-- Script completo para sincronizar datos entre miembros y eventos_activos_aportantes
-- Este script corrige todos los problemas de sincronización, incluyendo el caso específico de Julieta Ursino

-- 1. Verificar la estructura de las tablas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'eventos_activos_aportantes' 
ORDER BY ordinal_position;

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'miembros' 
ORDER BY ordinal_position;

-- 2. Verificar los datos actuales de Julieta Ursino
SELECT nombre_padre, email_padre, whatsapp_padre, id_comunidad 
FROM miembros 
WHERE nombre_padre ILIKE '%Julieta%' AND nombre_padre ILIKE '%Ursino%';

SELECT id, nombre_padre, email_padre, whatsapp_padre, id_evento, id_comunidad
FROM eventos_activos_aportantes
WHERE nombre_padre ILIKE '%Julieta%' AND nombre_padre ILIKE '%Ursino%';

-- 3. Actualizar específicamente los datos de Julieta Ursino
UPDATE eventos_activos_aportantes
SET 
    email_padre = 'ursino.julieta@gmail.com',
    whatsapp_padre = (SELECT whatsapp_padre FROM miembros WHERE email_padre = 'ursino.julieta@gmail.com' LIMIT 1)
WHERE nombre_padre ILIKE '%Julieta%' AND nombre_padre ILIKE '%Ursino%';

-- 4. Identificar discrepancias entre miembros y eventos_activos_aportantes
WITH discrepancias AS (
    SELECT 
        eaa.id,
        eaa.nombre_padre AS eaa_nombre,
        m.nombre_padre AS m_nombre,
        eaa.email_padre AS eaa_email,
        m.email_padre AS m_email,
        eaa.whatsapp_padre AS eaa_whatsapp,
        m.whatsapp_padre AS m_whatsapp,
        -- eaa.monto_aporte, -- La columna monto_aporte no existe
        c.monto_individual,
        eaa.id_comunidad
    FROM eventos_activos_aportantes eaa
    JOIN miembros m ON eaa.email_padre = m.email_padre
    LEFT JOIN comunidades c ON eaa.id_comunidad = c.id_comunidad
    WHERE eaa.nombre_padre != m.nombre_padre
       OR eaa.whatsapp_padre IS DISTINCT FROM m.whatsapp_padre
       -- OR eaa.monto_aporte IS NULL
       -- OR eaa.monto_aporte = 0
)
SELECT * FROM discrepancias;

-- 5. Actualizar todos los registros con discrepancias usando email como clave
UPDATE eventos_activos_aportantes eaa
SET 
    nombre_padre = m.nombre_padre,
    whatsapp_padre = m.whatsapp_padre
FROM miembros m
JOIN comunidades c ON m.id_comunidad = c.id_comunidad
WHERE eaa.email_padre = m.email_padre
  AND eaa.id_comunidad = m.id_comunidad
  AND (
      eaa.nombre_padre != m.nombre_padre
      OR eaa.whatsapp_padre IS DISTINCT FROM m.whatsapp_padre
  );

-- 6. Identificar registros con datos faltantes (email, whatsapp o monto_aporte)
SELECT id, nombre_padre, email_padre, whatsapp_padre, id_evento, id_comunidad
FROM eventos_activos_aportantes
WHERE email_padre IS NULL OR whatsapp_padre IS NULL;

-- 7. Actualizar registros con datos faltantes usando nombre_padre como clave
UPDATE eventos_activos_aportantes eaa
SET 
    email_padre = m.email_padre,
    whatsapp_padre = m.whatsapp_padre
FROM miembros m
JOIN comunidades c ON m.id_comunidad = c.id_comunidad
WHERE eaa.nombre_padre = m.nombre_padre
  AND eaa.id_comunidad = m.id_comunidad
  AND (
      eaa.email_padre IS NULL
      OR eaa.whatsapp_padre IS NULL
  );

-- 8. Verificar si hay aportantes faltantes (miembros que deberían estar en eventos_activos_aportantes pero no están)
WITH miembros_faltantes AS (
    SELECT 
        m.nombre_padre,
        m.email_padre,
        m.id_comunidad,
        ea.id_evento
    FROM miembros m
    CROSS JOIN eventos_activos ea
    WHERE m.id_comunidad = ea.id_comunidad
      AND m.activo = true
      AND NOT EXISTS (
          SELECT 1 
          FROM eventos_activos_aportantes eaa 
          WHERE eaa.id_evento = ea.id_evento 
            AND eaa.email_padre = m.email_padre
      )
)
SELECT * FROM miembros_faltantes;

-- 9. Insertar aportantes faltantes
INSERT INTO eventos_activos_aportantes (
    id_evento, 
    id_comunidad, 
    nombre_padre, 
    email_padre, 
    whatsapp_padre
)
SELECT 
    ea.id_evento,
    m.id_comunidad,
    m.nombre_padre,
    m.email_padre,
    m.whatsapp_padre
FROM miembros m
CROSS JOIN eventos_activos ea
JOIN comunidades c ON m.id_comunidad = c.id_comunidad
WHERE m.id_comunidad = ea.id_comunidad
  AND m.activo = true
  AND NOT EXISTS (
      SELECT 1 
      FROM eventos_activos_aportantes eaa 
      WHERE eaa.id_evento = ea.id_evento 
        AND eaa.email_padre = m.email_padre
  );

-- 10. Actualizar el contador de pendientes en eventos_activos
-- La columna pendientes no existe en la tabla eventos_activos
-- UPDATE eventos_activos ea
-- SET pendientes = (
--     SELECT COUNT(*) 
--     FROM eventos_activos_aportantes eaa 
--     WHERE eaa.id_evento = ea.id_evento 
--       -- AND eaa.pagado = false -- La columna pagado no existe
-- );

-- 11. Verificación final de los datos de Julieta Ursino
SELECT id, nombre_padre, email_padre, whatsapp_padre, id_evento, id_comunidad
FROM eventos_activos_aportantes
WHERE nombre_padre ILIKE '%Julieta%' AND nombre_padre ILIKE '%Ursino%';

-- 12. Verificación final de registros con datos incompletos
SELECT id, nombre_padre, email_padre, whatsapp_padre, id_evento, id_comunidad
FROM eventos_activos_aportantes
WHERE email_padre IS NULL OR whatsapp_padre IS NULL;
