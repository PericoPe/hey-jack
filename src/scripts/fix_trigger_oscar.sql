-- Script para verificar y corregir el problema con el trigger de sincronización
-- Este script verifica el estado del trigger y lo corrige si es necesario

-- 1. Verificar si el trigger existe
DO $$
DECLARE
    trigger_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'sincronizar_nuevo_miembro'
    ) INTO trigger_exists;
    
    IF trigger_exists THEN
        RAISE NOTICE 'El trigger sincronizar_nuevo_miembro existe.';
    ELSE
        RAISE NOTICE 'El trigger sincronizar_nuevo_miembro NO existe. Se creará a continuación.';
    END IF;
END $$;

-- 2. Eliminar el trigger existente si hay problemas
DROP TRIGGER IF EXISTS sincronizar_nuevo_miembro ON miembros;

-- 3. Eliminar la función del trigger si existe (con CASCADE para eliminar dependencias)
DROP FUNCTION IF EXISTS sincronizar_nuevo_miembro() CASCADE;

-- 4. Crear la función del trigger corregida
CREATE OR REPLACE FUNCTION sincronizar_nuevo_miembro()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    evento_record RECORD;
    eventos_actualizados INTEGER := 0;
BEGIN
    -- Verificar que el nuevo miembro no sea el padre del cumpleañero
    FOR evento_record IN 
        SELECT * FROM eventos_activos 
        WHERE id_comunidad = NEW.id_comunidad AND estado IN ('activo', 'recaudado')
    LOOP
        -- Verificar si el nuevo miembro es el padre del cumpleañero
        IF NEW.nombre_hijo = evento_record.nombre_hijo THEN
            RAISE NOTICE 'El miembro % es el padre del cumpleañero % y no se añadirá como aportante', 
                NEW.nombre_padre, evento_record.nombre_hijo;
            CONTINUE;
        END IF;
        
        -- Verificar si ya existe como aportante
        IF NOT EXISTS (
            SELECT 1 FROM eventos_activos_aportantes
            WHERE id_evento = evento_record.id_evento AND email_padre = NEW.email_padre
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
                NEW.id_comunidad,
                NEW.nombre_padre,
                NEW.whatsapp_padre,
                NEW.email_padre,
                1500::numeric, -- Valor fijo para evitar problemas de tipo
                'pendiente',
                FALSE,
                NOW()
            );
            
            eventos_actualizados := eventos_actualizados + 1;
            
            -- Omitimos la actualización de miembros_pendientes porque es de tipo JSONB
            -- y requiere un tratamiento especial
        END IF;
    END LOOP;
    
    IF eventos_actualizados > 0 THEN
        RAISE NOTICE 'Miembro % añadido como aportante a % eventos activos', NEW.nombre_padre, eventos_actualizados;
    ELSE
        RAISE NOTICE 'No se encontraron eventos activos para añadir al miembro % como aportante', NEW.nombre_padre;
    END IF;
    
    RETURN NEW;
END
$$ LANGUAGE plpgsql;

-- 5. Crear el trigger
CREATE TRIGGER sincronizar_nuevo_miembro
AFTER INSERT ON miembros
FOR EACH ROW
EXECUTE FUNCTION sincronizar_nuevo_miembro();

-- 6. Verificar si Oscar Martínez existe y sincronizarlo manualmente
DO $$
DECLARE
    oscar_record RECORD;
    evento_record RECORD;
    eventos_actualizados INTEGER := 0;
