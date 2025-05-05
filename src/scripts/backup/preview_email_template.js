/**
 * Script para previsualizar el diseño del email de notificación
 * Envía un email de prueba y muestra el HTML en la consola
 */
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Configuración del transportador de email
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'javierhursino@gmail.com',
    pass: 'vrrh pefi imgf zfdb'
  },
  debug: true
});

/**
 * Genera el HTML del email de notificación
 * @returns {string} HTML del email
 */
const generateEmailHTML = () => {
  // Datos de ejemplo
  const data = {
    parentName: 'Juan Pérez',
    childName: 'Martín',
    communityName: 'Sala Roja - Jardín Nuevos Aires',
    birthdayDate: new Date('2025-05-15'),
    amount: 1500,
    mpAlias: 'juanperez.mp'
  };
  
  // Formatear la fecha del cumpleaños
  const formattedDate = data.birthdayDate.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  // Crear el HTML del email
  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Hey Jack - Cumpleaños de ${data.childName}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <!-- HEADER -->
        <tr>
          <td style="background: linear-gradient(135deg, #4e7df0, #8f57fb); padding: 30px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Hey Jack</h1>
            <p style="color: #ffffff; opacity: 0.9; margin: 5px 0 0; font-size: 16px;">Tu asistente para colectas de cumpleaños</p>
          </td>
        </tr>
        
        <!-- SALUDO -->
        <tr>
          <td style="padding: 30px 30px 20px;">
            <h2 style="color: #4e7df0; margin: 0 0 15px; font-size: 22px;">¡Hola ${data.parentName}! 👋</h2>
            <p style="color: #333; font-size: 16px; line-height: 1.5; margin: 0 0 15px;">
              Te escribimos porque <strong style="color: #4e7df0;">${data.childName}</strong> de la comunidad <strong>${data.communityName}</strong> cumplirá años el <strong>${formattedDate}</strong>.
            </p>
            <p style="color: #333; font-size: 16px; line-height: 1.5; margin: 0;">
              Para celebrar este día especial, estamos organizando una colecta para su regalo. ¡Queremos hacer de este cumpleaños un momento inolvidable!
            </p>
          </td>
        </tr>
        
        <!-- DETALLES DE LA COLECTA -->
        <tr>
          <td style="padding: 0 30px 30px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8f9ff; border-radius: 10px; overflow: hidden; border-left: 5px solid #4e7df0;">
              <tr>
                <td style="padding: 20px;">
                  <h3 style="color: #4e7df0; margin: 0 0 15px; font-size: 18px;">📋 Detalles de la colecta</h3>
                  
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td width="50%" style="padding: 8px 0; color: #666; font-size: 15px;">Monto a aportar:</td>
                      <td width="50%" style="padding: 8px 0; color: #333; font-size: 15px; font-weight: 600;">$${data.amount}</td>
                    </tr>
                    <tr>
                      <td width="50%" style="padding: 8px 0; color: #666; font-size: 15px;">Fecha límite:</td>
                      <td width="50%" style="padding: 8px 0; color: #333; font-size: 15px; font-weight: 600;">${formattedDate}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        
        <!-- INSTRUCCIONES DE PAGO -->
        <tr>
          <td style="padding: 0 30px 30px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fff9e6; border-radius: 10px; overflow: hidden; border-left: 5px solid #ff9800;">
              <tr>
                <td style="padding: 20px;">
                  <h3 style="color: #ff9800; margin: 0 0 15px; font-size: 18px;">💰 Información de pago</h3>
                  
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td width="50%" style="padding: 8px 0; color: #666; font-size: 15px;">Método de pago:</td>
                      <td width="50%" style="padding: 8px 0; color: #333; font-size: 15px; font-weight: 600;">Mercado Pago</td>
                    </tr>
                    <tr>
                      <td width="50%" style="padding: 8px 0; color: #666; font-size: 15px;">Alias:</td>
                      <td width="50%" style="padding: 8px 0; color: #333; font-size: 15px; font-weight: 600;">${data.mpAlias}</td>
                    </tr>
                  </table>
                  
                  <div style="margin-top: 15px; padding-top: 15px; border-top: 1px dashed #ffcc80;">
                    <p style="color: #333; font-size: 14px; line-height: 1.5; margin: 0;">
                      <strong>Importante:</strong> Una vez realizado el pago, por favor responde a este email con el comprobante o envía un mensaje de WhatsApp al organizador para confirmar tu aporte.
                    </p>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        
        <!-- MENSAJE FINAL -->
        <tr>
          <td style="padding: 0 30px 30px;">
            <p style="color: #333; font-size: 16px; line-height: 1.5; margin: 0 0 15px;">
              ¡Gracias por tu colaboración! Juntos haremos que este cumpleaños sea especial para ${data.childName}.
            </p>
            <p style="color: #333; font-size: 16px; line-height: 1.5; margin: 0;">
              Saludos cordiales,<br>
              <strong>Equipo Hey Jack</strong>
            </p>
          </td>
        </tr>
        
        <!-- FOOTER -->
        <tr>
          <td style="background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
            <p style="color: #999; font-size: 13px; margin: 0 0 5px;">
              Este es un mensaje automático enviado por Hey Jack, tu asistente para colectas de cumpleaños.
            </p>
            <p style="color: #999; font-size: 13px; margin: 0;">
              Si tienes alguna pregunta, por favor contacta al organizador de la comunidad.
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
  
  return html;
};

/**
 * Guarda el HTML en un archivo para visualizarlo
 * @param {string} html - HTML a guardar
 */
const saveHTMLToFile = (html) => {
  const filePath = path.join(__dirname, '..', '..', 'email_preview.html');
  fs.writeFileSync(filePath, html);
  console.log(`\nVista previa del email guardada en: ${filePath}`);
  console.log('Abre este archivo en tu navegador para ver cómo se verá el email.');
};

/**
 * Envía un email de prueba
 * @param {string} html - HTML del email
 * @param {string} to - Destinatario
 */
const sendTestEmail = async (html, to) => {
  try {
    console.log(`\nEnviando email de prueba a ${to}...`);
    
    const info = await transporter.sendMail({
      from: '"Hey Jack - Prueba" <javierhursino@gmail.com>',
      to,
      subject: 'Hey Jack - Vista previa del diseño de email',
      html
    });
    
    console.log(`✅ Email enviado correctamente a ${to}`);
    console.log('ID del mensaje:', info.messageId);
    
    return true;
  } catch (error) {
    console.error('Error al enviar email:', error);
    return false;
  }
};

/**
 * Función principal
 */
const main = async () => {
  console.log('=== PREVISUALIZACIÓN DEL DISEÑO DE EMAIL ===');
  
  try {
    // Generar el HTML del email
    console.log('\nGenerando HTML del email...');
    const html = generateEmailHTML();
    
    // Guardar el HTML en un archivo
    saveHTMLToFile(html);
    
    // Preguntar si desea enviar un email de prueba
    const testEmail = process.argv[2];
    
    if (testEmail) {
      // Enviar email de prueba
      await sendTestEmail(html, testEmail);
    } else {
      console.log('\nPara enviar un email de prueba, ejecuta:');
      console.log('node src/scripts/preview_email_template.js tu@email.com');
    }
    
    console.log('\n✅ Proceso completado');
  } catch (error) {
    console.error('Error:', error);
  }
};

// Ejecutar la función principal
main()
  .then(() => {
    console.log('Script finalizado');
  })
  .catch(error => {
    console.error('Error en el script:', error);
  });
