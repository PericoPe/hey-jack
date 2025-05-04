/**
 * Script para probar el envío de emails
 * Este script envía un email de prueba para verificar la configuración SMTP
 */
const { testEmail } = require('../utils/emailConfig');

/**
 * Función principal
 */
const main = async () => {
  console.log('Iniciando prueba de envío de email...');
  console.log('Fecha actual:', new Date().toISOString());
  
  try {
    // Enviar email de prueba
    const result = await testEmail();
    
    if (result.success) {
      console.log('\n✅ Email de prueba enviado correctamente');
      console.log('ID del mensaje:', result.info.messageId);
      
      // Mostrar información adicional
      console.log('\nInformación adicional:');
      console.log('- Remitente:', result.info.envelope.from);
      console.log('- Destinatario:', result.info.envelope.to);
      console.log('- Respuesta del servidor:', result.info.response);
      
      console.log('\nRecuerda:');
      console.log('1. Los emails enviados programáticamente a veces no aparecen en la carpeta "Enviados" de Gmail');
      console.log('2. Verifica la carpeta "Recibidos" para ver si el email de prueba llegó (enviado a ti mismo)');
      console.log('3. Revisa también la carpeta "Spam" o "Correo no deseado"');
    } else {
      console.error('\n❌ Error al enviar email de prueba:', result.error);
      
      // Mostrar posibles soluciones
      console.log('\nPosibles soluciones:');
      console.log('1. Verifica que la contraseña en emailConfig.js sea correcta');
      console.log('2. Si tienes verificación en dos pasos activada en Gmail, debes usar una "contraseña de aplicación":');
      console.log('   - Ve a tu cuenta de Google > Seguridad > Verificación en dos pasos');
      console.log('   - Desplázate hacia abajo hasta "Contraseñas de aplicaciones"');
      console.log('   - Crea una nueva contraseña para "Hey Jack"');
      console.log('   - Copia esta contraseña y reemplázala en el archivo src/utils/emailConfig.js');
      console.log('3. Asegúrate de que tu cuenta de Gmail permita el acceso de aplicaciones menos seguras');
      console.log('4. Verifica tu conexión a internet');
    }
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
