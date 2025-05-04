#!/usr/bin/env node

/**
 * Script de ejecución para tareas programadas
 * Permite ejecutar diferentes scripts desde la línea de comandos
 * 
 * Uso: node run.js <script-name>
 * Ejemplo: node run.js updateActiveEvents
 */

const args = process.argv.slice(2);
const scriptName = args[0];

if (!scriptName) {
  console.error('❌ Error: Debes especificar el nombre del script a ejecutar');
  console.log('Uso: node run.js <script-name>');
  console.log('Scripts disponibles:');
  console.log('  - updateActiveEvents: Actualiza la tabla de eventos activos');
  process.exit(1);
}

const runScript = async (name) => {
  try {
    switch (name) {
      case 'updateActiveEvents':
        const runUpdateActiveEvents = require('./updateActiveEvents');
        await runUpdateActiveEvents();
        break;
      case 'registerAllBirthdays':
        require('./registerAllBirthdays');
        break;
      case 'sendEmailNotifications':
        require('./sendEmailNotifications');
        break;
      case 'registerPayment':
        require('./registerPayment');
        break;
      case 'migrateToContributorsTable':
        require('./migrate_to_contributors_table');
        break;
      case 'checkMemberEmails':
        require('./check_member_emails');
        break;
      case 'testEmail':
        require('./test_email');
        break;
      case 'createContributorsTable':
        require('./create_contributors_table_api');
        break;
      case 'sendNotifications':
        require('./send_notifications');
        break;
      case 'addTestContributors':
        require('./add_test_contributors');
        break;
      case 'previewEmailTemplate':
        require('./preview_email_template');
        break;
      case 'forceNotify':
        require('./force_notify');
        break;
      default:
        console.error(`❌ Error: Script "${name}" no encontrado`);
        console.log('Scripts disponibles:');
        console.log('  - updateActiveEvents: Actualiza la tabla de eventos activos');
        console.log('  - registerAllBirthdays: Registra todos los cumpleaños en la tabla eventos');
        console.log('  - sendEmailNotifications: Envía notificaciones por email para eventos activos');
        console.log('  - registerPayment: Registra pagos para eventos activos');
        console.log('  - migrateToContributorsTable: Migra datos a la tabla eventos_activos_aportantes');
        console.log('  - checkMemberEmails: Verifica los emails de los miembros registrados');
        console.log('  - testEmail: Envía un email de prueba para verificar la configuración SMTP');
        console.log('  - createContributorsTable: Crea la tabla eventos_activos_aportantes usando la API');
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error al ejecutar el script:', error);
    process.exit(1);
  }
};

runScript(scriptName)
  .then(() => {
    console.log('✅ Ejecución completada con éxito');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error en la ejecución:', error);
    process.exit(1);
  });
