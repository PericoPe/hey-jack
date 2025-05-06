-- Script final simplificado para corregir los datos de Julieta Ursino
-- Este script actualiza el email y whatsapp_padre para Julieta Ursino

-- 1. Verificamos los datos actuales de Julieta en eventos_activos_aportantes
SELECT id, nombre_padre, email_padre, whatsapp_padre, id_evento, id_comunidad
FROM eventos_activos_aportantes
WHERE nombre_padre ILIKE '%Julieta%' AND nombre_padre ILIKE '%Ursino%';

-- 2. Actualizamos específicamente los datos de Julieta Ursino
UPDATE eventos_activos_aportantes
SET 
    email_padre = 'ursino.julieta@gmail.com',
    whatsapp_padre = '1155667788' -- Reemplazar con el número correcto si lo conoces
WHERE nombre_padre ILIKE '%Julieta%' AND nombre_padre ILIKE '%Ursino%';

-- 3. Verificamos que los datos se hayan actualizado correctamente
SELECT id, nombre_padre, email_padre, whatsapp_padre, id_evento, id_comunidad
FROM eventos_activos_aportantes
WHERE nombre_padre ILIKE '%Julieta%' AND nombre_padre ILIKE '%Ursino%';
