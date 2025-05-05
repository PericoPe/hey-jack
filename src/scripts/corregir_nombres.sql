-- Script para corregir nombres en eventos_activos_aportantes
-- Basado en la estructura real de las tablas

-- 1. Verificar la fecha de cumpleaños de Milan
DO $$
DECLARE
    fecha_milan DATE;
BEGIN
    SELECT cumple_hijo INTO fecha_milan
    FROM miembros
    WHERE nombre_hijo = 'Milan';
    
    RAISE NOTICE 'La fecha de cumpleaños de Milan es: %', fecha_milan;
END $$;

-- 2. Mostrar discrepancias entre miembros y eventos_activos_aportantes
DO $$
DECLARE
    discrepancias_count INTEGER := 0;
    discrepancia RECORD;
BEGIN
    RAISE NOTICE 'Verificando discrepancias entre miembros y eventos_activos_aportantes...';
    
    FOR discrepancia IN (
        SELECT 
            ea.id_evento,
            ea.nombre_padre AS nombre_en_aportantes,
            m.nombre_padre AS nombre_en_miembros,
            ea.email_padre AS email_en_aportantes,
            m.email_padre AS email_en_miembros
        FROM eventos_activos_aportantes ea
        JOIN miembros m ON ea.email_padre = m.email_padre
        WHERE ea.nombre_padre != m.nombre_padre
    ) LOOP
        discrepancias_count := discrepancias_count + 1;
        RAISE NOTICE 'Discrepancia #%: Evento: %, Nombre en aportantes: %, Nombre en miembros: %, Email: %',
            discrepancias_count,
            discrepancia.id_evento,
            discrepancia.nombre_en_aportantes,
            discrepancia.nombre_en_miembros,
            discrepancia.email_en_aportantes;
    END LOOP;
    
    IF discrepancias_count = 0 THEN
        RAISE NOTICE 'No se encontraron discrepancias.';
    ELSE
        RAISE NOTICE 'Se encontraron % discrepancias en total.', discrepancias_count;
    END IF;
END $$;

-- 3. Corregir las discrepancias actualizando eventos_activos_aportantes con datos de miembros
DO $$
DECLARE
    actualizaciones_count INTEGER := 0;
BEGIN
    RAISE NOTICE 'Corrigiendo discrepancias...';
    
    UPDATE eventos_activos_aportantes ea
    SET nombre_padre = m.nombre_padre
    FROM miembros m
    WHERE ea.email_padre = m.email_padre
    AND ea.nombre_padre != m.nombre_padre;
    
    GET DIAGNOSTICS actualizaciones_count = ROW_COUNT;
    
    RAISE NOTICE 'Se actualizaron % registros en eventos_activos_aportantes.', actualizaciones_count;
END $$;

-- 4. Verificar que la tabla eventos_activos_aportantes esté correctamente sincronizada
DO $$
DECLARE
    discrepancias_count INTEGER := 0;
BEGIN
    RAISE NOTICE 'Verificando que no queden discrepancias...';
    
    SELECT COUNT(*) INTO discrepancias_count
    FROM eventos_activos_aportantes ea
    JOIN miembros m ON ea.email_padre = m.email_padre
    WHERE ea.nombre_padre != m.nombre_padre;
    
    IF discrepancias_count = 0 THEN
        RAISE NOTICE 'Verificación exitosa: No quedan discrepancias entre las tablas.';
    ELSE
        RAISE NOTICE 'ADVERTENCIA: Aún quedan % discrepancias sin resolver.', discrepancias_count;
    END IF;
END $$;

-- 5. Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE 'La corrección de nombres en eventos_activos_aportantes ha sido completada.';
    RAISE NOTICE 'Todos los nombres deberían estar correctamente sincronizados ahora.';
END $$;
