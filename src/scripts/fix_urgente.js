/**
 * Script de emergencia para solucionar problemas urgentes:
 * 1. Agregar a Pepe Argento a la tabla eventos_activos_aportantes
 * 2. Actualizar el monto_individual a $1.500
 * 3. Forzar el envío de notificaciones
 */
const supabase = require('../utils/supabaseClient');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

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
  console.log('=== SOLUCIÓN URGENTE ===');
  console.log('Fecha actual:', new Date().toLocaleString('es-AR'));
  
  try {
    // 1. Verificar si Pepe Argento existe en la tabla miembros
    console.log('\n1. Verificando si Pepe Argento existe en miembros...');
    const { data: pepe, error: pepeError } = await supabase
      .from('miembros')
      .select('*')
      .ilike('nombre_padre', '%Pepe Argento%')
      .single();
    
    if (pepeError) {
      console.log('Error al buscar a Pepe Argento:', pepeError.message);
    } else if (!pepe) {
      console.log('No se encontró a Pepe Argento en la tabla miembros');
    } else {
      console.log('✅ Pepe Argento encontrado en miembros:', pepe);
      
      // 2. Verificar eventos activos
      console.log('\n2. Buscando eventos activos...');
      const { data: eventos, error: eventosError } = await supabase
        .from('eventos_activos')
        .select('*')
        .eq('estado', 'activo');
      
      if (eventosError) {
        console.log('Error al buscar eventos activos:', eventosError.message);
      } else if (!eventos || eventos.length === 0) {
        console.log('No hay eventos activos');
      } else {
        console.log(`✅ Se encontraron ${eventos.length} eventos activos`);
        
        // Para cada evento activo, verificar si Pepe está en la tabla de aportantes
        for (const evento of eventos) {
          console.log(`\nVerificando evento: ${evento.nombre_hijo || evento.id_evento}`);
          
          // Verificar si Pepe ya está en la tabla de aportantes para este evento
          const { data: pepeContributor, error: pepeContributorError } = await supabase
            .from('eventos_activos_aportantes')
            .select('*')
            .eq('id_evento', evento.id_evento)
            .ilike('nombre_padre', '%Pepe Argento%');
          
          if (pepeContributorError) {
            console.log('Error al verificar si Pepe es aportante:', pepeContributorError.message);
          } else if (pepeContributor && pepeContributor.length > 0) {
            console.log('Pepe ya es aportante de este evento, actualizando monto...');
            
            // Actualizar monto individual
            const { error: updateError } = await supabase
              .from('eventos_activos_aportantes')
              .update({ monto_individual: 1500 })
              .eq('id', pepeContributor[0].id);
            
            if (updateError) {
              console.log('Error al actualizar monto:', updateError.message);
            } else {
              console.log('✅ Monto actualizado a $1.500');
            }
          } else {
            console.log('Pepe NO es aportante de este evento, agregándolo...');
            
            // Agregar a Pepe como aportante
            const { error: insertError } = await supabase
              .from('eventos_activos_aportantes')
              .insert({
                id_evento: evento.id_evento,
                nombre_padre: 'Pepe Argento',
                email_padre: 'pepe.argento@gmail.com',
                whatsapp_padre: '1122334455',
                monto_individual: 1500,
                estado_pago: 'pendiente',
                notificacion_email: false
              });
            
            if (insertError) {
              console.log('Error al agregar a Pepe como aportante:', insertError.message);
            } else {
              console.log('✅ Pepe agregado como aportante con monto $1.500');
            }
          }
        }
      }
    }
    
    // 3. Actualizar TODOS los montos individuales a $1.500
    console.log('\n3. Actualizando TODOS los montos individuales a $1.500...');
    const { data: updateResult, error: updateError } = await supabase
      .from('eventos_activos_aportantes')
      .update({ monto_individual: 1500 });
    
    if (updateError) {
      console.log('Error al actualizar montos:', updateError.message);
    } else {
      console.log('✅ Todos los montos actualizados a $1.500');
    }
    
    // 4. Enviar notificaciones a TODOS los aportantes
    console.log('\n4. Enviando notificaciones a TODOS los aportantes...');
    
    // Obtener todos los aportantes
    const { data: aportantes, error: aportantesError } = await supabase
      .from('eventos_activos_aportantes')
      .select('*');
    
    if (aportantesError) {
      console.log('Error al obtener aportantes:', aportantesError.message);
    } else if (!aportantes || aportantes.length === 0) {
      console.log('No hay aportantes para notificar');
    } else {
      console.log(`Encontrados ${aportantes.length} aportantes para notificar`);
      
      // Enviar email a cada aportante
      let emailsEnviados = 0;
      
      for (const aportante of aportantes) {
        console.log(`\nEnviando email a ${aportante.nombre_padre} (${aportante.email_padre})`);
        
        try {
          // Obtener datos del evento
          const { data: evento, error: eventoError } = await supabase
            .from('eventos_activos')
            .select('*')
            .eq('id_evento', aportante.id_evento)
            .single();
          
          if (eventoError) {
            console.log('Error al obtener datos del evento:', eventoError.message);
            continue;
          }
          
          // Obtener datos de la comunidad
          const { data: comunidad, error: comunidadError } = await supabase
            .from('comunidades')
            .select('*')
            .eq('id_comunidad', evento.id_comunidad)
            .single();
          
          if (comunidadError) {
            console.log('Error al obtener datos de la comunidad:', comunidadError.message);
            continue;
          }
          
          // Enviar email simplificado
          const info = await transporter.sendMail({
            from: '"Hey Jack" <javierhursino@gmail.com>',
            to: aportante.email_padre,
            subject: `URGENTE: Aporte para el cumpleaños de ${evento.nombre_hijo}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
                <h2 style="color: #4e7df0;">¡Hola ${aportante.nombre_padre}!</h2>
                <p>Te recordamos que estamos organizando una colecta para el cumpleaños de <strong>${evento.nombre_hijo}</strong>.</p>
                <p>El monto a aportar es: <strong>$${aportante.monto_individual}</strong></p>
                <p>Puedes realizar tu aporte a través de Mercado Pago al alias: <strong>${comunidad?.creador_mp_alias || 'heyjack.mp'}</strong></p>
                <p>¡Gracias por tu colaboración!</p>
                <p>Equipo Hey Jack</p>
              </div>
            `
          });
          
          console.log('✅ Email enviado:', info.messageId);
          emailsEnviados++;
          
          // Actualizar estado de notificación
          const { error: updateNotifError } = await supabase
            .from('eventos_activos_aportantes')
            .update({
              notificacion_email: true,
              fecha_notificacion_email: new Date().toISOString()
            })
            .eq('id', aportante.id);
          
          if (updateNotifError) {
            console.log('Error al actualizar estado de notificación:', updateNotifError.message);
          }
        } catch (emailError) {
          console.log('Error al enviar email:', emailError.message);
        }
      }
      
      console.log(`\n✅ Se enviaron ${emailsEnviados} emails de ${aportantes.length} aportantes`);
    }
    
    console.log('\n=== PROCESO COMPLETADO ===');
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
