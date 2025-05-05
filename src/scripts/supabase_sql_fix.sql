-- Script para corregir la estructura de la tabla eventos_activos_aportantes
-- y configurar la sincronización automática con la tabla miembros
-- Ejecutar este script en el SQL Editor de Supabase

-- 1. Verificar y añadir las columnas necesarias a la tabla eventos_activos_aportantes
DO $$
BEGIN
  -- Añadir columna telefono si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'eventos_activos_aportantes' AND column_name = 'telefono'
  ) THEN
    ALTER TABLE eventos_activos_aportantes ADD COLUMN telefono TEXT;
  END IF;

  -- Añadir columna id_miembro si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'eventos_activos_aportantes' AND column_name = 'id_miembro'
  ) THEN
    ALTER TABLE eventos_activos_aportantes ADD COLUMN id_miembro INTEGER;
  END IF;
  
  -- Añadir columna whatsapp si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'eventos_activos_aportantes' AND column_name = 'whatsapp'
  ) THEN
    ALTER TABLE eventos_activos_aportantes ADD COLUMN whatsapp TEXT;
  END IF;
END
$$;

-- 2. Actualizar los id_miembro basados en email_padre
UPDATE eventos_activos_aportantes a
SET id_miembro = m.id
FROM miembros m
WHERE a.email_padre = m.email_padre AND a.id_miembro IS NULL;

-- 3. Actualizar los datos desde la tabla miembros
UPDATE eventos_activos_aportantes a
SET 
  nombre_padre = m.nombre_padre,
  email_padre = m.email_padre,
  whatsapp = m.whatsapp_padre
FROM miembros m
WHERE a.email_padre = m.email_padre;

-- 4. Crear función para sincronizar nuevos miembros como aportantes
CREATE OR REPLACE FUNCTION sync_miembro_to_aportantes()
RETURNS TRIGGER AS $$
DECLARE
  evento RECORD;
BEGIN
  -- Para cada evento activo en la comunidad del nuevo miembro
  FOR evento IN 
    SELECT * FROM eventos_activos 
    WHERE id_comunidad = NEW.id_comunidad AND estado = 'activo'
  LOOP
    -- Insertar el nuevo miembro como aportante en cada evento activo
    INSERT INTO eventos_activos_aportantes (
      id_evento, 
      id_comunidad,
      id_miembro,
      nombre_padre, 
      email_padre, 
      whatsapp,
      monto_individual, 
      estado_pago, 
      notificacion_email, 
      fecha_creacion
    ) VALUES (
      evento.id_evento,
      NEW.id_comunidad,
      NEW.id,
      NEW.nombre_padre,
      NEW.email_padre,
      NEW.whatsapp_padre,
      1500, -- Monto por defecto
      'pendiente',
      false,
      NOW()
    )
    -- Si ya existe un registro con el mismo email y evento, no hacer nada
    ON CONFLICT (id_evento, email_padre) 
    DO NOTHING;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Crear trigger para nuevos miembros
DROP TRIGGER IF EXISTS miembro_insert_trigger ON miembros;

CREATE TRIGGER miembro_insert_trigger
AFTER INSERT ON miembros
FOR EACH ROW
EXECUTE FUNCTION sync_miembro_to_aportantes();

-- 6. Crear función para actualizar datos de aportantes cuando se actualiza un miembro
CREATE OR REPLACE FUNCTION update_aportantes_from_miembro()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar todos los aportantes asociados a este miembro
  UPDATE eventos_activos_aportantes
  SET 
    nombre_padre = NEW.nombre_padre,
    email_padre = NEW.email_padre,
    whatsapp = NEW.whatsapp_padre
  WHERE 
    email_padre = NEW.email_padre OR id_miembro = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Crear trigger para actualización de miembros
DROP TRIGGER IF EXISTS miembro_update_trigger ON miembros;

CREATE TRIGGER miembro_update_trigger
AFTER UPDATE ON miembros
FOR EACH ROW
EXECUTE FUNCTION update_aportantes_from_miembro();

-- 8. Insertar a Hernan Sanjurjo como aportante en los eventos activos de su comunidad
DO $$
DECLARE
  hernan_id INTEGER;
  hernan_comunidad TEXT;
  evento_record RECORD;
BEGIN
  -- Obtener ID y comunidad de Hernan
  SELECT id, id_comunidad INTO hernan_id, hernan_comunidad
  FROM miembros
  WHERE nombre_padre ILIKE '%Hernan Sanjurjo%' OR email_padre ILIKE '%hernan.sanjurjo%'
  LIMIT 1;
  
  IF hernan_id IS NOT NULL THEN
    -- Para cada evento activo en la comunidad de Hernan
    FOR evento_record IN 
      SELECT * FROM eventos_activos 
      WHERE id_comunidad = hernan_comunidad AND estado = 'activo'
    LOOP
      -- Insertar a Hernan como aportante
      INSERT INTO eventos_activos_aportantes (
        id_evento, 
        id_comunidad,
        id_miembro,
        nombre_padre, 
        email_padre, 
        whatsapp,
        monto_individual, 
        estado_pago, 
        notificacion_email, 
        fecha_creacion
      )
      SELECT 
        evento_record.id_evento,
        m.id_comunidad,
        m.id,
        m.nombre_padre,
        m.email_padre,
        m.whatsapp_padre,
        1500, -- Monto por defecto
        'pendiente',
        false,
        NOW()
      FROM miembros m
      WHERE m.id = hernan_id
      -- Si ya existe un registro con el mismo email y evento, no hacer nada
      ON CONFLICT (id_evento, email_padre) 
      DO NOTHING;
    END LOOP;
  END IF;
END
$$;

-- 9. Sincronizar todos los miembros con eventos activos
DO $$
DECLARE
  miembro_record RECORD;
  evento_record RECORD;
BEGIN
  -- Para cada miembro
  FOR miembro_record IN 
    SELECT * FROM miembros
  LOOP
    -- Para cada evento activo en la comunidad del miembro
    FOR evento_record IN 
      SELECT * FROM eventos_activos 
      WHERE id_comunidad = miembro_record.id_comunidad AND estado = 'activo'
    LOOP
      -- Insertar el miembro como aportante
      INSERT INTO eventos_activos_aportantes (
        id_evento, 
        id_comunidad,
        id_miembro,
        nombre_padre, 
        email_padre, 
        whatsapp,
        monto_individual, 
        estado_pago, 
        notificacion_email, 
        fecha_creacion
      ) VALUES (
        evento_record.id_evento,
        miembro_record.id_comunidad,
        miembro_record.id,
        miembro_record.nombre_padre,
        miembro_record.email_padre,
        miembro_record.whatsapp_padre,
        1500, -- Monto por defecto
        'pendiente',
        false,
        NOW()
      )
      -- Si ya existe un registro con el mismo email y evento, no hacer nada
      ON CONFLICT (id_evento, email_padre) 
      DO NOTHING;
    END LOOP;
  END LOOP;
END
$$;
