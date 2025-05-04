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
  const [data, setData] = useState({
    community: null,
    members: [],
    activeEvents: [],
    upcomingBirthdays: []
  });
  
  // Obtener datos al cargar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Leer communityId y userEmail de localStorage
        const communityId = localStorage.getItem('communityId');
        const userEmail = localStorage.getItem('userEmail');
        if (!communityId) {
          setError('No se encontró la comunidad del usuario. Por favor, inicia sesión nuevamente.');
          setLoading(false);
          return;
        }
        const dashboardData = await getDashboardData(communityId);
        setData(dashboardData);
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
  
  // Datos de la comunidad
  const { community, members, activeEvents, upcomingBirthdays } = data;
  
  // Evento activo principal (el primero si hay varios)
  const mainEvent = activeEvents && activeEvents.length > 0 ? activeEvents[0] : null;

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f9ff' }}>
      {/* Header */}
      <Box sx={{ backgroundColor: 'primary.main', color: 'white', py: 2 }}>
        <Container>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" component="h1" fontWeight="bold">
              Hey Jack
            </Typography>
            <Button 
              component={Link} 
              to="/"
              variant="outlined" 
              color="inherit" 
              size="small"
              startIcon={<HomeIcon />}
            >
              Inicio
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Container sx={{ py: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom fontWeight="bold">
          Dashboard
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          Bienvenido al dashboard de tu comunidad. Aquí puedes ver el estado de la colecta y gestionar los participantes.
        </Typography>

        {/* Community Info */}
        <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <Typography variant="h5" gutterBottom>
            {community?.nombre_comunidad || 'Mi Comunidad'}
            {community?.institucion && ` - ${community.institucion}`}
            {community?.grado && ` - ${community.grado}°`}
            {community?.division && ` "${community.division}"`}
          </Typography>
          
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <PeopleIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Miembros
                  </Typography>
                  <Typography variant="h6">
                    {members.length}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                  <MonetizationOnIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Aporte por persona
                  </Typography>
                  <Typography variant="h6">
                    ${community?.monto_individual || 0}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <CakeIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Próximos cumpleaños
                  </Typography>
                  <Typography variant="h6">
                    {upcomingBirthdays.length}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
          
          {mainEvent && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Evento activo: Cumpleaños de {mainEvent.nombre_hijo} ({formatDate(mainEvent.fecha_evento)})
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Progreso de la colecta</Typography>
                <Typography variant="body2" fontWeight="bold">
                  ${mainEvent.totalAmount || 0} / ${mainEvent.monto_objetivo || 0} ({mainEvent.progress || 0}%)
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={mainEvent.progress || 0} 
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>
          )}
        </Paper>

        {/* Main Content Grid */}
        <Grid container spacing={4}>
          {/* Active Event Contributors */}
          <Grid item xs={12} md={8}>
            <Card sx={{ borderRadius: 2, mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {mainEvent ? `Aportantes para el cumpleaños de ${mainEvent.nombre_hijo}` : 'No hay eventos activos'}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {mainEvent ? (
                  <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                    {mainEvent.contributors && mainEvent.contributors.length > 0 ? (
                      mainEvent.contributors.map((contributor) => (
                        <ListItem 
                          key={contributor.id}
                          secondaryAction={
                            <Chip 
                              icon={contributor.estado_pago === 'pagado' ? <CheckCircleIcon /> : <PendingIcon />}
                              label={contributor.estado_pago === 'pagado' ? 'Pagado' : 'Pendiente'}
                              color={contributor.estado_pago === 'pagado' ? 'success' : 'default'}
                              size="small"
                            />
                          }
                          sx={{
                            mb: 1,
                            borderRadius: 1,
                            backgroundColor: contributor.estado_pago === 'pagado' ? 'rgba(76, 175, 80, 0.08)' : 'transparent'
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar>
                              <PersonIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary={contributor.nombre_padre || 'Aportante'} 
                            secondary={
                              <>
                                {contributor.estado_pago === 'pagado' 
                                  ? `$${contributor.monto_pagado || 0} · ${formatDate(contributor.fecha_pago)}` 
                                  : `Aporte pendiente: $${contributor.monto_individual || 0}`
                                }
                                <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Chip 
                                    icon={<EmailIcon fontSize="small" />} 
                                    label={contributor.notificacion_email ? 'Notificado' : 'Pendiente'} 
                                    color={contributor.notificacion_email ? 'info' : 'default'}
                                    size="small"
                                    variant="outlined"
                                  />
                                  <Chip 
                                    icon={<WhatsAppIcon fontSize="small" />} 
                                    label={contributor.notificacion_whatsapp ? 'Notificado' : 'Pendiente'} 
                                    color={contributor.notificacion_whatsapp ? 'success' : 'default'}
                                    size="small"
                                    variant="outlined"
                                  />
                                </Box>
                              </>
                            }
                          />
                        </ListItem>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                        No hay aportantes registrados para este evento.
                      </Typography>
                    )}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                    No hay eventos activos en este momento.
                  </Typography>
                )}
              </CardContent>
            </Card>
            
            {/* Community Members */}
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Miembros de la comunidad
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {members.length > 0 ? (
                    members.map((member, index) => (
                      <ListItem 
                        key={index}
                        sx={{
                          mb: 1,
                          borderRadius: 1
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar>
                            <PersonIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary={member.nombre_padre} 
                          secondary={
                            <>
                              <Typography variant="body2" component="span">
                                Hijo/a: {member.nombre_hijo}
                              </Typography>
                              {member.cumple_hijo && (
                                <Typography variant="body2" component="div">
                                  Cumpleaños: {formatDate(member.cumple_hijo)}
                                </Typography>
                              )}
                              {member.email_padre && (
                                <Typography variant="body2" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <EmailIcon fontSize="small" color="action" /> {member.email_padre}
                                </Typography>
                              )}
                              {member.whatsapp_padre && (
                                <Typography variant="body2" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <WhatsAppIcon fontSize="small" color="success" /> {member.whatsapp_padre}
                                </Typography>
                              )}
                            </>
                          }
                        />
                      </ListItem>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                      No hay miembros registrados en esta comunidad.
                    </Typography>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Upcoming Birthdays */}
            <Card sx={{ borderRadius: 2, mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Próximos cumpleaños
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <List>
                  {upcomingBirthdays.length > 0 ? (
                    upcomingBirthdays.map((birthday, index) => (
                      <ListItem 
                        key={index}
                        sx={{
                          mb: 1,
                          borderRadius: 1,
                          backgroundColor: birthday.daysRemaining <= 15 ? 'rgba(255, 152, 0, 0.08)' : 'transparent'
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: birthday.daysRemaining <= 15 ? 'warning.main' : 'primary.light' }}>
                            <CakeIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary={birthday.nombre_hijo} 
                          secondary={
                            <>
                              <Typography variant="body2" component="div">
                                {formatDate(birthday.nextBirthday)}
                              </Typography>
                              <Chip 
                                size="small" 
                                label={`En ${birthday.daysRemaining} días`} 
                                color={birthday.daysRemaining <= 15 ? 'warning' : 'primary'}
                                sx={{ mt: 0.5 }}
                              />
                            </>
                          }
                        />
                      </ListItem>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                      No hay próximos cumpleaños registrados.
                    </Typography>
                  )}
                </List>
              </CardContent>
            </Card>
            
            {/* Actions */}
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Acciones
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Button 
                  variant="contained" 
                  color="primary" 
                  fullWidth 
                  sx={{ mb: 2 }}
                  startIcon={<MonetizationOnIcon />}
                  component={Link}
                  to="/register-payment"
                >
                  Registrar pago
                </Button>
                
                <Button 
                  variant="outlined" 
                  color="primary" 
                  fullWidth 
                  sx={{ mb: 2 }}
                  startIcon={<NotificationsIcon />}
                  component={Link}
                  to="/send-notifications"
                >
                  Enviar notificaciones
                </Button>
                
                <Button 
                  variant="outlined" 
                  color="secondary" 
                  fullWidth
                  startIcon={<EventIcon />}
                  component={Link}
                  to="/manage-events"
                >
                  Gestionar eventos
                </Button>
                
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  startIcon={<PeopleIcon />}
                  sx={{ mb: 2 }}
                >
                  Invitar participantes
                </Button>
                
                <Button
                  variant="outlined"
                  color="secondary"
                  fullWidth
                  startIcon={<CardGiftcardIcon />}
                  sx={{ mb: 2 }}
                >
                  Explorar regalos
                </Button>
                
                <Divider sx={{ my: 3 }} />
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  Comparte el enlace de tu comunidad para que más personas puedan unirse:
                </Typography>
                
                <Paper
                  elevation={0}
                  sx={{ 
                    p: 2, 
                    backgroundColor: 'rgba(78, 125, 240, 0.05)',
                    border: '1px dashed rgba(78, 125, 240, 0.3)',
                    borderRadius: 2,
                    wordBreak: 'break-all'
                  }}
                >
                  <Typography variant="body2" color="primary.main">
                    https://heyjack.com/c/escuela-san-martin-3er-grado-a
                  </Typography>
                </Paper>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;
