/**
 * Configuración para el servicio de email
 * Utiliza nodemailer para enviar correos electrónicos
 */
const nodemailer = require('nodemailer');

// Configuración del transportador de email
// Para Gmail, es recomendable usar una "contraseña de aplicación" en lugar de la contraseña normal
// https://support.google.com/accounts/answer/185833
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'javierhursino@gmail.com', // Tu dirección de email
    pass: process.env.EMAIL_PASSWORD || 'tu_contraseña_de_aplicación' // Usar variable de entorno por seguridad
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
