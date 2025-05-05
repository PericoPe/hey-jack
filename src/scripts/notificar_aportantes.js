
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Crear cliente de Supabase
const supabaseUrl = 'https://xpwfqfpwhnzuazvfltcx.supabase.co';
const supabaseKey "[REDACTED]";
const supabase = createClient(supabaseUrl, supabaseKey);

// Configuración del transportador de email
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'javierhursino@gmail.com',
    pass: "[REDACTED]"
  }
});

// Crear archivo para guardar el registro de emails enviados
const logDir = path.join(__dirname, '..', '..');
const logFile = path.join(logDir, 'emails_enviados.html');

// Inicializar archivo de log
fs.writeFileSync(logFile, `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Emails Enviados - Hey Jack</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #4e7df0; }
    .email-container { border: 1px solid #ddd; margin: 20px 0; padding: 15px; border-radius: 5px; }
    .email-header { background-color: #f5f9ff; padding: 10px; margin-bottom: 15px; border-radius: 5px; }
    .email-content { border: 1px dashed #eee; padding: 15px; margin-top: 15px; }
    .success { color: green; }
    .error { color: red; }
  </style>
</head>
<body>
  <h1>Emails Enviados - Hey Jack</h1>
  <p>Fecha: ${new Date().toLocaleString('es-AR')}</p>
  <hr>
`);


function generateEmailHTML(data) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Hey Jack - Notificación de Aporte</title>
    </head>
    <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f9ff;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
        <tr>
          <td style="padding: 30px 0; text-align: center; background: linear-gradient(135deg, #4e7df0, #8f57fb);">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Hey Jack</h1>
            <p style="color: #ffffff; opacity: 0.9; margin: 5px 0 0;">Tu asistente para colectas de cumpleaños</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 30px;">
            <h2 style="color: #4e7df0; margin-top: 0;">¡Hola ${data.nombre_padre}!</h2>
            <p>Te recordamos que estamos organizando una colecta para el cumpleaños de <strong>${data.nombre_hijo}</strong> de la comunidad <strong>${data.nombre_comunidad}</strong>.</p>
            
            <div style="background-color: #f5f9ff; border-left: 4px solid #4e7df0; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <h3 style="margin-top: 0; color: #4e7df0;">Detalles del aporte</h3>
              <p><strong>Monto a aportar:</strong> $${data.monto_individual}</p>
              <p><strong>Fecha del cumpleaños:</strong> ${new Date(data.fecha_cumple).toLocaleDateString('es-AR')}</p>
              <p><strong>Estado de tu aporte:</strong> ${data.estado_pago === 'pagado' ? 'Pagado' : 'Pendiente'}</p>
            </div>
            
            ${data.estado_pago !== 'pagado' ? `
            <div style="background-color: #fff9e6; border-left: 4px solid #ff9800; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <h3 style="margin-top: 0; color: #ff9800;">Información de pago</h3>
              <p>Puedes realizar tu aporte a través de Mercado Pago al alias: <strong>${data.mp_alias || 'heyjack.mp'}</strong></p>
              <p>Una vez realizado el pago, por favor responde a este email con el comprobante.</p>
            </div>
            ` : ''}
            
            <p>¡Gracias por tu colaboración! Juntos haremos que este cumpleaños sea especial.</p>
            <p>Saludos cordiales,<br>Equipo Hey Jack</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 20px; text-align: center; background-color: #f5f5f5; color: #999; font-size: 12px;">
            <p>Este es un mensaje automático enviado por Hey Jack.</p>
            <p>Si tienes alguna pregunta, por favor contacta al organizador de la comunidad.</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}


