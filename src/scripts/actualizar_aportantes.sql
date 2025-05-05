-- SCRIPT PARA ACTUALIZACIÓN COMPLETA DE LA TABLA EVENTOS_ACTIVOS_APORTANTES
-- Este script realiza una sincronización completa de datos entre miembros y aportantes

-- 1. Primero, ejecutamos la función para sincronizar todos los miembros existentes
DO $$
BEGIN
    RAISE NOTICE 'Iniciando sincronización completa de aportantes...';
    
    -- Ejecutar la función de sincronización
    PERFORM sincronizar_todos_miembros();
    
    RAISE NOTICE 'Sincronización básica completada. Ahora realizando correcciones adicionales...';
END $$;

-- 2. Actualizar los campos faltantes o incorrectos en eventos_activos_aportantes
DO $$
DECLARE
    aportante_record RECORD;
    miembro_record RECORD;
    actualizados INTEGER := 0;
BEGIN
    -- Para cada aportante
    FOR aportante_record IN 
        SELECT * FROM eventos_activos_aportantes
    LOOP
        -- Buscar el miembro correspondiente
        SELECT * INTO miembro_record 
        FROM miembros
        WHERE email_padre = aportante_record.email_padre
        LIMIT 1;
        
        IF miembro_record IS NOT NULL THEN
            -- Actualizar campos que podrían estar desactualizados
            UPDATE eventos_activos_aportantes
            SET 
                nombre_padre = miembro_record.nombre_padre,
                whatsapp_padre = miembro_record.whatsapp_padre,
                monto_individual = 1500::numeric,
                estado_pago = COALESCE(aportante_record.estado_pago, 'pendiente')
            WHERE id = aportante_record.id
            AND (
                nombre_padre != miembro_record.nombre_padre OR
                whatsapp_padre IS DISTINCT FROM miembro_record.whatsapp_padre OR
                monto_individual IS NULL OR
                estado_pago IS NULL
            );
            
            GET DIAGNOSTICS actualizados = ROW_COUNT;
            
            IF actualizados > 0 THEN
                RAISE NOTICE 'Actualizado aportante: % (ID: %)', miembro_record.nombre_padre, aportante_record.id;
            END IF;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Actualización de campos completada.';
END $$;

-- 3. Corregir el campo estado_pago (asegurar que sea 'pendiente' o 'pagado')
UPDATE eventos_activos_aportantes
SET estado_pago = 'pendiente'
WHERE estado_pago IS NULL OR estado_pago NOT IN ('pendiente', 'pagado');

-- 4. Asegurar que todos los aportantes tengan fecha_creacion
UPDATE eventos_activos_aportantes
SET fecha_creacion = NOW()
WHERE fecha_creacion IS NULL;

-- 5. Asegurar que todos los aportantes tengan notificacion_email definido
UPDATE eventos_activos_aportantes
SET notificacion_email = FALSE
WHERE notificacion_email IS NULL;

-- 6. Verificar que Ricardo Darín esté correctamente registrado
DO $$
DECLARE
    ricardo_record RECORD;
    evento_record RECORD;
    eventos_actualizados INTEGER := 0;
