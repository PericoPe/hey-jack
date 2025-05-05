require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Inicializar cliente de Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('=== CORRECCIÓN DE DATOS EN TABLA EVENTOS_ACTIVOS_APORTANTES ===\n');

async function fixAportantesData() {
  try {
    // 1. Obtener todos los registros de eventos_activos_aportantes
    console.log('1. Obteniendo registros de eventos_activos_aportantes...');
    const { data: aportantes, error: aportantesError } = await supabase
      .from('eventos_activos_aportantes')
      .select('*');
    
    if (aportantesError) throw aportantesError;
    console.log(`   ✓ ${aportantes.length} registros encontrados`);

    // 2. Obtener todos los miembros para tener la información correcta
    console.log('\n2. Obteniendo información de miembros...');
    const { data: miembros, error: miembrosError } = await supabase
      .from('miembros')
      .select('*');
    
    if (miembrosError) throw miembrosError;
    console.log(`   ✓ ${miembros.length} miembros encontrados`);

    // 3. Crear un mapa de miembros por email para búsqueda rápida
    const miembrosMap = {};
    miembros.forEach(miembro => {
      if (miembro.email_padre) {
        miembrosMap[miembro.email_padre.toLowerCase()] = miembro;
      }
    });

    // 4. Actualizar cada registro en eventos_activos_aportantes con la información correcta de miembros
    console.log('\n3. Actualizando registros de aportantes con información correcta...');
    let actualizados = 0;
    let errores = 0;

    for (const aportante of aportantes) {
      try {
        // Buscar el miembro correspondiente por email
        const emailAportante = aportante.email_padre ? aportante.email_padre.toLowerCase() : null;
        
        if (!emailAportante) {
          console.log(`   ⚠️ Aportante ID ${aportante.id} no tiene email, no se puede actualizar`);
          continue;
        }

        const miembro = miembrosMap[emailAportante];
        
        if (!miembro) {
          console.log(`   ⚠️ No se encontró miembro para el email ${aportante.email_padre}`);
          continue;
        }

        // Actualizar el registro con la información correcta del miembro
        const { error: updateError } = await supabase
          .from('eventos_activos_aportantes')
          .update({
            nombre_padre: miembro.nombre_padre,
            telefono: miembro.telefono || aportante.telefono,
            whatsapp: miembro.whatsapp || aportante.whatsapp
          })
          .eq('id', aportante.id);

        if (updateError) {
          console.log(`   ❌ Error al actualizar aportante ID ${aportante.id}: ${updateError.message}`);
          errores++;
        } else {
          actualizados++;
          if (actualizados % 10 === 0) {
            console.log(`   ✓ ${actualizados} registros actualizados hasta ahora...`);
          }
        }
      } catch (error) {
        console.log(`   ❌ Error procesando aportante ID ${aportante.id}: ${error.message}`);
        errores++;
      }
    }

    console.log(`\n✅ Proceso completado: ${actualizados} registros actualizados, ${errores} errores`);

    // 5. Verificar algunos registros actualizados para confirmar
    console.log('\n4. Verificando algunos registros actualizados:');
    const { data: verificacion, error: verificacionError } = await supabase
      .from('eventos_activos_aportantes')
      .select('*')
      .limit(5);
    
    if (verificacionError) {
      console.log(`   ❌ Error al verificar: ${verificacionError.message}`);
    } else {
      verificacion.forEach((reg, index) => {
        console.log(`   Registro ${index + 1}: ID=${reg.id}, Nombre=${reg.nombre_padre}, Email=${reg.email_padre}, Teléfono=${reg.telefono || 'N/A'}, WhatsApp=${reg.whatsapp || 'N/A'}`);
      });
    }

  } catch (error) {
    console.log(`\n❌ ERROR GENERAL: ${error.message}`);
  }
}

// Ejecutar la función principal
fixAportantesData()
  .then(() => console.log('\nScript finalizado'))
  .catch(err => console.error('\nError en el script:', err));
