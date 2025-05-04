# Script para hacer commit y push de los cambios
Write-Host "Añadiendo archivos modificados..."
git add src/assets/index.js src/components/GiftSection.js src/assets/storeLogos.js

Write-Host "Haciendo commit de los cambios..."
git commit -m "Añadir tiendas aliadas a la landing page"

Write-Host "Haciendo push de los cambios a GitHub..."
git push origin master

Write-Host "¡Proceso completado!"
