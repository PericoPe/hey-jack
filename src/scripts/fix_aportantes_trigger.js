/**
 * Script para corregir la tabla eventos_activos_aportantes
 * Este script crea un trigger en Supabase que añade automáticamente un miembro
 * a todos los eventos activos de su comunidad cuando es creado
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Inicializar cliente de Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('=== CREACIÓN DE TRIGGER PARA SINCRONIZACIÓN AUTOMÁTICA DE MIEMBROS Y APORTANTES ===\n');

async function main() {
  console.log('=== CORRECCIÓN DE TABLA EVENTOS_ACTIVOS_APORTANTES ===');
  
  try {
    // 1. Crear función para añadir miembros a eventos activos
    console.log('\n1. Creando función para añadir miembros a eventos activos...');
    
    const createFunctionQuery = `
      CREATE OR REPLACE FUNCTION agregar_miembro_a_eventos_activos()
      RETURNS TRIGGER AS $$
      DECLARE
        evento_record RECORD;
      BEGIN
        -- Para cada evento activo de la comunidad del nuevo miembro
        FOR evento_record IN (
          SELECT id_evento, nombre_comunidad, nombre_hijo
          FROM eventos_activos
          WHERE id_comunidad = NEW.id_comunidad AND estado = 'activo'
        ) LOOP
          -- Insertar en eventos_activos_aportantes si no existe
          INSERT INTO eventos_activos_aportantes (
            id_evento, 
            id_comunidad, 
            nombre_padre, 
            email_padre, 
            whatsapp_padre, 
            monto_individual, 
            estado_pago, 
            notificacion_email, 
            fecha_creacion, 
            fecha_actualizacion
          )
          VALUES (
            evento_record.id_evento,
            NEW.id_comunidad,
            NEW.nombre_padre,
            NEW.email_padre,
            NEW.whatsapp_padre,
            1500, -- Monto por defecto
            'pendiente',
            false,
            NOW(),
            NOW()
          )
          ON CONFLICT (id_evento, email_padre) DO NOTHING;
          
          RAISE NOTICE 'Miembro % añadido al evento % de %', 
            NEW.nombre_padre, evento_record.nombre_hijo, evento_record.nombre_comunidad;
        END LOOP;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
    `;
    
    const { error: functionError } = await supabase.rpc('exec_sql', { query: createFunctionQuery });
    
    if (functionError) {
      console.error('Error al crear la función:', functionError.message);
      // Intentar con otro método si el primero falla
      console.log('Intentando método alternativo...');
      
      // Ejecutar SQL directamente (esto puede variar según los permisos)
      const { error: directError } = await supabase.from('_exec_sql').insert({ sql: createFunctionQuery });
      
      if (directError) {
        throw new Error(`No se pudo crear la función: ${directError.message}`);
      }
    }
    
    console.log('✅ Función creada correctamente');
    
    // 2. Crear trigger para ejecutar la función cuando se crea un miembro
    console.log('\n2. Creando trigger para nuevos miembros...');
    
    const createTriggerQuery = `
      DROP TRIGGER IF EXISTS trigger_agregar_miembro_a_eventos_activos ON miembros;
      
      CREATE TRIGGER trigger_agregar_miembro_a_eventos_activos
      AFTER INSERT ON miembros
      FOR EACH ROW
      EXECUTE FUNCTION agregar_miembro_a_eventos_activos();
    `;
    
    const { error: triggerError } = await supabase.rpc('exec_sql', { query: createTriggerQuery });
    
    if (triggerError) {
      console.error('Error al crear el trigger:', triggerError.message);
      // Intentar con otro método si el primero falla
      console.log('Intentando método alternativo...');
      
      // Ejecutar SQL directamente (esto puede variar según los permisos)
      const { error: directError } = await supabase.from('_exec_sql').insert({ sql: createTriggerQuery });
      
      if (directError) {
        throw new Error(`No se pudo crear el trigger: ${directError.message}`);
      }
    }
    
    console.log('✅ Trigger creado correctamente');
    
    // 3. Procesar miembros existentes para añadirlos a eventos activos
    console.log('\n3. Procesando miembros existentes...');
    
    // Obtener todos los miembros
    const { data: miembros, error: miembrosError } = await supabase
      .from('miembros')
      .select('*');
    
    if (miembrosError) {
      throw new Error(`Error al obtener miembros: ${miembrosError.message}`);
    }
    
    console.log(`Se encontraron ${miembros.length} miembros`);
    
    // Obtener todos los eventos activos
    const { data: eventos, error: eventosError } = await supabase
      .from('eventos_activos')
      .select('*')
      .eq('estado', 'activo');
    
    if (eventosError) {
      throw new Error(`Error al obtener eventos activos: ${eventosError.message}`);
    }
    
    console.log(`Se encontraron ${eventos.length} eventos activos`);
    
    // Para cada miembro, añadirlo a los eventos activos de su comunidad
    let aportantesAgregados = 0;
    
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
          console.error(`Error al verificar aportante existente: ${existenteError.message}`);
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
                nombre_padre: miembro.nombre_padre,
                email_padre: miembro.email_padre,
                whatsapp_padre: miembro.whatsapp_padre,
                monto_individual: 1500, // Monto por defecto
                estado_pago: 'pendiente',
                notificacion_email: false,
                fecha_creacion: new Date().toISOString(),
                fecha_actualizacion: new Date().toISOString()
              }
            ]);
          
          if (insertError) {
            console.error(`Error al insertar aportante: ${insertError.message}`);
          } else {
            aportantesAgregados++;
            console.log(`✅ Miembro ${miembro.nombre_padre} añadido al evento ${evento.nombre_hijo}`);
          }
        }
      }
    }
    
    console.log(`\nSe agregaron ${aportantesAgregados} aportantes a eventos activos`);
    
    // 4. Verificar el caso específico de Hernan Sanjurjo
    console.log('\n4. Verificando el caso de Hernan Sanjurjo...');
    
    const { data: hernan, error: hernanError } = await supabase
      .from('miembros')
      .select('*')
      .ilike('nombre_padre', '%Hernan Sanjurjo%')
      .maybeSingle();
    
    if (hernanError) {
      console.error(`Error al buscar a Hernan Sanjurjo: ${hernanError.message}`);
    } else if (hernan) {
      console.log(`Se encontró a Hernan Sanjurjo (ID: ${hernan.id}, Comunidad: ${hernan.id_comunidad})`);
      
      // Obtener eventos activos de su comunidad
      const { data: eventosHernan, error: eventosHernanError } = await supabase
        .from('eventos_activos')
        .select('*')
        .eq('id_comunidad', hernan.id_comunidad)
        .eq('estado', 'activo');
      
      if (eventosHernanError) {
        console.error(`Error al obtener eventos de la comunidad: ${eventosHernanError.message}`);
      } else {
        console.log(`Se encontraron ${eventosHernan.length} eventos activos en su comunidad`);
        
        // Añadir a Hernan a todos los eventos activos de su comunidad
        for (const evento of eventosHernan) {
          const { error: insertError } = await supabase
            .from('eventos_activos_aportantes')
            .upsert([
              {
                id_evento: evento.id_evento,
                id_comunidad: hernan.id_comunidad,
                nombre_padre: hernan.nombre_padre,
                email_padre: hernan.email_padre,
                whatsapp_padre: hernan.whatsapp_padre,
                monto_individual: 1500,
                estado_pago: 'pendiente',
                notificacion_email: false,
                fecha_creacion: new Date().toISOString(),
                fecha_actualizacion: new Date().toISOString()
              }
            ], { onConflict: 'id_evento,email_padre' });
          
          if (insertError) {
            console.error(`Error al añadir a Hernan al evento ${evento.nombre_hijo}: ${insertError.message}`);
          } else {
            console.log(`✅ Hernan Sanjurjo añadido al evento ${evento.nombre_hijo}`);
          }
        }
      }
    } else {
      console.log('No se encontró a Hernan Sanjurjo en la base de datos');
    }
    
    console.log('\n=== PROCESO COMPLETADO ===');
    console.log('Se ha creado un trigger que añadirá automáticamente a los nuevos miembros a los eventos activos de su comunidad');
    console.log('También se han procesado los miembros existentes para añadirlos a los eventos activos actuales');
    
  } catch (error) {
    console.error('\n❌ ERROR GENERAL:', error.message);
  }
}

// Ejecutar la función principal
main()
  .then(() => {
    console.log('Script finalizado');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error fatal:', error);
    process.exit(1);
  });
