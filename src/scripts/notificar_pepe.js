
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');

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

// Función principal
async function main() {
  console.log('Notificando a Pepe Argento sobre el cumpleaños de Milan...');
  
  try {
    // 1. Verificar si existe el evento de Milan
    console.log('Buscando evento de Milan...');
    const { data: eventos, error: eventosError } = await supabase
      .from('eventos_activos')
      .select('*')
      .ilike('nombre_hijo', '%Milan%')
      .limit(1);
    
    if (eventosError) {
      console.error('Error al buscar evento de Milan:', eventosError.message);
      return;
    }
    
    if (!eventos || eventos.length === 0) {
      console.log('No se encontró el evento de Milan');
      return;
    }
    
    const evento = eventos[0];
    console.log(`Evento encontrado: ${evento.nombre_hijo} (ID: ${evento.id_evento})`);
    
    // 2. Verificar si Pepe Argento está como aportante
    console.log('Verificando si Pepe Argento está como aportante...');
    const { data: pepe, error: pepeError } = await supabase
      .from('eventos_activos_aportantes')
      .select('*')
      .eq('id_evento', evento.id_evento)
      .ilike('nombre_padre', '%Pepe%')
      .limit(1);
    
    if (pepeError) {
      console.error('Error al verificar aportante:', pepeError.message);
      return;
    }
    
    if (!pepe || pepe.length === 0) {
      console.log('Pepe Argento no está como aportante. Agregándolo...');
      
      // Agregar a Pepe como aportante
      const { data: newPepe, error: insertError } = await supabase
        .from('eventos_activos_aportantes')
        .insert({
          id_evento: evento.id_evento,
          id_comunidad: evento.id_comunidad,
          nombre_padre: 'Pepe Argento',
          email_padre: 'javierhursino@gmail.com',
          whatsapp_padre: '1122334455',
          monto_individual: 1500,
          estado_pago: 'pendiente',
          notificacion_email: false
        })
        .select()
        .single();
      
      if (insertError) {
        console.error('Error al agregar a Pepe Argento:', insertError.message);
        return;
      }
      
      console.log('Pepe Argento agregado correctamente');
      pepe[0] = newPepe;
    } else {
      console.log('Pepe Argento ya está como aportante');
    }
    
    // 3. Enviar email de notificación
    console.log('Enviando email de notificación...');
    const info = await transporter.sendMail({
      from: '"Hey Jack" <javierhursino@gmail.com>',
      to: 'javierhursino@gmail.com',
      subject: `URGENTE: Aporte para el cumpleaños de ${evento.nombre_hijo}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="color: #4e7df0;">¡Hola Pepe Argento!</h2>
          <p>Te recordamos que estamos organizando una colecta para el cumpleaños de <strong>${evento.nombre_hijo}</strong>.</p>
          <p>El monto a aportar es: <strong>$1.500</strong></p>
          <p>¡Gracias por tu colaboración!</p>
          <p>Equipo Hey Jack</p>
          <p style="color: #999; font-size: 12px;">Este es un email de prueba enviado el ${new Date().toLocaleString('es-AR')}</p>
        </div>
      `
    });
    
    console.log('Email enviado:', info.messageId);
    
    // 4. Actualizar estado de notificación
    console.log('Actualizando estado de notificación...');
    const { error: updateError } = await supabase
      .from('eventos_activos_aportantes')
      .update({
        notificacion_email: true,
        fecha_notificacion_email: new Date().toISOString()
      })
      .eq('id', pepe[0].id);
    
    if (updateError) {
      console.error('Error al actualizar estado de notificación:', updateError.message);
    } else {
      console.log('Estado de notificación actualizado correctamente');
    }
    
    console.log('Proceso completado con éxito');
  } catch (error) {
    console.error('Error general:', error);
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
