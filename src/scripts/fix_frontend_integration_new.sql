-- Script para corregir problemas de integración entre el frontend y Supabase
-- Este script añade las columnas faltantes y crea las funciones necesarias

-- 1. Añadir columna fecha_creacion a las tablas que la necesitan
DO $$
BEGIN
    -- Añadir a comunidades si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'comunidades' AND column_name = 'fecha_creacion'
    ) THEN
        ALTER TABLE comunidades ADD COLUMN fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Columna fecha_creacion añadida a la tabla comunidades';
    ELSE
        RAISE NOTICE 'La columna fecha_creacion ya existe en la tabla comunidades';
    END IF;

    -- Añadir a miembros si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'miembros' AND column_name = 'fecha_creacion'
    ) THEN
        ALTER TABLE miembros ADD COLUMN fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Columna fecha_creacion añadida a la tabla miembros';
    ELSE
        RAISE NOTICE 'La columna fecha_creacion ya existe en la tabla miembros';
    END IF;

    -- Añadir a eventos si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'eventos' AND column_name = 'fecha_creacion'
    ) THEN
        ALTER TABLE eventos ADD COLUMN fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Columna fecha_creacion añadida a la tabla eventos';
    ELSE
        RAISE NOTICE 'La columna fecha_creacion ya existe en la tabla eventos';
    END IF;

    -- Añadir a eventos_activos si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'eventos_activos' AND column_name = 'fecha_creacion'
    ) THEN
        ALTER TABLE eventos_activos ADD COLUMN fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Columna fecha_creacion añadida a la tabla eventos_activos';
    ELSE
        RAISE NOTICE 'La columna fecha_creacion ya existe en la tabla eventos_activos';
    END IF;

    -- Añadir fecha_evento a eventos_activos si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'eventos_activos' AND column_name = 'fecha_evento'
    ) THEN
        ALTER TABLE eventos_activos ADD COLUMN fecha_evento TIMESTAMP WITH TIME ZONE;
        
        -- Actualizar fecha_evento desde la tabla eventos
        UPDATE eventos_activos ea
        SET fecha_evento = e.fecha_evento
        FROM eventos e
        WHERE ea.id_evento = e.id_evento;
        
        RAISE NOTICE 'Columna fecha_evento añadida a la tabla eventos_activos y actualizada';
    ELSE
        RAISE NOTICE 'La columna fecha_evento ya existe en la tabla eventos_activos';
    END IF;

    -- Añadir monto_total_recaudado a eventos_activos si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'eventos_activos' AND column_name = 'monto_total_recaudado'
    ) THEN
        ALTER TABLE eventos_activos ADD COLUMN monto_total_recaudado NUMERIC DEFAULT 0;
        
        -- Actualizar monto_total_recaudado con la suma de los montos de los aportantes que han pagado
        UPDATE eventos_activos ea
        SET monto_total_recaudado = COALESCE(subquery.total, 0)
        FROM (
            SELECT id_evento, SUM(monto_individual::numeric) as total
            FROM eventos_activos_aportantes
            WHERE estado_pago = 'pagado'
            GROUP BY id_evento
        ) AS subquery
        WHERE ea.id_evento = subquery.id_evento;
        
        RAISE NOTICE 'Columna monto_total_recaudado añadida a la tabla eventos_activos y actualizada';
    ELSE
        RAISE NOTICE 'La columna monto_total_recaudado ya existe en la tabla eventos_activos';
    END IF;
END $$;

-- 2. Crear función RPC get_all_comunidades
CREATE OR REPLACE FUNCTION get_all_comunidades()
RETURNS SETOF comunidades
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY SELECT * FROM comunidades ORDER BY nombre_comunidad;
END;
$$ LANGUAGE plpgsql;

-- 3. Crear función RPC exec_sql para ejecutar SQL dinámico
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS void
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    EXECUTE sql;
END;
$$ LANGUAGE plpgsql;

-- 4. Actualizar los registros existentes con fechas de creación si están vacías
UPDATE comunidades SET fecha_creacion = NOW() WHERE fecha_creacion IS NULL;
UPDATE miembros SET fecha_creacion = NOW() WHERE fecha_creacion IS NULL;
UPDATE eventos SET fecha_creacion = NOW() WHERE fecha_creacion IS NULL;
UPDATE eventos_activos SET fecha_creacion = NOW() WHERE fecha_creacion IS NULL;

-- 5. Asegurar que todos los eventos activos tengan nombre_comunidad
UPDATE eventos_activos ea
SET nombre_comunidad = c.nombre_comunidad
FROM comunidades c
WHERE ea.id_comunidad = c.id_comunidad
AND (ea.nombre_comunidad IS NULL OR ea.nombre_comunidad = '');

-- 6. Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE 'La integración entre el frontend y Supabase ha sido corregida exitosamente.';
    RAISE NOTICE 'Se han añadido las columnas faltantes y creado las funciones necesarias.';
END $$;
