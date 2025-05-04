-- SCRIPT DE CORRECCIÓN COMPLETA PARA HEY JACK
-- Este script corrige todos los problemas de la base de datos

-- 1. CORREGIR POLÍTICAS RLS
-- Primero desactivamos RLS para poder hacer cambios
ALTER TABLE comunidades DISABLE ROW LEVEL SECURITY;
ALTER TABLE miembros DISABLE ROW LEVEL SECURITY;
ALTER TABLE eventos DISABLE ROW LEVEL SECURITY;
ALTER TABLE eventos_activos DISABLE ROW LEVEL SECURITY;
ALTER TABLE eventos_activos_aportantes DISABLE ROW LEVEL SECURITY;

-- Eliminamos todas las políticas existentes
DROP POLICY IF EXISTS admin_comunidades ON comunidades;
DROP POLICY IF EXISTS user_comunidades ON comunidades;
DROP POLICY IF EXISTS public_comunidades ON comunidades;
DROP POLICY IF EXISTS "Acceso público total a comunidades" ON comunidades;

DROP POLICY IF EXISTS admin_miembros ON miembros;
DROP POLICY IF EXISTS user_miembros ON miembros;

DROP POLICY IF EXISTS admin_eventos ON eventos;
DROP POLICY IF EXISTS user_eventos ON eventos;

DROP POLICY IF EXISTS admin_eventos_activos ON eventos_activos;
DROP POLICY IF EXISTS user_eventos_activos ON eventos_activos;

DROP POLICY IF EXISTS admin_eventos_activos_aportantes ON eventos_activos_aportantes;
DROP POLICY IF EXISTS user_eventos_activos_aportantes ON eventos_activos_aportantes;

-- Volvemos a activar RLS
ALTER TABLE comunidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE miembros ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos_activos ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos_activos_aportantes ENABLE ROW LEVEL SECURITY;

-- Creamos políticas simples y claras
-- Política para administrador (javierhrusino@gmail.com)
CREATE POLICY admin_comunidades ON comunidades
    FOR ALL
    TO authenticated
    USING (auth.email() = 'javierhrusino@gmail.com');

CREATE POLICY admin_miembros ON miembros
    FOR ALL
    TO authenticated
    USING (auth.email() = 'javierhrusino@gmail.com');

CREATE POLICY admin_eventos ON eventos
    FOR ALL
    TO authenticated
    USING (auth.email() = 'javierhrusino@gmail.com');

CREATE POLICY admin_eventos_activos ON eventos_activos
    FOR ALL
    TO authenticated
    USING (auth.email() = 'javierhrusino@gmail.com');

CREATE POLICY admin_eventos_activos_aportantes ON eventos_activos_aportantes
    FOR ALL
    TO authenticated
    USING (auth.email() = 'javierhrusino@gmail.com');

-- Política para usuarios normales
CREATE POLICY user_comunidades ON comunidades
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM miembros
            WHERE miembros.id_comunidad = comunidades.id_comunidad
            AND miembros.email_padre = auth.email()
        )
    );

CREATE POLICY user_miembros ON miembros
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM miembros m
            WHERE m.id_comunidad = miembros.id_comunidad
            AND m.email_padre = auth.email()
        )
    );

CREATE POLICY user_eventos ON eventos
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM miembros
            WHERE miembros.id_comunidad = eventos.id_comunidad
            AND miembros.email_padre = auth.email()
        )
    );

CREATE POLICY user_eventos_activos ON eventos_activos
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM miembros
            WHERE miembros.id_comunidad = eventos_activos.id_comunidad
            AND miembros.email_padre = auth.email()
        )
    );

CREATE POLICY user_eventos_activos_aportantes ON eventos_activos_aportantes
    FOR SELECT
    TO authenticated
    USING (
        email_padre = auth.email() OR
        EXISTS (
            SELECT 1 FROM miembros
            WHERE miembros.id_comunidad = eventos_activos_aportantes.id_comunidad
            AND miembros.email_padre = auth.email()
            AND miembros.perfil = 'creador'
        )
    );

-- Política para acceso público
CREATE POLICY public_comunidades ON comunidades
    FOR SELECT
    TO public
    USING (TRUE);

-- 2. CORREGIR FUNCIONES CON SEARCH_PATH MUTABLE
-- Corregir generar_id_comunidad
DROP FUNCTION IF EXISTS generar_id_comunidad() CASCADE;
CREATE OR REPLACE FUNCTION generar_id_comunidad()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.id_comunidad = LOWER(REPLACE(REPLACE(NEW.institucion, ' ', ''), '.', '')) || 
                       LOWER(REPLACE(NEW.grado, ' ', '')) || 
                       LOWER(REPLACE(NEW.division, ' ', '')) || 
                       '_' || 
                       FLOOR(RANDOM() * 1000000)::TEXT;
    
    NEW.nombre_comunidad = NEW.institucion || ' - ' || NEW.grado || ' - ' || NEW.division;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recrear el trigger
