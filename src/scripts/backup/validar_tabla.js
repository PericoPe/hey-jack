/**
 * Script para validar que la tabla eventos_activos_aportantes esté funcionando correctamente
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
  console.log('=== VALIDACIÓN DE TABLA eventos_activos_aportantes ===');
  console.log('Fecha actual:', new Date().toLocaleString('es-AR'));
  
  try {
    // 1. Verificar que la tabla existe
    console.log('\n1. Verificando estructura de la tabla...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('eventos_activos_aportantes')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Error al acceder a la tabla:', tableError.message);
      return;
    }
    
    console.log('✅ La tabla eventos_activos_aportantes existe y es accesible');
    
    // 2. Verificar todos los registros en la tabla
    console.log('\n2. Verificando registros en la tabla...');
    const { data: aportantes, error: aportantesError } = await supabase
      .from('eventos_activos_aportantes')
      .select('*');
    
    if (aportantesError) {
      console.error('❌ Error al obtener aportantes:', aportantesError.message);
      return;
    }
    
    if (!aportantes || aportantes.length === 0) {
      console.log('⚠️ No hay aportantes en la tabla');
    } else {
      console.log(`✅ Se encontraron ${aportantes.length} aportantes en la tabla`);
      
      // Mostrar información de cada aportante
      console.log('\nLista de aportantes:');
      aportantes.forEach((aportante, index) => {
        console.log(`${index + 1}. ${aportante.nombre_padre} (${aportante.email_padre || 'Sin email'})`);
        console.log(`   ID Evento: ${aportante.id_evento}`);
        console.log(`   Monto: $${aportante.monto_individual}`);
        console.log(`   Estado: ${aportante.estado_pago}`);
        console.log(`   Notificación email: ${aportante.notificacion_email ? 'Sí' : 'No'}`);
        console.log('   ---');
      });
      
      // 3. Verificar si Pepe Argento está en la tabla
      console.log('\n3. Verificando si Pepe Argento está en la tabla...');
      const pepeArgento = aportantes.find(a => a.nombre_padre.includes('Pepe') && a.nombre_padre.includes('Argento'));
      
      if (pepeArgento) {
        console.log('✅ Pepe Argento encontrado en la tabla:');
        console.log(`   ID: ${pepeArgento.id}`);
        console.log(`   ID Evento: ${pepeArgento.id_evento}`);
        console.log(`   Email: ${pepeArgento.email_padre || 'Sin email'}`);
        console.log(`   Monto: $${pepeArgento.monto_individual}`);
        
        // Verificar si el monto es $1.500
        if (pepeArgento.monto_individual === 1500) {
          console.log('✅ El monto individual es correcto: $1.500');
        } else {
          console.log(`❌ El monto individual NO es $1.500, es: $${pepeArgento.monto_individual}`);
          
          // Corregir el monto
          console.log('   Actualizando monto a $1.500...');
          const { error: updateError } = await supabase
            .from('eventos_activos_aportantes')
            .update({ monto_individual: 1500 })
            .eq('id', pepeArgento.id);
          
          if (updateError) {
            console.error('   ❌ Error al actualizar monto:', updateError.message);
          } else {
            console.log('   ✅ Monto actualizado correctamente a $1.500');
          }
        }
        
        // 4. Enviar email de prueba a Pepe Argento
        console.log('\n4. Enviando email de prueba a Pepe Argento...');
        
        // Obtener datos del evento
        const { data: evento, error: eventoError } = await supabase
          .from('eventos_activos')
          .select('*')
          .eq('id_evento', pepeArgento.id_evento)
          .single();
        
        if (eventoError) {
          console.error('❌ Error al obtener datos del evento:', eventoError.message);
        } else if (!evento) {
          console.log('⚠️ No se encontró el evento asociado al aportante');
        } else {
          console.log(`✅ Evento encontrado: ${evento.nombre_hijo}`);
          
          // Obtener datos de la comunidad
          const { data: comunidad, error: comunidadError } = await supabase
            .from('comunidades')
            .select('*')
            .eq('id_comunidad', evento.id_comunidad)
            .single();
          
          if (comunidadError) {
            console.error('❌ Error al obtener datos de la comunidad:', comunidadError.message);
          } else if (!comunidad) {
            console.log('⚠️ No se encontró la comunidad asociada al evento');
          } else {
            console.log(`✅ Comunidad encontrada: ${comunidad.nombre_comunidad}`);
            
            // Enviar email de prueba
            try {
              const info = await transporter.sendMail({
                from: '"Hey Jack" <javierhursino@gmail.com>',
                to: pepeArgento.email_padre || 'javierhursino@gmail.com', // Si no tiene email, enviar a Javier
                subject: `PRUEBA: Aporte para el cumpleaños de ${evento.nombre_hijo}`,
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
                    <h2 style="color: #4e7df0;">¡Hola ${pepeArgento.nombre_padre}!</h2>
                    <p>Este es un email de PRUEBA para verificar el sistema de notificaciones.</p>
                    <p>Estamos organizando una colecta para el cumpleaños de <strong>${evento.nombre_hijo}</strong>.</p>
                    <p>El monto a aportar es: <strong>$${pepeArgento.monto_individual}</strong></p>
                    <p>Puedes realizar tu aporte a través de Mercado Pago al alias: <strong>${comunidad?.creador_mp_alias || 'heyjack.mp'}</strong></p>
                    <p>¡Gracias por tu colaboración!</p>
                    <p>Equipo Hey Jack</p>
                    <p style="color: #999; font-size: 12px;">Este es un email de prueba enviado el ${new Date().toLocaleString('es-AR')}</p>
                  </div>
                `
              });
              
              console.log(`✅ Email de prueba enviado: ${info.messageId}`);
              
              // Actualizar estado de notificación
              const { error: updateNotifError } = await supabase
                .from('eventos_activos_aportantes')
                .update({
                  notificacion_email: true,
                  fecha_notificacion_email: new Date().toISOString()
                })
                .eq('id', pepeArgento.id);
              
              if (updateNotifError) {
                console.error('❌ Error al actualizar estado de notificación:', updateNotifError.message);
              } else {
                console.log('✅ Estado de notificación actualizado correctamente');
              }
            } catch (emailError) {
              console.error('❌ Error al enviar email:', emailError.message);
            }
          }
        }
      } else {
        console.log('⚠️ Pepe Argento NO encontrado en la tabla');
        
        // Buscar eventos activos para agregar a Pepe
        console.log('\nBuscando eventos activos para agregar a Pepe Argento...');
        const { data: eventosActivos, error: eventosActivosError } = await supabase
          .from('eventos_activos')
          .select('*')
          .eq('estado', 'activo')
          .limit(1);
        
        if (eventosActivosError) {
          console.error('❌ Error al buscar eventos activos:', eventosActivosError.message);
        } else if (!eventosActivos || eventosActivos.length === 0) {
          console.log('⚠️ No hay eventos activos para agregar a Pepe Argento');
        } else {
          const evento = eventosActivos[0];
          console.log(`✅ Evento activo encontrado: ${evento.nombre_hijo}`);
          
          // Agregar a Pepe como aportante
          console.log('Agregando a Pepe Argento como aportante...');
          const { data: newAportante, error: insertError } = await supabase
            .from('eventos_activos_aportantes')
            .insert({
              id_evento: evento.id_evento,
              id_comunidad: evento.id_comunidad,
              nombre_padre: 'Pepe Argento',
              email_padre: 'pepe.argento@gmail.com',
              whatsapp_padre: '1122334455',
              monto_individual: 1500,
              estado_pago: 'pendiente',
              notificacion_email: false
            })
            .select()
            .single();
          
          if (insertError) {
            console.error('❌ Error al agregar a Pepe como aportante:', insertError.message);
          } else {
            console.log('✅ Pepe Argento agregado como aportante con monto $1.500');
            console.log(`   ID: ${newAportante.id}`);
            
            // Enviar email de prueba
            console.log('\nEnviando email de prueba a Pepe Argento...');
            
            try {
              const info = await transporter.sendMail({
                from: '"Hey Jack" <javierhursino@gmail.com>',
                to: 'pepe.argento@gmail.com',
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
              
              console.log(`✅ Email de prueba enviado: ${info.messageId}`);
              
              // Actualizar estado de notificación
              const { error: updateNotifError } = await supabase
                .from('eventos_activos_aportantes')
                .update({
                  notificacion_email: true,
                  fecha_notificacion_email: new Date().toISOString()
                })
                .eq('id', newAportante.id);
              
              if (updateNotifError) {
                console.error('❌ Error al actualizar estado de notificación:', updateNotifError.message);
              } else {
                console.log('✅ Estado de notificación actualizado correctamente');
              }
            } catch (emailError) {
              console.error('❌ Error al enviar email:', emailError.message);
            }
          }
        }
      }
    }
    
    // 5. Verificar montos individuales de todos los aportantes
    console.log('\n5. Verificando montos individuales de todos los aportantes...');
    const aportantesConMontoIncorrecto = aportantes.filter(a => a.monto_individual !== 1500);
    
    if (aportantesConMontoIncorrecto.length === 0) {
      console.log('✅ Todos los aportantes tienen el monto correcto de $1.500');
    } else {
      console.log(`⚠️ Se encontraron ${aportantesConMontoIncorrecto.length} aportantes con monto incorrecto`);
      
      // Actualizar todos los montos a $1.500
      console.log('Actualizando todos los montos a $1.500...');
      const { error: updateMontosError } = await supabase
        .from('eventos_activos_aportantes')
        .update({ monto_individual: 1500 });
      
      if (updateMontosError) {
        console.error('❌ Error al actualizar montos:', updateMontosError.message);
      } else {
        console.log('✅ Todos los montos actualizados correctamente a $1.500');
      }
    }
    
    console.log('\n=== VALIDACIÓN COMPLETADA ===');
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
