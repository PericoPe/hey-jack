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
  Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import EventIcon from '@mui/icons-material/Event';
import CakeIcon from '@mui/icons-material/Cake';
import GroupIcon from '@mui/icons-material/Group';
import supabase from '../../utils/supabaseClient';

const AdminEvents = ({ setNotification }) => {
  const [events, setEvents] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [formData, setFormData] = useState({
    id_comunidad: '',
    nombre_hijo: '',
    fecha_cumple: '',
    tipo_evento: 'cumpleaños',
    descripcion: '',
    estado: 'pendiente'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [communityFilter, setCommunityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  // Cargar eventos y comunidades al montar el componente
  useEffect(() => {
    fetchEvents();
    fetchCommunities();
  }, []);

  // Filtrar eventos cuando cambia el término de búsqueda o los filtros
  useEffect(() => {
    filterEvents();
  }, [events, searchTerm, communityFilter, statusFilter]);

  // Obtener eventos de Supabase
  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .order('fecha_creacion', { ascending: false });
      
      if (error) throw error;
      
      setEvents(data || []);
    } catch (error) {
      console.error('Error al obtener eventos:', error);
      setError('No se pudieron cargar los eventos. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Obtener comunidades de Supabase
  const fetchCommunities = async () => {
    try {
      const { data, error } = await supabase
        .from('comunidades')
        .select('id_comunidad, nombre_comunidad')
        .order('nombre_comunidad', { ascending: true });
      
      if (error) throw error;
      
      setCommunities(data || []);
    } catch (error) {
      console.error('Error al obtener comunidades:', error);
    }
  };

  // Filtrar eventos según término de búsqueda y filtros
  const filterEvents = () => {
    let filtered = [...events];
    
    // Aplicar filtro de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(event => 
        event.nombre_hijo.toLowerCase().includes(term) ||
        event.descripcion?.toLowerCase().includes(term)
      );
    }
    
    // Aplicar filtro de comunidad
    if (communityFilter) {
      filtered = filtered.filter(event => event.id_comunidad === communityFilter);
    }
    
    // Aplicar filtro de estado
    if (statusFilter !== 'todos') {
      filtered = filtered.filter(event => event.estado === statusFilter);
    }
    
    setFilteredEvents(filtered);
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

  // Abrir diálogo para crear nuevo evento
  const handleOpenCreateDialog = () => {
    setCurrentEvent(null);
    setFormData({
      id_comunidad: '',
      nombre_hijo: '',
      fecha_cumple: '',
      tipo_evento: 'cumpleaños',
      descripcion: '',
      estado: 'pendiente'
    });
    setOpenDialog(true);
  };

  // Abrir diálogo para editar evento
  const handleOpenEditDialog = (event) => {
    setCurrentEvent(event);
    setFormData({
      id_comunidad: event.id_comunidad || '',
      nombre_hijo: event.nombre_hijo || '',
      fecha_cumple: event.fecha_cumple ? new Date(event.fecha_cumple).toISOString().split('T')[0] : '',
      tipo_evento: event.tipo_evento || 'cumpleaños',
      descripcion: event.descripcion || '',
      estado: event.estado || 'pendiente'
    });
    setOpenDialog(true);
  };

  // Cerrar diálogo
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Abrir diálogo de confirmación para eliminar
  const handleOpenDeleteDialog = (event) => {
    setCurrentEvent(event);
    setOpenDeleteDialog(true);
  };

  // Cerrar diálogo de confirmación para eliminar
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  // Manejar cambios en el formulario
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Guardar evento (crear o actualizar)
  const handleSaveEvent = async () => {
    try {
      if (currentEvent) {
        // Actualizar evento existente
        const { error } = await supabase
          .from('eventos')
          .update({
            id_comunidad: formData.id_comunidad,
            nombre_hijo: formData.nombre_hijo,
            fecha_cumple: formData.fecha_cumple,
            tipo_evento: formData.tipo_evento,
            descripcion: formData.descripcion,
            estado: formData.estado,
            fecha_actualizacion: new Date().toISOString()
          })
          .eq('id_evento', currentEvent.id_evento);
        
        if (error) throw error;
        
        setNotification({
          open: true,
          message: 'Evento actualizado correctamente',
          severity: 'success'
        });
      } else {
        // Crear nuevo evento
        const { error } = await supabase
          .from('eventos')
          .insert([
            {
              id_comunidad: formData.id_comunidad,
              nombre_hijo: formData.nombre_hijo,
              fecha_cumple: formData.fecha_cumple,
              tipo_evento: formData.tipo_evento,
              descripcion: formData.descripcion,
              estado: formData.estado,
              fecha_creacion: new Date().toISOString(),
              fecha_actualizacion: new Date().toISOString()
            }
          ]);
        
        if (error) throw error;
        
        setNotification({
          open: true,
          message: 'Evento creado correctamente',
          severity: 'success'
        });
      }
      
      // Cerrar diálogo y recargar datos
      handleCloseDialog();
      fetchEvents();
    } catch (error) {
      console.error('Error al guardar evento:', error);
      setNotification({
        open: true,
        message: `Error al guardar evento: ${error.message}`,
        severity: 'error'
      });
    }
  };

  // Eliminar evento
  const handleDeleteEvent = async () => {
    try {
      const { error } = await supabase
        .from('eventos')
        .delete()
        .eq('id_evento', currentEvent.id_evento);
      
      if (error) throw error;
      
      setNotification({
        open: true,
        message: 'Evento eliminado correctamente',
        severity: 'success'
      });
      
      // Cerrar diálogo y recargar datos
      handleCloseDeleteDialog();
      fetchEvents();
    } catch (error) {
      console.error('Error al eliminar evento:', error);
      setNotification({
        open: true,
        message: `Error al eliminar evento: ${error.message}`,
        severity: 'error'
      });
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

  // Obtener nombre de comunidad
  const getCommunityName = (communityId) => {
    const community = communities.find(c => c.id_comunidad === communityId);
    return community ? community.nombre_comunidad : communityId;
  };

  // Obtener color de chip según estado
  const getStatusColor = (status) => {
    switch (status) {
      case 'activo':
        return 'success';
      case 'pendiente':
        return 'warning';
      case 'completado':
        return 'info';
      case 'cancelado':
        return 'error';
      default:
        return 'default';
    }
  };

  // Si está cargando, mostrar indicador
  if (loading && events.length === 0) {
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
          Gestión de Eventos
        </Typography>
        
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
        >
          Nuevo Evento
        </Button>
      </Box>
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={fetchEvents}>
              Reintentar
            </Button>
          }
        >
          {error}
        </Alert>
      )}
      
      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Buscar evento"
              variant="outlined"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                endAdornment: <SearchIcon color="action" />
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Comunidad</InputLabel>
              <Select
                value={communityFilter}
                onChange={(e) => setCommunityFilter(e.target.value)}
                label="Comunidad"
              >
                <MenuItem value="">Todas</MenuItem>
                {communities.map((community) => (
                  <MenuItem key={community.id_comunidad} value={community.id_comunidad}>
                    {community.nombre_comunidad}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Estado</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Estado"
              >
                <MenuItem value="todos">Todos</MenuItem>
                <MenuItem value="pendiente">Pendiente</MenuItem>
                <MenuItem value="activo">Activo</MenuItem>
                <MenuItem value="completado">Completado</MenuItem>
                <MenuItem value="cancelado">Cancelado</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            <Button 
              variant="outlined" 
              startIcon={<RefreshIcon />}
              onClick={fetchEvents}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Actualizar'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Tabla de eventos */}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="tabla de eventos">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell><Typography fontWeight="bold">Nombre</Typography></TableCell>
              <TableCell><Typography fontWeight="bold">Comunidad</Typography></TableCell>
              <TableCell><Typography fontWeight="bold">Fecha Cumpleaños</Typography></TableCell>
              <TableCell><Typography fontWeight="bold">Tipo</Typography></TableCell>
              <TableCell><Typography fontWeight="bold">Descripción</Typography></TableCell>
              <TableCell><Typography fontWeight="bold">Estado</Typography></TableCell>
              <TableCell align="center"><Typography fontWeight="bold">Acciones</Typography></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEvents.length > 0 ? (
              filteredEvents
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((event) => (
                  <TableRow key={event.id_evento} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CakeIcon sx={{ mr: 1, color: '#e91e63' }} />
                        <Typography>{event.nombre_hijo}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <GroupIcon sx={{ mr: 1, color: '#4e7df0', fontSize: 18 }} />
                        <Typography>{getCommunityName(event.id_comunidad)}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{formatDate(event.fecha_cumple)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={event.tipo_evento} 
                        color="primary"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {event.descripcion || 'Sin descripción'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={event.estado} 
                        color={getStatusColor(event.estado)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Editar">
                        <IconButton 
                          color="primary" 
                          onClick={() => handleOpenEditDialog(event)}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton 
                          color="error" 
                          onClick={() => handleOpenDeleteDialog(event)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  {loading ? (
                    <CircularProgress size={24} sx={{ mr: 1 }} />
                  ) : (
                    <Typography>No se encontraron eventos</Typography>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredEvents.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </TableContainer>
      
      {/* Diálogo para crear/editar evento */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {currentEvent ? 'Editar Evento' : 'Nuevo Evento'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal" variant="outlined">
                <InputLabel>Comunidad</InputLabel>
                <Select
                  name="id_comunidad"
                  value={formData.id_comunidad}
                  onChange={handleFormChange}
                  label="Comunidad"
                  required
                >
                  {communities.map((community) => (
                    <MenuItem key={community.id_comunidad} value={community.id_comunidad}>
                      {community.nombre_comunidad}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal" variant="outlined">
                <InputLabel>Estado</InputLabel>
                <Select
                  name="estado"
                  value={formData.estado}
                  onChange={handleFormChange}
                  label="Estado"
                >
                  <MenuItem value="pendiente">Pendiente</MenuItem>
                  <MenuItem value="activo">Activo</MenuItem>
                  <MenuItem value="completado">Completado</MenuItem>
                  <MenuItem value="cancelado">Cancelado</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="nombre_hijo"
                label="Nombre del Hijo/a"
                fullWidth
                margin="normal"
                variant="outlined"
                value={formData.nombre_hijo}
                onChange={handleFormChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="fecha_cumple"
                label="Fecha de Cumpleaños"
                fullWidth
                margin="normal"
                variant="outlined"
                value={formData.fecha_cumple}
                onChange={handleFormChange}
                type="date"
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal" variant="outlined">
                <InputLabel>Tipo de Evento</InputLabel>
                <Select
                  name="tipo_evento"
                  value={formData.tipo_evento}
                  onChange={handleFormChange}
                  label="Tipo de Evento"
                >
                  <MenuItem value="cumpleaños">Cumpleaños</MenuItem>
                  <MenuItem value="graduación">Graduación</MenuItem>
                  <MenuItem value="otro">Otro</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="descripcion"
                label="Descripción"
                fullWidth
                margin="normal"
                variant="outlined"
                value={formData.descripcion}
                onChange={handleFormChange}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancelar
          </Button>
          <Button 
            onClick={handleSaveEvent} 
            color="primary" 
            variant="contained"
            disabled={!formData.id_comunidad || !formData.nombre_hijo || !formData.fecha_cumple}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Diálogo de confirmación para eliminar */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar el evento de "{currentEvent?.nombre_hijo}"?
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleDeleteEvent} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminEvents;
