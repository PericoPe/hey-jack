import React, { useState, useEffect } from 'react';
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
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Checkbox,
  FormControlLabel,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import VisibilityIcon from '@mui/icons-material/Visibility';
import supabase from '../../utils/supabaseClient';

const AdminNotificationTools = ({ setNotification }) => {
  const [loading, setLoading] = useState(false);
  const [communities, setCommunities] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState('');
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [contributors, setContributors] = useState([]);
  const [selectedContributors, setSelectedContributors] = useState([]);
  const [notificationType, setNotificationType] = useState('email');
  const [notificationPreview, setNotificationPreview] = useState('');
  const [logMessages, setLogMessages] = useState([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    totalContributors: 0,
    pendingPayments: 0,
    completedPayments: 0
  });

  // Cargar comunidades al iniciar
  useEffect(() => {
    loadCommunities();
    loadStats();
  }, []);

  // Cargar eventos cuando se selecciona una comunidad
  useEffect(() => {
    if (selectedCommunity) {
      loadEvents(selectedCommunity);
    } else {
      setEvents([]);
      setSelectedEvent('');
    }
  }, [selectedCommunity]);

  // Cargar aportantes cuando se selecciona un evento
  useEffect(() => {
    if (selectedEvent) {
      loadContributors(selectedEvent);
    } else {
      setContributors([]);
      setSelectedContributors([]);
    }
  }, [selectedEvent]);

  // Cargar estadísticas generales
  const loadStats = async () => {
    try {
      addLogMessage('info', 'Cargando estadísticas generales...');
      
      // Inicializar con valores por defecto en caso de error
      let statsData = {
        totalEvents: 0,
        activeEvents: 0,
        totalContributors: 0,
        pendingPayments: 0,
        completedPayments: 0
      };
      
      try {
        // Contar eventos totales
        const { data: eventosData, error: eventosError } = await supabase
          .from('eventos')
          .select('id_evento');
        
        if (!eventosError && eventosData) {
          statsData.totalEvents = eventosData.length;
        }
      } catch (e) {
        console.error('Error contando eventos:', e);
      }
      
      try {
        // Contar eventos activos
        const { data: eventosActivosData, error: eventosActivosError } = await supabase
          .from('eventos_activos')
          .select('id_evento')
          .in('estado', ['activo', 'recaudado']);
        
        if (!eventosActivosError && eventosActivosData) {
          statsData.activeEvents = eventosActivosData.length;
        }
      } catch (e) {
        console.error('Error contando eventos activos:', e);
      }
      
      try {
        // Contar aportantes totales
        const { data: aportantesData, error: aportantesError } = await supabase
          .from('eventos_activos_aportantes')
          .select('id');
        
        if (!aportantesError && aportantesData) {
          statsData.totalContributors = aportantesData.length;
        }
      } catch (e) {
        console.error('Error contando aportantes:', e);
      }
      
      try {
        // Contar pagos pendientes
        const { data: pendientesData, error: pendientesError } = await supabase
          .from('eventos_activos_aportantes')
          .select('id')
          .eq('estado_pago', 'pendiente');
        
        if (!pendientesError && pendientesData) {
          statsData.pendingPayments = pendientesData.length;
        }
      } catch (e) {
        console.error('Error contando pagos pendientes:', e);
      }
      
      try {
        // Contar pagos completados
        const { data: pagadosData, error: pagadosError } = await supabase
          .from('eventos_activos_aportantes')
          .select('id')
          .eq('estado_pago', 'pagado');
        
        if (!pagadosError && pagadosData) {
          statsData.completedPayments = pagadosData.length;
        }
      } catch (e) {
        console.error('Error contando pagos completados:', e);
      }
      
      setStats(statsData);
      addLogMessage('success', 'Estadísticas cargadas correctamente');
      
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      addLogMessage('error', `Error al cargar estadísticas: ${error.message}`);
    }
  };

  // Cargar comunidades
  const loadCommunities = async () => {
    try {
      addLogMessage('info', 'Cargando comunidades...');
      
      // Usamos RPC para ejecutar una consulta directa
      const { data, error } = await supabase.rpc('get_all_comunidades');
      
      if (error) {
        // Si falla el RPC, intentamos con consulta directa
        const { data: directData, error: directError } = await supabase
          .from('comunidades')
          .select('*')
          .order('nombre_comunidad');
        
        if (directError) throw directError;
        
        setCommunities(directData || []);
        addLogMessage('success', `${directData?.length || 0} comunidades cargadas correctamente`);
      } else {
        setCommunities(data || []);
        addLogMessage('success', `${data?.length || 0} comunidades cargadas correctamente`);
      }
    } catch (error) {
      console.error('Error al cargar comunidades:', error);
      addLogMessage('error', `Error al cargar comunidades: ${error.message}`);
    }
  };

  // Cargar eventos de una comunidad
  const loadEvents = async (communityId) => {
    try {
      addLogMessage('info', `Cargando eventos de la comunidad ID: ${communityId}...`);
      
      // Primero intentamos con la vista eventos_activos
      const { data, error } = await supabase
        .from('eventos_activos')
        .select('*')
        .eq('id_comunidad', communityId)
        .in('estado', ['activo', 'recaudado'])
        .order('fecha_evento');
      
      if (error) {
        // Si falla, intentamos con la tabla eventos directamente
        const { data: directData, error: directError } = await supabase
          .from('eventos')
          .select('*')
          .eq('id_comunidad', communityId)
          .order('fecha_evento');
        
        if (directError) throw directError;
        
        setEvents(directData || []);
        addLogMessage('success', `${directData?.length || 0} eventos cargados correctamente`);
      } else {
        setEvents(data || []);
        addLogMessage('success', `${data?.length || 0} eventos activos cargados correctamente`);
      }
    } catch (error) {
      console.error('Error al cargar eventos:', error);
      addLogMessage('error', `Error al cargar eventos: ${error.message}`);
    }
  };

  // Cargar aportantes de un evento
  const loadContributors = async (eventId) => {
    try {
      addLogMessage('info', `Cargando aportantes del evento ID: ${eventId}...`);
      
      // Primero intentamos con la tabla eventos_activos_aportantes
      const { data, error } = await supabase
        .from('eventos_activos_aportantes')
        .select('*')
        .eq('id_evento', eventId)
        .order('nombre_padre');
      
      if (error) {
        // Si falla, intentamos buscar miembros de la comunidad del evento
        const evento = events.find(e => e.id_evento === eventId);
        if (!evento) throw new Error('Evento no encontrado');
        
        const { data: miembrosData, error: miembrosError } = await supabase
          .from('miembros')
          .select('*')
          .eq('id_comunidad', evento.id_comunidad)
          .order('nombre_padre');
        
        if (miembrosError) throw miembrosError;
        
        // Convertimos los miembros a formato de aportantes
        const aportantesSimulados = miembrosData.map(miembro => ({
          id: `temp_${miembro.id}`,
          id_evento: eventId,
          id_comunidad: miembro.id_comunidad,
          nombre_padre: miembro.nombre_padre,
          email_padre: miembro.email_padre,
          whatsapp_padre: miembro.whatsapp_padre,
          monto_individual: 1500,
          estado_pago: 'pendiente',
          notificacion_email: false,
          fecha_creacion: new Date().toISOString()
        }));
        
        setContributors(aportantesSimulados || []);
        addLogMessage('warning', `No se encontraron aportantes en la tabla. Mostrando ${aportantesSimulados.length} miembros de la comunidad como posibles aportantes.`);
      } else {
        setContributors(data || []);
        addLogMessage('success', `${data?.length || 0} aportantes cargados correctamente`);
      }
    } catch (error) {
      console.error('Error al cargar aportantes:', error);
      addLogMessage('error', `Error al cargar aportantes: ${error.message}`);
    }
  };

  // Seleccionar/deseleccionar todos los aportantes
  const toggleAllContributors = () => {
    if (selectedContributors.length === contributors.length) {
      setSelectedContributors([]);
    } else {
      setSelectedContributors(contributors.map(c => c.id));
    }
  };

  // Alternar selección de un aportante
  const toggleContributor = (contributorId) => {
    if (selectedContributors.includes(contributorId)) {
      setSelectedContributors(selectedContributors.filter(id => id !== contributorId));
    } else {
      setSelectedContributors([...selectedContributors, contributorId]);
    }
  };

  // Generar vista previa de la notificación
  const generateNotificationPreview = () => {
    if (!selectedEvent || events.length === 0) {
      return 'Selecciona un evento para ver la vista previa';
    }
    
    const evento = events.find(e => e.id_evento === selectedEvent);
    if (!evento) return 'Evento no encontrado';
    
    if (notificationType === 'email') {
      return `Asunto: Recordatorio de aporte para el cumpleaños de ${evento.nombre_hijo}
      
Hola [Nombre del Padre],

Te recordamos que el cumpleaños de ${evento.nombre_hijo} se acerca (${new Date(evento.fecha_evento).toLocaleDateString()}).

Tu aporte de $1500 está pendiente. Puedes realizarlo a través de la plataforma Hey Jack o contactar directamente al organizador.

¡Gracias por ser parte de esta comunidad!

Saludos,
El equipo de Hey Jack`;
    } else {
      return `¡Hola [Nombre del Padre]! 👋

Te recordamos que el cumpleaños de ${evento.nombre_hijo} se acerca (${new Date(evento.fecha_evento).toLocaleDateString()}).

Tu aporte de $1500 está pendiente. Puedes realizarlo a través de la plataforma Hey Jack o contactar directamente al organizador.

¡Gracias por ser parte de esta comunidad! 🎉

Enviado desde: +5491130963251`;
    }
  };

  // Enviar notificaciones
  const sendNotifications = async () => {
    if (selectedContributors.length === 0) {
      addLogMessage('warning', 'No hay aportantes seleccionados para notificar');
      return;
    }
    
    setLoading(true);
    addLogMessage('info', `Iniciando envío de ${notificationType === 'email' ? 'emails' : 'mensajes de WhatsApp'} a ${selectedContributors.length} aportantes`);
    
    try {
      const evento = events.find(e => e.id_evento === selectedEvent);
      if (!evento) throw new Error('Evento no encontrado');
      
      let notificacionesEnviadas = 0;
      
      for (const contributorId of selectedContributors) {
        const contributor = contributors.find(c => c.id === contributorId || c.id === parseInt(contributorId));
        if (!contributor) continue;
        
        if (notificationType === 'email') {
          // Envío de email (simulado por ahora)
          addLogMessage('info', `Enviando email a ${contributor.nombre_padre} (${contributor.email_padre})`);
          
          // Si el ID es temporal (comienza con 'temp_'), no actualizamos la base de datos
          if (!String(contributor.id).startsWith('temp_')) {
            // Actualizar el registro en la base de datos
            const { error: updateError } = await supabase
              .from('eventos_activos_aportantes')
              .update({
                notificacion_email: true,
                fecha_notificacion: new Date().toISOString()
              })
              .eq('id', contributor.id);
            
            if (updateError) {
              addLogMessage('error', `Error al actualizar registro de notificación: ${updateError.message}`);
            } else {
              notificacionesEnviadas++;
              addLogMessage('success', `Email enviado a ${contributor.nombre_padre}`);
            }
          } else {
            notificacionesEnviadas++;
            addLogMessage('success', `Email enviado a ${contributor.nombre_padre} (simulado, no guardado en BD)`);
          }
        } else {
          // Envío de WhatsApp
          if (!contributor.whatsapp_padre) {
            addLogMessage('warning', `${contributor.nombre_padre} no tiene número de WhatsApp registrado`);
            continue;
          }
          
          // Formatear el número de WhatsApp (eliminar espacios, +, etc.)
          let whatsappNumber = contributor.whatsapp_padre.replace(/\s+/g, '').replace(/^\+/, '');
          if (!whatsappNumber.startsWith('54')) {
            whatsappNumber = '54' + whatsappNumber;
          }
          
          // Generar mensaje personalizado
          const mensaje = generateWhatsAppMessage(evento, contributor.nombre_padre);
          const mensajeEncoded = encodeURIComponent(mensaje);
          
          // Generar URL para WhatsApp
          const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${mensajeEncoded}`;
          
          // Abrir WhatsApp en una nueva ventana
          window.open(whatsappUrl, '_blank');
          
          addLogMessage('info', `Abriendo WhatsApp para ${contributor.nombre_padre} (${whatsappNumber})`);
          
          // Si el ID es temporal (comienza con 'temp_'), no actualizamos la base de datos
          if (!String(contributor.id).startsWith('temp_')) {
            // Actualizar el registro en la base de datos
            const { error: updateError } = await supabase
              .from('eventos_activos_aportantes')
              .update({
                notificacion_whatsapp: true,
                fecha_notificacion_whatsapp: new Date().toISOString()
              })
              .eq('id', contributor.id);
            
            if (updateError) {
              addLogMessage('error', `Error al actualizar registro de notificación: ${updateError.message}`);
            } else {
              notificacionesEnviadas++;
              addLogMessage('success', `WhatsApp enviado a ${contributor.nombre_padre}`);
            }
          } else {
            notificacionesEnviadas++;
            addLogMessage('success', `WhatsApp enviado a ${contributor.nombre_padre} (simulado, no guardado en BD)`);
          }
        }
        
        // Pequeña pausa entre envíos para no sobrecargar
        if (notificationType === 'whatsapp') {
          // Esperamos 3 segundos entre cada WhatsApp para dar tiempo al usuario
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
      
      // Recargar aportantes para reflejar los cambios
      loadContributors(selectedEvent);
      
      // Mostrar resumen
      addLogMessage('success', `${notificacionesEnviadas} notificaciones enviadas exitosamente`);
      
      // Mostrar notificación de éxito
      setNotification({
        open: true,
        message: `${notificacionesEnviadas} notificaciones enviadas exitosamente`,
        severity: 'success'
      });
      
    } catch (error) {
      console.error('Error al enviar notificaciones:', error);
      addLogMessage('error', `ERROR GENERAL: ${error.message}`);
      
      // Mostrar notificación de error
      setNotification({
        open: true,
        message: `Error al enviar notificaciones: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Generar mensaje de WhatsApp personalizado
  const generateWhatsAppMessage = (evento, nombrePadre) => {
    return `¡Hola ${nombrePadre}! 👋

Te recordamos que el cumpleaños de ${evento.nombre_hijo} se acerca (${new Date(evento.fecha_evento).toLocaleDateString()}).

Tu aporte de $1500 está pendiente. Puedes realizarlo a través de la plataforma Hey Jack o contactar directamente al organizador.

¡Gracias por ser parte de esta comunidad! 🎉

Enviado desde: +5491130963251`;
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
        Panel de Administración
      </Typography>
      
      {/* Estadísticas generales */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Eventos</Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                <Typography variant="h4" sx={{ mr: 1 }}>{stats.activeEvents}</Typography>
                <Typography variant="body2">activos</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">De un total de {stats.totalEvents} eventos</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Aportantes</Typography>
              <Typography variant="h4">{stats.totalContributors}</Typography>
              <Typography variant="body2" color="text.secondary">Registrados en eventos activos</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Pagos</Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                <Typography variant="h4" sx={{ mr: 1 }}>{stats.completedPayments}</Typography>
                <Typography variant="body2">completados</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">{stats.pendingPayments} pagos pendientes</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Grid container spacing={3}>
        {/* Panel de notificaciones */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Enviar Notificaciones
            </Typography>
            <Typography variant="body2" paragraph>
              Selecciona una comunidad, un evento y los aportantes a los que deseas enviar notificaciones.
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Comunidad</InputLabel>
              <Select
                value={selectedCommunity}
                onChange={(e) => setSelectedCommunity(e.target.value)}
                label="Comunidad"
                disabled={loading}
              >
                <MenuItem value="">Selecciona una comunidad</MenuItem>
                {communities.map((community) => (
                  <MenuItem key={community.id_comunidad} value={community.id_comunidad}>
                    {community.nombre_comunidad}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Evento</InputLabel>
              <Select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                label="Evento"
                disabled={loading || !selectedCommunity}
              >
                <MenuItem value="">Selecciona un evento</MenuItem>
                {events.map((event) => (
                  <MenuItem key={event.id_evento} value={event.id_evento}>
                    {event.nombre_hijo} - {new Date(event.fecha_evento).toLocaleDateString()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Tipo de Notificación</InputLabel>
              <Select
                value={notificationType}
                onChange={(e) => setNotificationType(e.target.value)}
                label="Tipo de Notificación"
                disabled={loading}
              >
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="whatsapp">WhatsApp</MenuItem>
              </Select>
            </FormControl>
            
            {selectedEvent && (
              <>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Aportantes ({contributors.length})
                  </Typography>
                  
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedContributors.length === contributors.length && contributors.length > 0}
                        indeterminate={selectedContributors.length > 0 && selectedContributors.length < contributors.length}
                        onChange={toggleAllContributors}
                        disabled={loading || contributors.length === 0}
                      />
                    }
                    label="Seleccionar todos"
                  />
                  
                  <List sx={{ maxHeight: '200px', overflow: 'auto', border: '1px solid #eee', borderRadius: '4px' }}>
                    {contributors.length === 0 ? (
                      <ListItem>
                        <ListItemText primary="No hay aportantes para este evento" />
                      </ListItem>
                    ) : (
                      contributors.map((contributor) => (
                        <ListItem key={contributor.id} dense button onClick={() => toggleContributor(contributor.id)}>
                          <Checkbox
                            edge="start"
                            checked={selectedContributors.includes(contributor.id)}
                            tabIndex={-1}
                            disableRipple
                          />
                          <ListItemText 
                            primary={contributor.nombre_padre} 
                            secondary={
                              <Box component="span" sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
                                <Typography component="span" variant="body2">
                                  {notificationType === 'email' ? contributor.email_padre : contributor.whatsapp_padre || 'Sin WhatsApp'}
                                </Typography>
                                {contributor.estado_pago === 'pagado' && (
                                  <Chip 
                                    size="small" 
                                    label="Pagado" 
                                    color="success" 
                                  />
                                )}
                                {notificationType === 'email' && contributor.notificacion_email && (
                                  <Chip 
                                    size="small" 
                                    label="Notificado" 
                                    color="info" 
                                  />
                                )}
                                {notificationType === 'whatsapp' && contributor.notificacion_whatsapp && (
                                  <Chip 
                                    size="small" 
                                    label="Notificado" 
                                    color="info" 
                                  />
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                      ))
                    )}
                  </List>
                </Box>
                
                <Accordion sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Vista previa de la notificación</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TextField
                      fullWidth
                      multiline
                      rows={8}
                      value={generateNotificationPreview()}
                      InputProps={{ readOnly: true }}
                      variant="outlined"
                    />
                  </AccordionDetails>
                </Accordion>
                
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={notificationType === 'email' ? <EmailIcon /> : <WhatsAppIcon />}
                  endIcon={<SendIcon />}
                  onClick={sendNotifications}
                  disabled={loading || selectedContributors.length === 0}
                  fullWidth
                >
                  {loading ? (
                    <>
                      <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                      Enviando...
                    </>
                  ) : (
                    `Enviar ${notificationType === 'email' ? 'Emails' : 'WhatsApps'} (${selectedContributors.length})`
                  )}
                </Button>
              </>
            )}
          </Paper>
        </Grid>
        
        {/* Panel de logs */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Registro de Actividad
            </Typography>
            
            <List sx={{ maxHeight: '500px', overflow: 'auto' }}>
              {logMessages.length === 0 ? (
                <ListItem>
                  <ListItemText primary="No hay actividad para mostrar" />
                </ListItem>
              ) : (
                logMessages.map((log, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      {renderLogIcon(log.type)}
                    </ListItemIcon>
                    <ListItemText 
                      primary={log.message} 
                      secondary={log.timestamp.toLocaleTimeString()} 
                    />
                  </ListItem>
                ))
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminNotificationTools;
