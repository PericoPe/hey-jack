const fs = require('fs');
const path = require('path');

// Función para crear un canvas y dibujar el logo
function createLogo(size) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  // Fondo
  ctx.fillStyle = '#4e7df0'; // Azul de Hey Jack
  ctx.fillRect(0, 0, size, size);
  
  // Texto
  ctx.fillStyle = 'white';
  ctx.font = `bold ${size / 4}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('HJ', size / 2, size / 2);
  
  return canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');
}

// Crear logos de diferentes tamaños
const sizes = [192, 512];
sizes.forEach(size => {
  const logoData = createLogo(size);
  const logoPath = path.join(__dirname, '..', '..', 'public', `logo${size}.png`);
  fs.writeFileSync(logoPath, Buffer.from(logoData, 'base64'));
  console.log(`Logo de ${size}x${size} creado en ${logoPath}`);
});

console.log('Logos creados exitosamente!');
