/**
 * Script para actualizar montos individuales y estado de notificaciones
 */
const supabase = require('../utils/supabaseClient');
const fs = require('fs');
const path = require('path');

/**
 * Función principal
 */
const main = async () => {
  console.log('=== ACTUALIZAR APORTANTES ===');
  console.log('Fecha actual:', new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' }));
  
  // Crear archivo de log
  const logFile = path.join(__dirname, '..', '..', 'update_contributors_log.txt');
  const log = (message) => {
    console.log(message);
    fs.appendFileSync(logFile, message + '\n');
  };
  
  // Iniciar log
  fs.writeFileSync(logFile, `=== ACTUALIZAR APORTANTES ===\n`);
  fs.appendFileSync(logFile, `Fecha: ${new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}\n\n`);
  
  try {
    // Verificar conexión y existencia de la tabla
    log('Verificando conexión y existencia de la tabla...');
    const { data: testRows, error: testError } = await supabase
      .from('eventos_activos_aportantes')
      .select('*')
      .limit(1);
    if (testError) {
      log('❌ Error de conexión o la tabla no existe: ' + JSON.stringify(testError, null, 2));
      return;
    }
    if (!testRows || testRows.length === 0) {
      log('⚠️ La tabla existe pero no tiene datos.');
    } else {
      log('✅ Conexión y tabla OK.');
    }
    // 1. Forzar update de TODOS los registros
    log('\nForzando update de TODOS los registros a $1.500, notificado = TRUE y fecha actual...');
    const fechaActual = new Date().toISOString();
    const { data: updatedRows, error: updateError } = await supabase
      .from('eventos_activos_aportantes')
      .update({
        monto_individual: 1500,
        notificacion_email: true,
        fecha_notificacion_email: fechaActual
      })
      .select();

    if (updateError) {
      log('❌ Error al forzar update: ' + JSON.stringify(updateError, null, 2));
      if (updateError.message) log('Mensaje: ' + updateError.message);
      if (updateError.stack) log('Stack: ' + updateError.stack);
    } else {
      const count = updatedRows ? updatedRows.length : 0;
      if (count === 0) {
        log('⚠️ El update no afectó ningún registro. Puede que ya estén actualizados o haya un problema de RLS/políticas.');
      } else {
        log(`✅ Registros actualizados: ${count}`);
      }
    }
    
    // 3. Verificar los cambios
    log('\nVerificando cambios...');
    const { data: contributors, error: checkError } = await supabase
      .from('eventos_activos_aportantes')
      .select('*');
    
    if (checkError) {
      log('Error al verificar cambios: ' + JSON.stringify(checkError));
    } else {
      log(`Total de aportantes: ${contributors.length}`);
      
      const correctAmount = contributors.filter(c => c.monto_individual === 1500).length;
      const notified = contributors.filter(c => c.notificacion_email === true).length;
      
      log(`Aportantes con monto correcto ($1.500): ${correctAmount}/${contributors.length}`);
      log(`Aportantes notificados: ${notified}/${contributors.length}`);
      
      // Mostrar detalles de cada aportante
      log('\nDetalles de aportantes:');
      contributors.forEach((c, i) => {
        log(`${i+1}. ${c.nombre_padre} (${c.email_padre}): $${c.monto_individual} - Notificado: ${c.notificacion_email ? 'SÍ' : 'NO'} - Fecha: ${c.fecha_notificacion_email || 'N/A'}`);
      });
    }
    
    log('\n✅ Proceso completado');
  } catch (error) {
    log('❌ Error inesperado: ' + JSON.stringify(error, null, 2));
    if (error.message) log('Mensaje: ' + error.message);
    if (error.stack) log('Stack: ' + error.stack);
  }
};

// Ejecutar función principal
main();
