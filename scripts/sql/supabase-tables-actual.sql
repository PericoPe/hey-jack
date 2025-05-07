-- Estructura actual de la tabla comunidades
CREATE TABLE comunidades (
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

-- Estructura actual de la tabla miembros
CREATE TABLE miembros (
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
