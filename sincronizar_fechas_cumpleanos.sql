-- Script para sincronizar las fechas de cumpleaños entre las tablas miembros, eventos y eventos_activos
-- Asegura que cumple_hijo (en miembros), fecha_evento (en eventos) y fecha_cumple (en eventos_activos) 
-- estén sincronizadas para Milan (18 de mayo de 2025)

-- 1. Primero verificamos las fechas actuales
SELECT 
    m.id as id_miembro,
    m.nombre_hijo as nombre_miembro,
    m.cumple_hijo as fecha_miembro,
    e.id_evento as id_evento,
    e.nombre_hijo as nombre_evento,
    e.fecha_evento as fecha_evento,
    ea.id_evento as id_evento_activo,
    ea.nombre_hijo as nombre_evento_activo,
    ea.fecha_cumple as fecha_evento_activo
FROM 
    miembros m
LEFT JOIN 
    eventos e ON e.nombre_hijo ILIKE '%' || m.nombre_hijo || '%'
LEFT JOIN 
    eventos_activos ea ON ea.id_evento = e.id_evento
WHERE 
    m.nombre_hijo ILIKE '%Milan%';

-- 2. Actualizamos la fecha en la tabla eventos para Milan (si es necesario)
UPDATE eventos
SET fecha_evento = '2025-05-18'
WHERE nombre_hijo ILIKE '%Milan%' AND (fecha_evento IS NULL OR fecha_evento != '2025-05-18');

-- 3. Actualizamos la fecha en la tabla eventos_activos para Milan (si es necesario)
UPDATE eventos_activos
SET fecha_cumple = '2025-05-18'
WHERE nombre_hijo ILIKE '%Milan%' AND (fecha_cumple IS NULL OR fecha_cumple != '2025-05-18');

-- 4. Verificamos que todas las fechas estén sincronizadas después de las actualizaciones
SELECT 
    m.id as id_miembro,
    m.nombre_hijo as nombre_miembro,
    m.cumple_hijo as fecha_miembro,
    e.id_evento as id_evento,
    e.nombre_hijo as nombre_evento,
    e.fecha_evento as fecha_evento,
    ea.id_evento as id_evento_activo,
    ea.nombre_hijo as nombre_evento_activo,
    ea.fecha_cumple as fecha_evento_activo
FROM 
    miembros m
LEFT JOIN 
    eventos e ON e.nombre_hijo ILIKE '%' || m.nombre_hijo || '%'
LEFT JOIN 
    eventos_activos ea ON ea.id_evento = e.id_evento
WHERE 
    m.nombre_hijo ILIKE '%Milan%';
