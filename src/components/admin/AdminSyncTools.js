import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid
} from '@mui/material';
import SyncIcon from '@mui/icons-material/Sync';
import BuildIcon from '@mui/icons-material/Build';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import supabase from '../../utils/supabaseClient';

const AdminSyncTools = ({ setNotification }) => {
  const [loading, setLoading] = useState(false);
  const [syncResults, setSyncResults] = useState(null);
  const [logMessages, setLogMessages] = useState([]);

  // Función para sincronizar a Hernan Sanjurjo
  const syncHernanSanjurjo = async () => {
    setLoading(true);
    setSyncResults(null);
    setLogMessages([]);
    
    try {
      addLogMessage('info', 'Iniciando sincronización de Hernan Sanjurjo...');
      
      // Buscar a Hernan Sanjurjo en la tabla miembros
      const { data: hernanData, error: hernanError } = await supabase
        .from('miembros')
        .select('*')
        .or('nombre_padre.ilike.%Hernan Sanjurjo%,email_padre.ilike.%hernan.sanjurjo%')
        .limit(1);
      
      if (hernanError) throw hernanError;
      
      if (!hernanData || hernanData.length === 0) {
        addLogMessage('error', 'No se encontró a Hernan Sanjurjo en la tabla miembros');
        setLoading(false);
        setSyncResults({
          success: false,
          message: 'No se encontró a Hernan Sanjurjo en la tabla miembros'
        });
        return;
      }
      
      const hernan = hernanData[0];
      addLogMessage('success', `Hernan Sanjurjo encontrado: ${hernan.nombre_padre} (ID: ${hernan.id})`);
      
      // Obtener eventos activos de su comunidad
      const { data: eventosActivos, error: eventosError } = await supabase
        .from('eventos_activos')
        .select('*')
        .eq('id_comunidad', hernan.id_comunidad)
        .eq('estado', 'activo');
      
      if (eventosError) throw eventosError;
      
      if (!eventosActivos || eventosActivos.length === 0) {
        addLogMessage('warning', 'No hay eventos activos en la comunidad de Hernan Sanjurjo');
        setLoading(false);
        setSyncResults({
          success: true,
          message: 'No hay eventos activos para sincronizar'
        });
        return;
      }
      
      addLogMessage('info', `${eventosActivos.length} eventos activos encontrados en la comunidad de Hernan Sanjurjo`);
      
      let eventosActualizados = 0;
      
      // Para cada evento activo, asegurarse de que Hernan esté como aportante
      for (const evento of eventosActivos) {
        addLogMessage('info', `Verificando evento: ${evento.nombre_hijo} (ID: ${evento.id_evento})`);
        
        // Verificar si Hernan ya está como aportante en este evento
        const { data: aportanteData, error: aportanteError } = await supabase
          .from('eventos_activos_aportantes')
          .select('*')
          .eq('id_evento', evento.id_evento)
          .eq('email_padre', hernan.email_padre);
        
        if (aportanteError) {
          addLogMessage('error', `Error al verificar si Hernan es aportante: ${aportanteError.message}`);
          continue;
        }
        
        if (!aportanteData || aportanteData.length === 0) {
          // Hernan no está como aportante, lo añadimos
          const { error: insertError } = await supabase
            .from('eventos_activos_aportantes')
            .insert({
              id_evento: evento.id_evento,
              id_comunidad: hernan.id_comunidad,
              id_miembro: hernan.id,
              nombre_padre: hernan.nombre_padre,
              email_padre: hernan.email_padre,
              telefono: hernan.telefono,
              whatsapp: hernan.whatsapp_padre,
              monto_individual: 1500, // Monto por defecto
              estado_pago: 'pendiente',
              notificacion_email: false,
              fecha_creacion: new Date().toISOString()
            });
          
          if (insertError) {
            addLogMessage('error', `Error al añadir a Hernan como aportante: ${insertError.message}`);
          } else {
            eventosActualizados++;
            addLogMessage('success', `Hernan Sanjurjo añadido como aportante al evento ${evento.nombre_hijo}`);
          }
        } else {
          // Hernan ya está como aportante, actualizamos sus datos
          const aportante = aportanteData[0];
          
          if (
            aportante.nombre_padre !== hernan.nombre_padre ||
            aportante.telefono !== hernan.telefono ||
            aportante.whatsapp !== hernan.whatsapp_padre ||
            !aportante.id_miembro
          ) {
            const { error: updateError } = await supabase
              .from('eventos_activos_aportantes')
              .update({
                nombre_padre: hernan.nombre_padre,
                telefono: hernan.telefono,
                whatsapp: hernan.whatsapp_padre,
                id_miembro: hernan.id
              })
              .eq('id', aportante.id);
            
            if (updateError) {
              addLogMessage('error', `Error al actualizar datos de Hernan: ${updateError.message}`);
            } else {
              eventosActualizados++;
              addLogMessage('success', `Datos de Hernan Sanjurjo actualizados en el evento ${evento.nombre_hijo}`);
            }
          } else {
            addLogMessage('info', `Hernan Sanjurjo ya está correctamente registrado en el evento ${evento.nombre_hijo}`);
          }
        }
      }
      
      setSyncResults({
        success: true,
        message: `Sincronización de Hernan Sanjurjo completada. ${eventosActualizados} eventos actualizados.`
      });
      
      // Notificar al usuario
      setNotification({
        open: true,
        message: `Sincronización de Hernan Sanjurjo completada. ${eventosActualizados} eventos actualizados.`,
        severity: 'success'
      });
      
    } catch (error) {
      console.error('Error en sincronización de Hernan Sanjurjo:', error);
      addLogMessage('error', `Error en sincronización: ${error.message}`);
      
      setSyncResults({
        success: false,
        message: `Error en sincronización: ${error.message}`
      });
      
      // Notificar al usuario
      setNotification({
        open: true,
        message: `Error en sincronización: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para sincronizar miembros con aportantes
  const syncMiembrosAportantes = async () => {
    setLoading(true);
    setSyncResults(null);
    setLogMessages([]);
    
    try {
      addLogMessage('info', 'Iniciando sincronización de miembros con aportantes...');
      
      // 1. Obtener todas las comunidades
      addLogMessage('info', 'Obteniendo comunidades...');
      const { data: comunidades, error: comunidadesError } = await supabase
        .from('comunidades')
        .select('*');
      
      if (comunidadesError) throw comunidadesError;
      addLogMessage('success', `${comunidades.length} comunidades encontradas`);

      // 2. Obtener todos los eventos activos
      addLogMessage('info', 'Obteniendo eventos activos...');
      const { data: eventosActivos, error: eventosActivosError } = await supabase
        .from('eventos_activos')
        .select('*')
        .eq('estado', 'activo');
      
      if (eventosActivosError) throw eventosActivosError;
      addLogMessage('success', `${eventosActivos.length} eventos activos encontrados`);

      // 3. Para cada comunidad, obtener miembros y asegurarse de que estén en eventos_activos_aportantes
      addLogMessage('info', 'Sincronizando miembros con eventos activos...');
      
      let totalMiembrosAgregados = 0;
      let totalMiembrosActualizados = 0;
      
      for (const comunidad of comunidades) {
        addLogMessage('info', `Procesando comunidad: ${comunidad.nombre_comunidad} (ID: ${comunidad.id_comunidad})`);
        
        // Obtener miembros de la comunidad
        const { data: miembros, error: miembrosError } = await supabase
          .from('miembros')
          .select('*')
          .eq('id_comunidad', comunidad.id_comunidad);
        
        if (miembrosError) {
          addLogMessage('error', `Error al obtener miembros: ${miembrosError.message}`);
          continue;
        }
        
        addLogMessage('info', `${miembros.length} miembros encontrados en la comunidad`);
        
        // Obtener eventos activos de la comunidad
        const eventosActivosComunidad = eventosActivos.filter(
          evento => evento.id_comunidad === comunidad.id_comunidad
        );
        
        if (eventosActivosComunidad.length === 0) {
          addLogMessage('info', `No hay eventos activos para esta comunidad`);
          continue;
        }
        
        addLogMessage('info', `${eventosActivosComunidad.length} eventos activos en la comunidad`);
        
        // Para cada evento activo, verificar que todos los miembros estén como aportantes
        for (const evento of eventosActivosComunidad) {
          addLogMessage('info', `Procesando evento: ${evento.nombre_hijo} (ID: ${evento.id_evento})`);
          
          // Obtener aportantes actuales del evento
          const { data: aportantesActuales, error: aportantesError } = await supabase
            .from('eventos_activos_aportantes')
            .select('*')
            .eq('id_evento', evento.id_evento);
          
          if (aportantesError) {
            addLogMessage('error', `Error al obtener aportantes: ${aportantesError.message}`);
            continue;
          }
          
          // Crear un mapa de aportantes por email para búsqueda rápida
          const aportantesMap = {};
          aportantesActuales.forEach(aportante => {
            if (aportante.email_padre) {
              aportantesMap[aportante.email_padre.toLowerCase()] = aportante;
            }
          });
          
          // Verificar cada miembro y añadirlo si no existe como aportante
          let miembrosAgregados = 0;
          let miembrosActualizados = 0;
          
          for (const miembro of miembros) {
            // Si el miembro no tiene email, no podemos procesarlo correctamente
            if (!miembro.email_padre) {
              addLogMessage('warning', `Miembro ${miembro.nombre_padre} no tiene email, se intentará usar su ID como referencia`);
              
              // Buscar por ID de miembro en lugar de email
              const aportanteExistentePorId = aportantesActuales.find(a => 
                a.id_miembro === miembro.id || 
                (a.nombre_padre === miembro.nombre_padre && a.id_comunidad === miembro.id_comunidad)
              );
              
              if (!aportanteExistentePorId) {
                // El miembro no existe como aportante, lo añadimos con un email temporal basado en su ID
                const emailTemporal = `miembro_${miembro.id}@heyjack.temp`;
                
                const { error: insertError } = await supabase
                  .from('eventos_activos_aportantes')
                  .insert({
                    id_evento: evento.id_evento,
                    id_comunidad: comunidad.id_comunidad,
                    id_miembro: miembro.id, // Guardar referencia al ID del miembro
                    nombre_padre: miembro.nombre_padre,
                    email_padre: emailTemporal,
                    telefono: miembro.telefono,
                    whatsapp: miembro.whatsapp_padre,
                    monto_individual: 1500, // Monto por defecto
                    estado_pago: 'pendiente',
                    notificacion_email: false,
                    fecha_creacion: new Date().toISOString()
                  });
                
                if (insertError) {
                  addLogMessage('error', `Error al añadir miembro ${miembro.nombre_padre}: ${insertError.message}`);
                } else {
                  miembrosAgregados++;
                  totalMiembrosAgregados++;
                  addLogMessage('success', `Miembro ${miembro.nombre_padre} añadido al evento ${evento.nombre_hijo}`);
                }
              }
              
              continue;
            }
            
            const emailMiembro = miembro.email_padre.toLowerCase();
            const aportanteExistente = aportantesMap[emailMiembro];
            
            if (!aportanteExistente) {
              // El miembro no existe como aportante, lo añadimos
              const { error: insertError } = await supabase
                .from('eventos_activos_aportantes')
                .insert({
                  id_evento: evento.id_evento,
                  id_comunidad: comunidad.id_comunidad,
                  id_miembro: miembro.id, // Guardar referencia al ID del miembro
                  nombre_padre: miembro.nombre_padre,
                  email_padre: miembro.email_padre,
                  telefono: miembro.telefono,
                  whatsapp: miembro.whatsapp_padre,
                  monto_individual: 1500, // Monto por defecto
                  estado_pago: 'pendiente',
                  notificacion_email: false,
                  fecha_creacion: new Date().toISOString()
                });
              
              if (insertError) {
                addLogMessage('error', `Error al añadir miembro ${miembro.nombre_padre}: ${insertError.message}`);
              } else {
                miembrosAgregados++;
                totalMiembrosAgregados++;
                addLogMessage('success', `Miembro ${miembro.nombre_padre} añadido al evento ${evento.nombre_hijo}`);
              }
            } else if (
              aportanteExistente.nombre_padre !== miembro.nombre_padre ||
              aportanteExistente.telefono !== miembro.telefono ||
              aportanteExistente.whatsapp !== miembro.whatsapp_padre ||
              !aportanteExistente.id_miembro
            ) {
              // El miembro existe pero sus datos no coinciden o falta id_miembro, actualizamos
              const { error: updateError } = await supabase
                .from('eventos_activos_aportantes')
                .update({
                  nombre_padre: miembro.nombre_padre,
                  telefono: miembro.telefono,
                  whatsapp: miembro.whatsapp_padre,
                  id_miembro: miembro.id // Asegurarnos de que tenga la referencia al ID del miembro
                })
                .eq('id', aportanteExistente.id);
              
              if (updateError) {
                addLogMessage('error', `Error al actualizar miembro ${miembro.nombre_padre}: ${updateError.message}`);
              } else {
                miembrosActualizados++;
                totalMiembrosActualizados++;
                addLogMessage('success', `Miembro ${miembro.nombre_padre} actualizado en el evento ${evento.nombre_hijo}`);
              }
            }
          }
          
          addLogMessage('info', `${miembrosAgregados} miembros agregados y ${miembrosActualizados} actualizados para el evento`);
        }
      }
      
      // Establecer resultados finales
      setSyncResults({
        totalMiembrosAgregados,
        totalMiembrosActualizados,
        success: true
      });
      
      addLogMessage('success', `Sincronización completada: ${totalMiembrosAgregados} miembros agregados y ${totalMiembrosActualizados} actualizados en total`);
      
      // Mostrar notificación de éxito
      setNotification({
        open: true,
        message: `Sincronización completada: ${totalMiembrosAgregados} miembros agregados y ${totalMiembrosActualizados} actualizados`,
        severity: 'success'
      });
      
    } catch (error) {
      console.error('Error en la sincronización:', error);
      addLogMessage('error', `ERROR GENERAL: ${error.message}`);
      
      // Establecer resultados de error
      setSyncResults({
        error: error.message,
        success: false
      });
      
      // Mostrar notificación de error
      setNotification({
        open: true,
        message: `Error en la sincronización: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Función para crear trigger en la base de datos
  const createTrigger = async () => {
    setLoading(true);
    setSyncResults(null);
    setLogMessages([]);
    
    try {
      addLogMessage('info', 'Creando trigger para sincronización automática...');
      
      // SQL para crear la función que se ejecutará con el trigger
      const createFunctionSQL = `
        CREATE OR REPLACE FUNCTION public.sync_miembro_to_aportantes()
        RETURNS TRIGGER AS $$
        DECLARE
          evento_record RECORD;
        BEGIN
          -- Para cada evento activo en la comunidad del nuevo miembro
          FOR evento_record IN 
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
              telefono, 
              whatsapp, 
              monto_individual, 
              estado_pago, 
              notificacion_email, 
              fecha_creacion
            ) VALUES (
              evento_record.id_evento,
              NEW.id_comunidad,
              NEW.id,
              NEW.nombre_padre,
              NEW.email_padre,
              NEW.telefono,
              NEW.whatsapp_padre,
              1500, -- Monto por defecto
              'pendiente',
              false,
              NOW()
            )
            -- Si ya existe un registro con el mismo email y evento, no hacer nada
            ON CONFLICT (id_evento, email_padre) DO NOTHING;
          END LOOP;
          
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `;
      
      // SQL para crear el trigger
      const createTriggerSQL = `
        DROP TRIGGER IF EXISTS miembro_insert_trigger ON miembros;
        
        CREATE TRIGGER miembro_insert_trigger
        AFTER INSERT ON miembros
        FOR EACH ROW
        EXECUTE FUNCTION sync_miembro_to_aportantes();
      `;
      
      // Verificar que la tabla eventos_activos_aportantes tenga la restricción de unicidad necesaria
      const addConstraintSQL = `
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint 
            WHERE conname = 'eventos_activos_aportantes_id_evento_email_padre_key'
          ) THEN
            ALTER TABLE eventos_activos_aportantes 
            ADD CONSTRAINT eventos_activos_aportantes_id_evento_email_padre_key 
            UNIQUE (id_evento, email_padre);
          END IF;
        END
        $$;
      `;
      
      // Ejecutar la creación de la restricción
      addLogMessage('info', 'Verificando/creando restricción de unicidad...');
      const { error: constraintError } = await supabase.rpc('exec_sql', { sql: addConstraintSQL });
      
      if (constraintError) {
        addLogMessage('error', `Error al verificar/crear restricción: ${constraintError.message}`);
        throw constraintError;
      }
      
      addLogMessage('success', 'Restricción de unicidad verificada/creada');
      
      // Ejecutar la creación de la función
      addLogMessage('info', 'Creando función de trigger...');
      const { error: functionError } = await supabase.rpc('exec_sql', { sql: createFunctionSQL });
      
      if (functionError) {
        addLogMessage('error', `Error al crear función: ${functionError.message}`);
        throw functionError;
      }
      
      addLogMessage('success', 'Función de trigger creada correctamente');
      
      // Ejecutar la creación del trigger
      addLogMessage('info', 'Creando trigger...');
      const { error: triggerError } = await supabase.rpc('exec_sql', { sql: createTriggerSQL });
      
      if (triggerError) {
        addLogMessage('error', `Error al crear trigger: ${triggerError.message}`);
        throw triggerError;
      }
      
      addLogMessage('success', 'Trigger creado correctamente');
      
      // Establecer resultados finales
      setSyncResults({
        triggerCreated: true,
        success: true
      });
      
      addLogMessage('success', 'Trigger creado exitosamente. Ahora cuando se añada un nuevo miembro, se agregará automáticamente como aportante a todos los eventos activos de su comunidad.');
      
      // Mostrar notificación de éxito
      setNotification({
        open: true,
        message: 'Trigger creado exitosamente para sincronización automática',
        severity: 'success'
      });
      
    } catch (error) {
      console.error('Error al crear trigger:', error);
      addLogMessage('error', `ERROR GENERAL: ${error.message}`);
      
      // Establecer resultados de error
      setSyncResults({
        error: error.message,
        success: false
      });
      
      // Mostrar notificación de error
      setNotification({
        open: true,
        message: `Error al crear trigger: ${error.message}`,
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
  
  // Renderizar icono según tipo de mensaje
  const renderLogIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'warning':
        return <ErrorIcon color="warning" />;
      case 'info':
      default:
        return <InfoIcon color="info" />;
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
        Herramientas de Sincronización
      </Typography>
      <Typography variant="body1" paragraph>
        Estas herramientas te permiten sincronizar los datos entre las tablas de miembros y aportantes, 
        así como configurar la sincronización automática.
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Sincronizar a Hernan Sanjurjo
            </Typography>
            <Typography variant="body2" paragraph>
              Sincroniza específicamente a Hernan Sanjurjo como aportante en todos los eventos activos de su comunidad.
              Esto asegura que Hernan aparezca correctamente en el panel de administración.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<SyncIcon />}
              onClick={syncHernanSanjurjo}
              disabled={loading}
              fullWidth
              sx={{ mt: 1 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Sincronizar a Hernan Sanjurjo'}
            </Button>
          </Paper>
          
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Sincronización Manual
            </Typography>
            <Typography variant="body2" paragraph>
              Sincroniza todos los miembros con la tabla de aportantes para asegurar que todos los miembros
              estén correctamente registrados como aportantes en los eventos activos de sus comunidades.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<SyncIcon />}
              onClick={syncMiembrosAportantes}
              disabled={loading}
              fullWidth
              sx={{ mt: 1 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Sincronizar Miembros y Aportantes'}
            </Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Configuración de Sincronización Automática
            </Typography>
            <Typography variant="body2" paragraph>
              Crea un trigger en la base de datos que añadirá automáticamente los nuevos miembros
              como aportantes en los eventos activos de su comunidad cuando sean creados.
            </Typography>
            <Button 
              variant="contained" 
              color="secondary" 
              startIcon={<BuildIcon />}
              onClick={createTrigger}
              disabled={loading}
              fullWidth
              sx={{ mt: 1 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Crear Trigger de Sincronización'}
            </Button>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Resultados */}
      {syncResults && (
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Resultados
          </Typography>
          
          {syncResults.success ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              {syncResults.triggerCreated ? (
                'Trigger creado exitosamente. La sincronización automática está configurada.'
              ) : (
                `Sincronización completada: ${syncResults.totalMiembrosAgregados} miembros agregados y ${syncResults.totalMiembrosActualizados} actualizados.`
              )}
            </Alert>
          ) : (
            <Alert severity="error" sx={{ mb: 2 }}>
              Error: {syncResults.error}
            </Alert>
          )}
        </Paper>
      )}
      
      {/* Log de operaciones */}
      {logMessages.length > 0 && (
        <Accordion defaultExpanded={true} sx={{ mb: 3 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Log de Operaciones</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List dense>
              {logMessages.map((log, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    {renderLogIcon(log.type)}
                  </ListItemIcon>
                  <ListItemText 
                    primary={log.message} 
                    secondary={log.timestamp.toLocaleTimeString()} 
                  />
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      )}
    </Box>
  );
};

export default AdminSyncTools;
