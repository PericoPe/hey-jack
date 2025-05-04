/**
 * Script para actualizar la tabla de eventos_activos
 * Este script busca cumpleaños próximos (15 días) y crea eventos activos para recaudar dinero
 * 
 * Puede ejecutarse manualmente o programarse para ejecutarse automáticamente
 * mediante un cron job o similar.
 */
const { updateActiveEvents } = require('../utils/api-supabase');

/**
 * Función principal que ejecuta la actualización de eventos activos
 */
const runUpdateActiveEvents = async () => {
  console.log('Iniciando actualización de eventos activos...');
  console.log('Fecha actual:', new Date().toISOString());
  
  try {
    const result = await updateActiveEvents();
    
    if (result.success) {
      console.log('✅ Actualización completada exitosamente');
      console.log(result.message);
      
      if (result.events && result.events.length > 0) {
        console.log('Eventos activos encontrados:');
        result.events.forEach(event => {
          console.log(`- ${event.nombre_hijo} (${new Date(event.fecha_cumple).toLocaleDateString()})`);
          console.log(`  Comunidad: ${event.nombre_comunidad}`);
          console.log(`  Objetivo: $${event.objetivo_recaudacion}`);
          console.log(`  Miembros pendientes: ${event.miembros_pendientes.length}`);
          console.log('-----------------------------------');
        });
      } else {
        console.log('No se encontraron eventos activos para los próximos 15 días');
      }
    } else {
      console.error('❌ Error en la actualización:', result.message);
    }
  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
  
  console.log('Finalización de la actualización:', new Date().toISOString());
};

// Ejecutar la función si este archivo se ejecuta directamente
if (require.main === module) {
  runUpdateActiveEvents()
    .then(() => {
      console.log('Script finalizado');
      process.exit(0);
    })
    .catch(error => {
      console.error('Error en el script:', error);
      process.exit(1);
    });
}

module.exports = runUpdateActiveEvents;
