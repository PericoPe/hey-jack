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
    pass: '1982Roger' // IMPORTANTE: Esta contraseña debe ser reemplazada por una contraseña de aplicación
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
    
    const info = await transporter.sendMail({
      from: '"Hey Jack Test" <javierhursino@gmail.com>',
      to: 'javierhursino@gmail.com',
      subject: 'Test de conexión SMTP',
      text: 'Este es un email de prueba para verificar la conexión SMTP.',
      html: '<b>Este es un email de prueba para verificar la conexión SMTP.</b>'
    });
    
    console.log('Email de prueba enviado:');
    console.log('- ID del mensaje:', info.messageId);
    console.log('- URL de vista previa:', nodemailer.getTestMessageUrl(info));
    
    return { success: true, info };
  } catch (error) {
    console.error('Error al enviar email de prueba:', error);
    return { success: false, error };
  }
};

// Exportar el transportador, la información del remitente y la función de prueba
module.exports = {
  transporter,
  senderEmail: 'javierhursino@gmail.com',
  senderName: 'Hey Jack - Asistente de Cumpleaños',
  testEmail
};
