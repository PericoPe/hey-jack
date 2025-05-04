/**
 * Script simplificado para probar la tabla eventos_activos_aportantes
 */
const supabase = require('../utils/supabaseClient');
const nodemailer = require('nodemailer');

// Configuración del transportador de email (simplificada)
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
 * Función principal
 */
const main = async () => {
  console.log('=== TEST TABLA eventos_activos_aportantes ===');
  console.log('Fecha actual:', new Date().toLocaleString('es-AR'));
  
  try {
    // 1. Verificar eventos activos
    console.log('\n1. Verificando eventos activos...');
    const { data: eventos, error: eventosError } = await supabase
      .from('eventos_activos')
      .select('*')
      .eq('estado', 'activo')
      .limit(1);
    
    if (eventosError) {
      console.error('Error al verificar eventos activos:', eventosError.message);
      return;
    }
    
    if (!eventos || eventos.length === 0) {
      console.log('No hay eventos activos. No se puede continuar.');
      return;
    }
    
    const evento = eventos[0];
    console.log(`Evento activo encontrado: ${evento.nombre_hijo} (ID: ${evento.id_evento})`);
    
    // 2. Agregar o actualizar a Pepe Argento
    console.log('\n2. Agregando/actualizando a Pepe Argento...');
    const { data: pepeResult, error: pepeError } = await supabase
      .from('eventos_activos_aportantes')
      .upsert({
        id_evento: evento.id_evento,
        id_comunidad: evento.id_comunidad,
        nombre_padre: 'Pepe Argento',
        email_padre: 'javierhursino@gmail.com', // Usar tu email para pruebas
        whatsapp_padre: '1122334455',
        monto_individual: 1500,
        estado_pago: 'pendiente',
        notificacion_email: false
      }, { onConflict: 'id_evento,nombre_padre' })
      .select()
      .single();
    
    if (pepeError) {
      console.error('Error al agregar/actualizar a Pepe Argento:', pepeError.message);
    } else {
      console.log('Pepe Argento agregado/actualizado correctamente:', pepeResult);
    }
    
    // 3. Actualizar todos los montos a $1.500
    console.log('\n3. Actualizando todos los montos a $1.500...');
    const { error: updateMontosError } = await supabase
      .from('eventos_activos_aportantes')
      .update({ monto_individual: 1500 });
    
    if (updateMontosError) {
      console.error('Error al actualizar montos:', updateMontosError.message);
    } else {
      console.log('Todos los montos actualizados a $1.500');
    }
    
    // 4. Enviar email de prueba
    console.log('\n4. Enviando email de prueba...');
    try {
      const info = await transporter.sendMail({
        from: '"Hey Jack" <javierhursino@gmail.com>',
        to: 'javierhursino@gmail.com',
        subject: `PRUEBA: Aporte para el cumpleaños de ${evento.nombre_hijo}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
            <h2 style="color: #4e7df0;">¡Hola Pepe Argento!</h2>
            <p>Este es un email de PRUEBA para verificar el sistema de notificaciones.</p>
            <p>Estamos organizando una colecta para el cumpleaños de <strong>${evento.nombre_hijo}</strong>.</p>
            <p>El monto a aportar es: <strong>$1.500</strong></p>
            <p>¡Gracias por tu colaboración!</p>
            <p>Equipo Hey Jack</p>
            <p style="color: #999; font-size: 12px;">Este es un email de prueba enviado el ${new Date().toLocaleString('es-AR')}</p>
          </div>
        `
      });
      
      console.log('Email de prueba enviado:', info.messageId);
      
      // Actualizar estado de notificación
      const { error: updateNotifError } = await supabase
        .from('eventos_activos_aportantes')
        .update({
          notificacion_email: true,
          fecha_notificacion_email: new Date().toISOString()
        })
        .eq('nombre_padre', 'Pepe Argento');
      
      if (updateNotifError) {
        console.error('Error al actualizar estado de notificación:', updateNotifError.message);
      } else {
        console.log('Estado de notificación actualizado correctamente');
      }
    } catch (emailError) {
      console.error('Error al enviar email:', emailError.message);
    }
    
    console.log('\n=== TEST COMPLETADO ===');
  } catch (error) {
    console.error('Error general:', error);
  }
};

// Ejecutar la función principal
main()
  .then(() => {
    console.log('\nScript finalizado con éxito');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error fatal:', error);
    process.exit(1);
  });
