-- Script simple para contar y mostrar los miembros de la comunidad Marianista
-- Creado: 6 de mayo de 2025

-- 1. Primero, veamos cuántos miembros tiene la comunidad Marianista
SELECT 
    c.nombre_comunidad,
    COUNT(*) as total_miembros
FROM 
    comunidades c
JOIN 
    miembros m ON m.id_comunidad = c.id_comunidad
WHERE 
    c.nombre_comunidad ILIKE '%Marianista%'
GROUP BY 
    c.nombre_comunidad;

-- 2. Veamos quiénes son estos miembros
SELECT 
    m.id,
    m.nombre_padre,
    m.email_padre,
    m.nombre_hijo,
    m.activo
FROM 
    miembros m
JOIN 
    comunidades c ON m.id_comunidad = c.id_comunidad
WHERE 
    c.nombre_comunidad ILIKE '%Marianista%'
ORDER BY 
    m.id;

-- 3. ELIMINAMOS directamente los miembros sobrantes para dejar solo 2
-- Primero, guardamos los IDs de los dos primeros miembros
CREATE TEMP TABLE miembros_a_conservar AS
SELECT m.id
FROM miembros m
JOIN comunidades c ON m.id_comunidad = c.id_comunidad
WHERE c.nombre_comunidad ILIKE '%Marianista%'
ORDER BY m.id
LIMIT 2;

-- Ahora eliminamos todos los demás miembros de esta comunidad
DELETE FROM miembros
WHERE id_comunidad IN (
    SELECT id_comunidad
    FROM comunidades
    WHERE nombre_comunidad ILIKE '%Marianista%'
) AND id NOT IN (SELECT id FROM miembros_a_conservar);

-- 4. Verificamos que ahora solo haya 2 miembros
SELECT 
    c.nombre_comunidad,
    COUNT(*) as total_miembros
FROM 
    comunidades c
JOIN 
    miembros m ON m.id_comunidad = c.id_comunidad
WHERE 
    c.nombre_comunidad ILIKE '%Marianista%'
GROUP BY 
    c.nombre_comunidad;

-- 5. Veamos quiénes son estos 2 miembros
SELECT 
    m.id,
    m.nombre_padre,
    m.email_padre,
    m.nombre_hijo,
    m.activo
FROM 
    miembros m
JOIN 
    comunidades c ON m.id_comunidad = c.id_comunidad
WHERE 
    c.nombre_comunidad ILIKE '%Marianista%'
ORDER BY 
    m.id;
