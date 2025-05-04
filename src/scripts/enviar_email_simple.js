/**
 * Script ultra simple para enviar un email de prueba
 */
const supabase = require('../utils/supabaseClient');
const nodemailer = require('nodemailer');

// Configuración del transportador de email
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'javierhursino@gmail.com',
    pass: 'vrrh pefi imgf zfdb'
  }
});

// Función principal
async function main() {
  console.log('Enviando email de prueba...');
  
  try {
    // Enviar email directamente sin complicaciones
    const info = await transporter.sendMail({
      from: '"Hey Jack" <javierhursino@gmail.com>',
      to: 'javierhursino@gmail.com',
      subject: 'PRUEBA SIMPLE: Notificación de Hey Jack',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="color: #4e7df0;">¡Hola!</h2>
          <p>Este es un email de PRUEBA SIMPLE para verificar que el sistema de notificaciones funciona.</p>
          <p>Fecha y hora: ${new Date().toLocaleString('es-AR')}</p>
          <p>¡Gracias!</p>
          <p>Equipo Hey Jack</p>
        </div>
      `
    });
    
    console.log('✅ Email enviado correctamente:', info.messageId);
  } catch (error) {
    console.error('❌ Error al enviar email:', error);
  }
}

// Ejecutar la función principal
main()
  .then(() => {
    console.log('Script finalizado');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error fatal:', error);
    process.exit(1);
  });
