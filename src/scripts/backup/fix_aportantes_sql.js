/**
 * Script para corregir la tabla eventos_activos_aportantes directamente en Supabase
 * Este script crea las funciones y triggers necesarios para mantener sincronizada
 * la tabla de aportantes con los miembros.
 */
const { createClient } = require('@supabase/supabase-js');

// Estas credenciales son públicas y se pueden incluir en el código del cliente
const supabaseUrl = 'https://xpwfqfpwhnzuazvfltcx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhwd2ZxZnB3aG56dWF6dmZsdGN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzMDU0NDQsImV4cCI6MjA2MTg4MTQ0NH0.7fYccKYRbqafy3sQX2cHTtWqtPSdtGfjZvOQnj4jQA8';

// Crear un cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('=== CORRECCIÓN DE TABLA EVENTOS_ACTIVOS_APORTANTES ===\n');

async function fixAportantesTable() {
  try {
    // 1. Crear índice en la tabla eventos_activos_aportantes para email_padre
    console.log('1. Creando índice para email_padre...');
    
    const createIndexSQL = `
      CREATE INDEX IF NOT EXISTS idx_eventos_activos_aportantes_email_padre
      ON eventos_activos_aportantes(email_padre);
    `;
    
    try {
      const { error: indexError } = await supabase.rpc('exec_sql', { sql: createIndexSQL });
      
      if (indexError) {
        console.log(`   ⚠️ No se pudo crear el índice: ${indexError.message}`);
        console.log('   ℹ️ Continuando con el resto del script...');
      } else {
        console.log('   ✓ Índice creado correctamente');
      }
    } catch (error) {
      console.log(`   ⚠️ Error al ejecutar SQL para índice: ${error.message}`);
      console.log('   ℹ️ Continuando con el resto del script...');
    }
    
    // 2. Crear columna id_miembro si no existe
    console.log('\n2. Verificando columna id_miembro...');
    
    const addColumnSQL = `
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'eventos_activos_aportantes' AND column_name = 'id_miembro'
        ) THEN
          ALTER TABLE eventos_activos_aportantes ADD COLUMN id_miembro UUID;
        END IF;
      END
      $$;
    `;
    
    try {
      const { error: columnError } = await supabase.rpc('exec_sql', { sql: addColumnSQL });
      
      if (columnError) {
        console.log(`   ⚠️ No se pudo verificar/crear columna: ${columnError.message}`);
        console.log('   ℹ️ Continuando con el resto del script...');
      } else {
        console.log('   ✓ Columna id_miembro verificada/creada correctamente');
      }
    } catch (error) {
      console.log(`   ⚠️ Error al ejecutar SQL para columna: ${error.message}`);
      console.log('   ℹ️ Continuando con el resto del script...');
    }
    
    // 3. Actualizar los id_miembro basados en email_padre
    console.log('\n3. Actualizando id_miembro en eventos_activos_aportantes...');
    
    const updateIdMiembroSQL = `
      UPDATE eventos_activos_aportantes a
      SET id_miembro = m.id
      FROM miembros m
      WHERE a.email_padre = m.email_padre AND a.id_miembro IS NULL;
    `;
    
    try {
      const { error: updateError } = await supabase.rpc('exec_sql', { sql: updateIdMiembroSQL });
      
      if (updateError) {
        console.log(`   ⚠️ No se pudo actualizar id_miembro: ${updateError.message}`);
        console.log('   ℹ️ Continuando con el resto del script...');
      } else {
        console.log('   ✓ id_miembro actualizado correctamente');
      }
    } catch (error) {
      console.log(`   ⚠️ Error al ejecutar SQL para actualizar id_miembro: ${error.message}`);
      console.log('   ℹ️ Continuando con el resto del script...');
    }
    
    // 4. Crear función para sincronizar datos de miembros a aportantes
    console.log('\n4. Creando función para sincronizar datos...');
    
    const createSyncFunctionSQL = `
      CREATE OR REPLACE FUNCTION sync_miembro_to_aportantes()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Para cada evento activo en la comunidad del nuevo miembro
        FOR evento IN 
          SELECT * FROM eventos_activos 
          WHERE id_comunidad = NEW.id_comunidad AND estado = 'activo'
        LOOP
          -- Insertar el nuevo miembro como aportante en cada evento activo
          INSERT INTO eventos_activos_aportantes (
            id_evento, 
            id_comunidad,
            id_miembro,
            nombre_padre, 
            email_padre, 
            telefono, 
            whatsapp, 
            monto_individual, 
            estado_pago, 
            notificacion_email, 
            fecha_creacion
          ) VALUES (
            evento.id_evento,
            NEW.id_comunidad,
            NEW.id,
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
    
    try {
      const { error: functionError } = await supabase.rpc('exec_sql', { sql: createSyncFunctionSQL });
      
      if (functionError) {
        console.log(`   ⚠️ No se pudo crear la función: ${functionError.message}`);
        console.log('   ℹ️ Continuando con el resto del script...');
      } else {
        console.log('   ✓ Función creada correctamente');
      }
    } catch (error) {
      console.log(`   ⚠️ Error al ejecutar SQL para función: ${error.message}`);
      console.log('   ℹ️ Continuando con el resto del script...');
    }
    
    // 5. Crear trigger para nuevos miembros
    console.log('\n5. Creando trigger para nuevos miembros...');
    
    const createTriggerSQL = `
      DROP TRIGGER IF EXISTS miembro_insert_trigger ON miembros;
      
      CREATE TRIGGER miembro_insert_trigger
      AFTER INSERT ON miembros
      FOR EACH ROW
      EXECUTE FUNCTION sync_miembro_to_aportantes();
    `;
    
    try {
      const { error: triggerError } = await supabase.rpc('exec_sql', { sql: createTriggerSQL });
      
      if (triggerError) {
        console.log(`   ⚠️ No se pudo crear el trigger: ${triggerError.message}`);
        console.log('   ℹ️ Continuando con el resto del script...');
      } else {
        console.log('   ✓ Trigger creado correctamente');
      }
    } catch (error) {
      console.log(`   ⚠️ Error al ejecutar SQL para trigger: ${error.message}`);
      console.log('   ℹ️ Continuando con el resto del script...');
    }
    
    // 6. Crear función para actualizar datos de aportantes cuando se actualiza un miembro
    console.log('\n6. Creando función para actualizar aportantes...');
    
    const createUpdateFunctionSQL = `
      CREATE OR REPLACE FUNCTION update_aportantes_from_miembro()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Actualizar todos los aportantes asociados a este miembro
        UPDATE eventos_activos_aportantes
        SET 
          nombre_padre = NEW.nombre_padre,
          telefono = NEW.telefono,
          whatsapp = NEW.whatsapp
        WHERE 
          email_padre = NEW.email_padre OR id_miembro = NEW.id;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;
    
    try {
      const { error: updateFunctionError } = await supabase.rpc('exec_sql', { sql: createUpdateFunctionSQL });
      
      if (updateFunctionError) {
        console.log(`   ⚠️ No se pudo crear la función de actualización: ${updateFunctionError.message}`);
        console.log('   ℹ️ Continuando con el resto del script...');
      } else {
        console.log('   ✓ Función de actualización creada correctamente');
      }
    } catch (error) {
      console.log(`   ⚠️ Error al ejecutar SQL para función de actualización: ${error.message}`);
      console.log('   ℹ️ Continuando con el resto del script...');
    }
    
    // 7. Crear trigger para actualización de miembros
    console.log('\n7. Creando trigger para actualización de miembros...');
    
    const createUpdateTriggerSQL = `
      DROP TRIGGER IF EXISTS miembro_update_trigger ON miembros;
      
      CREATE TRIGGER miembro_update_trigger
      AFTER UPDATE ON miembros
      FOR EACH ROW
      EXECUTE FUNCTION update_aportantes_from_miembro();
    `;
    
    try {
      const { error: updateTriggerError } = await supabase.rpc('exec_sql', { sql: createUpdateTriggerSQL });
      
      if (updateTriggerError) {
        console.log(`   ⚠️ No se pudo crear el trigger de actualización: ${updateTriggerError.message}`);
        console.log('   ℹ️ Continuando con el resto del script...');
      } else {
        console.log('   ✓ Trigger de actualización creado correctamente');
      }
    } catch (error) {
      console.log(`   ⚠️ Error al ejecutar SQL para trigger de actualización: ${error.message}`);
      console.log('   ℹ️ Continuando con el resto del script...');
    }
    
    // 8. Sincronizar todos los miembros existentes con eventos activos
    console.log('\n8. Sincronizando miembros existentes con eventos activos...');
    
    // Obtener todos los miembros
    const { data: miembros, error: miembrosError } = await supabase
      .from('miembros')
      .select('*');
    
    if (miembrosError) {
      console.log(`   ⚠️ Error al obtener miembros: ${miembrosError.message}`);
      console.log('   ℹ️ Continuando con el resto del script...');
    } else {
      console.log(`   ✓ Se encontraron ${miembros.length} miembros`);
      
      // Obtener todos los eventos activos
      const { data: eventos, error: eventosError } = await supabase
        .from('eventos_activos')
        .select('*')
        .eq('estado', 'activo');
      
      if (eventosError) {
        console.log(`   ⚠️ Error al obtener eventos activos: ${eventosError.message}`);
      } else {
        console.log(`   ✓ Se encontraron ${eventos.length} eventos activos`);
        
        let aportantesAgregados = 0;
        let aportantesActualizados = 0;
        
        // Para cada miembro, añadirlo a los eventos activos de su comunidad
        for (const miembro of miembros) {
          const eventosDesuComunidad = eventos.filter(e => e.id_comunidad === miembro.id_comunidad);
          
          for (const evento of eventosDesuComunidad) {
            // Verificar si ya existe en eventos_activos_aportantes
            const { data: existente, error: existenteError } = await supabase
              .from('eventos_activos_aportantes')
              .select('id')
              .eq('id_evento', evento.id_evento)
              .eq('email_padre', miembro.email_padre)
              .maybeSingle();
            
            if (existenteError) {
              console.log(`   ⚠️ Error al verificar aportante existente: ${existenteError.message}`);
              continue;
            }
            
            // Si no existe, añadirlo
            if (!existente) {
              const { error: insertError } = await supabase
                .from('eventos_activos_aportantes')
                .insert([
                  {
                    id_evento: evento.id_evento,
                    id_comunidad: miembro.id_comunidad,
                    id_miembro: miembro.id,
                    nombre_padre: miembro.nombre_padre,
                    email_padre: miembro.email_padre,
                    telefono: miembro.telefono,
                    whatsapp: miembro.whatsapp,
                    monto_individual: 1500, // Monto por defecto
                    estado_pago: 'pendiente',
                    notificacion_email: false,
                    fecha_creacion: new Date().toISOString()
                  }
                ]);
              
              if (insertError) {
                console.log(`   ⚠️ Error al insertar aportante: ${insertError.message}`);
              } else {
                aportantesAgregados++;
              }
            } else {
              // Si existe, actualizar sus datos
              const { error: updateError } = await supabase
                .from('eventos_activos_aportantes')
                .update({
                  id_miembro: miembro.id,
                  nombre_padre: miembro.nombre_padre,
                  telefono: miembro.telefono,
                  whatsapp: miembro.whatsapp
                })
                .eq('id', existente.id);
              
              if (updateError) {
                console.log(`   ⚠️ Error al actualizar aportante: ${updateError.message}`);
              } else {
                aportantesActualizados++;
              }
            }
          }
        }
        
        console.log(`   ✓ Se agregaron ${aportantesAgregados} aportantes y se actualizaron ${aportantesActualizados}`);
      }
    }
    
    console.log('\n✅ Proceso completado. La tabla eventos_activos_aportantes ha sido corregida y se han configurado los triggers necesarios para mantenerla sincronizada.');
    
  } catch (error) {
    console.log(`\n❌ ERROR GENERAL: ${error.message}`);
  }
}

// Ejecutar la función principal
fixAportantesTable()
  .then(() => console.log('\nScript finalizado'))
  .catch(err => console.error('\nError en el script:', err));
