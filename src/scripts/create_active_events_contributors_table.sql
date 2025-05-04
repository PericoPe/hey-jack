-- Script SQL para crear la tabla eventos_activos_aportantes en Supabase
-- Esta tabla almacena información detallada sobre los aportantes para cada evento activo
-- Incluye el estado de notificación y pago de cada aportante

-- Crear la tabla eventos_activos_aportantes
CREATE TABLE IF NOT EXISTS eventos_activos_aportantes (
  id SERIAL PRIMARY KEY,
  id_evento TEXT NOT NULL REFERENCES eventos_activos(id_evento) ON DELETE CASCADE,
  id_comunidad TEXT NOT NULL REFERENCES comunidades(id_comunidad),
  nombre_padre TEXT NOT NULL,
  whatsapp_padre TEXT,
  email_padre TEXT,
  monto_individual NUMERIC(10, 2) NOT NULL,
  estado_pago TEXT NOT NULL DEFAULT 'pendiente', -- pendiente, pagado, cancelado
  monto_pagado NUMERIC(10, 2) DEFAULT 0,
  metodo_pago TEXT, -- mercadopago, transferencia, efectivo
  referencia_pago TEXT, -- número de comprobante o referencia
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

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_eventos_activos_aportantes_id_evento ON eventos_activos_aportantes(id_evento);
CREATE INDEX IF NOT EXISTS idx_eventos_activos_aportantes_id_comunidad ON eventos_activos_aportantes(id_comunidad);
CREATE INDEX IF NOT EXISTS idx_eventos_activos_aportantes_nombre_padre ON eventos_activos_aportantes(nombre_padre);
CREATE INDEX IF NOT EXISTS idx_eventos_activos_aportantes_estado_pago ON eventos_activos_aportantes(estado_pago);

-- Establecer políticas de seguridad (RLS)
ALTER TABLE eventos_activos_aportantes ENABLE ROW LEVEL SECURITY;

-- Crear política para permitir acceso público a todas las operaciones
-- IMPORTANTE: En un entorno de producción, se recomienda implementar políticas más restrictivas
CREATE POLICY "Acceso público a eventos_activos_aportantes" ON eventos_activos_aportantes
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Crear trigger para actualizar fecha_actualizacion automáticamente
CREATE OR REPLACE FUNCTION update_eventos_activos_aportantes_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fecha_actualizacion = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_eventos_activos_aportantes_fecha_actualizacion
BEFORE UPDATE ON eventos_activos_aportantes
FOR EACH ROW
EXECUTE FUNCTION update_eventos_activos_aportantes_fecha_actualizacion();

-- Crear trigger para actualizar la tabla eventos_activos cuando se registra un pago
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

CREATE TRIGGER trigger_update_eventos_activos_on_payment
AFTER INSERT OR UPDATE ON eventos_activos_aportantes
FOR EACH ROW
EXECUTE FUNCTION update_eventos_activos_on_payment();

-- Comentarios para documentar la tabla
COMMENT ON TABLE eventos_activos_aportantes IS 'Tabla que almacena información detallada sobre los aportantes para cada evento activo';
COMMENT ON COLUMN eventos_activos_aportantes.id_evento IS 'Identificador del evento activo';
COMMENT ON COLUMN eventos_activos_aportantes.id_comunidad IS 'Identificador de la comunidad';
COMMENT ON COLUMN eventos_activos_aportantes.nombre_padre IS 'Nombre del padre aportante';
COMMENT ON COLUMN eventos_activos_aportantes.whatsapp_padre IS 'Número de WhatsApp del padre';
COMMENT ON COLUMN eventos_activos_aportantes.email_padre IS 'Email del padre';
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
COMMENT ON COLUMN eventos_activos_aportantes.notas IS 'Notas adicionales';
COMMENT ON COLUMN eventos_activos_aportantes.fecha_creacion IS 'Fecha de creación del registro';
COMMENT ON COLUMN eventos_activos_aportantes.fecha_actualizacion IS 'Fecha de última actualización del registro';