BEGIN
    -- Buscar a Ricardo Darín
    SELECT * INTO ricardo_record FROM miembros
    WHERE nombre_padre ILIKE '%Ricardo Darin%' OR nombre_padre ILIKE '%Ricardo Darín%'
    LIMIT 1;
    
    IF ricardo_record IS NULL THEN
        RAISE NOTICE 'No se encontró a Ricardo Darín en la tabla miembros';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Ricardo Darín encontrado: ID=%, Email=%', ricardo_record.id, ricardo_record.email_padre;
    
    -- Verificar y agregar a Ricardo en todos los eventos activos de su comunidad
    FOR evento_record IN 
        SELECT * FROM eventos_activos 
        WHERE id_comunidad = ricardo_record.id_comunidad AND estado IN ('activo', 'recaudado')
    LOOP
        -- Verificar si ya existe como aportante
        IF NOT EXISTS (
            SELECT 1 FROM eventos_activos_aportantes
            WHERE id_evento = evento_record.id_evento AND email_padre = ricardo_record.email_padre
        ) THEN
            -- Insertar a Ricardo como aportante
            INSERT INTO eventos_activos_aportantes (
                id_evento, 
                id_comunidad,
                nombre_padre, 
                whatsapp_padre,
                email_padre, 
                monto_individual, 
                estado_pago, 
                notificacion_email, 
                fecha_creacion
            ) VALUES (
                evento_record.id_evento,
                ricardo_record.id_comunidad,
                ricardo_record.nombre_padre,
                ricardo_record.whatsapp_padre,
                ricardo_record.email_padre,
                1500::numeric,
                'pendiente',
                false,
                NOW()
            );
            
            eventos_actualizados := eventos_actualizados + 1;
            RAISE NOTICE 'Ricardo Darín agregado como aportante al evento %', evento_record.nombre_hijo;
        ELSE
            RAISE NOTICE 'Ricardo Darín ya es aportante del evento %', evento_record.nombre_hijo;
        END IF;
    END LOOP;
    
    IF eventos_actualizados = 0 THEN
        RAISE NOTICE 'Ricardo Darín ya está registrado en todos los eventos activos o no hay eventos activos en su comunidad';
    END IF;
END $$;

-- 7. Verificar que todos los eventos activos tengan sus aportantes correspondientes
DO $$
DECLARE
    evento_record RECORD;
    miembro_record RECORD;
    padre_cumpleanero TEXT;
    aportantes_agregados INTEGER := 0;
BEGIN
    -- Para cada evento activo
    FOR evento_record IN 
        SELECT ea.*, e.nombre_evento
        FROM eventos_activos ea
        JOIN eventos e ON ea.id_evento = e.id_evento
        WHERE ea.estado IN ('activo', 'recaudado')
    LOOP
        -- Obtener nombre del padre del cumpleañero
        SELECT m.nombre_padre INTO padre_cumpleanero
        FROM miembros m
        WHERE m.id_comunidad = evento_record.id_comunidad 
        AND m.nombre_hijo = evento_record.nombre_hijo
        LIMIT 1;
        
        -- Para cada miembro de la comunidad (excepto el padre del cumpleañero)
        FOR miembro_record IN 
            SELECT *
            FROM miembros m
            WHERE m.id_comunidad = evento_record.id_comunidad
            AND m.activo = TRUE
            AND m.nombre_padre != padre_cumpleanero
        LOOP
            -- Si no existe como aportante, agregarlo
            IF NOT EXISTS (
                SELECT 1 FROM eventos_activos_aportantes
                WHERE id_evento = evento_record.id_evento 
                AND email_padre = miembro_record.email_padre
            ) THEN
                -- Insertar como aportante
                INSERT INTO eventos_activos_aportantes (
                    id_evento,
                    id_comunidad,
                    nombre_padre,
                    whatsapp_padre,
                    email_padre,
                    monto_individual,
                    estado_pago,
                    notificacion_email,
                    fecha_creacion
                ) VALUES (
                    evento_record.id_evento,
                    miembro_record.id_comunidad,
                    miembro_record.nombre_padre,
                    miembro_record.whatsapp_padre,
                    miembro_record.email_padre,
                    1500::numeric,
                    'pendiente',
                    FALSE,
                    NOW()
                );
                
                aportantes_agregados := aportantes_agregados + 1;
                RAISE NOTICE 'Agregado % como aportante al evento %', miembro_record.nombre_padre, evento_record.nombre_hijo;
            END IF;
        END LOOP;
    END LOOP;
    
    RAISE NOTICE 'Verificación completa: % aportantes agregados', aportantes_agregados;
END $$;

-- 8. Mensaje de confirmación final
DO $$
BEGIN
    RAISE NOTICE 'Actualización completa de la tabla eventos_activos_aportantes finalizada con éxito.';
    RAISE NOTICE 'La tabla ahora está correctamente sincronizada con los miembros y eventos activos.';
END $$;
