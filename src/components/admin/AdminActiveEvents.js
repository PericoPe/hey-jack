import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  TextField
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SendIcon from '@mui/icons-material/Send';
import supabase from '../../utils/supabaseClient';

const AdminActiveEvents = ({ setNotification }) => {
  const [activeEvents, setActiveEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [contributors, setContributors] = useState({});
  const [loadingContributors, setLoadingContributors] = useState({});
  const [openSendDialog, setOpenSendDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Cargar eventos activos al montar el componente
  useEffect(() => {
    fetchActiveEvents();
  }, []);

  // Obtener eventos activos de Supabase
  const fetchActiveEvents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('eventos_activos')
        .select('*')
        .eq('estado', 'activo')
        .order('fecha_creacion', { ascending: false });
      
      if (error) throw error;
      
      setActiveEvents(data || []);
    } catch (error) {
      console.error('Error al obtener eventos activos:', error);
      setError('No se pudieron cargar los eventos activos. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Obtener aportantes de un evento con información completa de miembros
  const fetchContributors = async (eventId) => {
    setLoadingContributors(prev => ({ ...prev, [eventId]: true }));
    
    try {
      // Primero obtenemos los aportantes básicos
      const { data: aportantesBasicos, error: errorAportantes } = await supabase
        .from('eventos_activos_aportantes')
        .select('*')
        .eq('id_evento', eventId)
        .order('fecha_creacion', { ascending: false });
      
      if (errorAportantes) throw errorAportantes;
      
      // Si no hay aportantes, terminamos
      if (!aportantesBasicos || aportantesBasicos.length === 0) {
        setContributors(prev => ({ ...prev, [eventId]: [] }));
        return;
      }
      
      // Para cada aportante, verificamos si necesitamos actualizar su información desde miembros
      const aportantesActualizados = [];
      
      for (const aportante of aportantesBasicos) {
        // Si el aportante tiene email, buscamos su información completa en miembros
        if (aportante.email_padre) {
          const { data: miembroData, error: miembroError } = await supabase
            .from('miembros')
            .select('*')
            .eq('email_padre', aportante.email_padre)
            .maybeSingle();
          
          if (!miembroError && miembroData) {
            // Actualizamos la información del aportante con los datos del miembro
            aportantesActualizados.push({
              ...aportante,
              nombre_padre: miembroData.nombre_padre || aportante.nombre_padre,
              telefono: miembroData.telefono || aportante.telefono,
              whatsapp: miembroData.whatsapp || aportante.whatsapp
            });
            
            // También actualizamos el registro en la base de datos si es necesario
            if (aportante.nombre_padre !== miembroData.nombre_padre || 
                aportante.telefono !== miembroData.telefono || 
                aportante.whatsapp !== miembroData.whatsapp) {
              
              await supabase
                .from('eventos_activos_aportantes')
                .update({
                  nombre_padre: miembroData.nombre_padre,
                  telefono: miembroData.telefono,
                  whatsapp: miembroData.whatsapp
                })
                .eq('id', aportante.id);
            }
          } else {
            // Si no encontramos el miembro, usamos los datos originales
            aportantesActualizados.push(aportante);
          }
        } else {
          // Si no tiene email, usamos los datos originales
          aportantesActualizados.push(aportante);
        }
      }
      
      setContributors(prev => ({ ...prev, [eventId]: aportantesActualizados }));
    } catch (error) {
      console.error(`Error al obtener aportantes del evento ${eventId}:`, error);
      setNotification({
        open: true,
        message: `Error al obtener aportantes: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setLoadingContributors(prev => ({ ...prev, [eventId]: false }));
    }
  };

  // Manejar cambio de página
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Manejar cambio de filas por página
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Manejar expansión de evento para ver aportantes
  const handleExpandEvent = (eventId) => {
    if (expandedEvent === eventId) {
      setExpandedEvent(null);
    } else {
      setExpandedEvent(eventId);
      if (!contributors[eventId]) {
        fetchContributors(eventId);
      }
    }
  };

  // Abrir diálogo para enviar notificaciones
  const handleOpenSendDialog = (event) => {
    setSelectedEvent(event);
    setOpenSendDialog(true);
    if (!contributors[event.id_evento]) {
      fetchContributors(event.id_evento);
    }
  };

  // Cerrar diálogo
  const handleCloseSendDialog = () => {
    setOpenSendDialog(false);
  };

  // Enviar notificaciones por email
  const handleSendNotifications = async () => {
    try {
      setLoading(true);
      
      // Aquí iría la lógica para enviar emails a los aportantes
      // Esto podría ser una llamada a una función en Supabase o un endpoint
      
      // Simulamos el envío de emails
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setNotification({
        open: true,
        message: `Notificaciones enviadas correctamente a los aportantes de ${selectedEvent.nombre_hijo}`,
        severity: 'success'
      });
      
      // Cerrar diálogo
      handleCloseSendDialog();
    } catch (error) {
      console.error('Error al enviar notificaciones:', error);
      setNotification({
        open: true,
        message: `Error al enviar notificaciones: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Formatear monto
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  // Si está cargando, mostrar indicador
  if (loading && activeEvents.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold' }}>
          Eventos Activos
        </Typography>
        
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />}
          onClick={fetchActiveEvents}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Actualizar'}
        </Button>
      </Box>
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={fetchActiveEvents}>
              Reintentar
            </Button>
          }
        >
          {error}
        </Alert>
      )}
      
      {/* Tabla de eventos activos */}
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table sx={{ minWidth: 650 }} aria-label="tabla de eventos activos">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell><Typography fontWeight="bold">Nombre</Typography></TableCell>
              <TableCell><Typography fontWeight="bold">Comunidad</Typography></TableCell>
              <TableCell><Typography fontWeight="bold">Fecha Cumpleaños</Typography></TableCell>
              <TableCell><Typography fontWeight="bold">Monto Recaudado</Typography></TableCell>
              <TableCell><Typography fontWeight="bold">Aportantes</Typography></TableCell>
              <TableCell align="center"><Typography fontWeight="bold">Acciones</Typography></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {activeEvents.length > 0 ? (
              activeEvents
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((event) => (
                  <React.Fragment key={event.id_evento}>
                    <TableRow hover>
                      <TableCell>{event.nombre_hijo}</TableCell>
                      <TableCell>{event.nombre_comunidad}</TableCell>
                      <TableCell>{formatDate(event.fecha_cumple)}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <MonetizationOnIcon sx={{ mr: 1, color: '#4caf50' }} />
                          <Typography>{formatAmount(event.monto_total_recaudado || 0)}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleExpandEvent(event.id_evento)}
                          endIcon={<ExpandMoreIcon />}
                        >
                          Ver Aportantes
                        </Button>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Enviar Notificaciones">
                          <IconButton 
                            color="primary" 
                            onClick={() => handleOpenSendDialog(event)}
                            size="small"
                          >
                            <SendIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton 
                            color="secondary" 
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                    
                    {/* Detalles de aportantes */}
                    {expandedEvent === event.id_evento && (
                      <TableRow>
                        <TableCell colSpan={6} sx={{ p: 0, borderBottom: 'none' }}>
                          <Box sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
                            <Typography variant="h6" gutterBottom>
                              Aportantes para el evento de {event.nombre_hijo}
                            </Typography>
                            
                            {loadingContributors[event.id_evento] ? (
                              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                                <CircularProgress size={30} />
                              </Box>
                            ) : contributors[event.id_evento]?.length > 0 ? (
                              <TableContainer component={Paper} variant="outlined">
                                <Table size="small">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>Nombre</TableCell>
                                      <TableCell>Contacto</TableCell>
                                      <TableCell>Monto</TableCell>
                                      <TableCell>Estado</TableCell>
                                      <TableCell>Notificado</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {contributors[event.id_evento].map((contributor) => (
                                      <TableRow key={contributor.id}>
                                        <TableCell>
                                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <PersonIcon sx={{ mr: 1, fontSize: 16, color: '#4e7df0' }} />
                                            {contributor.nombre_padre}
                                          </Box>
                                        </TableCell>
                                        <TableCell>
                                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <EmailIcon sx={{ mr: 1, fontSize: 16, color: '#9c27b0' }} />
                                            {contributor.email_padre}
                                          </Box>
                                          {contributor.telefono && (
                                            <Typography variant="caption" display="block" color="text.secondary">
                                              Tel: {contributor.telefono}
                                            </Typography>
                                          )}
                                          {contributor.whatsapp && (
                                            <Typography variant="caption" display="block" color="text.secondary">
                                              WhatsApp: {contributor.whatsapp}
                                            </Typography>
                                          )}
                                        </TableCell>
                                        <TableCell>{formatAmount(contributor.monto_individual)}</TableCell>
                                        <TableCell>
                                          <Chip 
                                            label={contributor.estado_pago} 
                                            color={contributor.estado_pago === 'pagado' ? 'success' : 'warning'}
                                            size="small"
                                          />
                                        </TableCell>
                                        <TableCell>
                                          {contributor.notificacion_email ? (
                                            <CheckCircleIcon color="success" fontSize="small" />
                                          ) : (
                                            <CancelIcon color="error" fontSize="small" />
                                          )}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            ) : (
                              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                                No hay aportantes para este evento
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <Typography>No hay eventos activos</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={activeEvents.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </TableContainer>
      
      {/* Diálogo para enviar notificaciones */}
      <Dialog open={openSendDialog} onClose={handleCloseSendDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Enviar Notificaciones - {selectedEvent?.nombre_hijo}
        </DialogTitle>
        <DialogContent dividers>
          {selectedEvent && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Detalles del Evento
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" fontWeight="medium">Nombre:</Typography>
                  <Typography variant="body1">{selectedEvent.nombre_hijo}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" fontWeight="medium">Comunidad:</Typography>
                  <Typography variant="body1">{selectedEvent.nombre_comunidad}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" fontWeight="medium">Fecha de Cumpleaños:</Typography>
                  <Typography variant="body1">{formatDate(selectedEvent.fecha_cumple)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" fontWeight="medium">Monto Recaudado:</Typography>
                  <Typography variant="body1">{formatAmount(selectedEvent.monto_total_recaudado || 0)}</Typography>
                </Grid>
              </Grid>
              
              <Typography variant="h6" gutterBottom>
                Aportantes
              </Typography>
              
              {loadingContributors[selectedEvent.id_evento] ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress size={30} />
                </Box>
              ) : contributors[selectedEvent.id_evento]?.length > 0 ? (
                <List>
                  {contributors[selectedEvent.id_evento].map((contributor) => (
                    <ListItem key={contributor.id} divider>
                      <ListItemText
                        primary={contributor.nombre_padre}
                        secondary={contributor.email_padre}
                      />
                      <ListItemSecondaryAction>
                        <Chip 
                          label={contributor.notificacion_email ? 'Notificado' : 'No Notificado'} 
                          color={contributor.notificacion_email ? 'success' : 'default'}
                          size="small"
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No hay aportantes para este evento
                </Typography>
              )}
              
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Mensaje de Notificación
              </Typography>
              
              <TextField
                label="Asunto"
                fullWidth
                margin="normal"
                variant="outlined"
                defaultValue={`Recordatorio: Aporte para el cumpleaños de ${selectedEvent.nombre_hijo}`}
              />
              
              <TextField
                label="Mensaje"
                fullWidth
                margin="normal"
                variant="outlined"
                multiline
                rows={4}
                defaultValue={`Hola,\n\nTe recordamos que estamos organizando una colecta para el cumpleaños de ${selectedEvent.nombre_hijo} de la comunidad ${selectedEvent.nombre_comunidad}.\n\nPor favor, realiza tu aporte lo antes posible.\n\nGracias,\nEquipo Hey Jack`}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSendDialog} color="inherit">
            Cancelar
          </Button>
          <Button 
            onClick={handleSendNotifications} 
            color="primary" 
            variant="contained"
            startIcon={<SendIcon />}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Enviar Notificaciones'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminActiveEvents;
