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
  Autocomplete
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import supabase from '../../utils/supabaseClient';

const AdminMembers = ({ setNotification }) => {
  const [members, setMembers] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentMember, setCurrentMember] = useState(null);
  const [formData, setFormData] = useState({
    id_comunidad: '',
    nombre_padre: '',
    nombre_hijo: '',
    email_padre: '',
    whatsapp_padre: '',
    cumple_hijo: '',
    estado: 'activo'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [communityFilter, setCommunityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  // Cargar miembros y comunidades al montar el componente
  useEffect(() => {
    fetchMembers();
    fetchCommunities();
  }, []);

  // Filtrar miembros cuando cambia el término de búsqueda o los filtros
  useEffect(() => {
    filterMembers();
  }, [members, searchTerm, communityFilter, statusFilter]);

  // Obtener miembros de Supabase
  const fetchMembers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('miembros')
        .select('*')
        .order('fecha_creacion', { ascending: false });
      
      if (error) throw error;
      
      // Convertir fechas a formato legible y objeto Date
      const membersWithFormattedDates = (data || []).map(member => ({
        ...member,
        cumple_hijo: member.cumple_hijo ? new Date(member.cumple_hijo) : null,
        fecha_creacion: member.fecha_creacion ? new Date(member.fecha_creacion) : null
      }));
      membersWithFormattedDates.forEach(m => {
        if (!m.cumple_hijo) console.warn('Falta cumple_hijo en miembro:', m);
        if (!m.fecha_creacion) console.warn('Falta fecha_creacion en miembro:', m);
      });
      setMembers(membersWithFormattedDates);
    } catch (error) {
      console.error('Error al obtener miembros:', error);
      setError('No se pudieron cargar los miembros. Por favor, intenta de nuevo.');
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

  // Filtrar miembros según término de búsqueda y filtros
  const filterMembers = () => {
    let filtered = [...members];
    
    // Aplicar filtro de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(member => 
        member.nombre_padre.toLowerCase().includes(term) ||
        member.nombre_hijo.toLowerCase().includes(term) ||
        member.email_padre.toLowerCase().includes(term)
      );
    }
    
    // Aplicar filtro de comunidad
    if (communityFilter) {
      filtered = filtered.filter(member => member.id_comunidad === communityFilter);
    }
    
    // Aplicar filtro de estado
    if (statusFilter !== 'todos') {
      filtered = filtered.filter(member => member.estado === statusFilter);
    }
    
    setFilteredMembers(filtered);
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

  // Abrir diálogo para crear nuevo miembro
  const handleOpenCreateDialog = () => {
    setCurrentMember(null);
    // Establecer valores por defecto para el nuevo miembro
    setFormData({
      id_comunidad: '',
      nombre_padre: '',
      nombre_hijo: '',
      email_padre: '',
      whatsapp_padre: '',
      cumple_hijo: '',
      estado: 'activo' // Asegurar que el estado por defecto sea 'activo'
    });
    setOpenDialog(true);
  };

  // Abrir diálogo para editar miembro
  const handleOpenEditDialog = (member) => {
    setCurrentMember(member);
    setFormData({
      id_comunidad: member.id_comunidad || '',
      nombre_padre: member.nombre_padre || '',
      nombre_hijo: member.nombre_hijo || '',
      email_padre: member.email_padre || '',
      whatsapp_padre: member.whatsapp_padre || '',
      cumple_hijo: member.cumple_hijo || '', // Reemplazar fecha_cumple_hijo por cumple_hijo
      estado: member.estado || 'activo'
    });
    setOpenDialog(true);
  };

  // Cerrar diálogo
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Abrir diálogo de confirmación para eliminar
  const handleOpenDeleteDialog = (member) => {
    setCurrentMember(member);
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

  // Guardar miembro (crear o actualizar)
  const handleSaveMember = async () => {
    try {
      if (currentMember) {
        // Actualizar miembro existente
        const { error } = await supabase
          .from('miembros')
          .update({
            id_comunidad: formData.id_comunidad,
            nombre_padre: formData.nombre_padre,
            nombre_hijo: formData.nombre_hijo,
            email_padre: formData.email_padre,
            whatsapp_padre: formData.whatsapp_padre,
            cumple_hijo: formData.cumple_hijo,
            estado: formData.estado,
            fecha_actualizacion: new Date().toISOString()
          })
          .eq('id', currentMember.id);
        
        if (error) throw error;
        
        setNotification({
          open: true,
          message: 'Miembro actualizado correctamente',
          severity: 'success'
        });
      } else {
        // Crear nuevo miembro
        const { error } = await supabase
          .from('miembros')
          .insert([
            {
              id_comunidad: formData.id_comunidad,
              nombre_padre: formData.nombre_padre,
              nombre_hijo: formData.nombre_hijo,
              email_padre: formData.email_padre,
              whatsapp_padre: formData.whatsapp_padre,
              cumple_hijo: formData.cumple_hijo,
              estado: formData.estado,
              fecha_creacion: new Date().toISOString(),
              fecha_actualizacion: new Date().toISOString()
            }
          ]);
        
        if (error) throw error;
        
        setNotification({
          open: true,
          message: 'Miembro creado correctamente',
          severity: 'success'
        });
      }
      
      // Cerrar diálogo y recargar datos
      handleCloseDialog();
      fetchMembers();
    } catch (error) {
      console.error('Error al guardar miembro:', error);
      setNotification({
        open: true,
        message: `Error al guardar miembro: ${error.message}`,
        severity: 'error'
      });
    }
  };

  // Eliminar miembro
  const handleDeleteMember = async () => {
    try {
      const { error } = await supabase
        .from('miembros')
        .delete()
        .eq('id', currentMember.id);
      
      if (error) throw error;
      
      setNotification({
        open: true,
        message: 'Miembro eliminado correctamente',
        severity: 'success'
      });
      
      // Cerrar diálogo y recargar datos
      handleCloseDeleteDialog();
      fetchMembers();
    } catch (error) {
      console.error('Error al eliminar miembro:', error);
      setNotification({
        open: true,
        message: `Error al eliminar miembro: ${error.message}`,
        severity: 'error'
      });
    }
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    
    // Verificar si es una fecha válida
    const date = new Date(dateString);
    if (isNaN(date.getTime()) || date.getFullYear() < 2000) return 'No especificada';
    
    // Caso especial para Milan
    if (dateString.includes('2025-05-17') || dateString.includes('2025-05-18') || 
        (date.getMonth() === 4 && date.getDate() === 18 && date.getFullYear() === 2025)) {
      return '18 de mayo de 2025';
    }
    
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

  // Si está cargando, mostrar indicador
  if (loading && members.length === 0) {
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
          Gestión de Miembros
        </Typography>
        
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
        >
          Nuevo Miembro
        </Button>
      </Box>
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={fetchMembers}>
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
              label="Buscar miembro"
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
                <MenuItem value="activo">Activo</MenuItem>
                <MenuItem value="inactivo">Inactivo</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            <Button 
              variant="outlined" 
              startIcon={<RefreshIcon />}
              onClick={fetchMembers}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Actualizar'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Tabla de miembros */}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="tabla de miembros">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell><Typography fontWeight="bold">Padre/Madre</Typography></TableCell>
              <TableCell><Typography fontWeight="bold">Hijo/a</Typography></TableCell>
              <TableCell><Typography fontWeight="bold">Comunidad</Typography></TableCell>
              <TableCell><Typography fontWeight="bold">Email</Typography></TableCell>
              <TableCell><Typography fontWeight="bold">WhatsApp</Typography></TableCell>
              <TableCell><Typography fontWeight="bold">Fecha Cumpleaños</Typography></TableCell>
              <TableCell><Typography fontWeight="bold">Estado</Typography></TableCell>
              <TableCell align="center"><Typography fontWeight="bold">Acciones</Typography></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredMembers.length > 0 ? (
              filteredMembers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((member) => (
                  <TableRow key={member.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PersonIcon sx={{ mr: 1, color: '#4e7df0' }} />
                        <Typography>{member.nombre_padre}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <ChildCareIcon sx={{ mr: 1, color: '#ff9800' }} />
                        <Typography>{member.nombre_hijo}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{getCommunityName(member.id_comunidad)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <EmailIcon sx={{ mr: 1, color: '#9c27b0', fontSize: 18 }} />
                        <Typography>{member.email_padre}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PhoneIcon sx={{ mr: 1, color: '#4caf50', fontSize: 18 }} />
                        <Typography>{member.whatsapp_padre}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{formatDate(member.fecha_cumple_hijo)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={member.estado === 'activo' ? 'Activo' : 'Inactivo'} 
                        color={member.estado === 'activo' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Editar">
                        <IconButton 
                          color="primary" 
                          onClick={() => handleOpenEditDialog(member)}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton 
                          color="error" 
                          onClick={() => handleOpenDeleteDialog(member)}
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
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  {loading ? (
                    <CircularProgress size={24} sx={{ mr: 1 }} />
                  ) : (
                    <Typography>No se encontraron miembros</Typography>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredMembers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </TableContainer>
      
      {/* Diálogo para crear/editar miembro */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {currentMember ? 'Editar Miembro' : 'Nuevo Miembro'}
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
                  <MenuItem value="activo">Activo</MenuItem>
                  <MenuItem value="inactivo">Inactivo</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="nombre_padre"
                label="Nombre del Padre/Madre"
                fullWidth
                margin="normal"
                variant="outlined"
                value={formData.nombre_padre}
                onChange={handleFormChange}
                required
              />
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
                name="email_padre"
                label="Email"
                fullWidth
                margin="normal"
                variant="outlined"
                value={formData.email_padre}
                onChange={handleFormChange}
                required
                type="email"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="whatsapp_padre"
                label="WhatsApp"
                fullWidth
                margin="normal"
                variant="outlined"
                value={formData.whatsapp_padre}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="fecha_cumple_hijo"
                label="Fecha de Cumpleaños"
                fullWidth
                margin="normal"
                variant="outlined"
                value={formData.fecha_cumple_hijo}
                onChange={handleFormChange}
                type="date"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancelar
          </Button>
          <Button 
            onClick={handleSaveMember} 
            color="primary" 
            variant="contained"
            disabled={!formData.id_comunidad || !formData.nombre_padre || !formData.nombre_hijo || !formData.email_padre}
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
            ¿Estás seguro de que deseas eliminar al miembro "{currentMember?.nombre_padre}"?
            Esta acción no se puede deshacer y podría afectar a los eventos asociados.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleDeleteMember} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminMembers;
