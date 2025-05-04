-- Script SQL para crear la tabla eventos_activos en Supabase
-- Esta tabla almacena los eventos de cumpleaños que están próximos a ocurrir (15 días)
-- y para los cuales se debe recaudar dinero

-- Crear la tabla eventos_activos
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

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_eventos_activos_id_comunidad ON eventos_activos(id_comunidad);
CREATE INDEX IF NOT EXISTS idx_eventos_activos_estado ON eventos_activos(estado);
CREATE INDEX IF NOT EXISTS idx_eventos_activos_fecha_cumple ON eventos_activos(fecha_cumple);

-- Establecer políticas de seguridad (RLS)
ALTER TABLE eventos_activos ENABLE ROW LEVEL SECURITY;

-- Crear política para permitir acceso público a todas las operaciones
-- IMPORTANTE: En un entorno de producción, se recomienda implementar políticas más restrictivas
CREATE POLICY "Acceso público a eventos_activos" ON eventos_activos
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Comentarios para documentar la tabla
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
