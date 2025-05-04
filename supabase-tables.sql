-- Crear tabla de comunidades
CREATE TABLE IF NOT EXISTS comunidades (
  id SERIAL PRIMARY KEY,
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
  monto_individual TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de miembros
CREATE TABLE IF NOT EXISTS miembros (
  id SERIAL PRIMARY KEY,
  id_comunidad TEXT NOT NULL REFERENCES comunidades(id_comunidad),
  nombre_padre TEXT NOT NULL,
  whatsapp_padre TEXT NOT NULL,
  email_padre TEXT NOT NULL,
  alias_mp TEXT NOT NULL,
  nombre_hijo TEXT NOT NULL,
  cumple_hijo DATE NOT NULL,
  perfil TEXT NOT NULL DEFAULT 'miembro',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de eventos
CREATE TABLE IF NOT EXISTS eventos (
  id SERIAL PRIMARY KEY,
  id_comunidad TEXT NOT NULL REFERENCES comunidades(id_comunidad),
  nombre_evento TEXT NOT NULL,
  fecha_evento TIMESTAMP WITH TIME ZONE NOT NULL,
  descripcion TEXT,
  estado TEXT NOT NULL DEFAULT 'pendiente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_miembros_id_comunidad ON miembros(id_comunidad);
CREATE INDEX IF NOT EXISTS idx_eventos_id_comunidad ON eventos(id_comunidad);
