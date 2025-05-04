/**
 * Script para registrar pagos para eventos activos
 */
const supabase = require('../utils/supabaseClient');

/**
 * Registra un pago para un miembro en un evento activo
 * @param {string} eventId - ID del evento activo
 * @param {string} parentName - Nombre del padre que realiza el pago
 * @param {number} amount - Monto del pago
 * @param {string} paymentMethod - Método de pago (mercadopago, transferencia, efectivo)
 * @param {string} reference - Referencia del pago
 * @returns {Promise<Object>} - Resultado del registro del pago
 */
const registerPayment = async (eventId, parentName, amount, paymentMethod = 'mercadopago', reference = '') => {
  try {
    console.log(`Registrando pago para ${parentName} en el evento ${eventId}...`);
    
    // Obtener el registro del aportante
    const { data: contributor, error: contributorError } = await supabase
      .from('eventos_activos_aportantes')
      .select('*')
      .eq('id_evento', eventId)
      .eq('nombre_padre', parentName)
      .single();
    
    if (contributorError) {
      console.error(`Error al obtener datos del aportante ${parentName}:`, contributorError);
      return { success: false, error: contributorError };
    }
    
    if (!contributor) {
      return { 
        success: false, 
        error: `No se encontró el aportante ${parentName} para el evento ${eventId}` 
      };
    }
    
    // Verificar si el aportante ya pagó
    if (contributor.estado_pago === 'pagado') {
      console.log(`${parentName} ya realizó su aporte para el evento ${eventId}`);
      return {
        success: false,
        error: 'El aportante ya realizó su aporte'
      };
    }
    
    // Actualizar el registro del aportante
    const { data: updatedContributor, error: updateError } = await supabase
      .from('eventos_activos_aportantes')
      .update({
        estado_pago: 'pagado',
        monto_pagado: amount,
        metodo_pago: paymentMethod,
        referencia_pago: reference,
        fecha_pago: new Date().toISOString()
      })
      .eq('id', contributor.id)
      .select()
      .single();
    
    if (updateError) {
      console.error(`Error al actualizar el registro del aportante ${parentName}:`, updateError);
      return { success: false, error: updateError };
    }
    
    console.log(`Pago registrado para ${parentName} en el evento ${eventId}`);
    
    // Obtener el evento actualizado para mostrar el estado actual
    const { data: event, error: eventError } = await supabase
      .from('eventos_activos')
      .select('*')
      .eq('id_evento', eventId)
      .single();
    
    if (eventError) {
      console.error(`Error al obtener el evento actualizado ${eventId}:`, eventError);
      return { success: true, contributor: updatedContributor };
    }
    
    return {
      success: true,
      contributor: updatedContributor,
      event: event
    };
  } catch (error) {
    console.error('Error al registrar pago:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Función principal
 */
const main = async () => {
  console.log('Iniciando registro de pagos...');
  console.log('Fecha actual:', new Date().toISOString());
  
  try {
    // Obtener todos los eventos activos
    const { data: events, error: eventsError } = await supabase
      .from('eventos_activos')
      .select('*');
    
    if (eventsError) throw eventsError;
    
    if (!events || events.length === 0) {
      console.log('No se encontraron eventos activos');
      return;
    }
    
    console.log(`\nSe encontraron ${events.length} eventos activos:\n`);
    
    // Para cada evento, obtener los aportantes pendientes
    for (const event of events) {
      console.log(`${event.id_evento.substring(0, 15)}... Cumpleaños de ${event.nombre_hijo}`);
      console.log(`   Comunidad: ${event.nombre_comunidad}`);
      console.log(`   Fecha: ${new Date(event.fecha_cumple).toLocaleDateString('es-AR')}`);
      console.log(`   Objetivo: $${event.objetivo}`);
      console.log(`   Recaudado: $${event.recaudado}`);
      
      // Obtener los aportantes pendientes
      const { data: pendingContributors, error: pendingError } = await supabase
        .from('eventos_activos_aportantes')
        .select('*')
        .eq('id_evento', event.id_evento)
        .eq('estado_pago', 'pendiente');
      
      if (pendingError) {
        console.error(`Error al obtener aportantes pendientes para el evento ${event.id_evento}:`, pendingError);
        continue;
      }
      
      // Obtener los aportantes que ya pagaron
      const { data: paidContributors, error: paidError } = await supabase
        .from('eventos_activos_aportantes')
        .select('*')
        .eq('id_evento', event.id_evento)
        .eq('estado_pago', 'pagado');
      
      if (paidError) {
        console.error(`Error al obtener aportantes que pagaron para el evento ${event.id_evento}:`, paidError);
        continue;
      }
      
      console.log(`   Miembros pendientes: ${pendingContributors ? pendingContributors.length : 0}`);
      console.log(`   Miembros que pagaron: ${paidContributors ? paidContributors.length : 0}`);
      
      if (pendingContributors && pendingContributors.length > 0) {
        console.log('\n   Miembros que deben pagar:');
        pendingContributors.forEach((contributor, i) => {
          console.log(`   ${i + 1}. ${contributor.nombre_padre} - $${contributor.monto_individual}`);
        });
      }
      
      console.log('');
    }
    
    // Registrar pagos para el primer evento (para pruebas)
    const firstEvent = events[0];
    
    // Obtener los aportantes pendientes del primer evento
    const { data: pendingContributors, error: pendingError } = await supabase
      .from('eventos_activos_aportantes')
      .select('*')
      .eq('id_evento', firstEvent.id_evento)
      .eq('estado_pago', 'pendiente');
    
    if (pendingError) {
      console.error(`Error al obtener aportantes pendientes para el evento ${firstEvent.id_evento}:`, pendingError);
      return;
    }
    
    if (!pendingContributors || pendingContributors.length === 0) {
      console.log('No hay aportantes pendientes para el primer evento');
      return;
    }
    
    // Registrar pago para el primer aportante pendiente
    const firstContributor = pendingContributors[0];
    const result = await registerPayment(
      firstEvent.id_evento,
      firstContributor.nombre_padre,
      firstContributor.monto_individual,
      'mercadopago',
      `Pago de prueba ${Date.now()}`
    );
    
    if (result.success) {
      console.log(`\n✅ Pago registrado para ${firstContributor.nombre_padre} en el evento ${firstEvent.id_evento}`);
      
      // Mostrar estado actual del evento
      console.log('\nEstado actual del evento:');
      console.log(`- Objetivo: $${result.event.objetivo}`);
      console.log(`- Recaudado: $${result.event.recaudado}`);
      console.log(`- Progreso: ${Math.round((result.event.recaudado / result.event.objetivo) * 100)}%`);
      
      // Obtener los aportantes pendientes actualizados
      const { data: updatedPending, error: updatedPendingError } = await supabase
        .from('eventos_activos_aportantes')
        .select('*')
        .eq('id_evento', firstEvent.id_evento)
        .eq('estado_pago', 'pendiente');
      
      if (!updatedPendingError && updatedPending) {
        console.log(`- Miembros pendientes: ${updatedPending.length}`);
        console.log(`- Miembros que pagaron: ${pendingContributors.length - updatedPending.length + 1}`);
        
        console.log('\nMiembros que aún deben pagar:');
        updatedPending.forEach((contributor, i) => {
          console.log(`${i + 1}. ${contributor.nombre_padre} - $${contributor.monto_individual}`);
        });
      }
    } else {
      console.error(`\n❌ Error al registrar pago para ${firstContributor.nombre_padre}:`, result.error);
    }
    
    // Registrar pago para el segundo aportante pendiente (si existe)
    if (pendingContributors.length > 1) {
      const secondContributor = pendingContributors[1];
      const result2 = await registerPayment(
        firstEvent.id_evento,
        secondContributor.nombre_padre,
        secondContributor.monto_individual,
        'transferencia',
        `Transferencia ${Date.now()}`
      );
      
      if (result2.success) {
        console.log(`\n✅ Pago registrado para ${secondContributor.nombre_padre} en el evento ${firstEvent.id_evento}`);
        
        // Mostrar estado actual del evento
        console.log('\nEstado actual del evento:');
        console.log(`- Objetivo: $${result2.event.objetivo}`);
        console.log(`- Recaudado: $${result2.event.recaudado}`);
        console.log(`- Progreso: ${Math.round((result2.event.recaudado / result2.event.objetivo) * 100)}%`);
        
        // Obtener los aportantes pendientes actualizados
        const { data: updatedPending, error: updatedPendingError } = await supabase
          .from('eventos_activos_aportantes')
          .select('*')
          .eq('id_evento', firstEvent.id_evento)
          .eq('estado_pago', 'pendiente');
        
        if (!updatedPendingError && updatedPending) {
          console.log(`- Miembros pendientes: ${updatedPending.length}`);
          console.log(`- Miembros que pagaron: ${pendingContributors.length - updatedPending.length + 2}`);
          
          console.log('\nMiembros que aún deben pagar:');
          updatedPending.forEach((contributor, i) => {
            console.log(`${i + 1}. ${contributor.nombre_padre} - $${contributor.monto_individual}`);
          });
        }
      } else {
        console.error(`\n❌ Error al registrar pago para ${secondContributor.nombre_padre}:`, result2.error);
      }
    }
  } catch (error) {
    console.error('Error inesperado:', error);
  }
  
  console.log('\nFinalización:', new Date().toISOString());
  console.log('Script finalizado');
};

// Ejecutar la función principal
main()
  .then(() => {
    process.exit(0);
  })
  .catch(error => {
    console.error('Error en el script:', error);
    process.exit(1);
  });
