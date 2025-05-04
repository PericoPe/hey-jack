/**
 * Configuración para el servicio de email
 * Utiliza nodemailer para enviar correos electrónicos
 */
const nodemailer = require('nodemailer');

// Configuración del transportador de email
// NOTA: Esta configuración es solo para desarrollo y pruebas
// En producción, se recomienda usar variables de entorno o un servicio de gestión de secretos
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'javierhursino@gmail.com',
    pass: '1982Roger' // IMPORTANTE: Esta contraseña debe ser reemplazada por una contraseña de aplicación en producción
  }
});

// Función para verificar la conexión con el servidor de email
const verifyEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log('Conexión con el servidor de email establecida correctamente');
    return true;
  } catch (error) {
    console.error('Error al conectar con el servidor de email:', error);
    return false;
  }
};

module.exports = {
  transporter,
  verifyEmailConnection,
  senderEmail: 'javierhursino@gmail.com',
  senderName: 'Hey Jack - Asistente de Cumpleaños'
};
