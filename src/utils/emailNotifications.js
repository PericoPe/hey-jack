/**
 * Módulo para enviar notificaciones por email
 * Utilizado para notificar a los padres sobre los cumpleaños próximos y la recaudación
 */
const { transporter, senderEmail, senderName } = require('./emailConfig');
const supabase = require('./supabaseClient');

/**
 * Envía una notificación por email a un padre sobre un evento de cumpleaños
 * @param {Object} options - Opciones para el email
 * @param {string} options.to - Dirección de email del destinatario
 * @param {string} options.parentName - Nombre del padre destinatario
 * @param {string} options.childName - Nombre del niño que cumple años
 * @param {string} options.birthdayDate - Fecha del cumpleaños
 * @param {string} options.communityName - Nombre de la comunidad
 * @param {number} options.amount - Monto a aportar
 * @param {string} options.mpAlias - Alias de Mercado Pago para el pago
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
    const subject = `Hey-Jack! está recaudando para el cumpleaños de ${childName}`;

    // Crear el cuerpo del email con un diseño más atractivo y profesional
    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Hey-Jack! - Cumpleaños de ${childName}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <!-- HEADER -->
          <tr>
            <td style="background: linear-gradient(135deg, #4e7df0, #8f57fb); padding: 30px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Hey-Jack!</h1>
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
                <strong>Equipo Hey-Jack!</strong>
              </p>
            </td>
          </tr>
          
          <!-- FOOTER -->
          <tr>
            <td style="background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="color: #999; font-size: 13px; margin: 0 0 5px;">
                Este es un mensaje automático enviado por Hey-Jack!, tu asistente para colectas de cumpleaños.
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
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email enviado a ${to}: ${info.messageId}`);
    
    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    console.error('Error al enviar notificación por email:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Envía notificaciones por email a los padres que deben aportar para un evento activo
 * @param {Object} event - Evento activo
 * @returns {Promise<Object>} - Resultado del envío de notificaciones
 */
const sendBirthdayNotifications = async (event) => {
  try {
    console.log(`Enviando notificaciones para el cumpleaños de ${event.nombre_hijo}...`);
    
    // Obtener los aportantes pendientes de la tabla eventos_activos_aportantes
    const { data: contributors, error: contributorsError } = await supabase
      .from('eventos_activos_aportantes')
      .select('*')
      .eq('id_evento', event.id_evento)
      .eq('estado_pago', 'pendiente');
    
    if (contributorsError) {
      console.error(`Error al obtener aportantes para el evento ${event.id_evento}:`, contributorsError);
      return { success: false, error: contributorsError };
    }
    
    if (!contributors || contributors.length === 0) {
      console.log('El evento no tiene aportantes pendientes');
      return { success: true, sent: 0, errors: 0 };
    }
    
    console.log(`Se encontraron ${contributors.length} aportantes pendientes`);
    
    let sent = 0;
    let errors = 0;
    
    // Obtener datos de la comunidad
    const { data: communityData, error: communityError } = await supabase
      .from('comunidades')
      .select('*')
      .eq('id_comunidad', event.id_comunidad)
      .single();
    
    if (communityError) {
      console.error(`Error al obtener datos de la comunidad ${event.id_comunidad}:`, communityError);
      return { success: false, error: communityError };
    }
    
    // Obtener datos del creador de la comunidad
    const { data: creatorData, error: creatorError } = await supabase
      .from('miembros')
      .select('*')
      .eq('id_comunidad', event.id_comunidad)
      .eq('perfil', 'creador')
      .single();
    
    if (creatorError) {
      console.error(`Error al obtener datos del creador de la comunidad ${event.id_comunidad}:`, creatorError);
      return { success: false, error: creatorError };
    }
    
    // Para cada aportante pendiente, enviar una notificación
    for (const contributor of contributors) {
      // Verificar si ya se envió una notificación por email
      if (contributor.notificacion_email) {
        console.log(`Ya se envió notificación por email a ${contributor.nombre_padre}`);
        continue;
      }
      
      // Verificar si tiene email
      if (!contributor.email_padre) {
        console.log(`No se encontró email para ${contributor.nombre_padre}`);
        errors++;
        continue;
      }
      
      // Enviar email
      const emailData = {
        to: contributor.email_padre,
        subject: `Hey-Jack! está recaudando para el cumpleaños de ${event.nombre_hijo}`,
        text: generateEmailText({
          parentName: contributor.nombre_padre,
          childName: event.nombre_hijo,
          birthday: formatDate(event.fecha_cumple),
          communityName: communityData.nombre_comunidad,
          institution: communityData.institucion,
          grade: communityData.grado,
          division: communityData.division,
          amount: contributor.monto_individual,
          creatorName: creatorData.nombre_padre,
          aliasMp: creatorData.alias_mp || communityData.creador_alias_mp
        }),
        html: generateEmailHtml({
          parentName: contributor.nombre_padre,
          childName: event.nombre_hijo,
          birthday: formatDate(event.fecha_cumple),
          communityName: communityData.nombre_comunidad,
          institution: communityData.institucion,
          grade: communityData.grado,
          division: communityData.division,
          amount: contributor.monto_individual,
          creatorName: creatorData.nombre_padre,
          aliasMp: creatorData.alias_mp || communityData.creador_alias_mp
        })
      };
      
      const result = await sendEmail(emailData);
      
      if (result.success) {
        console.log(`✅ Notificación enviada a ${contributor.nombre_padre} (${contributor.email_padre})`);
        
        // Actualizar el registro en la tabla eventos_activos_aportantes
        const { error: updateError } = await supabase
          .from('eventos_activos_aportantes')
          .update({
            notificacion_email: true,
            fecha_notificacion_email: new Date().toISOString()
          })
          .eq('id', contributor.id);
        
        if (updateError) {
          console.error(`Error al actualizar registro de notificación para ${contributor.nombre_padre}:`, updateError);
        }
        
        sent++;
      } else {
        console.error(`Error al enviar notificación a ${contributor.nombre_padre}:`, result.error);
        errors++;
      }
    }
    
    console.log(`Notificaciones enviadas: ${sent}, errores: ${errors}`);
    
    return { success: true, sent, errors };
  } catch (error) {
    console.error('Error al enviar notificaciones:', error);
    return { success: false, error };
  }
};

