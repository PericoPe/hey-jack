
const { verifyEmailConnection } = require('../utils/emailConfig');
const { sendNotificationsForAllActiveEvents } = require('../utils/emailNotifications');


const main = async () => {
  console.log('Iniciando envío de notificaciones por email...');
  console.log('Fecha actual:', new Date().toISOString());
  
  try {
    // Verificar conexión con el servidor de email
    const connected = await verifyEmailConnection();
    
    if (!connected) {
      console.error('❌ No se pudo establecer conexión con el servidor de email');
      console.error('Verifica la configuración de email en src/utils/emailConfig.js');
      console.error('Para Gmail, asegúrate de usar una "contraseña de aplicación"');
      return;
    }
    
    // Enviar notificaciones para todos los eventos activos
    const result = await sendNotificationsForAllActiveEvents();
    
    if (result.success) {
      console.log('✅', result.message);
      
      if (result.results.length === 0) {
        console.log('No se enviaron notificaciones');
      } else {
        console.log('\nResumen de notificaciones enviadas:');
        
        result.results.forEach((eventResult, index) => {
          console.log(`\nEvento #${index + 1}: ${eventResult.eventId}`);
          
          if (!eventResult.success) {
            console.log(`❌ Error: ${eventResult.error}`);
            return;
          }
          
          if (!eventResult.results || eventResult.results.length === 0) {
            console.log('No se enviaron notificaciones para este evento');
            return;
          }
          
          const successful = eventResult.results.filter(r => r.success).length;
          const failed = eventResult.results.filter(r => !r.success).length;
          
          console.log(`- Notificaciones enviadas: ${successful}`);
          console.log(`- Notificaciones fallidas: ${failed}`);
          
          if (failed > 0) {
            console.log('\nDetalles de notificaciones fallidas:');
            eventResult.results
              .filter(r => !r.success)
              .forEach(r => {
                console.log(`- ${r.parentName}: ${r.error}`);
              });
          }
        });
      }
    } else {
      console.error('❌ Error al enviar notificaciones:', result.error);
    }
  } catch (error) {
    console.error('❌ Error inesperado:', error);
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
