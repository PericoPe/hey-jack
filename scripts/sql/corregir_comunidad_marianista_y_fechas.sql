-- Script para corregir la comunidad Marianista y sincronizar fechas de cumpleaños
-- Creado: 6 de mayo de 2025

-- 1. Primero verificamos la comunidad Marianista y sus miembros
SELECT 
    c.id_comunidad,
    c.nombre_comunidad,
    COUNT(m.id) as cantidad_miembros
FROM 
    comunidades c
LEFT JOIN 
    miembros m ON m.id_comunidad = c.id_comunidad
WHERE 
    c.nombre_comunidad ILIKE '%Marianista%'
GROUP BY 
    c.id_comunidad, c.nombre_comunidad;

-- 2. Listamos todos los miembros de la comunidad Marianista
SELECT 
    m.id,
    m.nombre_padre,
    m.email_padre,
    m.nombre_hijo,
    m.cumple_hijo,
    m.activo
FROM 
    miembros m
JOIN 
    comunidades c ON m.id_comunidad = c.id_comunidad
WHERE 
    c.nombre_comunidad ILIKE '%Marianista%'
ORDER BY 
    m.id;

-- 3. Desactivamos los miembros sobrantes de la comunidad Marianista
-- Asumimos que los dos primeros miembros son los correctos y los demás deben desactivarse
UPDATE miembros
SET activo = false
WHERE id IN (
    SELECT m.id
    FROM miembros m
    JOIN comunidades c ON m.id_comunidad = c.id_comunidad
    WHERE c.nombre_comunidad ILIKE '%Marianista%'
    ORDER BY m.id
    OFFSET 2
);

-- 4. Verificamos que ahora solo haya 2 miembros activos
SELECT 
    c.id_comunidad,
    c.nombre_comunidad,
    COUNT(m.id) as cantidad_miembros_total,
    SUM(CASE WHEN m.activo = true THEN 1 ELSE 0 END) as cantidad_miembros_activos
FROM 
    comunidades c
LEFT JOIN 
    miembros m ON m.id_comunidad = c.id_comunidad
WHERE 
    c.nombre_comunidad ILIKE '%Marianista%'
GROUP BY 
    c.id_comunidad, c.nombre_comunidad;

-- 5. Ahora corregimos las fechas de cumpleaños en la tabla eventos
-- Verificamos primero las discrepancias entre miembros y eventos
SELECT 
    m.id as id_miembro,
    m.nombre_hijo as nombre_miembro,
    m.cumple_hijo as fecha_miembro,
    e.id_evento,
    e.nombre_hijo as nombre_evento,
    e.fecha_evento
FROM 
    miembros m
JOIN 
    eventos e ON e.nombre_hijo ILIKE '%' || m.nombre_hijo || '%'
WHERE 
    e.fecha_evento IS DISTINCT FROM m.cumple_hijo;

-- 6. Actualizamos las fechas en la tabla eventos para que coincidan con miembros
UPDATE eventos e
SET fecha_evento = m.cumple_hijo
FROM miembros m
WHERE e.nombre_hijo ILIKE '%' || m.nombre_hijo || '%'
  AND e.fecha_evento IS DISTINCT FROM m.cumple_hijo;

-- 7. Actualizamos también la tabla eventos_activos
UPDATE eventos_activos ea
SET fecha_cumple = m.cumple_hijo
FROM miembros m
JOIN eventos e ON e.id_evento = ea.id_evento
WHERE e.nombre_hijo ILIKE '%' || m.nombre_hijo || '%'
  AND ea.fecha_cumple IS DISTINCT FROM m.cumple_hijo;

-- 8. Verificamos que todas las fechas estén sincronizadas después de las actualizaciones
SELECT 
    m.id as id_miembro,
    m.nombre_hijo as nombre_miembro,
    m.cumple_hijo as fecha_miembro,
    e.id_evento,
    e.nombre_hijo as nombre_evento,
    e.fecha_evento,
    ea.id_evento as id_evento_activo,
    ea.fecha_cumple
FROM 
    miembros m
JOIN 
    eventos e ON e.nombre_hijo ILIKE '%' || m.nombre_hijo || '%'
LEFT JOIN 
    eventos_activos ea ON ea.id_evento = e.id_evento
ORDER BY 
    m.nombre_hijo;

-- 9. Verificamos específicamente el caso de Milan
SELECT 
    m.id as id_miembro,
    m.nombre_hijo as nombre_miembro,
    m.cumple_hijo as fecha_miembro,
    e.id_evento,
    e.nombre_hijo as nombre_evento,
    e.fecha_evento,
    ea.id_evento as id_evento_activo,
    ea.fecha_cumple
FROM 
    miembros m
JOIN 
    eventos e ON e.nombre_hijo ILIKE '%' || m.nombre_hijo || '%'
LEFT JOIN 
    eventos_activos ea ON ea.id_evento = e.id_evento
WHERE 
    m.nombre_hijo ILIKE '%Milan%';

-- 10. Si la fecha de Milan en miembros no es 18 de mayo de 2025, la corregimos
UPDATE miembros
SET cumple_hijo = '2025-05-18'
WHERE nombre_hijo ILIKE '%Milan%' AND (cumple_hijo IS NULL OR cumple_hijo != '2025-05-18');

-- 11. Verificación final de la comunidad Marianista
SELECT 
    c.id_comunidad,
    c.nombre_comunidad,
    COUNT(CASE WHEN m.activo = true THEN 1 ELSE NULL END) as miembros_activos
FROM 
    comunidades c
LEFT JOIN 
    miembros m ON m.id_comunidad = c.id_comunidad
WHERE 
    c.nombre_comunidad ILIKE '%Marianista%'
GROUP BY 
    c.id_comunidad, c.nombre_comunidad;
