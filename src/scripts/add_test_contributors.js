/**
 * Script para agregar aportantes de prueba a la tabla eventos_activos_aportantes
 * Esto permitirá probar el envío de notificaciones por email
 */
const supabase = require('../utils/supabaseClient');
const fs = require('fs');
const path = require('path');

// Lista de emails para pruebas
const testEmails = [
  'pale@intramed.net',
  'ursino.julieta@gmail.com',
  'irene.candido@gmail.com',
  'piero.gildelvalle@gmail.com'
];

/**
 * Función principal
 */
const main = async () => {
  console.log('=== AGREGAR APORTANTES DE PRUEBA ===');
  console.log('Fecha actual:', new Date().toISOString());
  
  // Crear archivo de log
  const logFile = path.join(__dirname, '..', '..', 'contributors_log.txt');
  const log = (message) => {
    console.log(message);
    fs.appendFileSync(logFile, message + '\n');
  };
  
  // Iniciar log
  fs.writeFileSync(logFile, `=== AGREGAR APORTANTES DE PRUEBA ===\n`);
  fs.appendFileSync(logFile, `Fecha: ${new Date().toISOString()}\n\n`);
  
  try {
    // Obtener eventos activos
    log('\nBuscando eventos activos...');
    const { data: activeEvents, error: eventsError } = await supabase
      .from('eventos_activos')
      .select('*')
      .eq('estado', 'activo');
    
    if (eventsError) {
      log('Error al obtener eventos activos: ' + JSON.stringify(eventsError));
      return;
    }
    
    if (!activeEvents || activeEvents.length === 0) {
      // Si no hay eventos activos, crear uno de prueba
      log('No se encontraron eventos activos. Creando uno de prueba...');
      
      // Obtener una comunidad
      const { data: communities, error: commError } = await supabase
        .from('comunidades')
        .select('*')
        .limit(1);
      
      if (commError || !communities || communities.length === 0) {
        log('Error: No se encontraron comunidades para crear un evento de prueba.');
        return;
      }
      
      const community = communities[0];
      
      // Crear evento de prueba
      const eventDate = new Date();
      eventDate.setDate(eventDate.getDate() + 10); // 10 días en el futuro
      
      const { data: newEvent, error: newEventError } = await supabase
        .from('eventos_activos')
        .insert([
          {
            id_comunidad: community.id_comunidad,
            nombre_hijo: 'Milan',
            fecha_evento: eventDate.toISOString(),
            monto_objetivo: 10000,
            estado: 'activo'
          }
        ])
        .select();
      
      if (newEventError) {
        log('Error al crear evento de prueba: ' + JSON.stringify(newEventError));
        return;
      }
      
      log(`Evento de prueba creado con éxito: ${newEvent[0].nombre_hijo}`);
      activeEvents = newEvent;
    }
    
    log(`Se encontraron ${activeEvents.length} eventos activos`);
    
    // Usar el primer evento activo
    const event = activeEvents[0];
    log(`\nUsando evento: ${event.nombre_hijo} (${event.id_evento || event.id})`);
    
    // Verificar si hay aportantes existentes
    const { data: existingContributors, error: existingError } = await supabase
      .from('eventos_activos_aportantes')
      .select('*')
      .eq('id_evento', event.id_evento || event.id);
    
    if (existingError) {
      log('Error al verificar aportantes existentes: ' + JSON.stringify(existingError));
    } else if (existingContributors && existingContributors.length > 0) {
      log(`Ya existen ${existingContributors.length} aportantes para este evento. Se eliminarán para crear nuevos...`);
      
      // Eliminar aportantes existentes
      const { error: deleteError } = await supabase
        .from('eventos_activos_aportantes')
        .delete()
        .eq('id_evento', event.id_evento || event.id);
      
      if (deleteError) {
        log('Error al eliminar aportantes existentes: ' + JSON.stringify(deleteError));
      } else {
        log('Aportantes existentes eliminados correctamente.');
      }
    }
    
    // Agregar aportantes de prueba
    log('\nAgregando aportantes de prueba...');
    
    for (let i = 0; i < testEmails.length; i++) {
      const email = testEmails[i];
      const nombre = email.split('@')[0]; // Usar la parte del email antes de @ como nombre
      
      log(`\nAgregando aportante ${i+1}/${testEmails.length}: ${nombre} (${email})`);
      
      // Crear nuevo aportante
      const { data: contributor, error: contributorError } = await supabase
        .from('eventos_activos_aportantes')
        .insert([
          {
            id_evento: event.id_evento || event.id,
            id_comunidad: event.id_comunidad,
            nombre_padre: nombre,
            email_padre: email,
            whatsapp_padre: '1234567890', // Número de WhatsApp ficticio
            monto_individual: 1000, // Monto ficticio
            estado_pago: 'pendiente',
            notificacion_email: false,
            notificacion_whatsapp: false
          }
        ])
        .select();
      
      if (contributorError) {
        log(`Error al crear aportante ${nombre}: ${JSON.stringify(contributorError)}`);
      } else {
        log(`✅ Aportante ${nombre} creado correctamente (ID: ${contributor[0].id})`);
      }
    }
    
    // Verificar que se hayan creado correctamente
    const { data: finalContributors, error: finalError } = await supabase
      .from('eventos_activos_aportantes')
      .select('*')
      .eq('id_evento', event.id_evento || event.id);
    
    if (finalError) {
      log('Error al verificar aportantes finales: ' + JSON.stringify(finalError));
    } else {
      log(`\n✅ Proceso completado. Se encontraron ${finalContributors.length} aportantes en la tabla:`);
      for (const contributor of finalContributors) {
        log(`- ${contributor.nombre_padre} (${contributor.email_padre}) - ID: ${contributor.id}`);
      }
    }
    
    log('\nAhora puedes ejecutar el comando "npm run force-notify" para enviar notificaciones a estos aportantes.');
  } catch (error) {
    log('Error inesperado: ' + JSON.stringify(error));
  }
  
  log('\n=== FIN DEL PROCESO ===');
  log(`Log guardado en: ${logFile}`);
  console.log(`Log guardado en: ${logFile}`);
};

// Ejecutar la función principal
main()
  .then(() => {
    console.log('Script finalizado');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error en el script:', error);
    process.exit(1);
  });
