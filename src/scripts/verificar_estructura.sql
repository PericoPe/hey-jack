-- Script para verificar la estructura de las tablas

-- 1. Verificar estructura de eventos_activos_aportantes
DO $$
DECLARE
    columna RECORD;
BEGIN
    RAISE NOTICE 'Verificando estructura de la tabla eventos_activos_aportantes...';
    
    FOR columna IN (
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'eventos_activos_aportantes'
        ORDER BY ordinal_position
    ) LOOP
        RAISE NOTICE 'Columna: %, Tipo: %', columna.column_name, columna.data_type;
    END LOOP;
END $$;

-- 2. Verificar estructura de miembros
DO $$
DECLARE
    columna RECORD;
BEGIN
    RAISE NOTICE 'Verificando estructura de la tabla miembros...';
    
    FOR columna IN (
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'miembros'
        ORDER BY ordinal_position
    ) LOOP
        RAISE NOTICE 'Columna: %, Tipo: %', columna.column_name, columna.data_type;
    END LOOP;
END $$;

-- 3. Verificar datos de ejemplo de eventos_activos_aportantes
DO $$
DECLARE
    registro RECORD;
BEGIN
    RAISE NOTICE 'Mostrando datos de ejemplo de eventos_activos_aportantes (primeros 5 registros)...';
    
    FOR registro IN (
        SELECT *
        FROM eventos_activos_aportantes
        LIMIT 5
    ) LOOP
        RAISE NOTICE 'Registro: %', registro;
    END LOOP;
END $$;

-- 4. Verificar datos de ejemplo de miembros
DO $$
DECLARE
    registro RECORD;
BEGIN
    RAISE NOTICE 'Mostrando datos de ejemplo de miembros (primeros 5 registros)...';
    
    FOR registro IN (
        SELECT *
        FROM miembros
        LIMIT 5
    ) LOOP
        RAISE NOTICE 'Registro: %', registro;
    END LOOP;
END $$;
