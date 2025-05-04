-- Script simple para sincronizar miembros con eventos_activos_aportantes
-- Este script solo realiza las operaciones básicas necesarias

-- 1. Verificar si Hernan Sanjurjo existe en la tabla miembros
DO $$
DECLARE
  hernan_record RECORD;
  evento_record RECORD;
BEGIN
  -- Buscar a Hernan Sanjurjo
  SELECT * INTO hernan_record FROM miembros
  WHERE nombre_padre ILIKE '%Hernan Sanjurjo%' OR email_padre ILIKE '%hernan.sanjurjo%'
  LIMIT 1;
  
  IF hernan_record IS NULL THEN
    RAISE NOTICE 'No se encontró a Hernan Sanjurjo en la tabla miembros';
  ELSE
    RAISE NOTICE 'Hernan Sanjurjo encontrado: ID=%, Email=%', hernan_record.id, hernan_record.email_padre;
    
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
          email_padre, 
          monto_individual, 
          estado_pago, 
          notificacion_email, 
          fecha_creacion
        ) VALUES (
          evento_record.id_evento,
          hernan_record.id_comunidad,
          hernan_record.nombre_padre,
          hernan_record.email_padre,
          1500, -- Monto por defecto
          'pendiente',
          false,
          NOW()
        );
        
        RAISE NOTICE 'Hernan Sanjurjo agregado como aportante al evento %', evento_record.nombre_hijo;
      ELSE
        RAISE NOTICE 'Hernan Sanjurjo ya es aportante del evento %', evento_record.nombre_hijo;
      END IF;
    END LOOP;
  END IF;
END
$$;

-- 2. Sincronizar todos los miembros con eventos activos
DO $$
DECLARE
  miembro_record RECORD;
  evento_record RECORD;
  aportantes_agregados INTEGER := 0;
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
      -- Verificar si ya existe como aportante
      IF NOT EXISTS (
        SELECT 1 FROM eventos_activos_aportantes
        WHERE id_evento = evento_record.id_evento AND email_padre = miembro_record.email_padre
      ) THEN
        -- Insertar el miembro como aportante
        INSERT INTO eventos_activos_aportantes (
          id_evento, 
          id_comunidad,
          nombre_padre, 
          email_padre, 
          monto_individual, 
          estado_pago, 
          notificacion_email, 
          fecha_creacion
        ) VALUES (
          evento_record.id_evento,
          miembro_record.id_comunidad,
          miembro_record.nombre_padre,
          miembro_record.email_padre,
          1500, -- Monto por defecto
          'pendiente',
          false,
          NOW()
        );
        
        aportantes_agregados := aportantes_agregados + 1;
      END IF;
    END LOOP;
  END LOOP;
  
  RAISE NOTICE 'Se agregaron % miembros como aportantes', aportantes_agregados;
END
$$;

-- 3. Actualizar los datos de WhatsApp en eventos_activos_aportantes
DO $$
DECLARE
  miembro_record RECORD;
  aportantes_actualizados INTEGER := 0;
BEGIN
  -- Para cada miembro con whatsapp_padre
  FOR miembro_record IN 
    SELECT * FROM miembros
    WHERE whatsapp_padre IS NOT NULL
  LOOP
    -- Verificar si existe la columna whatsapp en eventos_activos_aportantes
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'eventos_activos_aportantes' AND column_name = 'whatsapp'
    ) THEN
      -- Actualizar whatsapp para todos los aportantes con este email_padre
      UPDATE eventos_activos_aportantes
      SET whatsapp = miembro_record.whatsapp_padre
      WHERE email_padre = miembro_record.email_padre;
      
      GET DIAGNOSTICS aportantes_actualizados = ROW_COUNT;
      
      IF aportantes_actualizados > 0 THEN
        RAISE NOTICE 'Se actualizó el WhatsApp de % aportantes para %', aportantes_actualizados, miembro_record.nombre_padre;
      END IF;
    END IF;
  END LOOP;
END
$$;
