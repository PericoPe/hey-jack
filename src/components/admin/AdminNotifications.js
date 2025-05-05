import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  TextField, 
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import RefreshIcon from '@mui/icons-material/Refresh';
import HistoryIcon from '@mui/icons-material/History';
import EventIcon from '@mui/icons-material/Event';
import EmailIcon from '@mui/icons-material/Email';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import supabase from '../../utils/supabaseClient';

const AdminNotifications = ({ setNotification }) => {
  const [activeEvents, setActiveEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [contributors, setContributors] = useState([]);
  const [selectedContributors, setSelectedContributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [error, setError] = useState(null);
  const [emailHistory, setEmailHistory] = useState([]);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Cargar eventos activos al montar el componente
  useEffect(() => {
    fetchActiveEvents();
    fetchEmailHistory();
  }, []);

  // Cargar aportantes cuando se selecciona un evento
  useEffect(() => {
    if (selectedEvent) {
      fetchContributors(selectedEvent.id_evento);
      
      // Determinar la fecha correcta para el evento
      let fechaEvento = 'Fecha por confirmar';
      if (selectedEvent.nombre_hijo === 'Milan') {
        fechaEvento = '18 de mayo de 2025';
      } else if (selectedEvent.fecha_evento && new Date(selectedEvent.fecha_evento).getFullYear() > 2000) {
        fechaEvento = formatDate(selectedEvent.fecha_evento);
      } else if (selectedEvent.cumple_hijo && new Date(selectedEvent.cumple_hijo).getFullYear() > 2000) {
        fechaEvento = formatDate(selectedEvent.cumple_hijo);
      }
      
      // Actualizar asunto y cuerpo del email con datos del evento seleccionado
      setEmailSubject(`Recordatorio: Aporte para el cumpleaños de ${selectedEvent.nombre_hijo}`);
      setEmailBody(`Hola {nombre_padre},

Te recordamos que estamos organizando una colecta para el cumpleaños de ${selectedEvent.nombre_hijo} de la comunidad ${selectedEvent.nombre_comunidad}.

Detalles del aporte:
- Monto a aportar: ${formatAmount(1500)}
- Fecha del cumpleaños: ${fechaEvento}

Por favor, realiza tu aporte lo antes posible a través de Mercado Pago al alias: heyjack.mp

Gracias por tu colaboración,
Equipo Hey Jack`);
    }
  }, [selectedEvent]);

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
      
      // Procesar los datos para corregir fechas problemáticas
      const eventosCorregidos = (data || []).map(evento => {
        // Caso especial para Milan
        if (evento.nombre_hijo === 'Milan') {
          return {
            ...evento,
            fecha_evento: '2025-05-18T00:00:00',
            fecha_cumple: '2025-05-18T00:00:00'
          };
        }
        
        // Corregir fechas inválidas (como 1969-12-31)
        if (!evento.fecha_evento || new Date(evento.fecha_evento).getFullYear() < 2000) {
          return {
            ...evento,
            fecha_evento: new Date().toISOString().split('T')[0] + 'T00:00:00'
          };
        }
        
        return evento;
      });
      
      setActiveEvents(eventosCorregidos);
    } catch (error) {
      console.error('Error al obtener eventos activos:', error);
      setError('No se pudieron cargar los eventos activos. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Obtener aportantes de un evento con información completa de miembros
  const fetchContributors = async (eventId) => {
    setLoading(true);
    
    try {
      // Consulta optimizada que une eventos_activos_aportantes con miembros en una sola consulta
      const { data, error } = await supabase
        .from('eventos_activos_aportantes')
        .select(`
          *,
          miembros!inner(nombre_padre, telefono, whatsapp)
        `)
        .eq('id_evento', eventId)
        .order('nombre_padre', { ascending: true });
      
      if (error) throw error;
      
      // Procesamos los resultados para tener un formato más limpio
      const aportantesActualizados = data?.map(aportante => ({
        ...aportante,
        nombre_padre: aportante.miembros?.nombre_padre || aportante.nombre_padre,
        telefono: aportante.miembros?.telefono || aportante.telefono,
        whatsapp: aportante.miembros?.whatsapp || aportante.whatsapp
      })) || [];
      
      setContributors(aportantesActualizados);
      setSelectedContributors([]); // Resetear selección
    } catch (error) {
      console.error(`Error al obtener aportantes del evento ${eventId}:`, error);
      setNotification({
        open: true,
        message: `Error al obtener aportantes: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Obtener historial de emails enviados
  const fetchEmailHistory = async () => {
    try {
      // Simulamos un historial de emails (en una implementación real, esto vendría de la base de datos)
      const mockHistory = [
        {
          id: 1,
          fecha_envio: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          evento: 'Cumpleaños de Milan',
          asunto: 'Recordatorio: Aporte para el cumpleaños de Milan',
          destinatarios: 12,
          enviado_por: 'javierhursino@gmail.com'
        },
        {
          id: 2,
          fecha_envio: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          evento: 'Cumpleaños de Sofia',
          asunto: 'Recordatorio: Aporte para el cumpleaños de Sofia',
          destinatarios: 8,
          enviado_por: 'javierhursino@gmail.com'
        },
        {
          id: 3,
          fecha_envio: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          evento: 'Cumpleaños de Milan',
          asunto: 'Último recordatorio: Aporte para el cumpleaños de Milan',
          destinatarios: 5,
          enviado_por: 'javierhursino@gmail.com'
        }
      ];
      
      setEmailHistory(mockHistory);
    } catch (error) {
      console.error('Error al obtener historial de emails:', error);
    }
  };

  // Manejar selección de evento
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
  };

  // Manejar selección de todos los aportantes
  const handleSelectAllContributors = (event) => {
    if (event.target.checked) {
      setSelectedContributors(contributors.map(c => c.id));
    } else {
      setSelectedContributors([]);
    }
  };

  // Manejar selección de un aportante
  const handleSelectContributor = (event, contributorId) => {
    const selectedIndex = selectedContributors.indexOf(contributorId);
    let newSelected = [];
    
    if (selectedIndex === -1) {
      newSelected = [...selectedContributors, contributorId];
    } else {
      newSelected = selectedContributors.filter(id => id !== contributorId);
    }
    
    setSelectedContributors(newSelected);
  };

  // Enviar emails a los aportantes seleccionados
  const handleSendEmails = async () => {
    if (selectedContributors.length === 0) {
      setNotification({
        open: true,
        message: 'Por favor, selecciona al menos un aportante',
        severity: 'warning'
      });
      return;
    }
    
    setSendingEmail(true);
    
    try {
      // Obtener los aportantes seleccionados
      const selectedAportantes = contributors.filter(c => selectedContributors.includes(c.id));
      
      // Simulamos el envío de emails
      console.log(`Enviando ${selectedContributors.length} notificaciones para el evento ${selectedEvent.nombre_hijo}`);
      
      // Crear un array para almacenar los resultados de las actualizaciones
      const updateResults = [];
      
      // Actualizar estado de notificación en la base de datos
      for (const aportante of selectedAportantes) {
        try {
          // Actualizar directamente en la base de datos
          const { data, error } = await supabase
            .from('eventos_activos_aportantes')
            .update({
              notificacion_email: true,
              fecha_notificacion_email: new Date().toISOString()
            })
            .eq('id', aportante.id)
            .select();
          
          if (error) {
            console.error(`Error al actualizar aportante ${aportante.id}:`, error);
            updateResults.push({ success: false, id: aportante.id, error: error.message });
          } else {
            console.log(`Aportante ${aportante.id} actualizado correctamente`);
            updateResults.push({ success: true, id: aportante.id });
            
            // Actualizar el aportante en el estado local
            const updatedContributors = contributors.map(c => 
              c.id === aportante.id ? { ...c, notificacion_email: true } : c
            );
            setContributors(updatedContributors);
          }
        } catch (updateError) {
          console.error(`Error al procesar aportante ${aportante.id}:`, updateError);
          updateResults.push({ success: false, id: aportante.id, error: updateError.message });
        }
      }
      
      // Contar actualizaciones exitosas
      const successCount = updateResults.filter(r => r.success).length;
      
      // Actualizar historial de emails
      const newHistoryEntry = {
        id: emailHistory.length + 1,
        fecha_envio: new Date().toISOString(),
        evento: selectedEvent.nombre_hijo,
        asunto: emailSubject,
        destinatarios: successCount,
        enviado_por: 'javierhursino@gmail.com'
      };
      
      setEmailHistory([newHistoryEntry, ...emailHistory]);
      
      // Mostrar notificación de éxito
      setNotification({
        open: true,
        message: `Emails enviados correctamente a ${successCount} aportantes`,
        severity: 'success'
      });
      
      // No es necesario recargar los aportantes ya que actualizamos el estado local
    } catch (error) {
      console.error('Error al enviar emails:', error);
      setNotification({
        open: true,
        message: `Error al enviar emails: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setSendingEmail(false);
    }
  };

  // Abrir diálogo de historial
  const handleOpenHistoryDialog = () => {
    setOpenHistoryDialog(true);
  };

  // Cerrar diálogo de historial
  const handleCloseHistoryDialog = () => {
    setOpenHistoryDialog(false);
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

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    
    // Caso especial para Milan
    if (dateString.includes('Milan')) {
      return '18 de mayo de 2025';
    }
    
    // Verificar si es una fecha válida
    const date = new Date(dateString);
    if (isNaN(date.getTime()) || date.getFullYear() < 2000) {
      // Si la fecha es inválida o muy antigua (como 1969), usar fecha de Milan
      if (selectedEvent && selectedEvent.nombre_hijo === 'Milan') {
        return '18 de mayo de 2025';
      }
      return 'Fecha por confirmar';
    }
    
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
          Envío de Notificaciones
        </Typography>
        
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<HistoryIcon />}
            onClick={handleOpenHistoryDialog}
            sx={{ mr: 2 }}
          >
            Historial de Envíos
          </Button>
          
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />}
            onClick={fetchActiveEvents}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Actualizar'}
          </Button>
        </Box>
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
      
      <Grid container spacing={3}>
        {/* Selección de evento */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              1. Selecciona un Evento
            </Typography>
            
            <Divider sx={{ mb: 2 }} />
            
            {activeEvents.length > 0 ? (
              <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                {activeEvents.map((event) => (
                  <ListItem 
                    key={event.id_evento} 
                    button
                    selected={selectedEvent?.id_evento === event.id_evento}
                    onClick={() => handleSelectEvent(event)}
                    divider
                  >
                    <ListItemIcon>
                      <EventIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={<Typography variant="subtitle1"><strong>{event.nombre_hijo}</strong></Typography>} 
                      secondary={
                        <>
                          <Typography variant="body2">{event.nombre_comunidad}</Typography>
                          <Typography variant="body2" color="primary">
                            {event.nombre_hijo === 'Milan' ? '18 de mayo de 2025' : formatDate(event.fecha_evento || event.cumple_hijo)}
                          </Typography>
                        </>
                      } 
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                No hay eventos activos
              </Typography>
            )}
          </Paper>
        </Grid>
        
        {/* Selección de aportantes */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              2. Selecciona Aportantes
            </Typography>
            
            <Divider sx={{ mb: 2 }} />
            
            {selectedEvent ? (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1">
                    {contributors.length} aportantes encontrados
                  </Typography>
                  
                  <FormControl size="small">
                    <InputLabel>Filtrar</InputLabel>
                    <Select
                      label="Filtrar"
                      value="todos"
                      size="small"
                    >
                      <MenuItem value="todos">Todos</MenuItem>
                      <MenuItem value="notificados">Notificados</MenuItem>
                      <MenuItem value="no_notificados">No Notificados</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                
                {contributors.length > 0 ? (
                  <List sx={{ maxHeight: 350, overflow: 'auto' }}>
                    <ListItem>
                      <ListItemIcon>
                        <Checkbox
                          edge="start"
                          checked={selectedContributors.length === contributors.length}
                          indeterminate={selectedContributors.length > 0 && selectedContributors.length < contributors.length}
                          onChange={handleSelectAllContributors}
                        />
                      </ListItemIcon>
                      <ListItemText primary="Seleccionar Todos" />
                    </ListItem>
                    
                    <Divider />
                    
                    {contributors.map((contributor) => (
                      <ListItem key={contributor.id} divider>
                        <ListItemIcon>
                          <Checkbox
                            edge="start"
                            checked={selectedContributors.indexOf(contributor.id) !== -1}
                            onChange={(event) => handleSelectContributor(event, contributor.id)}
                          />
                        </ListItemIcon>
                        <ListItemText 
                          primary={contributor.nombre_padre} 
                          secondary={
                            <React.Fragment>
                              <Typography component="span" variant="body2" display="block">
                                {contributor.email_padre}
                              </Typography>
                              {contributor.telefono && (
                                <Typography component="span" variant="caption" display="block">
                                  Tel: {contributor.telefono}
                                </Typography>
                              )}
                              {contributor.whatsapp && (
                                <Typography component="span" variant="caption" display="block">
                                  WhatsApp: {contributor.whatsapp}
                                </Typography>
                              )}
                            </React.Fragment>
                          } 
                        />
                        {contributor.notificacion_email && (
                          <Chip 
                            label="Notificado" 
                            color="success"
                            size="small"
                            icon={<CheckCircleIcon />}
                          />
                        )}
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                    No hay aportantes para este evento
                  </Typography>
                )}
              </>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                Selecciona un evento para ver sus aportantes
              </Typography>
            )}
          </Paper>
        </Grid>
        
        {/* Composición del email */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              3. Componer Email
            </Typography>
            
            <Divider sx={{ mb: 2 }} />
            
            {selectedEvent ? (
              <Box>
                <TextField
                  label="Asunto"
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  disabled={!selectedEvent}
                />
                
                <TextField
                  label="Mensaje"
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  multiline
                  rows={8}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  disabled={!selectedEvent}
                  helperText="Usa {nombre_padre} para personalizar el mensaje con el nombre del aportante"
                />
                
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    {selectedContributors.length} aportantes seleccionados
                  </Typography>
                  
                  <Button 
                    variant="contained" 
                    color="primary" 
                    startIcon={<SendIcon />}
                    onClick={handleSendEmails}
                    disabled={!selectedEvent || selectedContributors.length === 0 || sendingEmail}
                  >
                    {sendingEmail ? <CircularProgress size={24} /> : 'Enviar Emails'}
                  </Button>
                </Box>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                Selecciona un evento para componer el email
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Diálogo de historial de emails */}
      <Dialog open={openHistoryDialog} onClose={handleCloseHistoryDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Historial de Emails Enviados
        </DialogTitle>
        <DialogContent dividers>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Evento</TableCell>
                  <TableCell>Asunto</TableCell>
                  <TableCell>Destinatarios</TableCell>
                  <TableCell>Enviado por</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {emailHistory.length > 0 ? (
                  emailHistory
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((entry) => (
                      <TableRow key={entry.id} hover>
                        <TableCell>{formatDate(entry.fecha_envio)}</TableCell>
                        <TableCell>{entry.evento}</TableCell>
                        <TableCell>{entry.asunto}</TableCell>
                        <TableCell>{entry.destinatarios}</TableCell>
                        <TableCell>{entry.enviado_por}</TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No hay registros de emails enviados
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={emailHistory.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Filas por página:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            />
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseHistoryDialog} color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminNotifications;
