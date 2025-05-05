require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Inicializar cliente de Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('=== SINCRONIZACIÓN DE MIEMBROS Y APORTANTES ===\n');

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
          // Si el miembro no tiene email, no podemos procesarlo
          if (!miembro.email_padre) continue;
          
          const emailMiembro = miembro.email_padre.toLowerCase();
          const aportanteExistente = aportantesMap[emailMiembro];
          
          if (!aportanteExistente) {
            // El miembro no existe como aportante, lo añadimos
            const { error: insertError } = await supabase
              .from('eventos_activos_aportantes')
              .insert({
                id_evento: evento.id_evento,
                id_comunidad: comunidad.id_comunidad,
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
            }
          } else if (
            aportanteExistente.nombre_padre !== miembro.nombre_padre ||
            aportanteExistente.telefono !== miembro.telefono ||
            aportanteExistente.whatsapp !== miembro.whatsapp
          ) {
            // El miembro existe pero sus datos no coinciden, actualizamos
            const { error: updateError } = await supabase
              .from('eventos_activos_aportantes')
              .update({
                nombre_padre: miembro.nombre_padre,
                telefono: miembro.telefono,
                whatsapp: miembro.whatsapp
              })
              .eq('id', aportanteExistente.id);
            
            if (updateError) {
              console.log(`   ❌ Error al actualizar miembro ${miembro.nombre_padre}: ${updateError.message}`);
            } else {
              miembrosActualizados++;
              totalMiembrosActualizados++;
            }
          }
        }
        
        console.log(`   ✓ ${miembrosAgregados} miembros agregados y ${miembrosActualizados} actualizados para el evento`);
      }
    }
    
    console.log(`\n✅ Sincronización completada: ${totalMiembrosAgregados} miembros agregados y ${totalMiembrosActualizados} actualizados en total`);

  } catch (error) {
    console.log(`\n❌ ERROR GENERAL: ${error.message}`);
  }
}

// Ejecutar la función principal
syncMiembrosAportantes()
  .then(() => console.log('\nScript finalizado'))
  .catch(err => console.error('\nError en el script:', err));
