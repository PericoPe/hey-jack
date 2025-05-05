/**
 * Script para corregir la estructura de la tabla eventos_activos_aportantes
 * y sincronizar los datos de miembros correctamente
 */
const { createClient } = require('@supabase/supabase-js');

// Estas credenciales son públicas y se pueden incluir en el código del cliente
const supabaseUrl = 'https://xpwfqfpwhnzuazvfltcx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhwd2ZxZnB3aG56dWF6dmZsdGN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzMDU0NDQsImV4cCI6MjA2MTg4MTQ0NH0.7fYccKYRbqafy3sQX2cHTtWqtPSdtGfjZvOQnj4jQA8';

// Crear un cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('=== CORRECCIÓN DE ESTRUCTURA Y SINCRONIZACIÓN DE DATOS ===\n');

async function fixTablaAportantes() {
  try {
    // 1. Verificar estructura de la tabla eventos_activos_aportantes
    console.log('1. Verificando estructura de la tabla eventos_activos_aportantes...');
    
    // Obtener información de la tabla
    const { data: columnas, error: columnasError } = await supabase
      .from('eventos_activos_aportantes')
      .select('*')
      .limit(1);
    
    if (columnasError) {
      console.log(`   ❌ Error al verificar estructura: ${columnasError.message}`);
      return;
    }
    
    // Mostrar las columnas actuales
    if (columnas && columnas.length > 0) {
      console.log('   ✓ Columnas actuales en la tabla:');
      const primeraFila = columnas[0];
      Object.keys(primeraFila).forEach(columna => {
        console.log(`     - ${columna}: ${typeof primeraFila[columna]}`);
      });
      
      // Verificar si existe la columna id_miembro
      const tieneIdMiembro = Object.keys(primeraFila).includes('id_miembro');
      console.log(`   ${tieneIdMiembro ? '✓' : '❌'} La columna id_miembro ${tieneIdMiembro ? 'existe' : 'no existe'}`);
    } else {
      console.log('   ⚠️ No se encontraron registros en la tabla');
    }
    
    // 2. Sincronizar datos de miembros a aportantes
    console.log('\n2. Sincronizando datos de miembros a aportantes...');
    
    // Obtener todos los miembros
    const { data: miembros, error: miembrosError } = await supabase
      .from('miembros')
      .select('*');
    
    if (miembrosError) {
      console.log(`   ❌ Error al obtener miembros: ${miembrosError.message}`);
      return;
    }
    
    console.log(`   ✓ Se encontraron ${miembros.length} miembros`);
    
    // Obtener todos los eventos activos
    const { data: eventos, error: eventosError } = await supabase
      .from('eventos_activos')
      .select('*')
      .eq('estado', 'activo');
    
    if (eventosError) {
      console.log(`   ❌ Error al obtener eventos activos: ${eventosError.message}`);
      return;
    }
    
    console.log(`   ✓ Se encontraron ${eventos.length} eventos activos`);
    
    // Obtener todos los aportantes
    const { data: aportantes, error: aportantesError } = await supabase
      .from('eventos_activos_aportantes')
      .select('*');
    
    if (aportantesError) {
      console.log(`   ❌ Error al obtener aportantes: ${aportantesError.message}`);
      return;
    }
    
    console.log(`   ✓ Se encontraron ${aportantes.length} aportantes`);
    
    // 3. Buscar específicamente a Hernan Sanjurjo
    console.log('\n3. Buscando a Hernan Sanjurjo...');
    
    const hernanMiembro = miembros.find(m => 
      m.nombre_padre?.toLowerCase().includes('hernan sanjurjo') || 
      m.email_padre?.toLowerCase().includes('hernan.sanjurjo')
    );
    
    if (!hernanMiembro) {
      console.log('   ❌ No se encontró a Hernan Sanjurjo en la tabla miembros');
    } else {
      console.log(`   ✓ Hernan Sanjurjo encontrado: ID=${hernanMiembro.id}`);
      console.log(`     Nombre: ${hernanMiembro.nombre_padre}`);
      console.log(`     Email: ${hernanMiembro.email_padre}`);
      console.log(`     WhatsApp: ${hernanMiembro.whatsapp || 'No registrado'}`);
      
      // Verificar si está como aportante
      const hernanAportante = aportantes.find(a => 
        a.email_padre?.toLowerCase() === hernanMiembro.email_padre?.toLowerCase()
      );
      
      if (!hernanAportante) {
        console.log('   ⚠️ Hernan no está como aportante en ningún evento');
        
        // Buscar eventos activos de su comunidad
        const eventosHernan = eventos.filter(e => e.id_comunidad === hernanMiembro.id_comunidad);
        
        if (eventosHernan.length === 0) {
          console.log('   ⚠️ No hay eventos activos en su comunidad');
        } else {
          console.log(`   ✓ Se encontraron ${eventosHernan.length} eventos activos en su comunidad`);
          
          // Intentar agregarlo como aportante
          for (const evento of eventosHernan) {
            console.log(`     - Intentando agregar a Hernan al evento: ${evento.nombre_hijo}`);
            
            const { error: insertError } = await supabase
              .from('eventos_activos_aportantes')
              .insert([
                {
                  id_evento: evento.id_evento,
                  id_comunidad: hernanMiembro.id_comunidad,
                  nombre_padre: hernanMiembro.nombre_padre,
                  email_padre: hernanMiembro.email_padre,
                  telefono: hernanMiembro.telefono || null,
                  whatsapp: hernanMiembro.whatsapp || null,
                  monto_individual: 1500,
                  estado_pago: 'pendiente',
                  notificacion_email: false,
                  fecha_creacion: new Date().toISOString()
                }
              ]);
            
            if (insertError) {
              console.log(`     ❌ Error al agregar a Hernan: ${insertError.message}`);
            } else {
              console.log('     ✓ Hernan agregado correctamente como aportante');
            }
          }
        }
      } else {
        console.log('   ✓ Hernan ya está como aportante');
        console.log(`     ID Evento: ${hernanAportante.id_evento}`);
        
        // Actualizar sus datos
        const { error: updateError } = await supabase
          .from('eventos_activos_aportantes')
          .update({
            nombre_padre: hernanMiembro.nombre_padre,
            telefono: hernanMiembro.telefono || null,
            whatsapp: hernanMiembro.whatsapp || null
          })
          .eq('id', hernanAportante.id);
        
        if (updateError) {
          console.log(`     ❌ Error al actualizar datos de Hernan: ${updateError.message}`);
        } else {
          console.log('     ✓ Datos de Hernan actualizados correctamente');
        }
      }
    }
    
    // 4. Sincronizar WhatsApp para todos los aportantes
    console.log('\n4. Sincronizando WhatsApp para todos los aportantes...');
    
    let actualizados = 0;
    
    for (const aportante of aportantes) {
      // Buscar el miembro correspondiente
      const miembro = miembros.find(m => 
        m.email_padre?.toLowerCase() === aportante.email_padre?.toLowerCase()
      );
      
      if (miembro && miembro.whatsapp && (!aportante.whatsapp || aportante.whatsapp !== miembro.whatsapp)) {
        console.log(`   - Actualizando WhatsApp de ${aportante.nombre_padre} (${aportante.email_padre})`);
        console.log(`     De: ${aportante.whatsapp || 'No registrado'} -> A: ${miembro.whatsapp}`);
        
        const { error: updateError } = await supabase
          .from('eventos_activos_aportantes')
          .update({
            whatsapp: miembro.whatsapp
          })
          .eq('id', aportante.id);
        
        if (updateError) {
          console.log(`     ❌ Error al actualizar WhatsApp: ${updateError.message}`);
        } else {
          console.log('     ✓ WhatsApp actualizado correctamente');
          actualizados++;
        }
      }
    }
    
    console.log(`   ✓ Se actualizaron ${actualizados} números de WhatsApp`);
    
    // 5. Verificar miembros sin aportantes
    console.log('\n5. Verificando miembros que no están como aportantes...');
    
    let miembrosSinAportantes = 0;
    let miembrosAgregados = 0;
    
    for (const miembro of miembros) {
      // Buscar eventos activos de su comunidad
      const eventosMiembro = eventos.filter(e => e.id_comunidad === miembro.id_comunidad);
      
      if (eventosMiembro.length === 0) continue;
      
      for (const evento of eventosMiembro) {
        // Verificar si ya es aportante
        const esAportante = aportantes.some(a => 
          a.email_padre?.toLowerCase() === miembro.email_padre?.toLowerCase() && 
          a.id_evento === evento.id_evento
        );
        
        if (!esAportante) {
          miembrosSinAportantes++;
          console.log(`   - ${miembro.nombre_padre} no es aportante en el evento ${evento.nombre_hijo}`);
          
          // Intentar agregarlo como aportante
          const { error: insertError } = await supabase
            .from('eventos_activos_aportantes')
            .insert([
              {
                id_evento: evento.id_evento,
                id_comunidad: miembro.id_comunidad,
                nombre_padre: miembro.nombre_padre,
                email_padre: miembro.email_padre,
                telefono: miembro.telefono || null,
                whatsapp: miembro.whatsapp || null,
                monto_individual: 1500,
                estado_pago: 'pendiente',
                notificacion_email: false,
                fecha_creacion: new Date().toISOString()
              }
            ]);
          
          if (insertError) {
            console.log(`     ❌ Error al agregar como aportante: ${insertError.message}`);
          } else {
            console.log('     ✓ Agregado correctamente como aportante');
            miembrosAgregados++;
          }
        }
      }
    }
    
    console.log(`   ✓ Se encontraron ${miembrosSinAportantes} miembros sin aportantes y se agregaron ${miembrosAgregados}`);
    
    console.log('\n✅ Proceso completado. La sincronización de datos ha finalizado.');
    
  } catch (error) {
    console.log(`\n❌ ERROR GENERAL: ${error.message}`);
  }
}

// Ejecutar la función principal
fixTablaAportantes()
  .then(() => console.log('\nScript finalizado'))
  .catch(err => console.error('\nError en el script:', err));
