-- Script para corregir el conteo de miembros en las comunidades
-- Este script actualiza la columna "miembros" en la tabla "comunidades"
-- basándose en el conteo real de miembros en la tabla "miembros"

-- Primero, verificamos el estado actual de las comunidades
SELECT id, nombre_comunidad, miembros 
FROM comunidades 
WHERE nombre_comunidad IN ('San Patrick', 'INA');

-- Creamos una función temporal para actualizar el conteo de miembros para cada comunidad
CREATE OR REPLACE FUNCTION actualizar_conteo_miembros() 
RETURNS void AS $$
BEGIN
  -- Actualizamos la columna miembros en la tabla comunidades
  -- basándonos en el conteo real de la tabla miembros
  UPDATE comunidades c
  SET miembros = (
    SELECT COUNT(*) 
    FROM miembros m 
    WHERE m.id_comunidad = c.id_comunidad
  );
  
  -- Registramos la actualización para verificación
  RAISE NOTICE 'Conteo de miembros actualizado para todas las comunidades';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Ejecutamos la función para actualizar todos los conteos de miembros
SELECT actualizar_conteo_miembros();

-- Verificamos los conteos de miembros actualizados
SELECT id, nombre_comunidad, miembros 
FROM comunidades 
WHERE nombre_comunidad IN ('San Patrick', 'INA');

-- Creamos un trigger para actualizar automáticamente el conteo de miembros cuando se añaden o eliminan miembros
CREATE OR REPLACE FUNCTION actualizar_miembros_trigger() 
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Incrementamos el conteo de miembros cuando se añade un nuevo miembro
    UPDATE comunidades 
    SET miembros = miembros + 1 
    WHERE id_comunidad = NEW.id_comunidad;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrementamos el conteo de miembros cuando se elimina un miembro
    UPDATE comunidades 
    SET miembros = miembros - 1 
    WHERE id_comunidad = OLD.id_comunidad;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' AND NEW.id_comunidad <> OLD.id_comunidad THEN
    -- Manejamos el cambio de comunidad: decrementamos la comunidad antigua, incrementamos la nueva
    UPDATE comunidades 
    SET miembros = miembros - 1 
    WHERE id_comunidad = OLD.id_comunidad;
    
    UPDATE comunidades 
    SET miembros = miembros + 1 
    WHERE id_comunidad = NEW.id_comunidad;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Eliminamos el trigger si ya existe
DROP TRIGGER IF EXISTS actualizar_miembros_trigger ON miembros;

-- Creamos el trigger
CREATE TRIGGER actualizar_miembros_trigger
AFTER INSERT OR UPDATE OR DELETE ON miembros
FOR EACH ROW
EXECUTE FUNCTION actualizar_miembros_trigger();

-- Verificación final
SELECT c.id, c.nombre_comunidad, c.miembros, COUNT(m.id) as miembros_reales
FROM comunidades c
LEFT JOIN miembros m ON c.id_comunidad = m.id_comunidad
GROUP BY c.id, c.nombre_comunidad, c.miembros
ORDER BY c.nombre_comunidad;
