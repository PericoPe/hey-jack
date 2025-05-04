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
      default:
        console.error(`❌ Error: Script "${name}" no encontrado`);
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
