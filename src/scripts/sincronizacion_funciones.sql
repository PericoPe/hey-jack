-- FUNCIONES DE SINCRONIZACIÓN PARA EL PANEL DE ADMINISTRACIÓN
-- Este script crea las funciones necesarias para las herramientas de sincronización

-- 1. Función para sincronizar a Hernan Sanjurjo específicamente
CREATE OR REPLACE FUNCTION sincronizar_hernan_sanjurjo()
RETURNS INTEGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    hernan_record RECORD;
    evento_record RECORD;
    aportantes_agregados INTEGER := 0;
BEGIN
    -- Buscar a Hernan Sanjurjo en la tabla miembros
    SELECT * INTO hernan_record FROM miembros
    WHERE nombre_padre ILIKE '%Hernan Sanjurjo%' OR email_padre ILIKE '%hernan.sanjurjo%'
    LIMIT 1;
    
    IF hernan_record IS NULL THEN
        RAISE EXCEPTION 'No se encontró a Hernan Sanjurjo en la tabla miembros';
    END IF;
    
    -- Buscar eventos activos de su comunidad
    FOR evento_record IN 
        SELECT * FROM eventos_activos 
        WHERE id_comunidad = hernan_record.id_comunidad AND estado = 'activo'
    LOOP
        -- Verificar si ya existe como aportante
        IF NOT EXISTS (
            SELECT 1 FROM eventos_activos_aportantes
            WHERE id_evento = evento_record.id_evento AND email_padre = hernan_record.email_padre
        ) THEN
            -- Insertar a Hernan como aportante
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
                hernan_record.id_comunidad,
                hernan_record.nombre_padre,
                hernan_record.whatsapp_padre,
                hernan_record.email_padre,
                hernan_record.monto_individual, 
                'pendiente',
                false,
                NOW()
            );
            
            aportantes_agregados := aportantes_agregados + 1;
        END IF;
    END LOOP;
    
    RETURN aportantes_agregados;
END;
$$ LANGUAGE plpgsql;

-- 2. Función para sincronización manual de todos los miembros
CREATE OR REPLACE FUNCTION sincronizacion_manual()
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
                    miembro_record.monto_individual,
                    'pendiente',
                    FALSE,
                    NOW()
                );
                
                aportantes_agregados := aportantes_agregados + 1;
            END IF;
        END LOOP;
    END LOOP;
    
    RETURN aportantes_agregados;
END;
$$ LANGUAGE plpgsql;

-- 3. Función para crear trigger de sincronización automática
CREATE OR REPLACE FUNCTION crear_trigger_sincronizacion()
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Crear función que se ejecutará con el trigger
    CREATE OR REPLACE FUNCTION sincronizar_nuevo_miembro()
    RETURNS TRIGGER
    SECURITY DEFINER
    SET search_path = public
    AS $FUNC$
    DECLARE
        evento_record RECORD;
        padre_cumpleanero TEXT;
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
                        NEW.monto_individual,
                        'pendiente',
                        FALSE,
                        NOW()
                    );
                END IF;
            END IF;
        END LOOP;
        
        RETURN NEW;
    END;
    $FUNC$ LANGUAGE plpgsql;

    -- Eliminar el trigger si ya existe
    DROP TRIGGER IF EXISTS trigger_sincronizar_nuevo_miembro ON miembros;
    
    -- Crear el trigger
    CREATE TRIGGER trigger_sincronizar_nuevo_miembro
    AFTER INSERT ON miembros
    FOR EACH ROW
    EXECUTE FUNCTION sincronizar_nuevo_miembro();
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
