/**
 * Script para sincronizar miembros con eventos_activos_aportantes
 * Este script asegura que todos los miembros estén correctamente registrados como aportantes
 * en los eventos activos de sus comunidades.
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Inicializar cliente de Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('=== SINCRONIZACIÓN CORRECTIVA DE MIEMBROS Y APORTANTES ===\n');

async function syncMiembrosAportantes() {
  try {
    // 1. Obtener todas las comunidades
    console.log('1. Obteniendo comunidades...');
    const { data: comunidades, error: comunidadesError } = await supabase
      .from('comunidades')
      .select('*');
    
    if (comunidadesError) throw comunidadesError;
    console.log(`   ✓ ${comunidades.length} comunidades encontradas`);

    // 2. Obtener todos los eventos activos
    console.log('\n2. Obteniendo eventos activos...');
    const { data: eventosActivos, error: eventosActivosError } = await supabase
      .from('eventos_activos')
      .select('*')
      .eq('estado', 'activo');
    
    if (eventosActivosError) throw eventosActivosError;
    console.log(`   ✓ ${eventosActivos.length} eventos activos encontrados`);

    // 3. Para cada comunidad, obtener miembros y asegurarse de que estén en eventos_activos_aportantes
    console.log('\n3. Sincronizando miembros con eventos activos...');
    
    let totalMiembrosAgregados = 0;
    let totalMiembrosActualizados = 0;
    
    for (const comunidad of comunidades) {
      console.log(`\n   Procesando comunidad: ${comunidad.nombre_comunidad} (ID: ${comunidad.id_comunidad})`);
      
      // Obtener miembros de la comunidad
      const { data: miembros, error: miembrosError } = await supabase
        .from('miembros')
        .select('*')
        .eq('id_comunidad', comunidad.id_comunidad);
      
      if (miembrosError) {
        console.log(`   ❌ Error al obtener miembros: ${miembrosError.message}`);
        continue;
      }
      
      console.log(`   ✓ ${miembros.length} miembros encontrados en la comunidad`);
      
      // Obtener eventos activos de la comunidad
      const eventosActivosComunidad = eventosActivos.filter(
        evento => evento.id_comunidad === comunidad.id_comunidad
      );
      
      if (eventosActivosComunidad.length === 0) {
        console.log(`   ℹ️ No hay eventos activos para esta comunidad`);
        continue;
      }
      
      console.log(`   ✓ ${eventosActivosComunidad.length} eventos activos en la comunidad`);
      
      // Para cada evento activo, verificar que todos los miembros estén como aportantes
      for (const evento of eventosActivosComunidad) {
        console.log(`   - Procesando evento: ${evento.nombre_hijo} (ID: ${evento.id_evento})`);
        
        // Obtener aportantes actuales del evento
        const { data: aportantesActuales, error: aportantesError } = await supabase
          .from('eventos_activos_aportantes')
          .select('*')
          .eq('id_evento', evento.id_evento);
        
        if (aportantesError) {
          console.log(`   ❌ Error al obtener aportantes: ${aportantesError.message}`);
          continue;
        }
        
        // Crear un mapa de aportantes por email para búsqueda rápida
        const aportantesMap = {};
        aportantesActuales.forEach(aportante => {
          if (aportante.email_padre) {
            aportantesMap[aportante.email_padre.toLowerCase()] = aportante;
          }
        });
        
        // Verificar cada miembro y añadirlo si no existe como aportante
        let miembrosAgregados = 0;
        let miembrosActualizados = 0;
        
        for (const miembro of miembros) {
          // Si el miembro no tiene email, no podemos procesarlo correctamente
          if (!miembro.email_padre) {
            console.log(`   ⚠️ Miembro ${miembro.nombre_padre} no tiene email, se intentará usar su ID como referencia`);
            
            // Buscar por ID de miembro en lugar de email
            const aportanteExistentePorId = aportantesActuales.find(a => 
              a.id_miembro === miembro.id || 
              (a.nombre_padre === miembro.nombre_padre && a.id_comunidad === miembro.id_comunidad)
            );
            
            if (!aportanteExistentePorId) {
              // El miembro no existe como aportante, lo añadimos con un email temporal basado en su ID
              const emailTemporal = `miembro_${miembro.id}@heyjack.temp`;
              
              const { error: insertError } = await supabase
                .from('eventos_activos_aportantes')
                .insert({
                  id_evento: evento.id_evento,
                  id_comunidad: comunidad.id_comunidad,
                  id_miembro: miembro.id, // Guardar referencia al ID del miembro
                  nombre_padre: miembro.nombre_padre,
                  email_padre: emailTemporal,
                  telefono: miembro.telefono,
                  whatsapp: miembro.whatsapp,
                  monto_individual: 1500, // Monto por defecto
                  estado_pago: 'pendiente',
                  notificacion_email: false,
                  fecha_creacion: new Date().toISOString()
                });
              
              if (insertError) {
                console.log(`   ❌ Error al añadir miembro ${miembro.nombre_padre}: ${insertError.message}`);
              } else {
                miembrosAgregados++;
                totalMiembrosAgregados++;
                console.log(`   ✓ Miembro ${miembro.nombre_padre} añadido al evento ${evento.nombre_hijo}`);
              }
            }
            
            continue;
          }
          
          const emailMiembro = miembro.email_padre.toLowerCase();
          const aportanteExistente = aportantesMap[emailMiembro];
          
          if (!aportanteExistente) {
            // El miembro no existe como aportante, lo añadimos
            const { error: insertError } = await supabase
              .from('eventos_activos_aportantes')
              .insert({
                id_evento: evento.id_evento,
                id_comunidad: comunidad.id_comunidad,
                id_miembro: miembro.id, // Guardar referencia al ID del miembro
                nombre_padre: miembro.nombre_padre,
                email_padre: miembro.email_padre,
                telefono: miembro.telefono,
                whatsapp: miembro.whatsapp,
                monto_individual: 1500, // Monto por defecto
                estado_pago: 'pendiente',
                notificacion_email: false,
                fecha_creacion: new Date().toISOString()
              });
            
            if (insertError) {
              console.log(`   ❌ Error al añadir miembro ${miembro.nombre_padre}: ${insertError.message}`);
            } else {
              miembrosAgregados++;
              totalMiembrosAgregados++;
              console.log(`   ✓ Miembro ${miembro.nombre_padre} añadido al evento ${evento.nombre_hijo}`);
            }
          } else if (
            aportanteExistente.nombre_padre !== miembro.nombre_padre ||
            aportanteExistente.telefono !== miembro.telefono ||
            aportanteExistente.whatsapp !== miembro.whatsapp ||
            !aportanteExistente.id_miembro
          ) {
            // El miembro existe pero sus datos no coinciden o falta id_miembro, actualizamos
            const { error: updateError } = await supabase
              .from('eventos_activos_aportantes')
              .update({
                nombre_padre: miembro.nombre_padre,
                telefono: miembro.telefono,
                whatsapp: miembro.whatsapp,
                id_miembro: miembro.id // Asegurarnos de que tenga la referencia al ID del miembro
              })
              .eq('id', aportanteExistente.id);
            
            if (updateError) {
              console.log(`   ❌ Error al actualizar miembro ${miembro.nombre_padre}: ${updateError.message}`);
            } else {
              miembrosActualizados++;
              totalMiembrosActualizados++;
              console.log(`   ✓ Miembro ${miembro.nombre_padre} actualizado en el evento ${evento.nombre_hijo}`);
            }
          }
        }
        
        console.log(`   ✓ ${miembrosAgregados} miembros agregados y ${miembrosActualizados} actualizados para el evento`);
      }
    }
    
    console.log(`\n✅ Sincronización completada: ${totalMiembrosAgregados} miembros agregados y ${totalMiembrosActualizados} actualizados en total`);

    // 4. Crear índice y restricción de unicidad si no existen
    console.log('\n4. Verificando índices y restricciones...');
    
    // Esta operación requiere permisos de administrador en Supabase
    const createIndexSQL = `
      DO $$
      BEGIN
        -- Crear índice para búsqueda rápida por email si no existe
        IF NOT EXISTS (
          SELECT 1 FROM pg_indexes 
          WHERE indexname = 'idx_eventos_activos_aportantes_email_padre'
        ) THEN
          CREATE INDEX idx_eventos_activos_aportantes_email_padre 
          ON eventos_activos_aportantes(email_padre);
        END IF;
        
        -- Crear índice para búsqueda rápida por id_miembro si no existe
        IF NOT EXISTS (
          SELECT 1 FROM pg_indexes 
          WHERE indexname = 'idx_eventos_activos_aportantes_id_miembro'
        ) THEN
          CREATE INDEX idx_eventos_activos_aportantes_id_miembro 
          ON eventos_activos_aportantes(id_miembro);
        END IF;
        
        -- Crear restricción de unicidad para evento+email si no existe
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint 
          WHERE conname = 'eventos_activos_aportantes_id_evento_email_padre_key'
        ) THEN
          ALTER TABLE eventos_activos_aportantes 
          ADD CONSTRAINT eventos_activos_aportantes_id_evento_email_padre_key 
          UNIQUE (id_evento, email_padre);
        END IF;
      END
      $$;
    `;
    
    try {
      const { error: indexError } = await supabase.rpc('exec_sql', { sql: createIndexSQL });
      
      if (indexError) {
        console.log(`   ⚠️ No se pudieron crear índices/restricciones: ${indexError.message}`);
        console.log('   ℹ️ Esto puede requerir permisos de administrador en Supabase');
      } else {
        console.log('   ✓ Índices y restricciones verificados/creados correctamente');
      }
    } catch (error) {
      console.log(`   ⚠️ Error al ejecutar SQL para índices: ${error.message}`);
    }

  } catch (error) {
    console.log(`\n❌ ERROR GENERAL: ${error.message}`);
  }
}

// Ejecutar la función principal
syncMiembrosAportantes()
  .then(() => console.log('\nScript finalizado'))
  .catch(err => console.error('\nError en el script:', err));
