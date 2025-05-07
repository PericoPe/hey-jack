-- Script ultra simple para contar miembros de la comunidad Marianista
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
    m.nombre_hijo
FROM 
    miembros m
JOIN 
    comunidades c ON m.id_comunidad = c.id_comunidad
WHERE 
    c.nombre_comunidad ILIKE '%Marianista%'
ORDER BY 
    m.id;

-- 3. ELIMINAR los miembros sobrantes (dejar solo los 2 primeros)
DELETE FROM miembros
WHERE id IN (
    SELECT m.id
    FROM miembros m
    JOIN comunidades c ON m.id_comunidad = c.id_comunidad
    WHERE c.nombre_comunidad ILIKE '%Marianista%'
    ORDER BY m.id
    OFFSET 2
);

-- 4. Verificar que ahora solo hay 2 miembros
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
