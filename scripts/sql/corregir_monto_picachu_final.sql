-- Script para corregir el monto de recaudación del cumpleaños de Picachu
-- Creado: 6 de mayo de 2025

-- 1. Primero, veamos la estructura de la tabla eventos
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'eventos' 
ORDER BY ordinal_position;

-- 2. Veamos la estructura de la tabla eventos_activos
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

-- 5. Corregir el monto en la tabla eventos (usando el nombre correcto de la columna)
-- Intentamos con varios nombres posibles para la columna
UPDATE eventos
SET 
    monto = 10000.00
WHERE 
    nombre_evento ILIKE '%Picachu%';

UPDATE eventos
SET 
    monto_objetivo = 10000.00
WHERE 
    nombre_evento ILIKE '%Picachu%';

UPDATE eventos
SET 
    monto_total = 10000.00
WHERE 
    nombre_evento ILIKE '%Picachu%';

-- 6. Corregir el monto en la tabla eventos_activos
UPDATE eventos_activos
SET 
    monto_recaudado = 10000.00
WHERE 
    nombre_hijo ILIKE '%Picachu%';

UPDATE eventos_activos
SET 
    monto_total_recaudado = 10000.00
WHERE 
    nombre_hijo ILIKE '%Picachu%';

-- 7. Verificar que se haya actualizado correctamente
SELECT *
FROM eventos
WHERE nombre_evento ILIKE '%Picachu%';

-- 8. Verificar también la tabla eventos_activos
SELECT *
FROM eventos_activos
WHERE nombre_hijo ILIKE '%Picachu%';
