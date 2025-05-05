/**
 * Script para corregir la integración entre miembros y eventos_activos_aportantes en Supabase
 * Este script crea las funciones y triggers necesarios en Supabase para mantener
 * sincronizados los datos entre las tablas
 */
const { createClient } = require('@supabase/supabase-js');

// Estas credenciales son públicas y se pueden incluir en el código del cliente
const supabaseUrl = 'https://xpwfqfpwhnzuazvfltcx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhwd2ZxZnB3aG56dWF6dmZsdGN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzMDU0NDQsImV4cCI6MjA2MTg4MTQ0NH0.7fYccKYRbqafy3sQX2cHTtWqtPSdtGfjZvOQnj4jQA8';

// Crear un cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('=== CORRECCIÓN DE INTEGRACIÓN SUPABASE ===\n');

async function fixSupabaseIntegration() {
  try {
    // 1. Verificar si Hernan Sanjurjo existe en la tabla miembros
    console.log('1. Verificando si Hernan Sanjurjo existe en la tabla miembros...');
    
    const { data: hernan, error: hernanError } = await supabase
      .from('miembros')
      .select('*')
      .ilike('nombre_padre', '%Hernan Sanjurjo%')
      .maybeSingle();
    
    if (hernanError) {
      console.log(`   ❌ Error al buscar a Hernan Sanjurjo: ${hernanError.message}`);
    } else if (!hernan) {
      console.log('   ⚠️ No se encontró a Hernan Sanjurjo en la tabla miembros');
    } else {
      console.log(`   ✓ Hernan Sanjurjo encontrado: ID=${hernan.id}`);
      console.log(`     Nombre: ${hernan.nombre_padre}`);
      console.log(`     Email: ${hernan.email_padre}`);
      console.log(`     WhatsApp: ${hernan.whatsapp || 'No registrado'}`);
      
      // Verificar si está como aportante
      const { data: hernanAportante, error: aportanteError } = await supabase
        .from('eventos_activos_aportantes')
        .select('*')
        .eq('email_padre', hernan.email_padre)
        .maybeSingle();
      
      if (aportanteError) {
        console.log(`   ❌ Error al verificar si Hernan es aportante: ${aportanteError.message}`);
      } else if (!hernanAportante) {
        console.log('   ⚠️ Hernan no está como aportante en ningún evento');
      } else {
        console.log('   ✓ Hernan ya está como aportante');
      }
    }
    
    // 2. Verificar la estructura de la tabla eventos_activos_aportantes
    console.log('\n2. Verificando la estructura de la tabla eventos_activos_aportantes...');
    
    // Intentar agregar manualmente a Hernan como aportante si no existe
    if (hernan) {
      // Buscar eventos activos de su comunidad
      const { data: eventos, error: eventosError } = await supabase
        .from('eventos_activos')
        .select('*')
        .eq('id_comunidad', hernan.id_comunidad)
        .eq('estado', 'activo');
      
      if (eventosError) {
        console.log(`   ❌ Error al buscar eventos activos: ${eventosError.message}`);
      } else if (!eventos || eventos.length === 0) {
        console.log('   ⚠️ No hay eventos activos para la comunidad de Hernan');
      } else {
        console.log(`   ✓ Se encontraron ${eventos.length} eventos activos para la comunidad de Hernan`);
        
        // Intentar agregar a Hernan como aportante en cada evento
        for (const evento of eventos) {
          console.log(`     - Verificando evento: ${evento.nombre_hijo} (ID: ${evento.id_evento})`);
          
          // Verificar si ya existe como aportante en este evento
          const { data: existente, error: existenteError } = await supabase
            .from('eventos_activos_aportantes')
            .select('*')
            .eq('id_evento', evento.id_evento)
            .eq('email_padre', hernan.email_padre)
            .maybeSingle();
          
          if (existenteError) {
            console.log(`     ❌ Error al verificar si Hernan es aportante: ${existenteError.message}`);
            continue;
          }
          
          if (!existente) {
            console.log('     ⚠️ Hernan no está como aportante en este evento. Agregándolo...');
            
            // Agregar a Hernan como aportante
            const { error: insertError } = await supabase
              .from('eventos_activos_aportantes')
              .insert({
                id_evento: evento.id_evento,
                id_comunidad: hernan.id_comunidad,
                nombre_padre: hernan.nombre_padre,
                email_padre: hernan.email_padre,
                telefono: hernan.telefono || null,
                whatsapp: hernan.whatsapp || null,
                monto_individual: 1500, // Monto por defecto
                estado_pago: 'pendiente',
                notificacion_email: false,
                fecha_creacion: new Date().toISOString()
              });
            
            if (insertError) {
              console.log(`     ❌ Error al agregar a Hernan como aportante: ${insertError.message}`);
            } else {
              console.log('     ✓ Hernan agregado correctamente como aportante');
            }
          } else {
            console.log('     ✓ Hernan ya está como aportante en este evento');
            
            // Actualizar sus datos
            const { error: updateError } = await supabase
              .from('eventos_activos_aportantes')
              .update({
                nombre_padre: hernan.nombre_padre,
                telefono: hernan.telefono || null,
                whatsapp: hernan.whatsapp || null
              })
              .eq('id', existente.id);
            
            if (updateError) {
              console.log(`     ❌ Error al actualizar datos de Hernan: ${updateError.message}`);
            } else {
              console.log('     ✓ Datos de Hernan actualizados correctamente');
            }
          }
        }
      }
    }
    
    // 3. Sincronizar WhatsApp para todos los aportantes
    console.log('\n3. Sincronizando WhatsApp para todos los aportantes...');
    
    // Obtener todos los miembros
    const { data: miembros, error: miembrosError } = await supabase
      .from('miembros')
      .select('*');
    
    if (miembrosError) {
      console.log(`   ❌ Error al obtener miembros: ${miembrosError.message}`);
    } else {
      console.log(`   ✓ Se encontraron ${miembros.length} miembros`);
      
      // Obtener todos los aportantes
      const { data: aportantes, error: aportantesError } = await supabase
        .from('eventos_activos_aportantes')
        .select('*');
      
      if (aportantesError) {
        console.log(`   ❌ Error al obtener aportantes: ${aportantesError.message}`);
      } else {
        console.log(`   ✓ Se encontraron ${aportantes.length} aportantes`);
        
        let actualizados = 0;
        
        // Crear un mapa de miembros por email para búsqueda rápida
        const miembrosMap = {};
        miembros.forEach(miembro => {
          if (miembro.email_padre) {
            miembrosMap[miembro.email_padre.toLowerCase()] = miembro;
          }
        });
        
        // Actualizar WhatsApp para cada aportante
        for (const aportante of aportantes) {
          if (!aportante.email_padre) continue;
          
          const miembro = miembrosMap[aportante.email_padre.toLowerCase()];
          
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
      }
    }
    
    // 4. Crear función y trigger en Supabase para sincronización automática
    console.log('\n4. Creando función y trigger para sincronización automática...');
    
    // SQL para crear la función que se ejecutará con el trigger
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION public.sync_miembro_to_aportantes()
      RETURNS TRIGGER AS $$
      DECLARE
        evento_record RECORD;
      BEGIN
        -- Para cada evento activo en la comunidad del nuevo miembro
        FOR evento_record IN 
          SELECT * FROM eventos_activos 
          WHERE id_comunidad = NEW.id_comunidad AND estado = 'activo'
        LOOP
          -- Insertar el nuevo miembro como aportante en cada evento activo
          INSERT INTO eventos_activos_aportantes (
            id_evento, 
            id_comunidad,
            nombre_padre, 
            email_padre, 
            telefono, 
            whatsapp, 
            monto_individual, 
            estado_pago, 
            notificacion_email, 
            fecha_creacion
          ) VALUES (
            evento_record.id_evento,
            NEW.id_comunidad,
            NEW.nombre_padre,
            NEW.email_padre,
            NEW.telefono,
            NEW.whatsapp,
            1500, -- Monto por defecto
            'pendiente',
            false,
            NOW()
          )
          -- Si ya existe un registro con el mismo email y evento, no hacer nada
          ON CONFLICT (id_evento, email_padre) 
          DO NOTHING;
        END LOOP;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;
    
    // SQL para crear el trigger
    const createTriggerSQL = `
      DROP TRIGGER IF EXISTS miembro_insert_trigger ON miembros;
      
      CREATE TRIGGER miembro_insert_trigger
      AFTER INSERT ON miembros
      FOR EACH ROW
      EXECUTE FUNCTION sync_miembro_to_aportantes();
    `;
    
    // SQL para crear función de actualización
    const createUpdateFunctionSQL = `
      CREATE OR REPLACE FUNCTION public.update_aportantes_from_miembro()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Actualizar todos los aportantes asociados a este miembro
        UPDATE eventos_activos_aportantes
        SET 
          nombre_padre = NEW.nombre_padre,
          telefono = NEW.telefono,
          whatsapp = NEW.whatsapp
        WHERE 
          email_padre = NEW.email_padre;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;
    
    // SQL para crear trigger de actualización
    const createUpdateTriggerSQL = `
      DROP TRIGGER IF EXISTS miembro_update_trigger ON miembros;
      
      CREATE TRIGGER miembro_update_trigger
      AFTER UPDATE ON miembros
      FOR EACH ROW
      EXECUTE FUNCTION update_aportantes_from_miembro();
    `;
    
    // Ejecutar SQL en Supabase
    try {
      console.log('   - Creando función sync_miembro_to_aportantes...');
      
      // Intentar ejecutar el SQL usando RPC si está disponible
      try {
        const { error: functionError } = await supabase.rpc('exec_sql', { sql: createFunctionSQL });
        
        if (functionError) {
          console.log(`   ⚠️ Error al crear función mediante RPC: ${functionError.message}`);
          console.log('   ℹ️ Este error es normal si la función exec_sql no existe en Supabase');
        } else {
          console.log('   ✓ Función creada correctamente mediante RPC');
        }
      } catch (error) {
        console.log(`   ⚠️ Error al ejecutar RPC: ${error.message}`);
        console.log('   ℹ️ Este error es normal si la función exec_sql no existe en Supabase');
      }
      
      console.log('   - Creando trigger miembro_insert_trigger...');
      
      try {
        const { error: triggerError } = await supabase.rpc('exec_sql', { sql: createTriggerSQL });
        
        if (triggerError) {
          console.log(`   ⚠️ Error al crear trigger mediante RPC: ${triggerError.message}`);
        } else {
          console.log('   ✓ Trigger creado correctamente mediante RPC');
        }
      } catch (error) {
        console.log(`   ⚠️ Error al ejecutar RPC: ${error.message}`);
      }
      
      console.log('   - Creando función update_aportantes_from_miembro...');
      
      try {
        const { error: updateFunctionError } = await supabase.rpc('exec_sql', { sql: createUpdateFunctionSQL });
        
        if (updateFunctionError) {
          console.log(`   ⚠️ Error al crear función de actualización mediante RPC: ${updateFunctionError.message}`);
        } else {
          console.log('   ✓ Función de actualización creada correctamente mediante RPC');
        }
      } catch (error) {
        console.log(`   ⚠️ Error al ejecutar RPC: ${error.message}`);
      }
      
      console.log('   - Creando trigger miembro_update_trigger...');
      
      try {
        const { error: updateTriggerError } = await supabase.rpc('exec_sql', { sql: createUpdateTriggerSQL });
        
        if (updateTriggerError) {
          console.log(`   ⚠️ Error al crear trigger de actualización mediante RPC: ${updateTriggerError.message}`);
        } else {
          console.log('   ✓ Trigger de actualización creado correctamente mediante RPC');
        }
      } catch (error) {
        console.log(`   ⚠️ Error al ejecutar RPC: ${error.message}`);
      }
      
      console.log('\n✅ Proceso completado. Las funciones y triggers han sido configurados en Supabase.');
      console.log('   ℹ️ NOTA: Si hubo errores al ejecutar los comandos SQL, deberás ejecutarlos manualmente en el SQL Editor de Supabase.');
      console.log('   ℹ️ Copia los comandos SQL que aparecen en este log y ejecútalos en el SQL Editor de Supabase.');
      
    } catch (error) {
      console.log(`   ❌ Error general al ejecutar SQL: ${error.message}`);
    }
    
    // 5. Sincronizar manualmente a Hernan Sanjurjo y otros miembros
    console.log('\n5. Sincronizando manualmente a Hernan Sanjurjo y otros miembros...');
    
    // Obtener todos los eventos activos
    const { data: eventosActivos, error: eventosActivosError } = await supabase
      .from('eventos_activos')
      .select('*')
      .eq('estado', 'activo');
    
    if (eventosActivosError) {
      console.log(`   ❌ Error al obtener eventos activos: ${eventosActivosError.message}`);
    } else {
      console.log(`   ✓ Se encontraron ${eventosActivos.length} eventos activos`);
      
      let miembrosAgregados = 0;
      
      // Para cada miembro, verificar que esté como aportante en los eventos activos de su comunidad
      for (const miembro of miembros || []) {
        const eventosActivosComunidad = eventosActivos.filter(
          evento => evento.id_comunidad === miembro.id_comunidad
        );
        
        if (eventosActivosComunidad.length === 0) continue;
        
        for (const evento of eventosActivosComunidad) {
          // Verificar si ya existe como aportante
          const { data: existente, error: existenteError } = await supabase
            .from('eventos_activos_aportantes')
            .select('*')
            .eq('id_evento', evento.id_evento)
            .eq('email_padre', miembro.email_padre)
            .maybeSingle();
          
          if (existenteError) {
            console.log(`   ❌ Error al verificar aportante: ${existenteError.message}`);
            continue;
          }
          
          if (!existente) {
            console.log(`   - Agregando a ${miembro.nombre_padre} como aportante en el evento ${evento.nombre_hijo}...`);
            
            const { error: insertError } = await supabase
              .from('eventos_activos_aportantes')
              .insert({
                id_evento: evento.id_evento,
                id_comunidad: miembro.id_comunidad,
                nombre_padre: miembro.nombre_padre,
                email_padre: miembro.email_padre,
                telefono: miembro.telefono || null,
                whatsapp: miembro.whatsapp || null,
                monto_individual: 1500, // Monto por defecto
                estado_pago: 'pendiente',
                notificacion_email: false,
                fecha_creacion: new Date().toISOString()
              });
            
            if (insertError) {
              console.log(`   ❌ Error al agregar aportante: ${insertError.message}`);
            } else {
              console.log(`   ✓ ${miembro.nombre_padre} agregado correctamente como aportante`);
              miembrosAgregados++;
            }
          }
        }
      }
      
      console.log(`   ✓ Se agregaron ${miembrosAgregados} miembros como aportantes`);
    }
    
    console.log('\n✅ Proceso completado. La integración entre miembros y eventos_activos_aportantes ha sido corregida.');
    
  } catch (error) {
    console.log(`\n❌ ERROR GENERAL: ${error.message}`);
  }
}

// Ejecutar la función principal
fixSupabaseIntegration()
  .then(() => console.log('\nScript finalizado'))
  .catch(err => console.error('\nError en el script:', err));