DROP TRIGGER IF EXISTS trigger_generar_id_comunidad ON comunidades;
CREATE TRIGGER trigger_generar_id_comunidad
BEFORE INSERT ON comunidades
FOR EACH ROW
EXECUTE FUNCTION generar_id_comunidad();

-- Corregir generar_id_nombre_padre
DROP FUNCTION IF EXISTS generar_id_nombre_padre() CASCADE;
CREATE OR REPLACE FUNCTION generar_id_nombre_padre()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.id_nombre_padre = LOWER(REPLACE(NEW.nombre_padre, ' ', '_')) || '_' || 
                         COALESCE(REPLACE(NEW.whatsapp_padre, '+', ''), '') || '_' || 
                         LOWER(REPLACE(NEW.email_padre, '@', '_'));
    
    -- Heredar monto_individual de la comunidad si no se especifica
    IF NEW.monto_individual IS NULL THEN
        SELECT monto_individual INTO NEW.monto_individual FROM comunidades WHERE id_comunidad = NEW.id_comunidad;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recrear el trigger
DROP TRIGGER IF EXISTS trigger_generar_id_nombre_padre ON miembros;
CREATE TRIGGER trigger_generar_id_nombre_padre
BEFORE INSERT ON miembros
FOR EACH ROW
EXECUTE FUNCTION generar_id_nombre_padre();

-- Corregir actualizar_contador_miembros
DROP FUNCTION IF EXISTS actualizar_contador_miembros() CASCADE;
CREATE OR REPLACE FUNCTION actualizar_contador_miembros()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE comunidades SET miembros = miembros + 1 WHERE id_comunidad = NEW.id_comunidad;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE comunidades SET miembros = miembros - 1 WHERE id_comunidad = OLD.id_comunidad;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Recrear el trigger
DROP TRIGGER IF EXISTS trigger_actualizar_contador_miembros ON miembros;
CREATE TRIGGER trigger_actualizar_contador_miembros
AFTER INSERT OR DELETE ON miembros
FOR EACH ROW
EXECUTE FUNCTION actualizar_contador_miembros();

-- Corregir generar_id_evento
DROP FUNCTION IF EXISTS generar_id_evento() CASCADE;
CREATE OR REPLACE FUNCTION generar_id_evento()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    comunidad_record RECORD;
    nombre_hijo_limpio TEXT;
BEGIN
    -- Obtener información de la comunidad
    SELECT * INTO comunidad_record FROM comunidades WHERE id_comunidad = NEW.id_comunidad;
    
    -- Limpiar nombre_evento para extraer nombre_hijo
    nombre_hijo_limpio = REPLACE(REPLACE(NEW.nombre_evento, 'Cumpleaños de ', ''), ' ', '_');
    
    -- Generar id_evento
    NEW.id_evento = 'event_' || NEW.id_comunidad || '_' || nombre_hijo_limpio || '_' || FLOOR(RANDOM() * 10000000000)::TEXT;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recrear el trigger
DROP TRIGGER IF EXISTS trigger_generar_id_evento ON eventos;
CREATE TRIGGER trigger_generar_id_evento
BEFORE INSERT ON eventos
FOR EACH ROW
EXECUTE FUNCTION generar_id_evento();

-- Corregir calcular_objetivo_recaudacion
DROP FUNCTION IF EXISTS calcular_objetivo_recaudacion() CASCADE;
CREATE OR REPLACE FUNCTION calcular_objetivo_recaudacion()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    total_miembros INTEGER;
    monto_individual DECIMAL(10, 2);
    padre_cumpleanero TEXT;
BEGIN
    -- Obtener monto individual de la comunidad
    SELECT c.monto_individual INTO monto_individual
    FROM comunidades c
    WHERE c.id_comunidad = NEW.id_comunidad;
    
    -- Obtener nombre del padre del cumpleañero
    SELECT m.nombre_padre INTO padre_cumpleanero
    FROM miembros m
    WHERE m.id_comunidad = NEW.id_comunidad AND m.nombre_hijo = NEW.nombre_hijo
    LIMIT 1;
    
    -- Contar miembros activos excluyendo al padre del cumpleañero
    SELECT COUNT(*) INTO total_miembros
    FROM miembros m
    WHERE m.id_comunidad = NEW.id_comunidad AND m.activo = TRUE AND m.nombre_padre != padre_cumpleanero;
    
    -- Actualizar campos calculados
    NEW.objetivo_recaudacion = total_miembros * monto_individual;
    NEW.miembros_pendientes = total_miembros;
    NEW.nombre_comunidad = (SELECT nombre_comunidad FROM comunidades WHERE id_comunidad = NEW.id_comunidad);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recrear el trigger
DROP TRIGGER IF EXISTS trigger_calcular_objetivo_recaudacion ON eventos_activos;
CREATE TRIGGER trigger_calcular_objetivo_recaudacion
BEFORE INSERT ON eventos_activos
FOR EACH ROW
EXECUTE FUNCTION calcular_objetivo_recaudacion();

