-- Schema completo para Hey Jack
-- Este script crea todas las tablas necesarias para el funcionamiento del sistema

-- Crear extensión para generar UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de Comunidades
CREATE TABLE IF NOT EXISTS comunidades (
    id SERIAL PRIMARY KEY,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    id_comunidad TEXT UNIQUE NOT NULL,
    nombre_comunidad TEXT NOT NULL,
    institucion TEXT NOT NULL,
    grado TEXT NOT NULL,
    division TEXT NOT NULL,
    creador_nombre TEXT NOT NULL,
    creador_email TEXT NOT NULL,
    creador_whatsapp TEXT,
    miembros INTEGER DEFAULT 1,
    monto_individual DECIMAL(10, 2) DEFAULT 1500.00,
    activa BOOLEAN DEFAULT TRUE
);

-- Función para generar id_comunidad automáticamente
CREATE OR REPLACE FUNCTION generar_id_comunidad()
RETURNS TRIGGER AS $$
BEGIN
    NEW.id_comunidad = LOWER(REPLACE(REPLACE(NEW.institucion, ' ', ''), '.', '')) || 
                       LOWER(REPLACE(NEW.grado, ' ', '')) || 
                       LOWER(REPLACE(NEW.division, ' ', '')) || 
                       '_' || 
                       FLOOR(RANDOM() * 1000000)::TEXT;
    
    NEW.nombre_comunidad = NEW.institucion || ' - ' || NEW.grado || ' - ' || NEW.division;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para generar id_comunidad
CREATE TRIGGER trigger_generar_id_comunidad
BEFORE INSERT ON comunidades
FOR EACH ROW
EXECUTE FUNCTION generar_id_comunidad();

-- Tabla de Miembros
CREATE TABLE IF NOT EXISTS miembros (
    id SERIAL PRIMARY KEY,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    id_comunidad TEXT NOT NULL REFERENCES comunidades(id_comunidad) ON DELETE CASCADE,
    id_nombre_padre TEXT UNIQUE,
    nombre_padre TEXT NOT NULL,
    whatsapp_padre TEXT,
    email_padre TEXT NOT NULL,
    alias_mp TEXT,
    nombre_hijo TEXT NOT NULL,
    cumple_hijo DATE NOT NULL,
    edad INTEGER GENERATED ALWAYS AS (EXTRACT(YEAR FROM AGE(CURRENT_DATE, cumple_hijo))) STORED,
    perfil TEXT NOT NULL CHECK (perfil IN ('creador', 'miembro')),
    monto_individual DECIMAL(10, 2),
    activo BOOLEAN DEFAULT TRUE
);

-- Función para generar id_nombre_padre automáticamente
CREATE OR REPLACE FUNCTION generar_id_nombre_padre()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para generar id_nombre_padre
CREATE TRIGGER trigger_generar_id_nombre_padre
BEFORE INSERT ON miembros
FOR EACH ROW
EXECUTE FUNCTION generar_id_nombre_padre();

-- Trigger para actualizar contador de miembros en comunidades
CREATE OR REPLACE FUNCTION actualizar_contador_miembros()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE comunidades SET miembros = miembros + 1 WHERE id_comunidad = NEW.id_comunidad;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE comunidades SET miembros = miembros - 1 WHERE id_comunidad = OLD.id_comunidad;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para actualizar contador de miembros
CREATE TRIGGER trigger_actualizar_contador_miembros
AFTER INSERT OR DELETE ON miembros
FOR EACH ROW
EXECUTE FUNCTION actualizar_contador_miembros();

-- Tabla de Eventos
CREATE TABLE IF NOT EXISTS eventos (
    id SERIAL PRIMARY KEY,
    id_comunidad TEXT NOT NULL REFERENCES comunidades(id_comunidad) ON DELETE CASCADE,
    id_evento TEXT UNIQUE NOT NULL,
    nombre_evento TEXT NOT NULL,
    fecha_evento TIMESTAMP WITH TIME ZONE NOT NULL,
    estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'activo', 'inactivo'))
);

-- Función para generar id_evento automáticamente
CREATE OR REPLACE FUNCTION generar_id_evento()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para generar id_evento
CREATE TRIGGER trigger_generar_id_evento
BEFORE INSERT ON eventos
FOR EACH ROW
EXECUTE FUNCTION generar_id_evento();

-- Tabla de Eventos Activos
CREATE TABLE IF NOT EXISTS eventos_activos (
    id SERIAL PRIMARY KEY,
    id_evento TEXT NOT NULL REFERENCES eventos(id_evento) ON DELETE CASCADE,
    id_comunidad TEXT NOT NULL REFERENCES comunidades(id_comunidad) ON DELETE CASCADE,
    nombre_comunidad TEXT NOT NULL,
    nombre_hijo TEXT NOT NULL,
    fecha_cumple TIMESTAMP WITH TIME ZONE NOT NULL,
    objetivo_recaudacion DECIMAL(10, 2) DEFAULT 0,
    recaudado DECIMAL(10, 2) DEFAULT 0,
    estado TEXT NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'recaudado', 'finalizado')),
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    miembros_pendientes INTEGER DEFAULT 0,
    UNIQUE(id_evento)
);

