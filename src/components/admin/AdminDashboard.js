import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent, 
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import EventIcon from '@mui/icons-material/Event';
import CakeIcon from '@mui/icons-material/Cake';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import RefreshIcon from '@mui/icons-material/Refresh';
import supabase from '../../utils/supabaseClient';

const AdminDashboard = ({ setNotification }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    communities: 0,
    activeCommunitiesCount: 0,
    inactiveCommunitiesCount: 0,
    members: 0,
    events: 0,
    activeEvents: 0,
    pendingEvents: 0,
    completedEvents: 0,
    totalRaised: 0,
    pendingAmount: 0,
    averageContribution: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);

  // Cargar datos del dashboard
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Obtener datos del dashboard
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Obtener estadísticas de comunidades
      const { data: communities, error: communitiesError } = await supabase
        .from('comunidades')
        .select('id_comunidad, estado');
      
      if (communitiesError) throw communitiesError;
      
      // Contar comunidades activas e inactivas
      const activeCommunitiesCount = communities.filter(c => c.estado === 'activa').length;
      const inactiveCommunitiesCount = communities.filter(c => c.estado === 'inactiva').length;
      
      // Obtener estadísticas de miembros
      const { data: members, error: membersError } = await supabase
        .from('miembros')
        .select('id');
      
      if (membersError) throw membersError;
      
      // Obtener estadísticas de eventos
      const { data: events, error: eventsError } = await supabase
        .from('eventos')
        .select('id_evento');
      
      if (eventsError) throw eventsError;
      
      // Obtener estadísticas de eventos activos
      const { data: activeEvents, error: activeEventsError } = await supabase
        .from('eventos_activos')
        .select('id_evento, monto_total_recaudado, estado');
      
      if (activeEventsError) throw activeEventsError;
      
      // Filtrar eventos por estado
      const activeEventsFiltered = activeEvents.filter(e => e.estado === 'activo');
      const pendingEvents = activeEvents.filter(e => e.estado === 'pendiente').length;
      const completedEvents = activeEvents.filter(e => e.estado === 'completado').length;
      
      // Calcular monto total recaudado
      const totalRaised = activeEventsFiltered.reduce((sum, event) => sum + (parseFloat(event.monto_total_recaudado) || 0), 0);
      
      // Obtener información de aportantes para calcular montos pendientes y promedio
      const { data: aportantes, error: aportantesError } = await supabase
        .from('eventos_activos_aportantes')
        .select('id_evento, monto_individual, estado_pago');
      
      if (aportantesError) throw aportantesError;
      
      // Calcular monto pendiente de pago
      const pendingAmount = aportantes
        .filter(a => a.estado_pago === 'pendiente')
        .reduce((sum, a) => sum + (parseFloat(a.monto_individual) || 0), 0);
      
      // Calcular promedio de aporte
      const totalContributions = aportantes.length;
      const totalContributionAmount = aportantes.reduce((sum, a) => sum + (parseFloat(a.monto_individual) || 0), 0);
      const averageContribution = totalContributions > 0 ? totalContributionAmount / totalContributions : 0;
      
      // Actualizar estadísticas
      setStats({
        communities: communities.length,
        activeCommunitiesCount,
        inactiveCommunitiesCount,
        members: members.length,
        events: events.length,
        activeEvents: activeEventsFiltered.length,
        pendingEvents,
        completedEvents,
        totalRaised,
        pendingAmount,
        averageContribution
      });
      
      // Obtener actividades recientes (últimos 10 eventos activos)
      const { data: recentEvents, error: recentEventsError } = await supabase
        .from('eventos_activos')
        .select('id_evento, nombre_hijo, nombre_comunidad, fecha_cumple, fecha_creacion, estado')
        .order('fecha_creacion', { ascending: false })
        .limit(5);
      
      if (recentEventsError) throw recentEventsError;
      
      // Obtener últimos miembros añadidos
      const { data: recentMembers, error: recentMembersError } = await supabase
        .from('miembros')
        .select('id, nombre_padre, nombre_hijo, id_comunidad, fecha_creacion')
        .order('fecha_creacion', { ascending: false })
        .limit(5);
      
      if (recentMembersError) throw recentMembersError;
      
      // Combinar actividades recientes
      const activities = [
        ...recentEvents.map(event => ({
          type: 'event',
          id: event.id_evento,
          title: `Evento: ${event.nombre_hijo}`,
          description: `Comunidad: ${event.nombre_comunidad} - Estado: ${event.estado}`,
          date: event.fecha_creacion
        })),
        ...recentMembers.map(member => ({
          type: 'member',
          id: member.id,
          title: `Miembro: ${member.nombre_padre}`,
          description: `Hijo: ${member.nombre_hijo} - ID Comunidad: ${member.id_comunidad}`,
          date: member.fecha_creacion
        }))
      ];
      
      // Ordenar por fecha
      activities.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      // Limitar a 10 actividades
      setRecentActivities(activities.slice(0, 10));
      
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
      setError('No se pudieron cargar los datos del dashboard. Por favor, intenta de nuevo.');
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Si hay error, mostrar mensaje
  if (error) {
    return (
      <Alert 
        severity="error" 
        action={
          <Button color="inherit" size="small" onClick={fetchDashboardData}>
            Reintentar
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold' }}>
          Dashboard de Administración
        </Typography>
        
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />}
          onClick={fetchDashboardData}
        >
          Actualizar Datos
        </Button>
      </Box>

      {/* Tarjetas de estadísticas principales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', bgcolor: '#f5f9ff', boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PeopleAltIcon sx={{ fontSize: 40, color: '#1976d2', mr: 2 }} />
                <Typography variant="h4" component="div">
                  {stats.communities}
                </Typography>
              </Box>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Comunidades
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="body2" color="success.main">
                  Activas: {stats.activeCommunitiesCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Inactivas: {stats.inactiveCommunitiesCount}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', bgcolor: '#f5fff5', boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <GroupIcon sx={{ fontSize: 40, color: '#4caf50', mr: 2 }} />
                <Typography variant="h4" component="div">
                  {stats.members}
                </Typography>
              </Box>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Miembros
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="body2">
                  Promedio por comunidad: {stats.communities > 0 ? Math.round(stats.members / stats.communities) : 0}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', bgcolor: '#fff9f5', boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EventIcon sx={{ fontSize: 40, color: '#ff9800', mr: 2 }} />
                <Typography variant="h4" component="div">
                  {stats.events}
                </Typography>
              </Box>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Eventos
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="body2" color="success.main">
                  Activos: {stats.activeEvents}
                </Typography>
                <Typography variant="body2" color="warning.main">
                  Pendientes: {stats.pendingEvents}
                </Typography>
                <Typography variant="body2" color="info.main">
                  Completados: {stats.completedEvents}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', bgcolor: '#f5f5ff', boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <MonetizationOnIcon sx={{ fontSize: 40, color: '#9c27b0', mr: 2 }} />
                <Typography variant="h5" component="div">
                  {formatAmount(stats.totalRaised)}
                </Typography>
              </Box>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Recaudado
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="body2" color="warning.main">
                  Pendiente: {formatAmount(stats.pendingAmount)}
                </Typography>
                <Typography variant="body2" color="info.main">
                  Promedio: {formatAmount(stats.averageContribution)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Estadísticas detalladas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%', boxShadow: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
              Estadísticas Detalladas
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              Comunidades
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={4}>
                <Paper elevation={2} sx={{ p: 2, bgcolor: '#f5f9ff', textAlign: 'center' }}>
                  <Typography variant="h6">{stats.communities}</Typography>
                  <Typography variant="body2">Total</Typography>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper elevation={2} sx={{ p: 2, bgcolor: '#e8f5e9', textAlign: 'center' }}>
                  <Typography variant="h6">{stats.activeCommunitiesCount}</Typography>
                  <Typography variant="body2">Activas</Typography>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper elevation={2} sx={{ p: 2, bgcolor: '#ffebee', textAlign: 'center' }}>
                  <Typography variant="h6">{stats.inactiveCommunitiesCount}</Typography>
                  <Typography variant="body2">Inactivas</Typography>
                </Paper>
              </Grid>
            </Grid>
            
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              Miembros
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6}>
                <Paper elevation={2} sx={{ p: 2, bgcolor: '#f5fff5', textAlign: 'center' }}>
                  <Typography variant="h6">{stats.members}</Typography>
                  <Typography variant="body2">Total</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper elevation={2} sx={{ p: 2, bgcolor: '#e3f2fd', textAlign: 'center' }}>
                  <Typography variant="h6">{stats.communities > 0 ? Math.round(stats.members / stats.communities) : 0}</Typography>
                  <Typography variant="body2">Promedio por comunidad</Typography>
                </Paper>
              </Grid>
            </Grid>
            
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              Eventos
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={3}>
                <Paper elevation={2} sx={{ p: 2, bgcolor: '#fff9f5', textAlign: 'center' }}>
                  <Typography variant="h6">{stats.events}</Typography>
                  <Typography variant="body2">Total</Typography>
                </Paper>
              </Grid>
              <Grid item xs={3}>
                <Paper elevation={2} sx={{ p: 2, bgcolor: '#e8f5e9', textAlign: 'center' }}>
                  <Typography variant="h6">{stats.activeEvents}</Typography>
                  <Typography variant="body2">Activos</Typography>
                </Paper>
              </Grid>
              <Grid item xs={3}>
                <Paper elevation={2} sx={{ p: 2, bgcolor: '#fff8e1', textAlign: 'center' }}>
                  <Typography variant="h6">{stats.pendingEvents}</Typography>
                  <Typography variant="body2">Pendientes</Typography>
                </Paper>
              </Grid>
              <Grid item xs={3}>
                <Paper elevation={2} sx={{ p: 2, bgcolor: '#e0f7fa', textAlign: 'center' }}>
                  <Typography variant="h6">{stats.completedEvents}</Typography>
                  <Typography variant="body2">Completados</Typography>
                </Paper>
              </Grid>
            </Grid>
            
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              Finanzas
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Paper elevation={2} sx={{ p: 2, bgcolor: '#f3e5f5', textAlign: 'center' }}>
                  <Typography variant="h6">{formatAmount(stats.totalRaised)}</Typography>
                  <Typography variant="body2">Recaudado</Typography>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper elevation={2} sx={{ p: 2, bgcolor: '#fff8e1', textAlign: 'center' }}>
                  <Typography variant="h6">{formatAmount(stats.pendingAmount)}</Typography>
                  <Typography variant="body2">Pendiente</Typography>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper elevation={2} sx={{ p: 2, bgcolor: '#e0f7fa', textAlign: 'center' }}>
                  <Typography variant="h6">{formatAmount(stats.averageContribution)}</Typography>
                  <Typography variant="body2">Aporte promedio</Typography>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      
      {/* Actividades recientes */}
      <Paper sx={{ p: 3, mb: 4, boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
        <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 'bold' }}>
          Actividades Recientes
        </Typography>
        
        <Divider sx={{ mb: 2 }} />
        
        {recentActivities.length > 0 ? (
          <List>
            {recentActivities.map((activity, index) => (
              <React.Fragment key={`${activity.type}-${activity.id}`}>
                {index > 0 && <Divider component="li" />}
                <ListItem alignItems="flex-start">
                  <ListItemIcon>
                    {activity.type === 'event' ? <EventIcon color="primary" /> : <PeopleAltIcon color="secondary" />}
                  </ListItemIcon>
                  <ListItemText
                    primary={activity.title}
                    secondary={
                      <React.Fragment>
                        <Typography component="span" variant="body2" color="text.primary">
                          {activity.description}
                        </Typography>
                        {" — "}{formatDate(activity.date)}
                      </React.Fragment>
                    }
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
            No hay actividades recientes para mostrar.
          </Typography>
        )}
      </Paper>
      
      {/* Información del sistema */}
      <Paper sx={{ p: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
        <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 'bold' }}>
          Información del Sistema
        </Typography>
        
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
              Administrador:
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              javierhursino@gmail.com
            </Typography>
            
            <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
              Versión de la aplicación:
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              1.0.0
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
              Fecha y hora actual:
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {formatDate(new Date().toISOString())}
            </Typography>
            
            <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
              Estado del sistema:
            </Typography>
            <Typography variant="body1" sx={{ color: '#4caf50', fontWeight: 'medium' }}>
              Operativo
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default AdminDashboard;
