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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import supabase from '../../utils/supabaseClient';

const AdminCommunities = ({ setNotification }) => {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentCommunity, setCurrentCommunity] = useState(null);
  const [formData, setFormData] = useState({
    nombre_comunidad: '',
    descripcion: '',
    creador_nombre: '',
    creador_email: '',
    creador_whatsapp: '',
    creador_mp_alias: '',
    estado: 'activa'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCommunities, setFilteredCommunities] = useState([]);
  const [statusFilter, setStatusFilter] = useState('todos');

  // Cargar comunidades al montar el componente
  useEffect(() => {
    fetchCommunities();
  }, []);

  // Filtrar comunidades cuando cambia el término de búsqueda o el filtro de estado
  useEffect(() => {
    filterCommunities();
  }, [communities, searchTerm, statusFilter]);

  // Obtener comunidades de Supabase
  const fetchCommunities = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('comunidades')
        .select('*')
        .order('fecha_creacion', { ascending: false });
      
      if (error) throw error;
      
      setCommunities(data || []);
    } catch (error) {
      console.error('Error al obtener comunidades:', error);
      setError('No se pudieron cargar las comunidades. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar comunidades según término de búsqueda y filtro de estado
  const filterCommunities = () => {
    let filtered = [...communities];
    
    // Aplicar filtro de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(community => 
        community.nombre_comunidad.toLowerCase().includes(term) ||
        community.creador_nombre.toLowerCase().includes(term) ||
        community.creador_email.toLowerCase().includes(term)
      );
    }
    
    // Aplicar filtro de estado
    if (statusFilter !== 'todos') {
      filtered = filtered.filter(community => community.estado === statusFilter);
    }
    
    setFilteredCommunities(filtered);
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

  // Abrir diálogo para crear nueva comunidad
  const handleOpenCreateDialog = () => {
    setCurrentCommunity(null);
    setFormData({
      nombre_comunidad: '',
      descripcion: '',
      creador_nombre: '',
      creador_email: '',
      creador_whatsapp: '',
      creador_mp_alias: '',
      estado: 'activa'
    });
    setOpenDialog(true);
  };

  // Abrir diálogo para editar comunidad
  const handleOpenEditDialog = (community) => {
    setCurrentCommunity(community);
    setFormData({
      nombre_comunidad: community.nombre_comunidad || '',
      descripcion: community.descripcion || '',
      creador_nombre: community.creador_nombre || '',
      creador_email: community.creador_email || '',
      creador_whatsapp: community.creador_whatsapp || '',
      creador_mp_alias: community.creador_mp_alias || '',
      estado: community.estado || 'activa' // Corregido a 'activa' en lugar de 'activo'
    });
    setOpenDialog(true);
  };

  // Cerrar diálogo
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Abrir diálogo de confirmación para eliminar
  const handleOpenDeleteDialog = (community) => {
    setCurrentCommunity(community);
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

  // Guardar comunidad (crear o actualizar)
  const handleSaveCommunity = async () => {
    try {
      if (currentCommunity) {
        // Actualizar comunidad existente
        const { error } = await supabase
          .from('comunidades')
          .update({
            nombre_comunidad: formData.nombre_comunidad,
            descripcion: formData.descripcion,
            creador_nombre: formData.creador_nombre,
            creador_email: formData.creador_email,
            creador_whatsapp: formData.creador_whatsapp,
            creador_mp_alias: formData.creador_mp_alias,
            estado: formData.estado,
            fecha_actualizacion: new Date().toISOString()
          })
          .eq('id_comunidad', currentCommunity.id_comunidad);
        
        if (error) throw error;
        
        setNotification({
          open: true,
          message: 'Comunidad actualizada correctamente',
          severity: 'success'
        });
      } else {
        // Crear nueva comunidad
        const { error } = await supabase
          .from('comunidades')
          .insert([
            {
              nombre_comunidad: formData.nombre_comunidad,
              descripcion: formData.descripcion,
              creador_nombre: formData.creador_nombre,
              creador_email: formData.creador_email,
              creador_whatsapp: formData.creador_whatsapp,
              creador_mp_alias: formData.creador_mp_alias,
              estado: formData.estado,
              fecha_creacion: new Date().toISOString(),
              fecha_actualizacion: new Date().toISOString()
            }
          ]);
        
        if (error) throw error;
        
        setNotification({
          open: true,
          message: 'Comunidad creada correctamente',
          severity: 'success'
        });
      }
      
      // Cerrar diálogo y recargar datos
      handleCloseDialog();
      fetchCommunities();
    } catch (error) {
      console.error('Error al guardar comunidad:', error);
      setNotification({
        open: true,
        message: `Error al guardar comunidad: ${error.message}`,
        severity: 'error'
      });
    }
  };

  // Eliminar comunidad
  const handleDeleteCommunity = async () => {
    try {
      const { error } = await supabase
        .from('comunidades')
        .delete()
        .eq('id_comunidad', currentCommunity.id_comunidad);
      
      if (error) throw error;
      
      setNotification({
        open: true,
        message: 'Comunidad eliminada correctamente',
        severity: 'success'
      });
      
      // Cerrar diálogo y recargar datos
      handleCloseDeleteDialog();
      fetchCommunities();
    } catch (error) {
      console.error('Error al eliminar comunidad:', error);
      setNotification({
        open: true,
        message: `Error al eliminar comunidad: ${error.message}`,
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

  // Si está cargando, mostrar indicador
  if (loading && communities.length === 0) {
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
          Gestión de Comunidades
        </Typography>
        
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
        >
          Nueva Comunidad
        </Button>
      </Box>
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={fetchCommunities}>
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
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Buscar comunidad"
              variant="outlined"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                endAdornment: <SearchIcon color="action" />
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Estado</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Estado"
              >
                <MenuItem value="todos">Todos</MenuItem>
                <MenuItem value="activo">Activo</MenuItem>
                <MenuItem value="inactivo">Inactivo</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            <Button 
              variant="outlined" 
              startIcon={<RefreshIcon />}
              onClick={fetchCommunities}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Actualizar'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Tabla de comunidades */}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="tabla de comunidades">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell><Typography fontWeight="bold">Nombre</Typography></TableCell>
              <TableCell><Typography fontWeight="bold">Creador</Typography></TableCell>
              <TableCell><Typography fontWeight="bold">Email</Typography></TableCell>
              <TableCell><Typography fontWeight="bold">WhatsApp</Typography></TableCell>
              <TableCell><Typography fontWeight="bold">Fecha Creación</Typography></TableCell>
              <TableCell><Typography fontWeight="bold">Estado</Typography></TableCell>
              <TableCell align="center"><Typography fontWeight="bold">Acciones</Typography></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCommunities.length > 0 ? (
              filteredCommunities
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((community) => (
                  <TableRow key={community.id_comunidad} hover>
                    <TableCell>
                      <Typography fontWeight="medium">{community.nombre_comunidad}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {community.descripcion}
                      </Typography>
                    </TableCell>
                    <TableCell>{community.creador_nombre}</TableCell>
                    <TableCell>{community.creador_email}</TableCell>
                    <TableCell>{community.creador_whatsapp}</TableCell>
                    <TableCell>{formatDate(community.fecha_creacion)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={community.estado === 'activo' ? 'Activo' : 'Inactivo'} 
                        color={community.estado === 'activo' ? 'success' : 'default'}
                        size="small"
                        icon={community.estado === 'activo' ? <CheckCircleIcon /> : <CancelIcon />}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Editar">
                        <IconButton 
                          color="primary" 
                          onClick={() => handleOpenEditDialog(community)}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton 
                          color="error" 
                          onClick={() => handleOpenDeleteDialog(community)}
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
                    <Typography>No se encontraron comunidades</Typography>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredCommunities.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </TableContainer>
      
      {/* Diálogo para crear/editar comunidad */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {currentCommunity ? 'Editar Comunidad' : 'Nueva Comunidad'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="nombre_comunidad"
                label="Nombre de la Comunidad"
                fullWidth
                margin="normal"
                variant="outlined"
                value={formData.nombre_comunidad}
                onChange={handleFormChange}
                required
              />
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
                  <MenuItem value="activo">Activo</MenuItem>
                  <MenuItem value="inactivo">Inactivo</MenuItem>
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
                rows={2}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="creador_nombre"
                label="Nombre del Creador"
                fullWidth
                margin="normal"
                variant="outlined"
                value={formData.creador_nombre}
                onChange={handleFormChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="creador_email"
                label="Email del Creador"
                fullWidth
                margin="normal"
                variant="outlined"
                value={formData.creador_email}
                onChange={handleFormChange}
                required
                type="email"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="creador_whatsapp"
                label="WhatsApp del Creador"
                fullWidth
                margin="normal"
                variant="outlined"
                value={formData.creador_whatsapp}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="creador_mp_alias"
                label="Alias de Mercado Pago"
                fullWidth
                margin="normal"
                variant="outlined"
                value={formData.creador_mp_alias}
                onChange={handleFormChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancelar
          </Button>
          <Button 
            onClick={handleSaveCommunity} 
            color="primary" 
            variant="contained"
            disabled={!formData.nombre_comunidad || !formData.creador_nombre || !formData.creador_email}
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
            ¿Estás seguro de que deseas eliminar la comunidad "{currentCommunity?.nombre_comunidad}"?
            Esta acción no se puede deshacer y podría afectar a los miembros y eventos asociados.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleDeleteCommunity} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminCommunities;
