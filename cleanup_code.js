/**
 * Script para limpiar el código de los archivos JavaScript
 * Elimina información sensible y código redundante
 */
const fs = require('fs');
const path = require('path');

// Directorio de scripts
const scriptsDir = path.join(__dirname, 'src', 'scripts');

// Patrones a reemplazar
const replacements = [
  // Ocultar contraseñas y tokens
  {
    pattern: /(pass:|pass =|password:|password =).*['"](.+?)['"]/g,
    replacement: '$1 "[REDACTED]"'
  },
  // Ocultar claves de API
  {
    pattern: /(supabaseKey|apiKey|key:|key =).*['"](.+?)['"]/g,
    replacement: '$1 "[REDACTED]"'
  },
  // Eliminar comentarios de depuración redundantes
  {
    pattern: /\/\/ console\.log\(.+?\);?\n/g,
    replacement: ''
  },
  // Eliminar código comentado
  {
    pattern: /\/\*\*?\s*.*?\s*\*\*?\//gs,
    replacement: (match) => {
      // Mantener comentarios de documentación JSDoc
      if (match.startsWith('/**') && (match.includes('@param') || match.includes('@returns') || match.includes('@description'))) {
        return match;
      }
      // Eliminar comentarios de código
      if (match.includes('//') || match.includes('/*')) {
        return '';
      }
      return match;
    }
  }
];

// Archivos a procesar
const filesToProcess = [
  'notificar_aportantes.js',
  'notificar_pepe.js',
  'force_notify.js',
  'update_contributors.js',
  'sendEmailNotifications.js'
];

// Procesar cada archivo
filesToProcess.forEach(filename => {
  const filePath = path.join(scriptsDir, filename);
  
  // Verificar si el archivo existe
  if (!fs.existsSync(filePath)) {
    console.log(`Archivo no encontrado: ${filename}`);
    return;
  }
  
  // Leer contenido del archivo
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Aplicar reemplazos
  replacements.forEach(({ pattern, replacement }) => {
    content = content.replace(pattern, replacement);
  });
  
  // Guardar archivo modificado
  fs.writeFileSync(filePath, content);
  console.log(`Archivo limpiado: ${filename}`);
});

console.log('Limpieza de código completada');
