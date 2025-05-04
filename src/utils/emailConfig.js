/**
 * Configuración para el envío de emails
 * Utiliza nodemailer para enviar notificaciones por email
 */
const nodemailer = require('nodemailer');

// Configuración del transportador de email con opciones avanzadas
// NOTA: Esta configuración es solo para desarrollo y pruebas
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // true para 465, false para otros puertos
  auth: {
    user: 'javierhursino@gmail.com',
    // Contraseña de aplicación generada en la configuración de seguridad de Google
    pass: process.env.EMAIL_PASSWORD || 'vrrh pefi imgf zfdb'
  },
  debug: true, // Mostrar información de depuración
  logger: true, // Registrar actividad en la consola
  tls: {
    // No fallar en certificados inválidos
    rejectUnauthorized: false
  }
});

// Verificar la conexión con el servidor SMTP
transporter.verify(function(error, success) {
  if (error) {
    console.error('Error al conectar con el servidor SMTP:', error);
    console.error('Detalles del error:', JSON.stringify(error, null, 2));
    
    // Sugerencias para solucionar el problema
    console.log('\nPosibles soluciones:');
    console.log('1. Verifica que la contraseña sea correcta');
    console.log('2. Si tienes verificación en dos pasos activada, debes usar una "contraseña de aplicación"');
    console.log('3. Asegúrate de que tu cuenta de Gmail permita el acceso de aplicaciones menos seguras');
    console.log('4. Verifica tu conexión a internet');
  } else {
    console.log('\n✅ Servidor SMTP listo para enviar mensajes');
  }
});

// Función para probar el envío de un email
const testEmail = async () => {
  try {
    console.log('Enviando email de prueba...');
    
    // Configurar opciones del email
    const mailOptions = {
      from: `"Hey Jack Test" <javierhursino@gmail.com>`,
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
    const info = await transporter.sendMail(mailOptions);
    
    console.log('\n✅ Email de prueba enviado exitosamente:');
    console.log('- ID del mensaje:', info.messageId);
    console.log('- Enviado a:', info.envelope.to);
    console.log('- Respuesta del servidor:', info.response);
    
    return { success: true, info };
  } catch (error) {
    console.error('\n❌ Error al enviar email de prueba:');
    console.error('- Mensaje de error:', error.message);
    console.error('- Código de error:', error.code);
    console.error('- Comando:', error.command);
    console.error('- Respuesta:', error.response);
    
    return { success: false, error: error.message };
  }
};

// Exportar el transportador, la información del remitente y la función de prueba
module.exports = {
  transporter,
  senderEmail: 'javierhursino@gmail.com',
  senderName: 'Hey Jack - Asistente de Cumpleaños',
  testEmail
};