-- Función para calcular objetivo de recaudación
CREATE OR REPLACE FUNCTION calcular_objetivo_recaudacion()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para calcular objetivo de recaudación
CREATE TRIGGER trigger_calcular_objetivo_recaudacion
BEFORE INSERT ON eventos_activos
FOR EACH ROW
EXECUTE FUNCTION calcular_objetivo_recaudacion();

-- Tabla de Aportantes a Eventos Activos
CREATE TABLE IF NOT EXISTS eventos_activos_aportantes (
    id SERIAL PRIMARY KEY,
    id_evento TEXT NOT NULL REFERENCES eventos_activos(id_evento) ON DELETE CASCADE,
    id_comunidad TEXT NOT NULL REFERENCES comunidades(id_comunidad) ON DELETE CASCADE,
    nombre_padre TEXT NOT NULL,
    whatsapp_padre TEXT,
    email_padre TEXT NOT NULL,
    monto_individual DECIMAL(10, 2) NOT NULL DEFAULT 1500.00,
    estado_pago TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado_pago IN ('pendiente', 'pagado')),
    monto_pagado DECIMAL(10, 2) DEFAULT 0,
    metodo_pago TEXT,
    referencia_pago TEXT,
    fecha_pago TIMESTAMP WITH TIME ZONE,
    notificacion_email BOOLEAN DEFAULT FALSE,
    fecha_notificacion_email TIMESTAMP WITH TIME ZONE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(id_evento, email_padre)
);

-- Función para actualizar recaudación cuando se registra un pago
CREATE OR REPLACE FUNCTION actualizar_recaudacion()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para actualizar recaudación
CREATE TRIGGER trigger_actualizar_recaudacion
AFTER INSERT OR UPDATE OF estado_pago, monto_pagado ON eventos_activos_aportantes
FOR EACH ROW
EXECUTE FUNCTION actualizar_recaudacion();

-- Función para activar eventos 15 días antes del cumpleaños
CREATE OR REPLACE FUNCTION activar_eventos_proximos()
RETURNS void AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Crear función para desactivar eventos pasados
CREATE OR REPLACE FUNCTION desactivar_eventos_pasados()
RETURNS void AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Crear políticas de seguridad a nivel de fila (RLS)
ALTER TABLE comunidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE miembros ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos_activos ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos_activos_aportantes ENABLE ROW LEVEL SECURITY;

-- Primero eliminar políticas existentes para evitar conflictos
DROP POLICY IF EXISTS admin_comunidades ON comunidades;
DROP POLICY IF EXISTS user_comunidades ON comunidades;
DROP POLICY IF EXISTS public_comunidades ON comunidades;

-- Política para administrador (javierhrusino@gmail.com)
CREATE POLICY admin_comunidades ON comunidades
    FOR ALL
    TO authenticated
    USING (auth.email() = 'javierhrusino@gmail.com');

-- Política para usuarios normales (solo pueden ver sus propias comunidades)
CREATE POLICY user_comunidades ON comunidades
    FOR SELECT
    TO authenticated
    USING (
        auth.email() != 'javierhrusino@gmail.com' AND
        EXISTS (
            SELECT 1 FROM miembros
            WHERE miembros.id_comunidad = comunidades.id_comunidad
            AND miembros.email_padre = auth.email()
        )
    );

-- Política para acceso público (solo lectura a comunidades activas para anónimos)
CREATE POLICY public_comunidades ON comunidades
    FOR SELECT
    TO public
    USING (activa = TRUE);

-- Políticas para el resto de tablas
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

CREATE POLICY user_miembros ON miembros
    FOR SELECT
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM miembros m
        WHERE m.id_comunidad = miembros.id_comunidad
        AND m.email_padre = auth.email()
    ));

CREATE POLICY user_eventos ON eventos
    FOR SELECT
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM miembros
        WHERE miembros.id_comunidad = eventos.id_comunidad
        AND miembros.email_padre = auth.email()
    ));

CREATE POLICY user_eventos_activos ON eventos_activos
    FOR SELECT
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM miembros
        WHERE miembros.id_comunidad = eventos_activos.id_comunidad
        AND miembros.email_padre = auth.email()
    ));

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

-- Crear función para ejecutar diariamente (activar y desactivar eventos)
CREATE OR REPLACE FUNCTION actualizar_estado_eventos()
RETURNS void AS $$
BEGIN
    PERFORM activar_eventos_proximos();
    PERFORM desactivar_eventos_pasados();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Ejemplo de uso: SELECT actualizar_estado_eventos();
-- Se puede configurar como un cron job en Supabase
