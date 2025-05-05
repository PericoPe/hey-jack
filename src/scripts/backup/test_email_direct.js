/**
 * Script para probar el envío de emails directamente
 * Este script envía un email de prueba para verificar la configuración SMTP
 */
const nodemailer = require('nodemailer');

/**
 * Función principal
 */
const main = async () => {
  console.log('=== TEST DE ENVÍO DE EMAIL DIRECTO ===');
  console.log('Fecha actual:', new Date().toISOString());
  
  try {
    // Crear transportador de email
    console.log('\nCreando transportador de email...');
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'javierhursino@gmail.com',
        pass: 'vrrh pefi imgf zfdb'
      },
      debug: true,
      logger: true
    });
    
    // Verificar conexión
    console.log('\nVerificando conexión con el servidor SMTP...');
    await transporter.verify();
    console.log('✅ Conexión con el servidor SMTP establecida correctamente');
    
    // Configurar opciones del email
    console.log('\nPreparando email de prueba...');
    const mailOptions = {
      from: '"Hey Jack Test" <javierhursino@gmail.com>',
      to: 'javierhursino@gmail.com',
      subject: 'Test de conexión SMTP - ' + new Date().toLocaleString(),
      text: 'Este es un email de prueba para verificar la conexión SMTP.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #4e7df0;">Test de conexión SMTP</h2>
          <p>Este es un email de prueba para verificar que la configuración SMTP está funcionando correctamente.</p>
          <p>Fecha y hora: <strong>${new Date().toLocaleString()}</strong></p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">Este es un mensaje automático enviado por Hey Jack.</p>
        </div>
      `
    };
    
    // Enviar el email
    console.log('\nEnviando email...');
    const info = await transporter.sendMail(mailOptions);
    
    console.log('\n✅ EMAIL ENVIADO EXITOSAMENTE');
    console.log('- ID del mensaje:', info.messageId);
    console.log('- Enviado a:', info.envelope.to);
    console.log('- Respuesta del servidor:', info.response);
    
    console.log('\nRecuerda:');
    console.log('1. Los emails enviados programáticamente a veces no aparecen en la carpeta "Enviados" de Gmail');
    console.log('2. Verifica la carpeta "Recibidos" para ver si el email de prueba llegó (enviado a ti mismo)');
    console.log('3. Revisa también la carpeta "Spam" o "Correo no deseado"');
    
    console.log('\n✅ LA CONFIGURACIÓN DE EMAIL ESTÁ FUNCIONANDO CORRECTAMENTE');
  } catch (error) {
    console.error('\n❌ ERROR AL ENVIAR EMAIL');
    console.error('- Mensaje de error:', error.message);
    console.error('- Código de error:', error.code);
    console.error('- Comando:', error.command);
    console.error('- Respuesta:', error.response);
    
    console.log('\nPosibles soluciones:');
    console.log('1. Verifica que la contraseña sea correcta');
    console.log('2. Si tienes verificación en dos pasos activada en Gmail, debes usar una "contraseña de aplicación"');
    console.log('3. Asegúrate de que tu cuenta de Gmail permita el acceso de aplicaciones menos seguras');
    console.log('4. Verifica tu conexión a internet');
  }
  
  console.log('\n=== FIN DEL TEST ===');
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
