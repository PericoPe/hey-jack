-- Script para corregir las fechas de cumpleaños en la tabla eventos_activos
-- Este script actualiza las fechas en eventos_activos para que coincidan con las fechas correctas de la tabla miembros

-- 1. Actualizar la fecha_cumple en eventos_activos basándose en los datos de miembros
UPDATE eventos_activos ea
SET fecha_cumple = m.cumple_hijo
FROM miembros m
WHERE ea.nombre_hijo = m.nombre_hijo
  AND ea.id_comunidad = m.id_comunidad
  AND m.cumple_hijo IS NOT NULL;

-- 2. Verificar específicamente el caso de Pikachu
UPDATE eventos_activos
SET fecha_cumple = (
    SELECT cumple_hijo 
    FROM miembros 
    WHERE nombre_hijo ILIKE '%pikachu%' OR nombre_hijo ILIKE '%picachu%'
    LIMIT 1
)
WHERE nombre_hijo ILIKE '%pikachu%' OR nombre_hijo ILIKE '%picachu%';

-- 3. Actualizar la fecha_evento para que sea 15 días antes del cumpleaños
UPDATE eventos_activos
SET fecha_evento = fecha_cumple - INTERVAL '15 days'
WHERE fecha_cumple IS NOT NULL;

-- 4. Mostrar los registros actualizados para verificación
SELECT id_evento, nombre_hijo, fecha_cumple, fecha_evento
FROM eventos_activos
ORDER BY fecha_cumple;
