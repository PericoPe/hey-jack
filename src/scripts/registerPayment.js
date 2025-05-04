/**
 * Script para registrar pagos de los padres para eventos activos
 * Este script permite registrar manualmente los pagos realizados
 */
const { registerPayment } = require('../utils/emailNotifications');
const supabase = require('../utils/supabaseClient');

/**
 * Muestra los eventos activos disponibles
 */
const showActiveEvents = async () => {
  console.log('Obteniendo eventos activos...');
  
  try {
    const { data: events, error } = await supabase
      .from('eventos_activos')
      .select('*')
      .eq('estado', 'activo');
    
    if (error) throw error;
    
    if (!events || events.length === 0) {
      console.log('No se encontraron eventos activos');
      return null;
    }
    
    console.log(`\nSe encontraron ${events.length} eventos activos:`);
    
    events.forEach((event, index) => {
      console.log(`\n${index + 1}. Cumpleaños de ${event.nombre_hijo}`);
      console.log(`   Comunidad: ${event.nombre_comunidad}`);
      console.log(`   Fecha: ${new Date(event.fecha_cumple).toLocaleDateString()}`);
      console.log(`   Objetivo: $${event.objetivo_recaudacion}`);
      console.log(`   Recaudado: $${event.recaudado}`);
      
      // Mostrar miembros pendientes
      const pendientes = event.miembros_pendientes.filter(m => m.estado_pago === 'pendiente');
      const pagados = event.miembros_pendientes.filter(m => m.estado_pago === 'pagado');
      
      console.log(`   Miembros pendientes: ${pendientes.length}`);
      console.log(`   Miembros que pagaron: ${pagados.length}`);
      
      if (pendientes.length > 0) {
        console.log('\n   Miembros que deben pagar:');
        pendientes.forEach((miembro, i) => {
          console.log(`   ${i + 1}. ${miembro.nombre_padre} - $${miembro.monto_individual}`);
        });
      }
    });
    
    return events;
  } catch (error) {
    console.error('Error al obtener eventos activos:', error);
    return null;
  }
};

/**
 * Registra un pago para un miembro en un evento activo
 */
const registerPaymentForMember = async (eventId, parentName, amount, paymentMethod, paymentReference) => {
  console.log(`\nRegistrando pago para ${parentName} en el evento ${eventId}...`);
  
  try {
    const result = await registerPayment({
      eventId,
      parentName,
      amount,
      paymentMethod,
      paymentReference
    });
    
    if (result.success) {
      console.log('✅', result.message);
      
      // Mostrar detalles del evento actualizado
      const event = result.event;
      console.log('\nEstado actual del evento:');
      console.log(`- Objetivo: $${event.objetivo_recaudacion}`);
      console.log(`- Recaudado: $${event.recaudado}`);
      console.log(`- Progreso: ${Math.round((event.recaudado / event.objetivo_recaudacion) * 100)}%`);
      
      // Mostrar miembros pendientes
      const pendientes = event.miembros_pendientes.filter(m => m.estado_pago === 'pendiente');
      const pagados = event.miembros_pendientes.filter(m => m.estado_pago === 'pagado');
      
      console.log(`- Miembros pendientes: ${pendientes.length}`);
      console.log(`- Miembros que pagaron: ${pagados.length}`);
      
      if (pendientes.length > 0) {
        console.log('\nMiembros que aún deben pagar:');
        pendientes.forEach((miembro, i) => {
          console.log(`${i + 1}. ${miembro.nombre_padre} - $${miembro.monto_individual}`);
        });
      }
      
      return true;
    } else {
      console.error('❌ Error al registrar pago:', result.error);
      return false;
    }
  } catch (error) {
    console.error('Error inesperado al registrar pago:', error);
    return false;
  }
};

/**
 * Función principal
 */
const main = async () => {
  console.log('Iniciando registro de pagos...');
  console.log('Fecha actual:', new Date().toISOString());
  
  try {
    // Mostrar eventos activos
    const events = await showActiveEvents();
    
    if (!events || events.length === 0) {
      console.log('No hay eventos activos para registrar pagos');
      return;
    }
    
    // En un entorno real, aquí se podría implementar una interfaz de usuario
    // para seleccionar el evento y el miembro, y registrar el pago
    // Por ahora, vamos a registrar un pago de ejemplo para Milan
    
    // Ejemplo: Registrar pago de Ana Martínez para el cumpleaños de Milan
    const milanEvent = events.find(e => e.nombre_hijo === 'Milan');
    
    if (!milanEvent) {
      console.log('No se encontró el evento para Milan');
      return;
    }
    
    await registerPaymentForMember(
      milanEvent.id_evento,
      'Ana Martínez',
      1500,
      'mercadopago',
      'Transferencia #123456'
    );
    
    // Ejemplo: Registrar pago de Carlos Rodríguez para el cumpleaños de Milan
    await registerPaymentForMember(
      milanEvent.id_evento,
      'Carlos Rodríguez',
      1500,
      'transferencia',
      'Comprobante #789012'
    );
  } catch (error) {
    console.error('Error inesperado:', error);
  }
  
  console.log('\nFinalización:', new Date().toISOString());
};

// Si se ejecuta directamente
if (require.main === module) {
  main()
    .then(() => {
      console.log('Script finalizado');
      process.exit(0);
    })
    .catch(error => {
      console.error('Error en el script:', error);
      process.exit(1);
    });
} else {
  // Si se importa como módulo
  module.exports = {
    showActiveEvents,
    registerPaymentForMember
  };
}
