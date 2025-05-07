-- Script para corregir el monto de recaudación del cumpleaños de Picachu
-- Creado: 6 de mayo de 2025

-- 1. Primero, veamos los datos actuales del evento de Picachu
SELECT 
    *
FROM 
    eventos
WHERE 
    nombre_evento ILIKE '%Picachu%';

-- 2. También verificamos si hay un evento activo para Picachu
SELECT 
    *
FROM 
    eventos_activos
WHERE 
    nombre_hijo ILIKE '%Picachu%';

-- 3. Corregir el monto de recaudación en la tabla eventos
UPDATE eventos
SET 
    monto_recaudacion = 10000.00
WHERE 
    nombre_evento ILIKE '%Picachu%';

-- 4. Corregir el monto de recaudación en la tabla eventos_activos (si existe)
UPDATE eventos_activos
SET 
    monto_recaudado = 10000.00,
    monto_total_recaudado = 10000.00
WHERE 
    nombre_hijo ILIKE '%Picachu%';

-- 5. Verificar que se haya actualizado correctamente
SELECT 
    id_evento,
    nombre_evento,
    monto_recaudacion
FROM 
    eventos
WHERE 
    nombre_evento ILIKE '%Picachu%';

-- 6. Verificar también la tabla eventos_activos
SELECT 
    id_evento,
    nombre_hijo,
    monto_recaudado,
    monto_total_recaudado
FROM 
    eventos_activos
WHERE 
    nombre_hijo ILIKE '%Picachu%';
