/**
 * Script para crear la tabla eventos_activos_aportantes usando la API de Supabase
 * Este enfoque evita problemas con scripts SQL
 */
const supabase = require('../utils/supabaseClient');

/**
 * Función principal
 */
const main = async () => {
  console.log('Iniciando creación de tabla eventos_activos_aportantes...');
  console.log('Fecha actual:', new Date().toISOString());
  
  try {
    // Paso 1: Verificar si la tabla ya existe
    console.log('Verificando si la tabla ya existe...');
    
    const { data: existingTable, error: existingTableError } = await supabase
      .from('eventos_activos_aportantes')
      .select('id')
      .limit(1);
    
    if (!existingTableError) {
      console.log('La tabla eventos_activos_aportantes ya existe');
      return;
    }
    
    // Paso 2: Crear la tabla usando la API de Supabase
    console.log('Creando la tabla eventos_activos_aportantes...');
    
    // Usar la API REST de Supabase para ejecutar SQL directamente
    const { error: createTableError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE eventos_activos_aportantes (
          id SERIAL PRIMARY KEY,
          id_evento TEXT,
          id_comunidad TEXT,
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
      `
    });
    
    if (createTableError) {
      console.error('Error al crear la tabla:', createTableError);
      return;
    }
    
    console.log('✅ Tabla eventos_activos_aportantes creada correctamente');
    
    // Paso 3: Agregar restricciones de clave foránea
    console.log('Agregando restricciones de clave foránea...');
    
    const { error: foreignKeyError1 } = await supabase.rpc('exec_sql', {
      sql_query: `
        ALTER TABLE eventos_activos_aportantes 
        ADD CONSTRAINT fk_eventos_activos_aportantes_evento 
        FOREIGN KEY (id_evento) 
        REFERENCES eventos_activos(id_evento) 
        ON DELETE CASCADE;
      `
    });
    
    if (foreignKeyError1) {
      console.error('Error al agregar restricción de clave foránea para id_evento:', foreignKeyError1);
    } else {
      console.log('✅ Restricción de clave foránea para id_evento agregada correctamente');
    }
    
    const { error: foreignKeyError2 } = await supabase.rpc('exec_sql', {
      sql_query: `
        ALTER TABLE eventos_activos_aportantes 
        ADD CONSTRAINT fk_eventos_activos_aportantes_comunidad 
        FOREIGN KEY (id_comunidad) 
        REFERENCES comunidades(id_comunidad);
      `
    });
    
    if (foreignKeyError2) {
      console.error('Error al agregar restricción de clave foránea para id_comunidad:', foreignKeyError2);
    } else {
      console.log('✅ Restricción de clave foránea para id_comunidad agregada correctamente');
    }
    
    // Paso 4: Crear índices
    console.log('Creando índices...');
    
    const indexQueries = [
      `CREATE INDEX idx_eventos_activos_aportantes_id_evento ON eventos_activos_aportantes(id_evento);`,
      `CREATE INDEX idx_eventos_activos_aportantes_id_comunidad ON eventos_activos_aportantes(id_comunidad);`,
      `CREATE INDEX idx_eventos_activos_aportantes_nombre_padre ON eventos_activos_aportantes(nombre_padre);`,
      `CREATE INDEX idx_eventos_activos_aportantes_estado_pago ON eventos_activos_aportantes(estado_pago);`
    ];
    
    for (const query of indexQueries) {
      const { error: indexError } = await supabase.rpc('exec_sql', { sql_query: query });
      
      if (indexError) {
        console.error('Error al crear índice:', indexError);
      } else {
        console.log('✅ Índice creado correctamente');
      }
    }
    
    // Paso 5: Habilitar RLS y crear política
    console.log('Habilitando RLS y creando política...');
    
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql_query: `
        ALTER TABLE eventos_activos_aportantes ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Acceso público a eventos_activos_aportantes" 
        ON eventos_activos_aportantes
        FOR ALL
        TO public
        USING (true)
        WITH CHECK (true);
      `
    });
    
    if (rlsError) {
      console.error('Error al habilitar RLS y crear política:', rlsError);
    } else {
      console.log('✅ RLS habilitado y política creada correctamente');
    }
    
    // Paso 6: Crear triggers
    console.log('Creando triggers...');
    
    const { error: triggerError1 } = await supabase.rpc('exec_sql', {
      sql_query: `
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
      `
    });
    
    if (triggerError1) {
      console.error('Error al crear trigger para fecha_actualizacion:', triggerError1);
    } else {
      console.log('✅ Trigger para fecha_actualizacion creado correctamente');
    }
    
    const { error: triggerError2 } = await supabase.rpc('exec_sql', {
      sql_query: `
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
      `
    });
    
    if (triggerError2) {
      console.error('Error al crear trigger para actualizar eventos_activos:', triggerError2);
    } else {
      console.log('✅ Trigger para actualizar eventos_activos creado correctamente');
    }
    
    console.log('\n✅ Tabla eventos_activos_aportantes creada exitosamente con todas las configuraciones');
  } catch (error) {
    console.error('Error inesperado:', error);
  }
  
  console.log('\nFinalización:', new Date().toISOString());
};

// Ejecutar la función principal
main()
  .then(() => {
    console.log('Script finalizado');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error en el script:', error);
    process.exit(1);
  });
