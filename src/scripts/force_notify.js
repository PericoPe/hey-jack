/**
 * Script para forzar el envío de notificaciones por email a los aportantes
 * Envía notificaciones independientemente del estado de notificación
 */
const supabase = require('../utils/supabaseClient');
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
  }
});

/**
 * Genera el HTML del email de notificación
 * @param {Object} data - Datos para el email
 * @returns {string} HTML del email
 */
const generateEmailHTML = (data) => {
  // Formatear la fecha del cumpleaños
  const formattedDate = new Date(data.birthdayDate).toLocaleDateString('es-AR', {
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
 * Envía un email de notificación
 * @param {Object} contributor - Datos del aportante
 * @param {Object} event - Datos del evento
 * @param {Object} community - Datos de la comunidad
 * @returns {Promise<boolean>} - True si se envió correctamente
 */
const sendNotificationEmail = async (contributor, event, community) => {
  try {
    // Datos para el email
    const emailData = {
      parentName: contributor.nombre_padre,
      childName: event.nombre_hijo,
      communityName: community.nombre_comunidad,
      birthdayDate: event.fecha_evento,
      amount: contributor.monto_individual,
      mpAlias: community.creador_mp_alias || 'heyjack.mp'
    };
    
    // Generar HTML del email
    const html = generateEmailHTML(emailData);
    
    // Enviar email
    const info = await transporter.sendMail({
      from: '"Hey Jack" <javierhursino@gmail.com>',
      to: contributor.email_padre,
      subject: `Hey Jack está recaudando para el cumpleaños de ${event.nombre_hijo}`,
      html
    });
    
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
  console.log('=== FORZAR ENVÍO DE NOTIFICACIONES ===');
  console.log('Fecha actual:', new Date().toISOString());
  
  // Crear archivo de log
  const logFile = path.join(__dirname, '..', '..', 'force_notify_log.txt');
  const log = (message) => {
    console.log(message);
    fs.appendFileSync(logFile, message + '\n');
  };
  
  // Iniciar log
  fs.writeFileSync(logFile, `=== FORZAR ENVÍO DE NOTIFICACIONES ===\n`);
  fs.appendFileSync(logFile, `Fecha: ${new Date().toISOString()}\n\n`);
  
  try {
    // Verificar conexión SMTP
    log('Verificando conexión SMTP...');
    await transporter.verify();
    log('✅ Conexión SMTP verificada correctamente');
    
    // Obtener eventos activos
    log('\nBuscando eventos activos...');
    const { data: activeEvents, error: eventsError } = await supabase
      .from('eventos_activos')
      .select('*')
      .eq('estado', 'activo');
    
    if (eventsError) {
      log('Error al obtener eventos activos: ' + JSON.stringify(eventsError));
      return;
    }
    
    if (!activeEvents || activeEvents.length === 0) {
      log('No se encontraron eventos activos. No se pueden enviar notificaciones.');
      return;
    }
    
    log(`Se encontraron ${activeEvents.length} eventos activos`);
    
    // Procesar cada evento activo
    for (const event of activeEvents) {
      log(`\nProcesando evento: ${event.nombre_hijo} (${event.id_evento || event.id})`);
      
      // Obtener datos de la comunidad
      const { data: community, error: communityError } = await supabase
        .from('comunidades')
        .select('*')
        .eq('id_comunidad', event.id_comunidad)
        .single();
      
      if (communityError) {
        log(`Error al obtener datos de la comunidad: ${JSON.stringify(communityError)}`);
        continue;
      }
      
      // Obtener aportantes del evento
      const { data: contributors, error: contributorsError } = await supabase
        .from('eventos_activos_aportantes')
        .select('*')
        .eq('id_evento', event.id_evento || event.id)
        .eq('estado_pago', 'pendiente');
      
      if (contributorsError) {
        log(`Error al obtener aportantes: ${JSON.stringify(contributorsError)}`);
        continue;
      }
      
      if (!contributors || contributors.length === 0) {
        log(`No se encontraron aportantes pendientes para el evento ${event.nombre_hijo}`);
        continue;
      }
      
      log(`Se encontraron ${contributors.length} aportantes pendientes`);
      
      // Enviar notificaciones a cada aportante
      for (const contributor of contributors) {
        log(`\nEnviando notificación a ${contributor.nombre_padre} (${contributor.email_padre})`);
        
        // Enviar email
        const success = await sendNotificationEmail(contributor, event, community);
        
        if (success) {
          log(`✅ Notificación enviada correctamente a ${contributor.email_padre}`);
          
          // Actualizar estado de notificación
          const { error: updateError } = await supabase
            .from('eventos_activos_aportantes')
            .update({
              notificacion_email: true,
              fecha_notificacion_email: new Date().toISOString()
            })
            .eq('id', contributor.id);
          
          if (updateError) {
            log(`Error al actualizar estado de notificación: ${JSON.stringify(updateError)}`);
          } else {
            log(`✅ Estado de notificación actualizado correctamente`);
          }
        } else {
          log(`❌ Error al enviar notificación a ${contributor.email_padre}`);
        }
      }
    }
    
    log('\n✅ Proceso completado');
  } catch (error) {
    log('Error inesperado: ' + JSON.stringify(error));
  }
  
  log('\n=== FIN DEL PROCESO ===');
  log(`Log guardado en: ${logFile}`);
  console.log(`Log guardado en: ${logFile}`);
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