async function main() {
  console.log('=== ENVÍO DE NOTIFICACIONES A APORTANTES ===');
  console.log('Fecha:', new Date().toLocaleString('es-AR'));
  
  try {
    // 1. Verificar conexión con el servidor SMTP
    console.log('\n1. Verificando conexión SMTP...');
    await transporter.verify();
    console.log('✅ Conexión SMTP verificada correctamente');
    
    // 2. Obtener todos los eventos activos
    console.log('\n2. Obteniendo eventos activos...');
    const { data: eventos, error: eventosError } = await supabase
      .from('eventos_activos')
      .select('*')
      .eq('estado', 'activo');
    
    if (eventosError) {
      console.error('Error al obtener eventos activos:', eventosError.message);
      return;
    }
    
    if (!eventos || eventos.length === 0) {
      console.log('No hay eventos activos');
      return;
    }
    
    console.log(`Se encontraron ${eventos.length} eventos activos`);
    
    let totalAportantes = 0;
    let emailsEnviados = 0;
    
    // 3. Procesar cada evento activo
    for (const evento of eventos) {
      console.log(`\nProcesando evento: ${evento.nombre_hijo} (ID: ${evento.id_evento})`);
      
      // Obtener comunidad
      const { data: comunidad, error: comunidadError } = await supabase
        .from('comunidades')
        .select('*')
        .eq('id_comunidad', evento.id_comunidad)
        .single();
      
      if (comunidadError) {
        console.error('Error al obtener datos de la comunidad:', comunidadError.message);
        continue;
      }
      
      // Obtener aportantes del evento
      const { data: aportantes, error: aportantesError } = await supabase
        .from('eventos_activos_aportantes')
        .select('*')
        .eq('id_evento', evento.id_evento);
      
      if (aportantesError) {
        console.error('Error al obtener aportantes:', aportantesError.message);
        continue;
      }
      
      if (!aportantes || aportantes.length === 0) {
        console.log('No hay aportantes para este evento');
        continue;
      }
      
      console.log(`Se encontraron ${aportantes.length} aportantes para este evento`);
      totalAportantes += aportantes.length;
      
      // 4. Enviar email a cada aportante
      for (const aportante of aportantes) {
        if (!aportante.email_padre) {
          console.log(`Aportante ${aportante.nombre_padre} no tiene email, omitiendo...`);
          continue;
        }
        
        console.log(`\nEnviando email a ${aportante.nombre_padre} (${aportante.email_padre})...`);
        
        const emailData = {
          nombre_padre: aportante.nombre_padre,
          nombre_hijo: evento.nombre_hijo,
          nombre_comunidad: evento.nombre_comunidad,
          fecha_cumple: evento.fecha_cumple,
          monto_individual: aportante.monto_individual,
          estado_pago: aportante.estado_pago,
          mp_alias: comunidad.creador_mp_alias
        };
        
        const html = generateEmailHTML(emailData);
        
        try {
          // Enviar email
          const info = await transporter.sendMail({
            from: '"Hey Jack" <javierhursino@gmail.com>',
            to: aportante.email_padre,
            subject: `Recordatorio: Aporte para el cumpleaños de ${evento.nombre_hijo}`,
            html
          });
          
          console.log(`✅ Email enviado correctamente: ${info.messageId}`);
          emailsEnviados++;
          
          // Guardar copia del email en el archivo de log
          fs.appendFileSync(logFile, `
            <div class="email-container">
              <div class="email-header">
                <h2>Email #${emailsEnviados}</h2>
                <p><strong>Para:</strong> ${aportante.nombre_padre} (${aportante.email_padre})</p>
                <p><strong>Asunto:</strong> Recordatorio: Aporte para el cumpleaños de ${evento.nombre_hijo}</p>
                <p><strong>Enviado:</strong> ${new Date().toLocaleString('es-AR')}</p>
                <p class="success">✅ Enviado correctamente (ID: ${info.messageId})</p>
              </div>
              <div class="email-content">
                ${html}
              </div>
            </div>
          `);
          
          // Actualizar estado de notificación en la base de datos
          const { error: updateError } = await supabase
            .from('eventos_activos_aportantes')
            .update({
              notificacion_email: true,
              fecha_notificacion_email: new Date().toISOString()
            })
            .eq('id', aportante.id);
          
          if (updateError) {
            console.error('Error al actualizar estado de notificación:', updateError.message);
          } else {
            console.log('Estado de notificación actualizado correctamente');
          }
        } catch (emailError) {
          console.error('Error al enviar email:', emailError.message);
          
          // Guardar error en el archivo de log
          fs.appendFileSync(logFile, `
            <div class="email-container">
              <div class="email-header">
                <h2>Email #${emailsEnviados + 1} - ERROR</h2>
                <p><strong>Para:</strong> ${aportante.nombre_padre} (${aportante.email_padre})</p>
                <p><strong>Asunto:</strong> Recordatorio: Aporte para el cumpleaños de ${evento.nombre_hijo}</p>
                <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-AR')}</p>
                <p class="error">❌ Error al enviar: ${emailError.message}</p>
              </div>
            </div>
          `);
        }
      }
    }
    
    // Cerrar archivo de log
    fs.appendFileSync(logFile, `
      <hr>
      <h2>Resumen</h2>
      <p>Total de aportantes: ${totalAportantes}</p>
      <p>Emails enviados: ${emailsEnviados}</p>
      <p>Fecha de finalización: ${new Date().toLocaleString('es-AR')}</p>
    </body>
    </html>
    `);
    
    console.log(`\n=== RESUMEN ===`);
    console.log(`Total de aportantes: ${totalAportantes}`);
    console.log(`Emails enviados: ${emailsEnviados}`);
    console.log(`Archivo de log guardado en: ${logFile}`);
    console.log(`\n=== PROCESO COMPLETADO ===`);
  } catch (error) {
    console.error('Error general:', error);
    
    // Cerrar archivo de log en caso de error
    fs.appendFileSync(logFile, `
      <hr>
      <h2>Error General</h2>
      <p class="error">${error.message}</p>
      <p>Fecha de finalización: ${new Date().toLocaleString('es-AR')}</p>
    </body>
    </html>
    `);
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
