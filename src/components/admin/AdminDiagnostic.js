import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Grid
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import BugReportIcon from '@mui/icons-material/BugReport';
import runDiagnostic from '../../utils/supabaseDiagnostic';
import supabase from '../../utils/supabaseClient';

const AdminDiagnostic = ({ setNotification }) => {
  const [loading, setLoading] = useState(false);
  const [diagnosticResults, setDiagnosticResults] = useState(null);
  const [logMessages, setLogMessages] = useState([]);

  // Función para ejecutar el diagnóstico
  const runDiagnosticCheck = async () => {
    setLoading(true);
    setDiagnosticResults(null);
    setLogMessages([]);
    
    try {
      addLogMessage('info', 'Iniciando diagnóstico de Supabase...');
      
      // 1. Verificar la conexión a Supabase
      addLogMessage('info', '1. Verificando conexión a Supabase...');
      const { data: connectionTest, error: connectionError } = await supabase.from('comunidades').select('count()', { count: 'exact' });
      
      if (connectionError) {
        addLogMessage('error', `Error de conexión a Supabase: ${connectionError.message}`);
        throw connectionError;
      }
      
      addLogMessage('success', 'Conexión a Supabase exitosa');
      
      // 2. Verificar tablas y datos
      const tables = ['comunidades', 'miembros', 'eventos', 'eventos_activos', 'eventos_activos_aportantes'];
      
      for (const table of tables) {
        addLogMessage('info', `2. Verificando tabla ${table}...`);
        const { data, error, count } = await supabase.from(table).select('count()', { count: 'exact' });
        
        if (error) {
          addLogMessage('error', `Error al verificar tabla ${table}: ${error.message}`);
        } else {
          addLogMessage('success', `Tabla ${table} accesible. Registros: ${count}`);
        }
      }
      
      // 3. Verificar datos específicos
      addLogMessage('info', '3. Verificando datos específicos...');
      
      // Verificar comunidades
      const { data: comunidades, error: comunidadesError } = await supabase.from('comunidades').select('*').limit(1);
      if (comunidadesError) {
        addLogMessage('error', `Error al obtener comunidades: ${comunidadesError.message}`);
      } else if (comunidades.length === 0) {
        addLogMessage('warning', 'No hay comunidades en la base de datos');
      } else {
        addLogMessage('success', `Comunidades encontradas: ${comunidades.length}`);
      }
      
      // Verificar miembros
      const { data: miembros, error: miembrosError } = await supabase.from('miembros').select('*').limit(1);
      if (miembrosError) {
        addLogMessage('error', `Error al obtener miembros: ${miembrosError.message}`);
      } else if (miembros.length === 0) {
        addLogMessage('warning', 'No hay miembros en la base de datos');
      } else {
        addLogMessage('success', `Miembros encontrados: ${miembros.length}`);
      }
      
      // Verificar Hernan Sanjurjo
      const { data: hernan, error: hernanError } = await supabase
        .from('miembros')
        .select('*')
        .or('nombre_padre.ilike.%Hernan Sanjurjo%,email_padre.ilike.%hernan.sanjurjo%')
        .limit(1);
      
      if (hernanError) {
        addLogMessage('error', `Error al buscar a Hernan Sanjurjo: ${hernanError.message}`);
      } else if (hernan.length === 0) {
        addLogMessage('warning', 'No se encontró a Hernan Sanjurjo en la base de datos');
      } else {
        addLogMessage('success', `Hernan Sanjurjo encontrado: ${hernan[0].nombre_padre}`);
      }
      
      // Verificar eventos activos
      const { data: eventosActivos, error: eventosActivosError } = await supabase
        .from('eventos_activos')
        .select('*')
        .eq('estado', 'activo')
        .limit(1);
      
      if (eventosActivosError) {
        addLogMessage('error', `Error al obtener eventos activos: ${eventosActivosError.message}`);
      } else if (eventosActivos.length === 0) {
        addLogMessage('warning', 'No hay eventos activos en la base de datos');
      } else {
        addLogMessage('success', `Eventos activos encontrados: ${eventosActivos.length}`);
      }
      
      // Verificar aportantes
      const { data: aportantes, error: aportantesError } = await supabase
        .from('eventos_activos_aportantes')
        .select('*')
        .limit(1);
      
      if (aportantesError) {
        addLogMessage('error', `Error al obtener aportantes: ${aportantesError.message}`);
      } else if (aportantes.length === 0) {
        addLogMessage('warning', 'No hay aportantes en la base de datos');
      } else {
        addLogMessage('success', `Aportantes encontrados: ${aportantes.length}`);
      }
      
      // 4. Verificar relaciones
      addLogMessage('info', '4. Verificando relaciones entre tablas...');
      
      // Intentar crear una relación temporal para diagnóstico
      addLogMessage('info', 'Verificando si podemos crear una relación entre tablas...');
      
      try {
        // Obtener un miembro y un evento activo para probar
        const { data: unMiembro } = await supabase.from('miembros').select('*').limit(1);
        const { data: unEvento } = await supabase.from('eventos_activos').select('*').limit(1);
        
        if (unMiembro?.length > 0 && unEvento?.length > 0) {
          // Intentar insertar un aportante de prueba
          const { error: insertError } = await supabase
            .from('eventos_activos_aportantes')
            .insert({
              id_evento: unEvento[0].id_evento,
              id_comunidad: unMiembro[0].id_comunidad,
              id_miembro: unMiembro[0].id,
              nombre_padre: unMiembro[0].nombre_padre,
              email_padre: unMiembro[0].email_padre,
              telefono: unMiembro[0].telefono,
              whatsapp: unMiembro[0].whatsapp_padre,
              monto_individual: 1500,
              estado_pago: 'pendiente',
              notificacion_email: false,
              fecha_creacion: new Date().toISOString()
            })
            .select();
          
          if (insertError) {
            addLogMessage('warning', `No se pudo crear un aportante de prueba: ${insertError.message}`);
          } else {
            addLogMessage('success', 'Se pudo crear un aportante de prueba correctamente');
          }
        } else {
          addLogMessage('warning', 'No hay suficientes datos para probar la creación de relaciones');
        }
      } catch (error) {
        addLogMessage('error', `Error al probar relaciones: ${error.message}`);
      }
      
      addLogMessage('success', 'Diagnóstico completado');
      
      setDiagnosticResults({
        success: true,
        message: 'Diagnóstico completado exitosamente'
      });
      
      // Notificar al usuario
      setNotification({
        open: true,
        message: 'Diagnóstico completado exitosamente',
        severity: 'success'
      });
      
    } catch (error) {
      console.error('Error en diagnóstico:', error);
      addLogMessage('error', `Error en diagnóstico: ${error.message}`);
      
      setDiagnosticResults({
        success: false,
        message: `Error en diagnóstico: ${error.message}`
      });
      
      // Notificar al usuario
      setNotification({
        open: true,
        message: `Error en diagnóstico: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para reparar la base de datos
  const repairDatabase = async () => {
    setLoading(true);
    setDiagnosticResults(null);
    
    try {
      addLogMessage('info', 'Iniciando reparación de la base de datos...');
      
      // 1. Verificar y crear columnas necesarias en eventos_activos_aportantes
      addLogMessage('info', '1. Verificando y creando columnas necesarias...');
      
      // Ejecutar el script SQL para verificar y añadir columnas
      const { error: columnError } = await supabase.rpc('exec_sql', {
        sql: `
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
        `
      });
      
      if (columnError) {
        addLogMessage('error', `Error al verificar/crear columnas: ${columnError.message}`);
      } else {
        addLogMessage('success', 'Columnas verificadas/creadas correctamente');
      }
      
      // 2. Actualizar los datos desde la tabla miembros
      addLogMessage('info', '2. Actualizando datos desde la tabla miembros...');
      
      const { error: updateError } = await supabase.rpc('exec_sql', {
        sql: `
          -- Actualizar los id_miembro basados en email_padre
          UPDATE eventos_activos_aportantes a
          SET id_miembro = m.id
          FROM miembros m
          WHERE a.email_padre = m.email_padre AND a.id_miembro IS NULL;

          -- Actualizar los datos desde la tabla miembros
          UPDATE eventos_activos_aportantes a
          SET 
            nombre_padre = m.nombre_padre,
            email_padre = m.email_padre,
            whatsapp = m.whatsapp_padre
          FROM miembros m
          WHERE a.email_padre = m.email_padre;
        `
      });
      
      if (updateError) {
        addLogMessage('error', `Error al actualizar datos: ${updateError.message}`);
      } else {
        addLogMessage('success', 'Datos actualizados correctamente');
      }
      
      // 3. Sincronizar a Hernan Sanjurjo
      addLogMessage('info', '3. Sincronizando a Hernan Sanjurjo...');
      
      const { error: hernanError } = await supabase.rpc('exec_sql', {
        sql: `
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
                    id_miembro,
                    nombre_padre, 
                    email_padre, 
                    telefono,
                    whatsapp,
                    monto_individual, 
                    estado_pago, 
                    notificacion_email, 
                    fecha_creacion
                  ) VALUES (
                    evento_record.id_evento,
                    hernan_record.id_comunidad,
                    hernan_record.id,
                    hernan_record.nombre_padre,
                    hernan_record.email_padre,
                    hernan_record.telefono,
                    hernan_record.whatsapp_padre,
                    1500, -- Monto por defecto
                    'pendiente',
                    false,
                    NOW()
                  );
                  
                  RAISE NOTICE 'Hernan Sanjurjo agregado como aportante al evento %', evento_record.nombre_hijo;
                ELSE
                  -- Actualizar datos si ya existe
                  UPDATE eventos_activos_aportantes
                  SET 
                    nombre_padre = hernan_record.nombre_padre,
                    telefono = hernan_record.telefono,
                    whatsapp = hernan_record.whatsapp_padre,
                    id_miembro = hernan_record.id
                  WHERE 
                    id_evento = evento_record.id_evento AND 
                    email_padre = hernan_record.email_padre;
                    
                  RAISE NOTICE 'Hernan Sanjurjo actualizado como aportante al evento %', evento_record.nombre_hijo;
                END IF;
              END LOOP;
            END IF;
          END
          $$;
        `
      });
      
      if (hernanError) {
        addLogMessage('error', `Error al sincronizar a Hernan Sanjurjo: ${hernanError.message}`);
      } else {
        addLogMessage('success', 'Hernan Sanjurjo sincronizado correctamente');
      }
      
      // 4. Sincronizar todos los miembros
      addLogMessage('info', '4. Sincronizando todos los miembros...');
      
      const { error: syncError } = await supabase.rpc('exec_sql', {
        sql: `
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
                    id_miembro,
                    nombre_padre, 
                    email_padre, 
                    telefono,
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
                    miembro_record.telefono,
                    miembro_record.whatsapp_padre,
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
        `
      });
      
      if (syncError) {
        addLogMessage('error', `Error al sincronizar miembros: ${syncError.message}`);
      } else {
        addLogMessage('success', 'Miembros sincronizados correctamente');
      }
      
      addLogMessage('success', 'Reparación completada');
      
      setDiagnosticResults({
        success: true,
        message: 'Reparación completada exitosamente'
      });
      
      // Notificar al usuario
      setNotification({
        open: true,
        message: 'Reparación completada exitosamente',
        severity: 'success'
      });
      
    } catch (error) {
      console.error('Error en reparación:', error);
      addLogMessage('error', `Error en reparación: ${error.message}`);
      
      setDiagnosticResults({
        success: false,
        message: `Error en reparación: ${error.message}`
      });
      
      // Notificar al usuario
      setNotification({
        open: true,
        message: `Error en reparación: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para añadir mensajes al log
  const addLogMessage = (type, message) => {
    setLogMessages(prev => [...prev, { type, message, timestamp: new Date() }]);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Diagnóstico y Reparación
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Diagnóstico de Supabase
            </Typography>
            <Typography variant="body2" paragraph>
              Ejecuta un diagnóstico completo para verificar la conexión a Supabase y los datos disponibles.
              Esto te ayudará a identificar problemas en la base de datos.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<BugReportIcon />}
              onClick={runDiagnosticCheck}
              disabled={loading}
              fullWidth
              sx={{ mt: 1 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Ejecutar Diagnóstico'}
            </Button>
          </Paper>
          
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Reparación de Base de Datos
            </Typography>
            <Typography variant="body2" paragraph>
              Ejecuta una reparación automática de la base de datos para corregir problemas comunes.
              Esto incluye sincronizar miembros con aportantes y corregir datos faltantes.
            </Typography>
            <Button 
              variant="contained" 
              color="secondary" 
              startIcon={<BugReportIcon />}
              onClick={repairDatabase}
              disabled={loading}
              fullWidth
              sx={{ mt: 1 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Reparar Base de Datos'}
            </Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Resultados
            </Typography>
            
            {diagnosticResults && (
              <Alert 
                severity={diagnosticResults.success ? "success" : "error"}
                sx={{ mb: 2 }}
              >
                {diagnosticResults.message}
              </Alert>
            )}
            
            <Typography variant="subtitle1" gutterBottom>
              Log de Operaciones
            </Typography>
            
            {logMessages.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No hay mensajes de log disponibles.
              </Typography>
            ) : (
              <List>
                {logMessages.map((log, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemIcon>
                        {log.type === 'success' && <CheckCircleIcon color="success" />}
                        {log.type === 'error' && <ErrorIcon color="error" />}
                        {log.type === 'warning' && <WarningIcon color="warning" />}
                        {log.type === 'info' && <BugReportIcon color="info" />}
                      </ListItemIcon>
                      <ListItemText 
                        primary={log.message} 
                        secondary={log.timestamp.toLocaleTimeString()}
                      />
                    </ListItem>
                    {index < logMessages.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDiagnostic;
