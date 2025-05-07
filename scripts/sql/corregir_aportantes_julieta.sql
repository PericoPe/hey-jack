-- Script para corregir los datos de Julieta Ursino en la tabla eventos_activos_aportantes
-- Este script actualiza el WhatsApp, email y monto de aporte para Julieta Ursino

-- 1. Primero verificamos los datos correctos de Julieta en la tabla miembros
SELECT nombre_padre, email_padre, whatsapp_padre, id_comunidad 
FROM miembros 
WHERE nombre_padre ILIKE '%Julieta%' AND nombre_padre ILIKE '%Ursino%';

-- 2. Verificamos los datos actuales en eventos_activos_aportantes
SELECT id, nombre_padre, email_padre, whatsapp_padre, id_evento, id_comunidad
FROM eventos_activos_aportantes
WHERE nombre_padre ILIKE '%Julieta%' AND nombre_padre ILIKE '%Ursino%';

-- 3. Actualizamos los datos de Julieta en eventos_activos_aportantes
UPDATE eventos_activos_aportantes
SET 
    email_padre = (SELECT email_padre FROM miembros WHERE nombre_padre ILIKE '%Julieta%' AND nombre_padre ILIKE '%Ursino%' LIMIT 1),
    whatsapp = (SELECT whatsapp FROM miembros WHERE nombre_padre ILIKE '%Julieta%' AND nombre_padre ILIKE '%Ursino%' LIMIT 1),
    monto_aporte = 10000
WHERE nombre_padre ILIKE '%Julieta%' AND nombre_padre ILIKE '%Ursino%';

-- 4. Verificamos que los datos se hayan actualizado correctamente
SELECT id, nombre_padre, email_padre, whatsapp_padre, id_evento, id_comunidad
FROM eventos_activos_aportantes
WHERE nombre_padre ILIKE '%Julieta%' AND nombre_padre ILIKE '%Ursino%';

-- 5. Verificamos si hay otros registros con datos faltantes o incorrectos
SELECT eaa.id, eaa.nombre_padre, eaa.email_padre, eaa.whatsapp_padre
FROM eventos_activos_aportantes eaa
LEFT JOIN miembros m ON eaa.email_padre = m.email_padre
WHERE eaa.email_padre IS NULL OR eaa.whatsapp_padre IS NULL;

-- 6. Actualizamos todos los registros que tengan datos faltantes
UPDATE eventos_activos_aportantes
SET 
    email_padre = m.email_padre,
    whatsapp_padre = m.whatsapp_padre
FROM miembros m
WHERE eventos_activos_aportantes.nombre_padre = m.nombre_padre
  AND eventos_activos_aportantes.id_comunidad = m.id_comunidad
  AND (eventos_activos_aportantes.email_padre IS NULL OR eventos_activos_aportantes.whatsapp_padre IS NULL);

-- 7. Verificamos nuevamente que todos los datos estén completos
SELECT id, nombre_padre, email_padre, whatsapp_padre, id_evento, id_comunidad
FROM eventos_activos_aportantes
WHERE email_padre IS NULL OR whatsapp_padre IS NULL;