/**
 * Envía notificaciones por email a todos los padres que deben aportar para un evento activo
 * @param {string} eventId - ID del evento activo
 * @returns {Promise} - Promesa con el resultado del envío
 */
const sendNotificationsForEvent = async (eventId) => {
  try {
    // Obtener detalles del evento activo
    const { data: event, error: eventError } = await supabase
      .from('eventos_activos')
      .select('*')
      .eq('id_evento', eventId)
      .single();
    
    if (eventError) throw eventError;
    if (!event) throw new Error(`No se encontró el evento con ID ${eventId}`);
    
    // Enviar notificaciones
    const result = await sendBirthdayNotifications(event);
    
    return {
      success: true,
      eventId,
      sent: result.sent,
      errors: result.errors
    };
  } catch (error) {
    console.error(`Error al enviar notificaciones para el evento ${eventId}:`, error);
    return {
      success: false,
      eventId,
      error: error.message
    };
  }
};

/**
 * Envía notificaciones por email para todos los eventos activos
 * @returns {Promise} - Promesa con el resultado del envío
 */
const sendNotificationsForAllActiveEvents = async () => {
  try {
    // Obtener todos los eventos activos
    const { data: events, error } = await supabase
      .from('eventos_activos')
      .select('*')
      .eq('estado', 'activo');
    
    if (error) throw error;
    if (!events || events.length === 0) {
      console.log('No se encontraron eventos activos');
      return {
        success: true,
        message: 'No se encontraron eventos activos',
        results: []
      };
    }
    
    console.log(`Enviando notificaciones para ${events.length} eventos activos`);
    
    // Enviar notificaciones para cada evento activo
    const results = [];
    
    for (const event of events) {
      const result = await sendNotificationsForEvent(event.id_evento);
      results.push(result);
    }
    
    return {
      success: true,
      message: `Se enviaron notificaciones para ${events.length} eventos activos`,
      results
    };
  } catch (error) {
    console.error('Error al enviar notificaciones para todos los eventos activos:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Registra un pago para un miembro en un evento activo
 * @param {Object} options - Opciones para registrar el pago
 * @param {string} options.eventId - ID del evento activo
 * @param {string} options.parentName - Nombre del padre que realizó el pago
 * @param {number} options.amount - Monto pagado
 * @param {string} options.paymentMethod - Método de pago (mercadopago, transferencia, efectivo)
 * @param {string} options.paymentReference - Referencia del pago (opcional)
 * @returns {Promise} - Promesa con el resultado del registro
 */
const registerPayment = async (options) => {
  try {
    const {
      eventId,
      parentName,
      amount,
      paymentMethod,
      paymentReference
    } = options;
    
    // Obtener detalles del evento activo
    const { data: event, error: eventError } = await supabase
      .from('eventos_activos')
      .select('*')
      .eq('id_evento', eventId)
      .single();
    
    if (eventError) throw eventError;
    if (!event) throw new Error(`No se encontró el evento con ID ${eventId}`);
    
    // Verificar si el miembro está en la lista de pendientes
    const miembrosPendientes = [...event.miembros_pendientes];
    const memberIndex = miembrosPendientes.findIndex(m => m.nombre_padre === parentName);
    
    if (memberIndex === -1) {
      throw new Error(`El miembro ${parentName} no está en la lista de pendientes para el evento ${eventId}`);
    }
    
    // Verificar si el miembro ya ha pagado
    if (miembrosPendientes[memberIndex].estado_pago !== 'pendiente') {
      throw new Error(`El miembro ${parentName} ya ha pagado para el evento ${eventId}`);
    }
    
    // Actualizar el estado de pago del miembro
    miembrosPendientes[memberIndex] = {
      ...miembrosPendientes[memberIndex],
      estado_pago: 'pagado',
      monto_pagado: amount,
      metodo_pago: paymentMethod,
      referencia_pago: paymentReference,
      fecha_pago: new Date().toISOString()
    };
    
    // Calcular el nuevo monto recaudado
    const nuevoRecaudado = event.recaudado + amount;
    
    // Actualizar el evento activo
    const { data: updatedEvent, error: updateError } = await supabase
      .from('eventos_activos')
      .update({
        miembros_pendientes: miembrosPendientes,
        recaudado: nuevoRecaudado
      })
      .eq('id_evento', eventId)
      .select();
    
    if (updateError) throw updateError;
    
    console.log(`Pago registrado para ${parentName} en el evento ${eventId}`);
    
    return {
      success: true,
      message: `Pago registrado para ${parentName} en el evento ${eventId}`,
      event: updatedEvent[0]
    };
  } catch (error) {
    console.error('Error al registrar pago:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  sendBirthdayNotification,
  sendNotificationsForEvent,
  sendNotificationsForAllActiveEvents,
  registerPayment
};
