/**
 * Script para migrar los datos de la tabla eventos_activos a la nueva tabla eventos_activos_aportantes
 * Este script debe ejecutarse después de crear la tabla eventos_activos_aportantes
 */
const supabase = require('../utils/supabaseClient');

/**
 * Migra los datos de miembros_pendientes a la tabla eventos_activos_aportantes
 */
const migrateContributors = async () => {
  console.log('Iniciando migración de aportantes...');
  
  try {
    // Obtener todos los eventos activos
    const { data: events, error: eventsError } = await supabase
      .from('eventos_activos')
      .select('*');
    
    if (eventsError) throw eventsError;
    
    if (!events || events.length === 0) {
      console.log('No se encontraron eventos activos para migrar');
      return;
    }
    
    console.log(`Se encontraron ${events.length} eventos activos para migrar`);
    
    // Para cada evento, migrar los miembros pendientes a la tabla eventos_activos_aportantes
    for (const event of events) {
      console.log(`\nMigrando evento: ${event.nombre_hijo} (${event.id_evento})`);
      
      // Verificar si el evento tiene miembros pendientes
      if (!event.miembros_pendientes || event.miembros_pendientes.length === 0) {
        console.log('El evento no tiene miembros pendientes');
        continue;
      }
      
      console.log(`El evento tiene ${event.miembros_pendientes.length} miembros pendientes`);
      
      // Obtener información adicional de los miembros desde la tabla miembros
      for (const miembro of event.miembros_pendientes) {
        // Buscar el miembro en la tabla miembros para obtener su email
        const { data: memberData, error: memberError } = await supabase
          .from('miembros')
          .select('*')
          .eq('id_comunidad', event.id_comunidad)
          .eq('nombre_padre', miembro.nombre_padre)
          .single();
        
        if (memberError) {
          console.error(`Error al obtener datos del miembro ${miembro.nombre_padre}:`, memberError);
          continue;
        }
        
        if (!memberData) {
          console.log(`No se encontró el miembro ${miembro.nombre_padre} en la tabla miembros`);
          continue;
        }
        
        // Verificar si ya existe un registro para este miembro en este evento
        const { data: existingContributor, error: existingError } = await supabase
          .from('eventos_activos_aportantes')
          .select('*')
          .eq('id_evento', event.id_evento)
          .eq('nombre_padre', miembro.nombre_padre)
          .single();
        
        if (!existingError && existingContributor) {
          console.log(`El miembro ${miembro.nombre_padre} ya existe en la tabla eventos_activos_aportantes`);
          continue;
        }
        
        // Crear el registro en la tabla eventos_activos_aportantes
        const { data: contributor, error: contributorError } = await supabase
          .from('eventos_activos_aportantes')
          .insert([
            {
              id_evento: event.id_evento,
              id_comunidad: event.id_comunidad,
              nombre_padre: miembro.nombre_padre,
              whatsapp_padre: miembro.whatsapp_padre || memberData.whatsapp_padre,
              email_padre: memberData.email_padre,
              monto_individual: miembro.monto_individual,
              estado_pago: miembro.estado_pago || 'pendiente',
              monto_pagado: miembro.monto_pagado || 0,
              metodo_pago: miembro.metodo_pago,
              referencia_pago: miembro.referencia_pago,
              fecha_pago: miembro.fecha_pago
            }
          ])
          .select();
        
        if (contributorError) {
          console.error(`Error al crear registro para ${miembro.nombre_padre}:`, contributorError);
        } else {
          console.log(`✅ Registro creado para ${miembro.nombre_padre}`);
        }
      }
    }
    
    console.log('\n✅ Migración completada exitosamente');
    
    // Verificar los registros creados
    const { data: contributors, error: contributorsError } = await supabase
      .from('eventos_activos_aportantes')
      .select('*');
    
    if (contributorsError) {
      console.error('Error al obtener registros de eventos_activos_aportantes:', contributorsError);
      return;
    }
    
    console.log(`\nSe crearon ${contributors.length} registros en la tabla eventos_activos_aportantes`);
    
    // Mostrar resumen por evento
    const eventSummary = {};
    
    for (const contributor of contributors) {
      if (!eventSummary[contributor.id_evento]) {
        eventSummary[contributor.id_evento] = {
          total: 0,
          pendientes: 0,
          pagados: 0
        };
      }
      
      eventSummary[contributor.id_evento].total++;
      
      if (contributor.estado_pago === 'pagado') {
        eventSummary[contributor.id_evento].pagados++;
      } else {
        eventSummary[contributor.id_evento].pendientes++;
      }
    }
    
    console.log('\nResumen por evento:');
    
    for (const eventId in eventSummary) {
      const event = events.find(e => e.id_evento === eventId);
      console.log(`\nEvento: ${event ? event.nombre_hijo : eventId}`);
      console.log(`- Total aportantes: ${eventSummary[eventId].total}`);
      console.log(`- Pendientes: ${eventSummary[eventId].pendientes}`);
      console.log(`- Pagados: ${eventSummary[eventId].pagados}`);
    }
  } catch (error) {
    console.error('Error inesperado durante la migración:', error);
  }
};

/**
 * Función principal
 */
const main = async () => {
  console.log('Iniciando migración a tabla eventos_activos_aportantes...');
  console.log('Fecha actual:', new Date().toISOString());
  
  try {
    // Verificar si la tabla eventos_activos_aportantes existe
    const { data, error } = await supabase
      .from('eventos_activos_aportantes')
      .select('count(*)', { count: 'exact', head: true });
    
    if (error) {
      console.error('Error al verificar la tabla eventos_activos_aportantes:', error);
      console.error('Asegúrate de haber ejecutado el script SQL para crear la tabla');
      return;
    }
    
    console.log('✅ Tabla eventos_activos_aportantes verificada correctamente');
    
    // Migrar los datos
    await migrateContributors();
  } catch (error) {
    console.error('Error inesperado:', error);
  }
  
  console.log('\nFinalización:', new Date().toISOString());
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
