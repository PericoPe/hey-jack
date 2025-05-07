-- Script para examinar y corregir el monto de recaudación del cumpleaños de Picachu
-- Creado: 6 de mayo de 2025

-- 1. Primero, veamos la estructura exacta de la tabla eventos
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'eventos' 
ORDER BY ordinal_position;

-- 2. Veamos la estructura exacta de la tabla eventos_activos
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'eventos_activos' 
ORDER BY ordinal_position;

-- 3. Veamos los datos actuales del evento de Picachu
SELECT *
FROM eventos
WHERE nombre_evento ILIKE '%Picachu%';

-- 4. También verificamos si hay un evento activo para Picachu
SELECT *
FROM eventos_activos
WHERE nombre_hijo ILIKE '%Picachu%';

-- 5. Después de ver la estructura de las tablas, ejecuta manualmente las actualizaciones
-- necesarias usando los nombres correctos de las columnas.
-- Por ejemplo:
-- 
-- UPDATE eventos
-- SET nombre_de_columna_correcta = 10000.00
-- WHERE nombre_evento ILIKE '%Picachu%';
-- 
-- UPDATE eventos_activos
-- SET monto_recaudado = 10000.00
-- WHERE nombre_hijo ILIKE '%Picachu%';
