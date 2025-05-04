import React, { useState, useEffect } from 'react';
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
import AdminCommunities from '../components/admin/AdminCommunities';
import AdminMembers from '../components/admin/AdminMembers';
import AdminEvents from '../components/admin/AdminEvents';
import AdminActiveEvents from '../components/admin/AdminActiveEvents';
import AdminNotifications from '../components/admin/AdminNotifications';
import AdminDashboard from '../components/admin/AdminDashboard';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import EventIcon from '@mui/icons-material/Event';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import supabase from '../utils/supabaseClient';

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
          {children}
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
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // Verificar si el usuario está autorizado
  useEffect(() => {
    const checkAuthorization = async () => {
      const adminEmail = localStorage.getItem('adminEmail');
      
      if (adminEmail === 'javierhursino@gmail.com') {
        setAuthorized(true);
      }
      
      setLoading(false);
    };
    
    checkAuthorization();
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
        // En un entorno real, aquí verificaríamos la contraseña con un sistema seguro
        // Para este ejemplo, simplemente verificamos que haya ingresado algo
        if (password.length > 0) {
          localStorage.setItem('adminEmail', email.toLowerCase());
          setAuthorized(true);
          setNotification({
            open: true,
            message: '¡Bienvenido al Panel de Administración!',
            severity: 'success'
          });
        } else {
          setError('Por favor, ingresa una contraseña');
        }
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
    setPassword('');
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
              
              <TextField
                label="Contraseña"
                type="password"
                fullWidth
                margin="normal"
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            <Box sx={{ borderBottom: 1, borderColor: 'divider', backgroundColor: '#f5f5f5' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                variant="scrollable"
                scrollButtons="auto"
                sx={{ 
                  '& .MuiTab-root': { 
                    minHeight: '64px',
                    fontSize: '0.9rem',
                    fontWeight: 'medium'
                  }
                }}
              >
                <Tab icon={<DashboardIcon />} label="Dashboard" iconPosition="start" />
                <Tab icon={<GroupWorkIcon />} label="Comunidades" iconPosition="start" />
                <Tab icon={<PeopleIcon />} label="Miembros" iconPosition="start" />
                <Tab icon={<EventIcon />} label="Eventos" iconPosition="start" />
                <Tab icon={<EventAvailableIcon />} label="Eventos Activos" iconPosition="start" />
                <Tab icon={<NotificationsIcon />} label="Notificaciones" iconPosition="start" />
              </Tabs>
            </Box>
            
            {/* Contenido de las pestañas */}
            <Box sx={{ flex: 1, overflow: 'auto' }}>
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
                <AdminNotifications setNotification={setNotification} />
              </TabPanel>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default AdminPanel;