-- Corregir actualizar_recaudacion
DROP FUNCTION IF EXISTS actualizar_recaudacion() CASCADE;
CREATE OR REPLACE FUNCTION actualizar_recaudacion()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.estado_pago = 'pagado' AND (OLD IS NULL OR OLD.estado_pago = 'pendiente') THEN
        -- Actualizar monto recaudado en eventos_activos
        UPDATE eventos_activos
        SET recaudado = recaudado + NEW.monto_pagado,
            miembros_pendientes = miembros_pendientes - 1
        WHERE id_evento = NEW.id_evento;
        
        -- Verificar si se alcanzó el objetivo
        UPDATE eventos_activos
        SET estado = 'recaudado'
        WHERE id_evento = NEW.id_evento
        AND recaudado >= objetivo_recaudacion;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recrear el trigger
DROP TRIGGER IF EXISTS trigger_actualizar_recaudacion ON eventos_activos_aportantes;
CREATE TRIGGER trigger_actualizar_recaudacion
AFTER INSERT OR UPDATE OF estado_pago, monto_pagado ON eventos_activos_aportantes
FOR EACH ROW
EXECUTE FUNCTION actualizar_recaudacion();

-- Corregir activar_eventos_proximos
DROP FUNCTION IF EXISTS activar_eventos_proximos() CASCADE;
CREATE OR REPLACE FUNCTION activar_eventos_proximos()
RETURNS void 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    evento_record RECORD;
    miembro_record RECORD;
    padre_cumpleanero TEXT;
BEGIN
    -- Buscar eventos pendientes que estén a 15 días o menos
    FOR evento_record IN
        SELECT e.*
        FROM eventos e
        WHERE e.estado = 'pendiente'
        AND e.fecha_evento - INTERVAL '15 days' <= NOW()
    LOOP
        -- Cambiar estado a activo
        UPDATE eventos SET estado = 'activo' WHERE id_evento = evento_record.id_evento;
        
        -- Obtener información del cumpleañero
        SELECT m.nombre_hijo, m.nombre_padre INTO miembro_record
        FROM miembros m
        JOIN eventos e ON e.id_comunidad = m.id_comunidad
        WHERE e.id_evento = evento_record.id_evento
        AND e.nombre_evento ILIKE '%' || m.nombre_hijo || '%'
        LIMIT 1;
        
        padre_cumpleanero := miembro_record.nombre_padre;
        
        -- Crear entrada en eventos_activos si no existe
        IF NOT EXISTS (SELECT 1 FROM eventos_activos WHERE id_evento = evento_record.id_evento) THEN
            INSERT INTO eventos_activos (
                id_evento,
                id_comunidad,
                nombre_hijo,
                fecha_cumple,
                fecha_creacion
            ) VALUES (
                evento_record.id_evento,
                evento_record.id_comunidad,
                miembro_record.nombre_hijo,
                evento_record.fecha_evento,
                NOW()
            );
            
            -- Agregar todos los miembros como aportantes excepto el padre del cumpleañero
            INSERT INTO eventos_activos_aportantes (
                id_evento,
                id_comunidad,
                nombre_padre,
                whatsapp_padre,
                email_padre,
                monto_individual
            )
            SELECT 
                evento_record.id_evento,
                m.id_comunidad,
                m.nombre_padre,
                m.whatsapp_padre,
                m.email_padre,
                m.monto_individual
            FROM miembros m
            WHERE m.id_comunidad = evento_record.id_comunidad
            AND m.activo = TRUE
            AND m.nombre_padre != padre_cumpleanero;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Corregir desactivar_eventos_pasados
DROP FUNCTION IF EXISTS desactivar_eventos_pasados() CASCADE;
CREATE OR REPLACE FUNCTION desactivar_eventos_pasados()
RETURNS void 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Marcar como inactivos los eventos que ya pasaron
    UPDATE eventos
    SET estado = 'inactivo'
    WHERE fecha_evento < NOW()
    AND estado = 'activo';
    
    -- Marcar como finalizados los eventos activos que ya pasaron
    UPDATE eventos_activos
    SET estado = 'finalizado'
    WHERE fecha_cumple < NOW()
    AND estado IN ('activo', 'recaudado');
END;
$$ LANGUAGE plpgsql;

-- Corregir actualizar_estado_eventos
DROP FUNCTION IF EXISTS actualizar_estado_eventos() CASCADE;
CREATE OR REPLACE FUNCTION actualizar_estado_eventos()
RETURNS void 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    PERFORM activar_eventos_proximos();
    PERFORM desactivar_eventos_pasados();
END;
$$ LANGUAGE plpgsql;

-- 3. FUNCIÓN PARA SINCRONIZAR EVENTOS_ACTIVOS_APORTANTES
-- Esta función asegura que todos los miembros estén correctamente registrados como aportantes
CREATE OR REPLACE FUNCTION sincronizar_aportantes()
RETURNS void 
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
    
    RAISE NOTICE 'Sincronización completada. Se agregaron % aportantes.', aportantes_agregados;
END;
$$ LANGUAGE plpgsql;

-- Ejecutar la sincronización para asegurar que todos los aportantes estén correctamente registrados
SELECT sincronizar_aportantes();

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE 'Corrección completa finalizada. La base de datos ha sido actualizada correctamente.';
END $$;
