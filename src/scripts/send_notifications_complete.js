/**
 * Script para enviar notificaciones por email a los padres que deben aportar
 * para eventos activos de cumpleaños
 */
const supabase = require('../utils/supabaseClient');
const nodemailer = require('nodemailer');
const { senderEmail, senderName } = require('../utils/emailConfig');

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
 * Envía una notificación por email a un padre sobre un evento de cumpleaños
 * @param {Object} options - Opciones para el email
 * @returns {Promise} - Promesa con el resultado del envío
 */
const sendBirthdayNotification = async (options) => {
  try {
    const {
      to,
      parentName,
      childName,
      birthdayDate,
      communityName,
      amount,
      mpAlias
    } = options;

    // Formatear la fecha del cumpleaños
    const formattedDate = new Date(birthdayDate).toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    // Crear el asunto del email
    const subject = `Hey Jack está recaudando para el cumpleaños de ${childName}`;

    // Crear el cuerpo del email con un diseño más atractivo y profesional
    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Hey Jack - Cumpleaños de ${childName}</title>
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
              <h2 style="color: #4e7df0; margin: 0 0 15px; font-size: 22px;">¡Hola ${parentName}! 👋</h2>
              <p style="color: #333; font-size: 16px; line-height: 1.5; margin: 0 0 15px;">
                Te escribimos porque <strong style="color: #4e7df0;">${childName}</strong> de la comunidad <strong>${communityName}</strong> cumplirá años el <strong>${formattedDate}</strong>.
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
                        <td width="50%" style="padding: 8px 0; color: #333; font-size: 15px; font-weight: 600;">$${amount}</td>
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
                        <td width="50%" style="padding: 8px 0; color: #333; font-size: 15px; font-weight: 600;">${mpAlias}</td>
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
                ¡Gracias por tu colaboración! Juntos haremos que este cumpleaños sea especial para ${childName}.
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

    // Configurar el email
    const mailOptions = {
      from: `"${senderName}" <${senderEmail}>`,
      to,
      subject,
      html
    };

    // Enviar el email
    console.log(`Enviando email a ${to}...`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email enviado a ${to} (ID: ${info.messageId})`);
    
    return {
      success: true,
      messageId: info.messageId,
      to
    };
  } catch (error) {
    console.error(`❌ Error al enviar email a ${options.to}:`, error.message);
    return {
      success: false,
      error: error.message,
      to: options.to
    };
  }
};

/**
 * Envía notificaciones por email para todos los eventos activos
 * @returns {Promise<Object>} - Resultado del envío de notificaciones
 */
const sendNotificationsForAllActiveEvents = async () => {
  try {
    console.log('\nBuscando eventos activos...');
    
    // Obtener todos los eventos activos
    const { data: activeEvents, error: eventsError } = await supabase
      .from('eventos_activos')
      .select('*')
      .eq('estado', 'activo');
    
    if (eventsError) {
      console.error('Error al obtener eventos activos:', eventsError);
      return { success: false, error: eventsError.message };
    }
    
    if (!activeEvents || activeEvents.length === 0) {
      console.log('No se encontraron eventos activos');
      return { success: true, sent: 0, failed: 0, sentDetails: [], failedDetails: [] };
    }
    
    console.log(`Se encontraron ${activeEvents.length} eventos activos`);
    
    // Resultados del envío
    const results = {
      sent: 0,
      failed: 0,
      sentDetails: [],
      failedDetails: []
    };
    
    // Para cada evento activo
    for (const event of activeEvents) {
      console.log(`\n📅 Procesando evento: ${event.nombre_hijo} (${event.id_evento})`);
      
      // Obtener los aportantes pendientes de la tabla eventos_activos_aportantes
      const { data: contributors, error: contributorsError } = await supabase
        .from('eventos_activos_aportantes')
        .select('*')
        .eq('id_evento', event.id_evento)
        .eq('estado_pago', 'pendiente')
        .eq('notificacion_email', false);
      
      if (contributorsError) {
        console.error(`Error al obtener aportantes para el evento ${event.id_evento}:`, contributorsError);
        continue;
      }
      
      if (!contributors || contributors.length === 0) {
        console.log(`No se encontraron aportantes pendientes de notificación para el evento ${event.id_evento}`);
        continue;
      }
      
      console.log(`Se encontraron ${contributors.length} aportantes pendientes de notificación`);
      
      // Obtener información de la comunidad para el alias de Mercado Pago
      const { data: community, error: communityError } = await supabase
        .from('comunidades')
        .select('*')
        .eq('id_comunidad', event.id_comunidad)
        .single();
      
      if (communityError) {
        console.error(`Error al obtener información de la comunidad ${event.id_comunidad}:`, communityError);
        continue;
      }
      
      const mpAlias = community.creador_whatsapp || 'No disponible';
      
      // Para cada aportante pendiente
      for (const contributor of contributors) {
        // Verificar si tiene email
        if (!contributor.email_padre) {
          console.log(`El aportante ${contributor.nombre_padre} no tiene email registrado`);
          results.failed++;
          results.failedDetails.push({
            to: contributor.nombre_padre,
            error: 'No tiene email registrado'
          });
          continue;
        }
        
        // Enviar notificación por email
        const notificationResult = await sendBirthdayNotification({
          to: contributor.email_padre,
          parentName: contributor.nombre_padre,
          childName: event.nombre_hijo,
          birthdayDate: event.fecha_cumple,
          communityName: event.nombre_comunidad,
          amount: contributor.monto_individual,
          mpAlias
        });
        
        if (notificationResult.success) {
          // Actualizar el estado de notificación en la base de datos
          const { error: updateError } = await supabase
            .from('eventos_activos_aportantes')
            .update({
              notificacion_email: true,
              fecha_notificacion_email: new Date().toISOString()
            })
            .eq('id', contributor.id);
          
          if (updateError) {
            console.error(`Error al actualizar estado de notificación para ${contributor.nombre_padre}:`, updateError);
          } else {
            console.log(`✅ Estado de notificación actualizado para ${contributor.nombre_padre}`);
          }
          
          results.sent++;
          results.sentDetails.push({
            to: contributor.email_padre,
            messageId: notificationResult.messageId
          });
        } else {
          results.failed++;
          results.failedDetails.push({
            to: contributor.email_padre,
            error: notificationResult.error
          });
        }
      }
    }
    
    return {
      success: true,
      ...results
    };
  } catch (error) {
    console.error('Error al enviar notificaciones:', error);
    return { success: false, error: error.message };
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
  
  console.log('\n=== FIN DEL ENVÍO DE NOTIFICACIONES ===');
  console.log('Finalización:', new Date().toISOString());
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
