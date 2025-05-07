-- Script ultra simple para eliminar miembros sobrantes de la comunidad Marianista
-- Creado: 6 de mayo de 2025

-- 1. Primero, veamos la estructura de la tabla comunidades
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'comunidades' 
ORDER BY ordinal_position;

-- 2. Veamos la comunidad Marianista y su ID
SELECT * FROM comunidades WHERE nombre_comunidad ILIKE '%Marianista%';

-- 3. Ahora eliminamos directamente los miembros sobrantes
DO $$
DECLARE
    id_comunidad_marianista TEXT; -- Cambiado de UUID a TEXT
    total_antes INTEGER;
    total_despues INTEGER;
BEGIN
    -- Obtenemos el ID de la comunidad (como TEXT)
    SELECT id_comunidad INTO id_comunidad_marianista
    FROM comunidades
    WHERE nombre_comunidad ILIKE '%Marianista%'
    LIMIT 1;
    
    -- Contamos cuántos miembros hay antes
    SELECT COUNT(*) INTO total_antes
    FROM miembros
    WHERE id_comunidad = id_comunidad_marianista;
    
    RAISE NOTICE 'Comunidad Marianista ID (texto): %', id_comunidad_marianista;
    RAISE NOTICE 'Total de miembros antes: %', total_antes;
    
    -- Guardamos los IDs de los dos primeros miembros
    CREATE TEMP TABLE miembros_a_conservar AS
    SELECT id
    FROM miembros
    WHERE id_comunidad = id_comunidad_marianista
    ORDER BY id
    LIMIT 2;
    
    -- ELIMINAMOS FÍSICAMENTE todos los demás miembros
    DELETE FROM miembros
    WHERE id_comunidad = id_comunidad_marianista
    AND id NOT IN (SELECT id FROM miembros_a_conservar);
    
    -- Contamos cuántos miembros quedan después
    SELECT COUNT(*) INTO total_despues
    FROM miembros
    WHERE id_comunidad = id_comunidad_marianista;
    
    RAISE NOTICE 'Total de miembros después: %', total_despues;
    
    -- Verificamos que sean exactamente 2
    IF total_despues <> 2 THEN
        RAISE EXCEPTION 'Error: Deberían quedar exactamente 2 miembros, pero hay %', total_despues;
    ELSE
        RAISE NOTICE 'ÉXITO: La comunidad Marianista ahora tiene exactamente 2 miembros';
    END IF;
END $$;

-- Verificación final
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
