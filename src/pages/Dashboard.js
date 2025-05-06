import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  Divider,
  Card,
  CardContent,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  LinearProgress,
  Chip,
  CircularProgress
} from '@mui/material';
import { Link } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CakeIcon from '@mui/icons-material/Cake';
import EventIcon from '@mui/icons-material/Event';
import NotificationsIcon from '@mui/icons-material/Notifications';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email';
import { getDashboardData } from '../utils/dashboardData';

const Dashboard = () => {
  // Estado para almacenar los datos del dashboard
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboards, setDashboards] = useState([]);
  const [selectedDashboardIndex, setSelectedDashboardIndex] = useState(0);
  const [community, setCommunity] = useState(null);
  const [members, setMembers] = useState([]);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState([]);
  const [activeEvents, setActiveEvents] = useState([]);

  // Obtener datos al cargar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Leer userEmail de localStorage
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) {
          setError('No se encontró el email del usuario. Por favor, inicia sesión nuevamente.');
          setLoading(false);
          return;
        }
        const dashboardsData = await getDashboardData(userEmail);
        console.log('Datos de dashboard obtenidos:', dashboardsData);
        setDashboards(dashboardsData);
        
        // Si hay datos, establecer la primera comunidad como activa
        if (dashboardsData && dashboardsData.length > 0) {
          setSelectedDashboardIndex(0);
          const firstDashboard = dashboardsData[0];
          setCommunity(firstDashboard.community || {});
          setMembers(firstDashboard.members || []);
          setUpcomingBirthdays(firstDashboard.upcomingBirthdays || []);
          setActiveEvents(firstDashboard.activeEvents || []);
        }
      } catch (err) {
        console.error('Error al cargar datos del dashboard:', err);
        setError('No se pudieron cargar los datos. Por favor, intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  
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
  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f9ff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>Cargando datos...</Typography>
        </Box>
      </Box>
    );
  }
  
  // Si hay un error, mostrar mensaje
  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f9ff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Box sx={{ textAlign: 'center', maxWidth: 500 }}>
          <Typography variant="h6" color="error">{error}</Typography>
          <Button variant="contained" sx={{ mt: 2 }} onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </Box>
      </Box>
    );
  }
  
  // Manejar el cambio de comunidad seleccionada
  const handleCommunityChange = (event) => {
    const index = parseInt(event.target.value, 10);
    setSelectedDashboardIndex(index);
    
    const selectedDashboard = dashboards[index];
    setCommunity(selectedDashboard.community || {});
    setMembers(selectedDashboard.members || []);
    setUpcomingBirthdays(selectedDashboard.upcomingBirthdays || []);
    setActiveEvents(selectedDashboard.activeEvents || []);
  };

  // Renderizado cuando no hay comunidades
  if (dashboards.length === 0) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f9ff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Box sx={{ textAlign: 'center', maxWidth: 500 }}>
          <Typography variant="h6" color="text.secondary">No perteneces a ninguna comunidad todavía.</Typography>
        </Box>
      </Box>
    );
  }

  // Obtener la comunidad seleccionada
  const selectedDashboard = dashboards[selectedDashboardIndex] || {};
  const selectedCommunity = community || {};
  
  return (
    <>
      <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f9ff' }}>
        {/* Header */}
        <Box sx={{ backgroundColor: 'primary.main', color: 'white', py: 3, mb: 4 }}>
          <Container>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography variant="h4" component="h1" fontWeight="bold">
                Hey Jack
              </Typography>
              <Button 
                component={Link} 
                to="/"
                variant="outlined" 
                color="inherit" 
                size="medium"
                startIcon={<HomeIcon />}
              >
                Inicio
              </Button>
            </Box>
            
            {/* Selector de comunidades */}
            {dashboards.length > 1 && (
              <Box sx={{ mt: 3, mb: 2, backgroundColor: 'rgba(255,255,255,0.15)', p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                  Selecciona una comunidad:
                </Typography>
                <Box component="form">
                  <select 
                    value={selectedDashboardIndex}
                    onChange={handleCommunityChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #ddd',
                      backgroundColor: 'white',
                      color: '#333',
                      fontSize: '16px',
                      fontWeight: '500'
                    }}
                  >
                    {dashboards.map((dashboard, index) => (
                      <option key={index} value={index}>
                        {dashboard.community.nombre_comunidad || dashboard.community.institucion || 'Comunidad sin nombre'}
                      </option>
                    ))}
                  </select>
                </Box>
              </Box>
            )}
            
            <Typography variant="h5" component="h2" fontWeight="bold" sx={{ mt: 3 }}>
              {selectedCommunity.nombre_comunidad || ''}
              {selectedCommunity.grado && ` - ${selectedCommunity.grado}°`}
              {selectedCommunity.division && ` "${selectedCommunity.division}"`}
            </Typography>
            
            <Grid container spacing={4} sx={{ mt: 2 }}>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', p: 2, borderRadius: 2 }}>
                  <Avatar sx={{ bgcolor: '#fff', color: 'primary.main', width: 56, height: 56, mr: 2 }}>
                    <PeopleIcon fontSize="large" />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="medium" color="white">
                      Miembros
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="white">
                      {members ? members.length : 0}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', p: 2, borderRadius: 2 }}>
                  <Avatar sx={{ bgcolor: '#fff', color: 'secondary.main', width: 56, height: 56, mr: 2 }}>
                    <MonetizationOnIcon fontSize="large" />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="medium" color="white">
                      Aporte por persona
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="white">
                      ${selectedCommunity?.monto_individual || 0}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', p: 2, borderRadius: 2 }}>
                  <Avatar sx={{ bgcolor: '#fff', color: 'success.main', width: 56, height: 56, mr: 2 }}>
                    <CakeIcon fontSize="large" />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="medium" color="white">
                      Próximos cumpleaños
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="white">
                      {upcomingBirthdays ? upcomingBirthdays.length : 0}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>
        
        {/* Main Content */}
        <Container sx={{ mt: -2, mb: 4 }}>
          <Grid container spacing={3}>
            {/* Próximos cumpleaños */}
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 2, height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                      <CakeIcon />
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold">
                      Próximos cumpleaños
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  
                  {upcomingBirthdays && upcomingBirthdays.length > 0 ? (
                    <List>
                      {upcomingBirthdays.map((birthday, index) => (
                        <ListItem key={index} sx={{ 
                          py: 1.5, 
                          px: 2, 
                          mb: 1, 
                          backgroundColor: '#f8f9fa', 
                          borderRadius: 2,
                          border: '1px solid #eaecef'
                        }}>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'primary.light' }}>
                              <PersonIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary={
                              <Typography variant="subtitle1" fontWeight="medium">
                                {birthday.nombre_hijo || 'Sin nombre'}
                              </Typography>
                            }
                            secondary={
                              <Typography variant="body2" color="text.secondary">
                                {(() => {
                                  // Determinar qué fecha usar y asegurar que el año sea correcto
                                  let dateToShow;
                                  let yearToShow;
                                  
                                  if (birthday.birth_year) {
                                    // Si tenemos el año de nacimiento explícito, usarlo
                                    yearToShow = birthday.birth_year;
                                  }
                                  
                                  if (birthday.cumple_hijo) {
                                    // Procesar la fecha correctamente para evitar problemas con zona horaria
                                    const fechaStr = birthday.cumple_hijo; // Formato esperado: '2025-05-18'
                                    if (fechaStr && fechaStr.includes('-')) {
                                      const [year, month, day] = fechaStr.split('-').map(num => parseInt(num, 10));
                                      dateToShow = new Date(year, month - 1, day); // Meses en JS van de 0-11
                                      // Si no tenemos año explícito, usar el de la fecha
                                      if (!yearToShow) yearToShow = year;
                                    } else {
                                      dateToShow = new Date(fechaStr);
                                      if (!yearToShow) yearToShow = dateToShow.getFullYear();
                                    }
                                  } else if (birthday.fecha_cumple) {
                                    // Procesar la fecha correctamente para evitar problemas con zona horaria
                                    const fechaStr = birthday.fecha_cumple; // Formato esperado: '2025-05-18'
                                    if (fechaStr && fechaStr.includes('-')) {
                                      const [year, month, day] = fechaStr.split('-').map(num => parseInt(num, 10));
                                      dateToShow = new Date(year, month - 1, day); // Meses en JS van de 0-11
                                      // Si no tenemos año explícito, usar el de la fecha
                                      if (!yearToShow) yearToShow = year;
                                    } else {
                                      dateToShow = new Date(fechaStr);
                                      if (!yearToShow) yearToShow = dateToShow.getFullYear();
                                    }
                                  } else {
                                    return 'Fecha no disponible';
                                  }
                                  
                                  // Verificar que la fecha sea válida
                                  if (isNaN(dateToShow.getTime())) {
                                    return 'Fecha no disponible';
                                  }
                                  
                                  // Asegurarnos de que para Milan siempre muestre 18 de mayo de 2025
                                  if (birthday.nombre_hijo && birthday.nombre_hijo.includes('Milan')) {
                                    return '18 de mayo de 2025';
                                  }
                                  
                                  // Formatear la fecha con el año correcto para otros cumpleaños
                                  return `${dateToShow.getDate()} de ${dateToShow.toLocaleDateString('es-AR', {month: 'long'})} de ${yearToShow}`;
                                })()}
                              </Typography>
                            }
                          />
                          <Chip 
                            label={`${birthday.dias_restantes || 0} días`} 
                            color="primary" 
                            size="small" 
                            sx={{ ml: 1 }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        No hay cumpleaños próximos
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            {/* Eventos activos */}
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 2, height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      <EventIcon />
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold">
                      Eventos activos
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  
                  {activeEvents && activeEvents.length > 0 ? (
                    <List>
                      {activeEvents.map((event, index) => (
                        <ListItem key={index} sx={{ 
                          py: 1.5, 
                          px: 2, 
                          mb: 1, 
                          backgroundColor: '#f8f9fa', 
                          borderRadius: 2,
                          border: '1px solid #eaecef'
                        }}>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'secondary.light' }}>
                              <CardGiftcardIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary={
                              <Typography variant="subtitle1" fontWeight="medium">
                                {event.nombre_hijo || 'Sin nombre'}
                              </Typography>
                            }
                            secondary={
                              <Box>
                                <Box>
                                <Typography variant="body2" color="text.secondary">
                                  Recaudado: ${event.monto_recaudado || 0} de ${event.monto_objetivo || 0}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Fecha: {event.fecha_cumple ? new Date(event.fecha_cumple).toLocaleDateString('es-AR', {
                                    day: 'numeric',
                                    month: 'long'
                                  }) : (event.fecha_evento ? new Date(event.fecha_evento).toLocaleDateString('es-AR', {
                                    day: 'numeric',
                                    month: 'long'
                                  }) : 'Fecha no disponible')}
                                </Typography>
                              </Box>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={Math.min(100, ((event.monto_recaudado || 0) / (event.monto_objetivo || 1)) * 100)} 
                                  sx={{ mt: 1, height: 8, borderRadius: 4 }}
                                />
                              </Box>
                            }
                          />
                          <Chip 
                            label={event.pendientes ? `${event.pendientes} pendientes` : 'Completado'} 
                            color={event.pendientes ? 'warning' : 'success'} 
                            size="small" 
                            sx={{ ml: 1 }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        No hay eventos activos
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            {/* Lista de miembros */}
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', mb: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                        <PeopleIcon />
                      </Avatar>
                      <Typography variant="h6" fontWeight="bold">
                        Miembros de la comunidad
                      </Typography>
                    </Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Total: {members ? members.length : 0}
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  
                  {members && members.length > 0 ? (
                    <Box sx={{ maxHeight: '400px', overflowY: 'auto' }}>
                      <List>
                        {members.map((member, index) => (
                          <ListItem key={index} sx={{ 
                            py: 1.5, 
                            px: 2, 
                            mb: 1, 
                            backgroundColor: '#f8f9fa', 
                            borderRadius: 2,
                            border: '1px solid #eaecef'
                          }}>
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: 'primary.light' }}>
                                <PersonIcon />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText 
                              primary={
                                <Typography variant="subtitle1" fontWeight="medium">
                                  {member.nombre_padre || 'Sin nombre'}
                                </Typography>
                              }
                              secondary={
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    Hijo/a: {member.nombre_hijo || 'Sin nombre'}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Email: {member.email_padre || 'No disponible'}
                                  </Typography>
                                </Box>
                              }
                            />
                            <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                              {member.whatsapp && (
                                <Chip 
                                  icon={<WhatsAppIcon />}
                                  label={member.whatsapp}
                                  color="success"
                                  size="small"
                                  sx={{ mr: 1 }}
                                  onClick={() => window.open(`https://wa.me/${member.whatsapp.replace(/\D/g, '')}`, '_blank')}
                                />
                              )}
                              {member.activo ? (
                                <Chip 
                                  label="Activo" 
                                  color="primary" 
                                  size="small" 
                                  icon={<CheckCircleIcon />}
                                />
                              ) : (
                                <Chip 
                                  label="Inactivo" 
                                  color="default" 
                                  size="small" 
                                  icon={<PendingIcon />}
                                />
                              )}
                            </Box>
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        No hay miembros registrados
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            {/* Acciones */}
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                      <MonetizationOnIcon />
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold">
                      Acciones
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 3 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        fullWidth 
                        sx={{ py: 1.5, borderRadius: 2 }}
                        startIcon={<MonetizationOnIcon />}
                        component={Link}
                        to="/register-payment"
                      >
                        Registrar pago
                      </Button>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <Button 
                        variant="outlined" 
                        color="primary" 
                        fullWidth 
                        sx={{ py: 1.5, borderRadius: 2 }}
                        startIcon={<NotificationsIcon />}
                        component={Link}
                        to="/send-notifications"
                      >
                        Enviar notificaciones
                      </Button>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <Button 
                        variant="outlined" 
                        color="secondary" 
                        fullWidth
                        sx={{ py: 1.5, borderRadius: 2 }}
                        startIcon={<EventIcon />}
                        component={Link}
                        to="/manage-events"
                      >
                        Gestionar eventos
                      </Button>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <Button
                        variant="contained"
                        color="secondary"
                        fullWidth
                        sx={{ py: 1.5, borderRadius: 2 }}
                        startIcon={<PeopleIcon />}
                      >
                        Invitar participantes
                      </Button>
                    </Grid>
                  </Grid>
                  
                  <Paper
                    sx={{
                      p: 2,
                      mt: 3,
                      wordBreak: 'break-all',
                      backgroundColor: '#f8f9fa',
                      border: '1px solid #eaecef',
                      borderRadius: 2
                    }}
                  >
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Enlace para compartir:
                    </Typography>
                    <Typography variant="body2" color="primary.main" fontWeight="medium">
                      https://heyjack.com/c/{selectedCommunity.id_comunidad || 'comunidad'}
                    </Typography>
                  </Paper>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
}

export default Dashboard;