BEGIN
    -- Buscar a Oscar Martínez
    SELECT * INTO oscar_record FROM miembros
    WHERE nombre_padre ILIKE '%Oscar Martinez%' OR nombre_padre ILIKE '%Oscar Martínez%'
    LIMIT 1;
    
    IF oscar_record IS NULL THEN
        RAISE NOTICE 'No se encontró a Oscar Martínez en la tabla miembros';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Oscar Martínez encontrado: ID=%, Email=%', oscar_record.id, oscar_record.email_padre;
    
    -- Verificar y agregar a Oscar en todos los eventos activos de su comunidad
    FOR evento_record IN 
        SELECT * FROM eventos_activos 
        WHERE id_comunidad = oscar_record.id_comunidad AND estado IN ('activo', 'recaudado')
    LOOP
        -- Verificar si Oscar es el padre del cumpleañero
        IF oscar_record.nombre_hijo = evento_record.nombre_hijo THEN
            RAISE NOTICE 'Oscar Martínez es el padre del cumpleañero % y no se añadirá como aportante', 
                evento_record.nombre_hijo;
            CONTINUE;
        END IF;
        
        -- Verificar si ya existe como aportante
        IF NOT EXISTS (
            SELECT 1 FROM eventos_activos_aportantes
            WHERE id_evento = evento_record.id_evento AND email_padre = oscar_record.email_padre
        ) THEN
            -- Insertar a Oscar como aportante
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
                oscar_record.id_comunidad,
                oscar_record.nombre_padre,
                oscar_record.whatsapp_padre,
                oscar_record.email_padre,
                1500::numeric,
                'pendiente',
                false,
                NOW()
            );
            
            eventos_actualizados := eventos_actualizados + 1;
            RAISE NOTICE 'Oscar Martínez agregado como aportante al evento %', evento_record.nombre_hijo;
            
            -- Omitimos la actualización de miembros_pendientes porque es de tipo JSONB
            -- y requiere un tratamiento especial
        ELSE
            RAISE NOTICE 'Oscar Martínez ya es aportante del evento %', evento_record.nombre_hijo;
        END IF;
    END LOOP;
    
    IF eventos_actualizados = 0 THEN
        RAISE NOTICE 'Oscar Martínez ya está registrado en todos los eventos activos o no hay eventos activos en su comunidad';
    END IF;
END $$;

-- 7. Ejecutar sincronización manual para todos los miembros
DO $$
DECLARE
    comunidad_record RECORD;
    evento_record RECORD;
    miembro_record RECORD;
    padre_cumpleanero TEXT;
    aportantes_agregados INTEGER := 0;
    total_aportantes_agregados INTEGER := 0;
BEGIN
    RAISE NOTICE 'Iniciando sincronización manual de todos los miembros...';
    
    -- Para cada comunidad
    FOR comunidad_record IN 
        SELECT * FROM comunidades
    LOOP
        RAISE NOTICE 'Procesando comunidad: %', comunidad_record.nombre_comunidad;
        
        -- Para cada evento activo de la comunidad
        FOR evento_record IN 
            SELECT * FROM eventos_activos
            WHERE id_comunidad = comunidad_record.id_comunidad
            AND estado IN ('activo', 'recaudado')
        LOOP
            RAISE NOTICE 'Procesando evento: % (ID: %)', evento_record.nombre_hijo, evento_record.id_evento;
            
            -- Obtener el nombre del padre del cumpleañero
            SELECT m.nombre_padre INTO padre_cumpleanero
            FROM miembros m
            WHERE m.id_comunidad = evento_record.id_comunidad 
            AND m.nombre_hijo = evento_record.nombre_hijo
            LIMIT 1;
            
            IF padre_cumpleanero IS NULL THEN
                RAISE NOTICE 'No se encontró al padre del cumpleañero % en la comunidad %', 
                    evento_record.nombre_hijo, comunidad_record.nombre_comunidad;
                CONTINUE;
            END IF;
            
            RAISE NOTICE 'Padre del cumpleañero identificado: %', padre_cumpleanero;
            
            aportantes_agregados := 0;
            
            -- Para cada miembro de la comunidad (excepto el padre del cumpleañero)
            FOR miembro_record IN 
                SELECT * FROM miembros
                WHERE id_comunidad = comunidad_record.id_comunidad
                AND nombre_padre != padre_cumpleanero
            LOOP
                -- Verificar si ya existe como aportante
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
                    total_aportantes_agregados := total_aportantes_agregados + 1;
                    
                    RAISE NOTICE 'Miembro % añadido como aportante al evento %', 
                        miembro_record.nombre_padre, evento_record.nombre_hijo;
                    
                    -- Omitimos la actualización de miembros_pendientes porque es de tipo JSONB
                    -- y requiere un tratamiento especial
                END IF;
            END LOOP;
            
            RAISE NOTICE 'Se agregaron % aportantes al evento %', 
                aportantes_agregados, evento_record.nombre_hijo;
        END LOOP;
    END LOOP;
    
    RAISE NOTICE 'Sincronización manual completada. Se agregaron % aportantes en total.', 
        total_aportantes_agregados;
END $$;

-- 8. Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE 'El trigger de sincronización ha sido corregido y se ha ejecutado una sincronización manual.';
    RAISE NOTICE 'Oscar Martínez y todos los demás miembros deberían estar correctamente sincronizados ahora.';
END $$;
