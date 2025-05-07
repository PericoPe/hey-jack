-- Script para corregir la comunidad Marianista y sincronizar fechas de cumpleaños
-- Versión SQL pura (sin JavaScript)
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

-- 3. ELIMINAMOS los miembros sobrantes de la comunidad Marianista
-- Primero verificamos cuáles son los miembros actuales
SELECT 
    c.nombre_comunidad,
    COUNT(*) as total_miembros_antes
FROM 
    comunidades c
JOIN 
    miembros m ON m.id_comunidad = c.id_comunidad
WHERE 
    c.nombre_comunidad ILIKE '%Marianista%'
GROUP BY 
    c.nombre_comunidad;

-- Vemos los miembros actuales
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

-- Creamos una tabla temporal con los IDs de los dos miembros a conservar
CREATE TEMP TABLE miembros_a_conservar AS
SELECT m.id
FROM miembros m
JOIN comunidades c ON m.id_comunidad = c.id_comunidad
WHERE c.nombre_comunidad ILIKE '%Marianista%'
ORDER BY m.id
LIMIT 2;

-- ELIMINAMOS directamente todos los miembros que NO están en la lista de miembros a conservar
DELETE FROM miembros
WHERE id_comunidad IN (
    SELECT id_comunidad
    FROM comunidades
    WHERE nombre_comunidad ILIKE '%Marianista%'
) AND id NOT IN (SELECT id FROM miembros_a_conservar);

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
    e.nombre_evento,
    e.fecha_evento
FROM 
    miembros m
JOIN 
    eventos e ON e.nombre_evento ILIKE '%' || m.nombre_hijo || '%'
WHERE 
    e.fecha_evento IS DISTINCT FROM m.cumple_hijo;

-- 6. Actualizamos las fechas en la tabla eventos para que coincidan con miembros
UPDATE eventos e
SET fecha_evento = m.cumple_hijo
FROM miembros m
WHERE e.nombre_evento ILIKE '%' || m.nombre_hijo || '%'
  AND e.fecha_evento IS DISTINCT FROM m.cumple_hijo;

-- 7. Actualizamos también la tabla eventos_activos
UPDATE eventos_activos
SET fecha_cumple = m.cumple_hijo
FROM miembros m
JOIN eventos e ON e.nombre_evento ILIKE '%' || m.nombre_hijo || '%'
WHERE eventos_activos.id_evento = e.id_evento
  AND eventos_activos.fecha_cumple IS DISTINCT FROM m.cumple_hijo;

-- 8. Verificamos que todas las fechas estén sincronizadas después de las actualizaciones
SELECT 
    m.id as id_miembro,
    m.nombre_hijo as nombre_miembro,
    m.cumple_hijo as fecha_miembro,
    e.id_evento,
    e.nombre_evento,
    e.fecha_evento,
    ea.id_evento as id_evento_activo,
    ea.fecha_cumple
FROM 
    miembros m
JOIN 
    eventos e ON e.nombre_evento ILIKE '%' || m.nombre_hijo || '%'
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
    e.nombre_evento,
    e.fecha_evento,
    ea.id_evento as id_evento_activo,
    ea.fecha_cumple
FROM 
    miembros m
JOIN 
    eventos e ON e.nombre_evento ILIKE '%' || m.nombre_hijo || '%'
LEFT JOIN 
    eventos_activos ea ON ea.id_evento = e.id_evento
WHERE 
    m.nombre_hijo ILIKE '%Milan%';

-- 10. Si la fecha de Milan en miembros no es 18 de mayo de 2025, la corregimos
UPDATE miembros
SET cumple_hijo = '2025-05-18'
WHERE nombre_hijo ILIKE '%Milan%' AND (cumple_hijo IS NULL OR cumple_hijo != '2025-05-18');

-- 11. Nota: No hay un contador de miembros en la tabla comunidades para actualizar
-- En su lugar, verificamos que los miembros inactivos no aparezcan en las consultas

-- 12. Verificación y corrección de políticas RLS para la tabla comunidades
-- Primero verificamos las políticas existentes
SELECT 
    policyname, 
    tablename, 
    permissive, 
    roles, 
    cmd, 
    qual
FROM 
    pg_policies
WHERE 
    tablename = 'comunidades';

-- Eliminamos políticas excesivas (dejamos solo las 3 principales)
DROP POLICY IF EXISTS policy_4 ON comunidades;
DROP POLICY IF EXISTS policy_5 ON comunidades;
DROP POLICY IF EXISTS policy_6 ON comunidades;
DROP POLICY IF EXISTS policy_7 ON comunidades;

-- Nos aseguramos de que existan las 3 políticas principales
-- 1. Política para el administrador (acceso total)
DROP POLICY IF EXISTS admin_comunidades ON comunidades;
CREATE POLICY admin_comunidades ON comunidades
    FOR ALL
    TO authenticated
    USING (auth.email() = 'javierhrusino@gmail.com');

-- 2. Política para usuarios autenticados (solo sus propias comunidades)
DROP POLICY IF EXISTS user_comunidades ON comunidades;
CREATE POLICY user_comunidades ON comunidades
    FOR SELECT
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM miembros m 
        WHERE m.id_comunidad = id_comunidad 
        AND m.email_padre = auth.email()
    ));

-- 3. Política para usuarios anónimos (todas las comunidades)
DROP POLICY IF EXISTS public_comunidades ON comunidades;
CREATE POLICY public_comunidades ON comunidades
    FOR SELECT
    TO anon
    USING (true);

-- Verificamos las políticas después de la corrección
SELECT 
    policyname, 
    tablename, 
    permissive, 
    roles, 
    cmd, 
    qual
FROM 
    pg_policies
WHERE 
    tablename = 'comunidades';

-- 13. Corregimos los horarios de creación de la comunidad Marianista
-- Verificamos primero el horario actual
SELECT 
    id_comunidad,
    nombre_comunidad,
    fecha_creacion
FROM 
    comunidades
WHERE 
    nombre_comunidad ILIKE '%Marianista%';

-- Actualizamos el horario a las 10:00 AM hora de Argentina del día de hoy
UPDATE comunidades
SET fecha_creacion = '2025-05-06 10:00:00-03:00'::timestamptz
WHERE nombre_comunidad ILIKE '%Marianista%';

-- 14. Verificación final de la comunidad Marianista
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

-- 15. Verificación detallada de los miembros de la comunidad Marianista
-- Debe mostrar EXACTAMENTE 2 miembros
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
