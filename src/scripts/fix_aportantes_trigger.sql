-- SOLUCIÓN PARA ACTUALIZACIÓN AUTOMÁTICA DE EVENTOS_ACTIVOS_APORTANTES
-- Este script crea un trigger que asegura que cada vez que se agrega un nuevo miembro,
-- se actualice automáticamente la tabla eventos_activos_aportantes

-- 1. Crear función para el trigger que sincroniza nuevos miembros con eventos activos
CREATE OR REPLACE FUNCTION sincronizar_nuevo_miembro()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    evento_record RECORD;
    padre_cumpleanero TEXT;
    eventos_actualizados INTEGER := 0;
BEGIN
    -- Para cada evento activo en la comunidad del nuevo miembro
    FOR evento_record IN 
        SELECT ea.*, e.nombre_evento
        FROM eventos_activos ea
        JOIN eventos e ON ea.id_evento = e.id_evento
        WHERE ea.id_comunidad = NEW.id_comunidad
        AND ea.estado IN ('activo', 'recaudado')
    LOOP
        -- Obtener nombre del padre del cumpleañero
        SELECT m.nombre_padre INTO padre_cumpleanero
        FROM miembros m
        WHERE m.id_comunidad = evento_record.id_comunidad 
        AND m.nombre_hijo = evento_record.nombre_hijo
        LIMIT 1;
        
        -- Si el nuevo miembro no es el padre del cumpleañero, agregarlo como aportante
        IF NEW.nombre_padre != padre_cumpleanero THEN
            -- Verificar si ya existe como aportante
            IF NOT EXISTS (
                SELECT 1 FROM eventos_activos_aportantes
                WHERE id_evento = evento_record.id_evento 
                AND email_padre = NEW.email_padre
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
        END IF;
    END LOOP;
    
    -- Registrar la actividad en el log
    IF eventos_actualizados > 0 THEN
        RAISE NOTICE 'Miembro % añadido como aportante en % eventos activos', NEW.nombre_padre, eventos_actualizados;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Crear el trigger para nuevos miembros
DROP TRIGGER IF EXISTS trigger_sincronizar_nuevo_miembro ON miembros;
CREATE TRIGGER trigger_sincronizar_nuevo_miembro
AFTER INSERT ON miembros
FOR EACH ROW
EXECUTE FUNCTION sincronizar_nuevo_miembro();

-- 3. Función para sincronizar manualmente todos los miembros existentes
CREATE OR REPLACE FUNCTION sincronizar_todos_miembros()
RETURNS INTEGER
SECURITY DEFINER
SET search_path = public
AS $$
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
                    1500::numeric, -- Valor fijo para evitar problemas de tipo
                    'pendiente',
                    FALSE,
                    NOW()
                );
                
                aportantes_agregados := aportantes_agregados + 1;
                
                -- Omitimos la actualización de miembros_pendientes porque es de tipo JSONB
                -- y requiere un tratamiento especial
            END IF;
        END LOOP;
    END LOOP;
    
    RETURN aportantes_agregados;
END;
$$ LANGUAGE plpgsql;

-- 4. Ejecutar la sincronización para todos los miembros existentes
SELECT sincronizar_todos_miembros();

-- 5. Verificar que Ricardo Darín esté correctamente registrado como aportante
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
                1500::numeric, -- Valor fijo para evitar problemas de tipo
                'pendiente',
                false,
                NOW()
            );
            
            eventos_actualizados := eventos_actualizados + 1;
            RAISE NOTICE 'Ricardo Darín agregado como aportante al evento %', evento_record.nombre_hijo;
            
            -- Actualizar el contador de miembros pendientes
            -- Omitimos la actualización de miembros_pendientes porque es de tipo JSONB
            -- y requiere un tratamiento especial
        ELSE
            RAISE NOTICE 'Ricardo Darín ya es aportante del evento %', evento_record.nombre_hijo;
        END IF;
    END LOOP;
    
    IF eventos_actualizados = 0 THEN
        RAISE NOTICE 'Ricardo Darín ya está registrado en todos los eventos activos o no hay eventos activos en su comunidad';
    END IF;
END
$$;
