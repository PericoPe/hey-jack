import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import EmailIcon from '@mui/icons-material/Email';
import LoginIcon from '@mui/icons-material/Login';
import PersonIcon from '@mui/icons-material/Person';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import supabase from '../utils/supabaseClient';

// Lista de emails registrados para pruebas
const testEmails = [
  { email: 'pale@intramed.net', name: 'Pale', communityId: '1' },
  { email: 'ursino.julieta@gmail.com', name: 'Julieta', communityId: '1' },
  { email: 'irene.candido@gmail.com', name: 'Irene', communityId: '1' },
  { email: 'piero.gildelvalle@gmail.com', name: 'Piero', communityId: '1' },
  { email: 'javier@example.com', name: 'Javier', communityId: '1' },
  { email: 'javierhursino@gmail.com', name: 'Javier Hursino', communityId: 'admin' }
];

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Manejar cambio en el campo de email
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setError('');
  };
  
  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Caso especial para javierhursino@gmail.com (administrador)
    if (email.toLowerCase() === 'javierhursino@gmail.com') {
      console.log('Usuario administrador detectado: javierhursino@gmail.com');
      setSuccess(true);
      // Guardar email en localStorage sin communityId para que se muestren todas las comunidades
      localStorage.removeItem('communityId'); // Eliminar communityId para mostrar todas las comunidades
      localStorage.setItem('userEmail', 'javierhursino@gmail.com');
      // Redirigir al dashboard después de un breve retraso
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
      setLoading(false);
      return;
    }
    
    // Verificar si el email está en la lista de prueba
    const testUser = testEmails.find(user => user.email.toLowerCase() === email.toLowerCase());
    if (testUser) {
      console.log('Usuario de prueba encontrado:', testUser);
      setSuccess(true);
      // Guardar communityId y email en localStorage para test user
      localStorage.setItem('communityId', testUser.communityId || '1');
      localStorage.setItem('userEmail', testUser.email);
      // Redirigir al dashboard después de un breve retraso
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
      setLoading(false);
      return;
    }
    
    try {
      // Verificar si el email existe en la base de datos
      console.log('Verificando email en base de datos:', email);
      const { data, error: dbError } = await supabase
        .from('miembros')
        .select('id_comunidad, nombre_padre')
        .eq('email_padre', email);
      
      if (dbError || !data || data.length === 0) {
        console.error('Error o sin resultados al buscar email:', dbError);
        setError('Email no encontrado. Por favor, verifica que sea correcto.');
      } else {
        // Email encontrado en la base de datos
        console.log('Email encontrado en la base de datos:', data);
        setSuccess(true);
        // Guardar communityId y email en localStorage para usuario real
        if (data && data.length > 0 && data[0].id_comunidad) {
          localStorage.setItem('communityId', data[0].id_comunidad);
          localStorage.setItem('userEmail', email);
        } else {
          // Si no hay communityId, solo guardar el email
          localStorage.removeItem('communityId');
          localStorage.setItem('userEmail', email);
        }
        // Redirigir al dashboard después de un breve retraso
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }
    } catch (error) {
      console.error('Error al verificar email:', error);
      setError('Ocurrió un error al verificar el email. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };
  
  // Manejar clic en un email de prueba
  const handleTestEmailClick = (testEmail) => {
    setEmail(testEmail);
    setError('');
  };
  
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f9ff', py: 4 }}>
      <Container maxWidth="sm">
        <Button 
          component={Link} 
          to="/" 
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 4 }}
        >
          Volver al inicio
        </Button>
        
        <Paper sx={{ p: 4, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" color="primary">
              Hey Jack
            </Typography>
            <Typography variant="body1" color="text.secondary" align="center">
              Ingresa tu email para acceder a tu comunidad
            </Typography>
          </Box>
          
          {success ? (
            <Alert severity="success" sx={{ mb: 3 }}>
              ¡Inicio de sesión exitoso! Redirigiendo al dashboard...
            </Alert>
          ) : (
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email"
                variant="outlined"
                type="email"
                value={email}
                onChange={handleEmailChange}
                required
                error={!!error}
                helperText={error}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: <EmailIcon color="action" sx={{ mr: 1 }} />
                }}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
                sx={{ py: 1.5 }}
              >
                {loading ? 'Verificando...' : 'Ingresar'}
              </Button>
            </form>
          )}
        </Paper>
        
        <Paper sx={{ mt: 4, p: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Emails registrados para pruebas
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Haz clic en cualquiera de estos emails para probar el ingreso:
          </Typography>
          
          <Divider sx={{ mb: 2 }} />
          
          <List>
            {testEmails.map((user, index) => (
              <ListItem 
                key={index} 
                button 
                onClick={() => handleTestEmailClick(user.email)}
                sx={{ 
                  borderRadius: 1,
                  mb: 1,
                  '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                }}
              >
                <ListItemAvatar>
                  <Avatar>
                    <PersonIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary={user.name} 
                  secondary={user.email} 
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
