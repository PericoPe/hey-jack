/**
 * Script específico para corregir el caso de Hernan Sanjurjo y otros miembros
 * que no están correctamente sincronizados en eventos_activos_aportantes
 */
const { createClient } = require('@supabase/supabase-js');

// Estas credenciales son públicas y se pueden incluir en el código del cliente
const supabaseUrl = 'https://xpwfqfpwhnzuazvfltcx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhwd2ZxZnB3aG56dWF6dmZsdGN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzMDU0NDQsImV4cCI6MjA2MTg4MTQ0NH0.7fYccKYRbqafy3sQX2cHTtWqtPSdtGfjZvOQnj4jQA8';

// Crear un cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('=== CORRECCIÓN ESPECÍFICA PARA HERNAN SANJURJO Y OTROS MIEMBROS ===\n');

async function fixHernanSanjurjo() {
  try {
    // 1. Buscar a Hernan Sanjurjo en la tabla miembros
    console.log('1. Buscando a Hernan Sanjurjo en la tabla miembros...');
    
    const { data: hernan, error: hernanError } = await supabase
      .from('miembros')
      .select('*')
      .ilike('nombre_padre', '%Hernan Sanjurjo%')
      .maybeSingle();
    
    if (hernanError) {
      console.log(`   ❌ Error al buscar a Hernan Sanjurjo: ${hernanError.message}`);
      return;
    }
    
    if (!hernan) {
      console.log('   ⚠️ No se encontró a Hernan Sanjurjo en la tabla miembros');
      return;
    }
    
    console.log(`   ✓ Hernan Sanjurjo encontrado: ID=${hernan.id}, Comunidad=${hernan.id_comunidad}`);
    console.log(`     Nombre: ${hernan.nombre_padre}`);
    console.log(`     Email: ${hernan.email_padre}`);
    console.log(`     WhatsApp: ${hernan.whatsapp || 'No registrado'}`);
    
    // 2. Buscar eventos activos de su comunidad
    console.log('\n2. Buscando eventos activos de su comunidad...');
    
    const { data: eventos, error: eventosError } = await supabase
      .from('eventos_activos')
      .select('*')
      .eq('id_comunidad', hernan.id_comunidad)
      .eq('estado', 'activo');
    
    if (eventosError) {
      console.log(`   ❌ Error al buscar eventos activos: ${eventosError.message}`);
      return;
    }
    
    if (!eventos || eventos.length === 0) {
      console.log('   ⚠️ No se encontraron eventos activos para su comunidad');
      return;
    }
    
    console.log(`   ✓ Se encontraron ${eventos.length} eventos activos para su comunidad`);
    
    // 3. Verificar si Hernan está como aportante en estos eventos
    console.log('\n3. Verificando si Hernan está como aportante en estos eventos...');
    
    for (const evento of eventos) {
      console.log(`   - Evento: ${evento.nombre_hijo} (ID: ${evento.id_evento})`);
      
      const { data: aportante, error: aportanteError } = await supabase
        .from('eventos_activos_aportantes')
        .select('*')
        .eq('id_evento', evento.id_evento)
        .eq('email_padre', hernan.email_padre)
        .maybeSingle();
      
      if (aportanteError) {
        console.log(`     ❌ Error al verificar aportante: ${aportanteError.message}`);
        continue;
      }
      
      if (!aportante) {
        console.log('     ⚠️ Hernan no está como aportante en este evento. Agregándolo...');
        
        const { error: insertError } = await supabase
          .from('eventos_activos_aportantes')
          .insert([
            {
              id_evento: evento.id_evento,
              id_comunidad: hernan.id_comunidad,
              id_miembro: hernan.id,
              nombre_padre: hernan.nombre_padre,
              email_padre: hernan.email_padre,
              telefono: hernan.telefono || null,
              whatsapp: hernan.whatsapp || null,
              monto_individual: 1500, // Monto por defecto
              estado_pago: 'pendiente',
              notificacion_email: false,
              fecha_creacion: new Date().toISOString()
            }
          ]);
        
        if (insertError) {
          console.log(`     ❌ Error al agregar a Hernan como aportante: ${insertError.message}`);
        } else {
          console.log('     ✓ Hernan agregado como aportante');
        }
      } else {
        console.log('     ✓ Hernan ya está como aportante en este evento');
        
        // Verificar si los datos están actualizados
        if (
          aportante.nombre_padre !== hernan.nombre_padre ||
          aportante.telefono !== hernan.telefono ||
          aportante.whatsapp !== hernan.whatsapp ||
          !aportante.id_miembro
        ) {
          console.log('     ⚠️ Los datos de Hernan no están actualizados. Actualizando...');
          
          const { error: updateError } = await supabase
            .from('eventos_activos_aportantes')
            .update({
              id_miembro: hernan.id,
              nombre_padre: hernan.nombre_padre,
              telefono: hernan.telefono || null,
              whatsapp: hernan.whatsapp || null
            })
            .eq('id', aportante.id);
          
          if (updateError) {
            console.log(`     ❌ Error al actualizar datos de Hernan: ${updateError.message}`);
          } else {
            console.log('     ✓ Datos de Hernan actualizados');
          }
        } else {
          console.log('     ✓ Los datos de Hernan están actualizados');
        }
      }
    }
    
    // 4. Corregir el problema general de WhatsApp en todos los aportantes
    console.log('\n4. Corrigiendo problema de WhatsApp en todos los aportantes...');
    
    // Actualizar todos los aportantes con los datos de WhatsApp de los miembros
    const updateWhatsAppSQL = `
      UPDATE eventos_activos_aportantes a
      SET whatsapp = m.whatsapp
      FROM miembros m
      WHERE a.email_padre = m.email_padre AND m.whatsapp IS NOT NULL;
    `;
    
    try {
      const { error: whatsappError } = await supabase.rpc('exec_sql', { sql: updateWhatsAppSQL });
      
      if (whatsappError) {
        console.log(`   ❌ Error al actualizar WhatsApp: ${whatsappError.message}`);
      } else {
        console.log('   ✓ WhatsApp actualizado correctamente para todos los aportantes');
      }
    } catch (error) {
      console.log(`   ❌ Error al ejecutar SQL para WhatsApp: ${error.message}`);
    }
    
    // 5. Verificar todos los miembros de la comunidad de Hernan
    console.log('\n5. Verificando todos los miembros de la comunidad de Hernan...');
    
    const { data: miembros, error: miembrosError } = await supabase
      .from('miembros')
      .select('*')
      .eq('id_comunidad', hernan.id_comunidad);
    
    if (miembrosError) {
      console.log(`   ❌ Error al obtener miembros: ${miembrosError.message}`);
      return;
    }
    
    console.log(`   ✓ Se encontraron ${miembros.length} miembros en la comunidad`);
    
    let miembrosAgregados = 0;
    let miembrosActualizados = 0;
    
    for (const miembro of miembros) {
      console.log(`   - Miembro: ${miembro.nombre_padre} (Email: ${miembro.email_padre})`);
      
      for (const evento of eventos) {
        const { data: aportante, error: aportanteError } = await supabase
          .from('eventos_activos_aportantes')
          .select('*')
          .eq('id_evento', evento.id_evento)
          .eq('email_padre', miembro.email_padre)
          .maybeSingle();
        
        if (aportanteError) {
          console.log(`     ❌ Error al verificar aportante: ${aportanteError.message}`);
          continue;
        }
        
        if (!aportante) {
          console.log(`     ⚠️ ${miembro.nombre_padre} no está como aportante en el evento ${evento.nombre_hijo}. Agregándolo...`);
          
          const { error: insertError } = await supabase
            .from('eventos_activos_aportantes')
            .insert([
              {
                id_evento: evento.id_evento,
                id_comunidad: miembro.id_comunidad,
                id_miembro: miembro.id,
                nombre_padre: miembro.nombre_padre,
                email_padre: miembro.email_padre,
                telefono: miembro.telefono || null,
                whatsapp: miembro.whatsapp || null,
                monto_individual: 1500, // Monto por defecto
                estado_pago: 'pendiente',
                notificacion_email: false,
                fecha_creacion: new Date().toISOString()
              }
            ]);
          
          if (insertError) {
            console.log(`     ❌ Error al agregar a ${miembro.nombre_padre} como aportante: ${insertError.message}`);
          } else {
            console.log(`     ✓ ${miembro.nombre_padre} agregado como aportante`);
            miembrosAgregados++;
          }
        } else if (
          aportante.nombre_padre !== miembro.nombre_padre ||
          aportante.telefono !== miembro.telefono ||
          aportante.whatsapp !== miembro.whatsapp ||
          !aportante.id_miembro
        ) {
          console.log(`     ⚠️ Los datos de ${miembro.nombre_padre} no están actualizados. Actualizando...`);
          
          const { error: updateError } = await supabase
            .from('eventos_activos_aportantes')
            .update({
              id_miembro: miembro.id,
              nombre_padre: miembro.nombre_padre,
              telefono: miembro.telefono || null,
              whatsapp: miembro.whatsapp || null
            })
            .eq('id', aportante.id);
          
          if (updateError) {
            console.log(`     ❌ Error al actualizar datos de ${miembro.nombre_padre}: ${updateError.message}`);
          } else {
            console.log(`     ✓ Datos de ${miembro.nombre_padre} actualizados`);
            miembrosActualizados++;
          }
        }
      }
    }
    
    console.log(`\n✅ Proceso completado. Se agregaron ${miembrosAgregados} miembros como aportantes y se actualizaron ${miembrosActualizados}.`);
    
  } catch (error) {
    console.log(`\n❌ ERROR GENERAL: ${error.message}`);
  }
}

// Ejecutar la función principal
fixHernanSanjurjo()
  .then(() => console.log('\nScript finalizado'))
  .catch(err => console.error('\nError en el script:', err));
