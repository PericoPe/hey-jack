/**
 * Script para enviar notificaciones por email a los padres que deben aportar
 * para eventos activos de cumpleaños
 */
const { sendNotificationsForAllActiveEvents } = require('../utils/emailNotifications');
const { transporter } = require('../utils/emailConfig');

/**
 * Verifica la conexión con el servidor SMTP
 * @returns {Promise<boolean>} - Promesa que se resuelve a true si la conexión es exitosa
 */
const verifySmtpConnection = async () => {
  try {
    console.log('\nVerificando conexión con el servidor SMTP...');
    await transporter.verify();
    console.log('✅ Conexión con el servidor SMTP establecida correctamente');
    return true;
  } catch (error) {
    console.error('\n❌ Error al conectar con el servidor SMTP:', error.message);
    return false;
  }
};

/**
 * Función principal
 */
const main = async () => {
  console.log('=== ENVÍO DE NOTIFICACIONES POR EMAIL ===');
  console.log('Fecha actual:', new Date().toISOString());
  
  try {
    // Verificar conexión SMTP
    const isConnected = await verifySmtpConnection();
    
    if (!isConnected) {
      console.error('\n❌ No se puede continuar sin una conexión SMTP válida');
      console.log('\nPosibles soluciones:');
      console.log('1. Verifica que la contraseña en emailConfig.js sea correcta');
      console.log('2. Asegúrate de que tu cuenta de Gmail permita el acceso de aplicaciones');
      console.log('3. Verifica tu conexión a internet');
      return;
    }
    
    console.log('\nEnviando notificaciones por email...');
    
    // Enviar notificaciones para todos los eventos activos
    const result = await sendNotificationsForAllActiveEvents();
    
    if (result && result.success) {
      console.log('\n✅ NOTIFICACIONES ENVIADAS CORRECTAMENTE');
      console.log(`Total de notificaciones enviadas: ${result.sent || 0}`);
      console.log(`Total de notificaciones fallidas: ${result.failed || 0}`);
      
      if (result.sentDetails && result.sentDetails.length > 0) {
        console.log('\nDetalles de notificaciones enviadas:');
        result.sentDetails.forEach((detail, index) => {
          console.log(`${index + 1}. Enviado a: ${detail.to} (ID del mensaje: ${detail.messageId})`);
        });
      } else {
        console.log('\nNo se enviaron notificaciones. Posibles razones:');
        console.log('- No hay eventos activos en este momento');
        console.log('- Todos los aportantes ya han sido notificados');
        console.log('- No hay aportantes registrados para los eventos activos');
      }
      
      if (result.failedDetails && result.failedDetails.length > 0) {
        console.log('\nDetalles de notificaciones fallidas:');
        result.failedDetails.forEach((detail, index) => {
          console.log(`${index + 1}. Falló para: ${detail.to} (Error: ${detail.error})`);
        });
      }
    } else {
      console.error('\n❌ Error al enviar notificaciones:', result ? result.error : 'Resultado indefinido');
    }
  } catch (error) {
    console.error('\n❌ Error inesperado:', error.message);
    console.error(error.stack);
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
