-- Script SQL completo para la base de datos de Hey Jack
-- Incluye todas las tablas: comunidades, miembros, eventos, eventos_activos y eventos_activos_aportantes

-- Crear tabla de comunidades si no existe
CREATE TABLE IF NOT EXISTS comunidades (
  id SERIAL PRIMARY KEY,
  fecha_hora TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  id_comunidad TEXT NOT NULL UNIQUE,
  nombre_comunidad TEXT NOT NULL,
  institucion TEXT NOT NULL,
  grado TEXT NOT NULL,
  division TEXT NOT NULL,
  creador_nombre TEXT NOT NULL,
  creador_email TEXT NOT NULL,
  creador_whatsapp TEXT NOT NULL,
  miembros INTEGER NOT NULL DEFAULT 1,
  estado TEXT NOT NULL DEFAULT 'activa',
  monto_individual TEXT NOT NULL
);

-- Crear tabla de miembros si no existe
CREATE TABLE IF NOT EXISTS miembros (
  id SERIAL PRIMARY KEY,
  fecha_hora TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  id_comunidad TEXT NOT NULL REFERENCES comunidades(id_comunidad),
  id_nombre_padre TEXT NOT NULL,
  nombre_padre TEXT NOT NULL,
  whatsapp_padre TEXT NOT NULL,
  email_padre TEXT NOT NULL,
  alias_mp TEXT NOT NULL,
  nombre_hijo TEXT NOT NULL,
  cumple_hijo DATE NOT NULL,
  perfil TEXT NOT NULL DEFAULT 'miembro',
  monto_individual TEXT NOT NULL
);

-- Crear tabla de eventos si no existe
CREATE TABLE IF NOT EXISTS eventos (
  id SERIAL PRIMARY KEY,
  fecha_hora TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  id_comunidad TEXT NOT NULL REFERENCES comunidades(id_comunidad),
  id_evento TEXT NOT NULL,
  nombre_evento TEXT NOT NULL,
  fecha_evento TIMESTAMP WITH TIME ZONE NOT NULL,
  descripcion TEXT,
  estado TEXT NOT NULL DEFAULT 'pendiente'
);

-- Crear la tabla eventos_activos si no existe
CREATE TABLE IF NOT EXISTS eventos_activos (
  id_evento TEXT PRIMARY KEY,
  id_comunidad TEXT NOT NULL REFERENCES comunidades(id_comunidad),
  nombre_comunidad TEXT NOT NULL,
  nombre_hijo TEXT NOT NULL,
  fecha_cumple TIMESTAMP WITH TIME ZONE NOT NULL,
  nombre_padre TEXT NOT NULL, -- Padre del cumpleañero (no aporta)
  objetivo_recaudacion NUMERIC(10, 2) NOT NULL,
  recaudado NUMERIC(10, 2) DEFAULT 0,
  estado TEXT NOT NULL DEFAULT 'activo', -- activo, completado, cancelado
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  miembros_pendientes JSONB -- Array de objetos con información de los miembros que deben aportar
);

