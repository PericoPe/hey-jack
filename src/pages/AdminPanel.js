import React, { useState, useEffect, lazy, Suspense } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Tabs, 
  Tab, 
  Button, 
  TextField,
  Alert,
  CircularProgress,
  Snackbar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Importaciones de iconos
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import EventIcon from '@mui/icons-material/Event';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SyncIcon from '@mui/icons-material/Sync';
import LogoutIcon from '@mui/icons-material/Logout';
import BugReportIcon from '@mui/icons-material/BugReport';

// Importaciones con carga diferida para mejorar el rendimiento inicial
const AdminDashboard = lazy(() => import('../components/admin/AdminDashboard'));
const AdminCommunities = lazy(() => import('../components/admin/AdminCommunities'));
const AdminMembers = lazy(() => import('../components/admin/AdminMembers'));
const AdminEvents = lazy(() => import('../components/admin/AdminEvents'));
const AdminActiveEvents = lazy(() => import('../components/admin/AdminActiveEvents'));
const AdminNotifications = lazy(() => import('../components/admin/AdminNotifications'));
const AdminSyncTools = lazy(() => import('../components/admin/AdminSyncTools'));
const AdminNotificationTools = lazy(() => import('../components/admin/AdminNotificationTools'));
const AdminDiagnostic = lazy(() => import('../components/admin/AdminDiagnostic'));

// Componente TabPanel para mostrar el contenido de cada pestaña
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
      style={{ width: '100%' }}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>}>
            {children}
          </Suspense>
        </Box>
      )}
    </div>
  );
}

const AdminPanel = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // Verificar si el usuario está autorizado - versión optimizada
  useEffect(() => {
    const adminEmail = localStorage.getItem('adminEmail');
    
    if (adminEmail === 'javierhursino@gmail.com') {
      setAuthorized(true);
    }
    
    setLoading(false);
  }, []);

  // Manejar cambio de pestaña
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Manejar inicio de sesión
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (email.toLowerCase() === 'javierhursino@gmail.com') {
        localStorage.setItem('adminEmail', email.toLowerCase());
        setAuthorized(true);
        setNotification({
          open: true,
          message: '¡Bienvenido al Panel de Administración!',
          severity: 'success'
        });
      } else {
        setError('Email no autorizado para acceder al panel de administración');
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      setError('Ocurrió un error al iniciar sesión. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Manejar cierre de sesión
  const handleLogout = () => {
    localStorage.removeItem('adminEmail');
    setAuthorized(false);
    setEmail('');
    setNotification({
      open: true,
      message: 'Has cerrado sesión correctamente',
      severity: 'info'
    });
  };

  // Cerrar notificación
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Si está cargando, mostrar indicador
  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f9ff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>Cargando panel de administración...</Typography>
        </Box>
      </Box>
    );
  }

  // Si no está autorizado, mostrar formulario de inicio de sesión
  if (!authorized) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f9ff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Container maxWidth="sm">
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#4e7df0' }}>
                Panel de Administración
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Hey Jack - Acceso de Administrador
              </Typography>
            </Box>
            
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            <form onSubmit={handleLogin}>
              <TextField
                label="Email de Administrador"
                type="email"
                fullWidth
                margin="normal"
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              

              
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                sx={{ mt: 3, mb: 2, py: 1.5 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Iniciar Sesión'}
              </Button>
            </form>
            
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button
                variant="text"
                color="primary"
                onClick={() => navigate('/')}
                startIcon={<DashboardIcon />}
              >
                Volver a la página principal
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    );
  }

  // Panel de administración
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f9ff' }}>
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
      
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 64px)' }}>
            {/* Encabezado */}
            <Box sx={{ p: 3, backgroundColor: '#4e7df0', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                Panel de Administración - Hey Jack
              </Typography>
              
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleLogout}
                startIcon={<LogoutIcon />}
                sx={{ borderColor: 'rgba(255,255,255,0.5)' }}
              >
                Cerrar Sesión
              </Button>
            </Box>
            
            {/* Pestañas */}
            {authorized && (
              <Box sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 2, overflow: 'hidden' }}>
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  variant="scrollable"
                  scrollButtons="auto"
                  aria-label="admin tabs"
                  sx={{
                    borderBottom: 1,
                    borderColor: 'divider',
                    bgcolor: '#f5f9ff',
                    '& .MuiTab-root': {
                      py: 2,
                      minHeight: 64
                    }
                  }}
                >
                  <Tab 
                    icon={<DashboardIcon />} 
                    label="Dashboard" 
                    iconPosition="start"
                    sx={{ flexDirection: 'row', alignItems: 'center' }}
                  />
                  <Tab 
                    icon={<GroupWorkIcon />} 
                    label="Comunidades" 
                    iconPosition="start"
                    sx={{ flexDirection: 'row', alignItems: 'center' }}
                  />
                  <Tab 
                    icon={<PeopleIcon />} 
                    label="Miembros" 
                    iconPosition="start"
                    sx={{ flexDirection: 'row', alignItems: 'center' }}
                  />
                  <Tab 
                    icon={<EventIcon />} 
                    label="Eventos" 
                    iconPosition="start"
                    sx={{ flexDirection: 'row', alignItems: 'center' }}
                  />
                  <Tab 
                    icon={<EventAvailableIcon />} 
                    label="Eventos Activos" 
                    iconPosition="start"
                    sx={{ flexDirection: 'row', alignItems: 'center' }}
                  />
                  <Tab 
                    icon={<NotificationsIcon />} 
                    label="Notificaciones" 
                    iconPosition="start"
                    sx={{ flexDirection: 'row', alignItems: 'center' }}
                  />
                  <Tab 
                    icon={<SyncIcon />} 
                    label="Sincronización" 
                    iconPosition="start"
                    sx={{ flexDirection: 'row', alignItems: 'center' }}
                  />
                  <Tab 
                    icon={<BugReportIcon />} 
                    label="Diagnóstico" 
                    iconPosition="start"
                    sx={{ flexDirection: 'row', alignItems: 'center' }}
                  />
                </Tabs>
                
                <TabPanel value={tabValue} index={0}>
                  <AdminDashboard setNotification={setNotification} />
                </TabPanel>
                
                <TabPanel value={tabValue} index={1}>
                  <AdminCommunities setNotification={setNotification} />
                </TabPanel>
                
                <TabPanel value={tabValue} index={2}>
                  <AdminMembers setNotification={setNotification} />
                </TabPanel>
                
                <TabPanel value={tabValue} index={3}>
                  <AdminEvents setNotification={setNotification} />
                </TabPanel>
                
                <TabPanel value={tabValue} index={4}>
                  <AdminActiveEvents setNotification={setNotification} />
                </TabPanel>
                
                <TabPanel value={tabValue} index={5}>
                  <AdminNotificationTools setNotification={setNotification} />
                </TabPanel>
                
                <TabPanel value={tabValue} index={6}>
                  <AdminSyncTools setNotification={setNotification} />
                </TabPanel>
                
                <TabPanel value={tabValue} index={7}>
                  <AdminDiagnostic setNotification={setNotification} />
                </TabPanel>
              </Box>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default AdminPanel;