-- Crear la tabla eventos_activos_aportantes si no existe
CREATE TABLE IF NOT EXISTS eventos_activos_aportantes (
  id SERIAL PRIMARY KEY,
  id_evento TEXT REFERENCES eventos_activos(id_evento) ON DELETE CASCADE,
  id_comunidad TEXT REFERENCES comunidades(id_comunidad),
  nombre_padre TEXT NOT NULL,
  whatsapp_padre TEXT,
  email_padre TEXT,
  monto_individual NUMERIC(10, 2) NOT NULL DEFAULT 0,
  estado_pago TEXT NOT NULL DEFAULT 'pendiente',
  monto_pagado NUMERIC(10, 2) DEFAULT 0,
  metodo_pago TEXT,
  referencia_pago TEXT,
  fecha_pago TIMESTAMP WITH TIME ZONE,
  notificacion_email BOOLEAN DEFAULT false,
  fecha_notificacion_email TIMESTAMP WITH TIME ZONE,
  notificacion_whatsapp BOOLEAN DEFAULT false,
  fecha_notificacion_whatsapp TIMESTAMP WITH TIME ZONE,
  recordatorio_enviado BOOLEAN DEFAULT false,
  fecha_recordatorio TIMESTAMP WITH TIME ZONE,
  notas TEXT,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para eventos_activos si no existen
CREATE INDEX IF NOT EXISTS idx_eventos_activos_id_comunidad ON eventos_activos(id_comunidad);
CREATE INDEX IF NOT EXISTS idx_eventos_activos_estado ON eventos_activos(estado);
CREATE INDEX IF NOT EXISTS idx_eventos_activos_fecha_cumple ON eventos_activos(fecha_cumple);

-- Crear índices para eventos_activos_aportantes si no existen
CREATE INDEX IF NOT EXISTS idx_eventos_activos_aportantes_id_evento ON eventos_activos_aportantes(id_evento);
CREATE INDEX IF NOT EXISTS idx_eventos_activos_aportantes_id_comunidad ON eventos_activos_aportantes(id_comunidad);
CREATE INDEX IF NOT EXISTS idx_eventos_activos_aportantes_nombre_padre ON eventos_activos_aportantes(nombre_padre);
CREATE INDEX IF NOT EXISTS idx_eventos_activos_aportantes_estado_pago ON eventos_activos_aportantes(estado_pago);

-- Habilitar RLS para todas las tablas
ALTER TABLE comunidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE miembros ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos_activos ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos_activos_aportantes ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes para evitar errores
DROP POLICY IF EXISTS "Acceso público a comunidades" ON comunidades;
DROP POLICY IF EXISTS "Acceso público a miembros" ON miembros;
DROP POLICY IF EXISTS "Acceso público a eventos" ON eventos;
DROP POLICY IF EXISTS "Acceso público a eventos_activos" ON eventos_activos;
DROP POLICY IF EXISTS "Acceso público a eventos_activos_aportantes" ON eventos_activos_aportantes;

-- Políticas para permitir acceso anónimo
CREATE POLICY "Acceso público a comunidades" ON comunidades FOR ALL USING (true);
CREATE POLICY "Acceso público a miembros" ON miembros FOR ALL USING (true);
CREATE POLICY "Acceso público a eventos" ON eventos FOR ALL USING (true);
CREATE POLICY "Acceso público a eventos_activos" ON eventos_activos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso público a eventos_activos_aportantes" ON eventos_activos_aportantes FOR ALL USING (true) WITH CHECK (true);

-- Comentarios para documentar la tabla eventos_activos
COMMENT ON TABLE eventos_activos IS 'Tabla que almacena los eventos de cumpleaños activos para recaudación de dinero';
COMMENT ON COLUMN eventos_activos.id_evento IS 'Identificador único del evento';
COMMENT ON COLUMN eventos_activos.id_comunidad IS 'Identificador de la comunidad a la que pertenece el evento';
COMMENT ON COLUMN eventos_activos.nombre_comunidad IS 'Nombre de la comunidad';
COMMENT ON COLUMN eventos_activos.nombre_hijo IS 'Nombre del niño/a que cumple años';
COMMENT ON COLUMN eventos_activos.fecha_cumple IS 'Fecha del cumpleaños';
COMMENT ON COLUMN eventos_activos.nombre_padre IS 'Nombre del padre/madre del cumpleañero (no aporta dinero)';
COMMENT ON COLUMN eventos_activos.objetivo_recaudacion IS 'Monto total a recaudar para el evento';
COMMENT ON COLUMN eventos_activos.recaudado IS 'Monto recaudado hasta el momento';
COMMENT ON COLUMN eventos_activos.estado IS 'Estado del evento (activo, completado, cancelado)';
COMMENT ON COLUMN eventos_activos.fecha_creacion IS 'Fecha de creación del evento';
COMMENT ON COLUMN eventos_activos.miembros_pendientes IS 'Lista de miembros que deben aportar dinero, con su estado de pago';

-- Comentarios para documentar la tabla eventos_activos_aportantes
COMMENT ON TABLE eventos_activos_aportantes IS 'Tabla que almacena los aportantes para cada evento activo de cumpleaños';
COMMENT ON COLUMN eventos_activos_aportantes.id IS 'Identificador único del aportante';
COMMENT ON COLUMN eventos_activos_aportantes.id_evento IS 'Identificador del evento al que está asociado el aportante';
COMMENT ON COLUMN eventos_activos_aportantes.id_comunidad IS 'Identificador de la comunidad a la que pertenece el aportante';
COMMENT ON COLUMN eventos_activos_aportantes.nombre_padre IS 'Nombre del padre/madre que debe aportar';
COMMENT ON COLUMN eventos_activos_aportantes.whatsapp_padre IS 'Número de WhatsApp del padre/madre';
COMMENT ON COLUMN eventos_activos_aportantes.email_padre IS 'Email del padre/madre';
COMMENT ON COLUMN eventos_activos_aportantes.monto_individual IS 'Monto que debe aportar';
COMMENT ON COLUMN eventos_activos_aportantes.estado_pago IS 'Estado del pago (pendiente, pagado, cancelado)';
COMMENT ON COLUMN eventos_activos_aportantes.monto_pagado IS 'Monto efectivamente pagado';
COMMENT ON COLUMN eventos_activos_aportantes.metodo_pago IS 'Método de pago utilizado';
COMMENT ON COLUMN eventos_activos_aportantes.referencia_pago IS 'Referencia o comprobante del pago';
COMMENT ON COLUMN eventos_activos_aportantes.fecha_pago IS 'Fecha en que se realizó el pago';
COMMENT ON COLUMN eventos_activos_aportantes.notificacion_email IS 'Indica si se envió notificación por email';
COMMENT ON COLUMN eventos_activos_aportantes.fecha_notificacion_email IS 'Fecha en que se envió la notificación por email';
COMMENT ON COLUMN eventos_activos_aportantes.notificacion_whatsapp IS 'Indica si se envió notificación por WhatsApp';
COMMENT ON COLUMN eventos_activos_aportantes.fecha_notificacion_whatsapp IS 'Fecha en que se envió la notificación por WhatsApp';
COMMENT ON COLUMN eventos_activos_aportantes.recordatorio_enviado IS 'Indica si se envió un recordatorio';
COMMENT ON COLUMN eventos_activos_aportantes.fecha_recordatorio IS 'Fecha en que se envió el recordatorio';
COMMENT ON COLUMN eventos_activos_aportantes.notas IS 'Notas adicionales sobre el aportante o el pago';
COMMENT ON COLUMN eventos_activos_aportantes.fecha_creacion IS 'Fecha de creación del registro';
COMMENT ON COLUMN eventos_activos_aportantes.fecha_actualizacion IS 'Fecha de última actualización del registro';

-- Crear trigger para actualizar fecha_actualizacion en eventos_activos_aportantes
CREATE OR REPLACE FUNCTION update_eventos_activos_aportantes_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fecha_actualizacion = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Eliminar el trigger si ya existe para evitar errores
DROP TRIGGER IF EXISTS trigger_update_eventos_activos_aportantes_fecha_actualizacion ON eventos_activos_aportantes;

-- Crear el trigger
CREATE TRIGGER trigger_update_eventos_activos_aportantes_fecha_actualizacion
BEFORE UPDATE ON eventos_activos_aportantes
FOR EACH ROW
EXECUTE FUNCTION update_eventos_activos_aportantes_fecha_actualizacion();

-- Crear trigger para actualizar eventos_activos cuando se registra un pago
CREATE OR REPLACE FUNCTION update_eventos_activos_on_payment()
RETURNS TRIGGER AS $$
DECLARE
  evento_record RECORD;
  nuevo_recaudado NUMERIC(10, 2);
  miembros_pendientes JSONB;
BEGIN
  -- Solo ejecutar si se actualiza el estado_pago a 'pagado'
  IF NEW.estado_pago = 'pagado' AND (OLD.estado_pago IS NULL OR OLD.estado_pago != 'pagado') THEN
    -- Obtener el evento activo
    SELECT * INTO evento_record FROM eventos_activos WHERE id_evento = NEW.id_evento;
    
    IF FOUND THEN
      -- Calcular el nuevo monto recaudado
      nuevo_recaudado := evento_record.recaudado + NEW.monto_pagado;
      
      -- Actualizar el miembro en miembros_pendientes
      miembros_pendientes := evento_record.miembros_pendientes;
      
      -- Buscar y actualizar el miembro en el array
      FOR i IN 0..jsonb_array_length(miembros_pendientes) - 1 LOOP
        IF miembros_pendientes->i->>'nombre_padre' = NEW.nombre_padre THEN
          miembros_pendientes := jsonb_set(
            miembros_pendientes,
            ARRAY[i::text],
            jsonb_build_object(
              'nombre_padre', NEW.nombre_padre,
              'whatsapp_padre', NEW.whatsapp_padre,
              'monto_individual', NEW.monto_individual,
              'estado_pago', 'pagado',
              'monto_pagado', NEW.monto_pagado,
              'metodo_pago', NEW.metodo_pago,
              'referencia_pago', NEW.referencia_pago,
              'fecha_pago', NEW.fecha_pago
            )
          );
          EXIT;
        END IF;
      END LOOP;
      
      -- Actualizar el evento activo
      UPDATE eventos_activos
      SET 
        recaudado = nuevo_recaudado,
        miembros_pendientes = miembros_pendientes
      WHERE id_evento = NEW.id_evento;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Eliminar el trigger si ya existe para evitar errores
DROP TRIGGER IF EXISTS trigger_update_eventos_activos_on_payment ON eventos_activos_aportantes;

-- Crear el trigger
CREATE TRIGGER trigger_update_eventos_activos_on_payment
AFTER INSERT OR UPDATE ON eventos_activos_aportantes
FOR EACH ROW
EXECUTE FUNCTION update_eventos_activos_on_payment();
