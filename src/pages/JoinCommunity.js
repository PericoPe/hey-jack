import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Paper,
  TextField,
  Grid,
  Divider,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GroupIcon from '@mui/icons-material/Group';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import { joinCommunity, getCommunityDetails } from '../utils/api';

const steps = ['Completar'];

const JoinCommunity = () => {
  const navigate = useNavigate();
  const { communityId } = useParams();
  const location = useLocation();
  const [activeStep, setActiveStep] = useState(0);
  const [communityCode, setCommunityCode] = useState('');
  const [joined, setJoined] = useState(false);
  const [communityDetails, setCommunityDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [formData, setFormData] = useState({
    childName: '',
    childBirthdate: '',
    parentName: '',
    whatsapp: '',
    email: '',
    mercadoPagoAlias: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    // Verificar si tenemos un ID de comunidad en la URL
    if (communityId) {
      // Decodificar el ID si es necesario
      const decodedId = decodeURIComponent(communityId);
      setCommunityCode(decodedId);
      
      // Obtener detalles de la comunidad desde el backend
      fetchCommunityDetails(decodedId);
      
      // Mostrar directamente el formulario para unirse
      setActiveStep(0);
    }
  }, [communityId, location.pathname]);
  
  // Función para obtener detalles de la comunidad desde el backend
  const fetchCommunityDetails = async (communityId) => {
    setLoadingDetails(true);
    try {
      console.log('Buscando comunidad con ID:', communityId);
      
      const response = await getCommunityDetails(communityId);
      console.log('Respuesta de getCommunityDetails:', response);
      
      // Verificar si la respuesta es exitosa
      if (response.success) {
        // Extraer las partes del ID (formato: INSTITUCION+SALAoGRADO+DIVISION+TIMESTAMP)
        const parts = communityId.split('+');
        
        if (parts.length >= 3) {
          // Extraer y formatear los componentes del ID
          const institution = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
          const gradeLevel = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
          const division = parts[2].charAt(0).toUpperCase() + parts[2].slice(1);
          
          // Configurar los detalles de la comunidad
          const communityDetails = {
            name: response.communityName || `${institution} - ${gradeLevel} - ${division}`,
            institution: response.institution || institution,
            gradeLevel: response.gradeLevel || gradeLevel,
            division: response.division || division,
            contributionAmount: response.contributionAmount || "1.500",
            communityId: communityId,
            status: response.status || 'activa',
            members: response.memberCount || 1
          };
          
          console.log('Comunidad encontrada:', communityDetails);
          setCommunityDetails(communityDetails);
        }
      } else {
        // Si no se encuentra la comunidad, mostrar un mensaje de error
        console.error('No se encontró la comunidad:', communityId);
        setSnackbar({
          open: true,
          message: response.message || 'No se encontró la comunidad',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error al obtener detalles de la comunidad:', error);
      setSnackbar({
        open: true,
        message: 'Error al conectar con el servidor: ' + (error.message || error),
        severity: 'error'
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCodeChange = (e) => {
    setCommunityCode(e.target.value);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleJoin = () => {
    // Simulación de unirse a una comunidad mediante búsqueda manual
    if (communityCode) {
      // Redireccionar a la ruta con el ID de comunidad
      navigate(`/unirse-comunidad/${communityCode}`);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!communityDetails || !communityDetails.communityId) {
      setSnackbar({
        open: true,
        message: 'No se ha seleccionado una comunidad válida',
        severity: 'error'
      });
      return;
    }
    
    // Preparar datos para enviar al backend
    const memberData = {
      ...formData,
      communityId: communityDetails.communityId
    };
    
    setLoading(true);
    try {
      const response = await joinCommunity(memberData);
      
      if (response.success) {
        setSnackbar({
          open: true,
          message: response.message || '¡Te has unido exitosamente a la comunidad!',
          severity: 'success'
        });
        
        // Redireccionar al dashboard después de un breve retraso
        setTimeout(() => {
          navigate('/dashboard', { 
            state: { 
              communityId: communityDetails.communityId,
              isCreator: false,
              communityData: communityDetails
            } 
          });
        }, 1500);
      } else {
        setSnackbar({
          open: true,
          message: response.error || 'Error al unirse a la comunidad',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error al unirse a la comunidad:', error);
      setSnackbar({
        open: true,
        message: 'Error al conectar con el servidor',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleBack = () => {
    setCommunityDetails(null);
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  const renderCommunityForm = () => {
    return (
      <Box>
        <Typography variant="h5" gutterBottom>
          ¡Te han invitado a una comunidad!
        </Typography>
        <Paper elevation={1} sx={{ p: 3, mb: 4, bgcolor: 'primary.light', color: 'primary.contrastText', borderRadius: 2 }}>
          <Typography variant="body1" sx={{ fontWeight: 'medium', mb: 1 }}>
            {communityDetails?.creatorName || 'Un organizador'} te está invitando a unirte a la comunidad
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
            {communityDetails?.name || communityCode}
          </Typography>
          <Typography variant="body2">
            Institución: <b>{communityDetails?.institution}</b><br />
            Sala/Grado: <b>{communityDetails?.gradeLevel}</b><br />
            División: <b>{communityDetails?.division}</b>
          </Typography>
        </Paper>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          Para unirte a esta comunidad, por favor completa los siguientes datos:
        </Typography>
        {communityId && (
          <Typography 
            variant="body2" 
            color="primary.main" 
            sx={{ mb: 2, fontWeight: 'medium', display: 'none' }}
          >
            URL de acceso: {window.location.origin}/unirse-comunidad/{communityId}
          </Typography>
        )}
        
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="¿Cómo se llama tu hijo/a?"
              name="childName"
              value={formData.childName}
              onChange={handleChange}
              variant="outlined"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="¿Cuándo nació tu hijo/a?"
              name="childBirthdate"
              type="date"
              value={formData.childBirthdate}
              onChange={handleChange}
              InputLabelProps={{
                shrink: true,
              }}
              variant="outlined"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="¿Cómo te llamas?"
              name="parentName"
              value={formData.parentName}
              onChange={handleChange}
              variant="outlined"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="¿Cuál es tu WhatsApp?"
              name="whatsapp"
              value={formData.whatsapp}
              onChange={handleChange}
              placeholder="Ej: +5491123456789"
              variant="outlined"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="¿Email?"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              variant="outlined"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="¿Alias Mercado Pago?"
              name="mercadoPagoAlias"
              value={formData.mercadoPagoAlias}
              onChange={handleChange}
              variant="outlined"
            />
          </Grid>
        </Grid>
        
        {/* Botón eliminado para evitar duplicación */}
      </Box>
    );
  };

  const renderSearchForm = () => {
    return (
      <>
        <Box 
          sx={{ 
            display: 'flex',
            alignItems: 'center',
            mb: 4
          }}
        >
          <Avatar 
            sx={{ 
              bgcolor: 'primary.main',
              width: 56,
              height: 56,
              mr: 2
            }}
          >
            <GroupIcon fontSize="large" />
          </Avatar>
          <Box>
            <Typography variant="h5" gutterBottom>
              Únete a una colecta existente
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Contribuye a una colecta que ya está en marcha
            </Typography>
          </Box>
        </Box>
        
        <TextField
          fullWidth
          label="Código o enlace de la comunidad"
          variant="outlined"
          value={communityCode}
          onChange={handleCodeChange}
          placeholder="Ej: instituto+sala3+roja+123456"
          sx={{ mb: 3 }}
        />
        
        <Button
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          onClick={handleJoin}
          disabled={!communityCode}
          sx={{ py: 1.5 }}
        >
          Buscar comunidad
        </Button>
        
        <Divider sx={{ my: 4 }}>
          <Typography variant="body2" color="text.secondary">
            o
          </Typography>
        </Divider>
        
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body1" gutterBottom>
            ¿Quieres crear tu propia colecta?
          </Typography>
          <Button
            component={Link}
            to="/crear-comunidad"
            variant="outlined"
            color="primary"
            sx={{ mt: 1 }}
          >
            Crear una nueva comunidad
          </Button>
        </Box>
      </>
    );
  };

  return (
    <Box sx={{ py: 8, backgroundColor: '#f5f9ff', minHeight: '100vh' }}>
      <Container maxWidth="md">
        <Box sx={{ mb: 4 }}>
          <Button
            component={Link}
            to="/"
            startIcon={<ArrowBackIcon />}
            sx={{ mb: 2 }}
          >
            Volver a inicio
          </Button>
          
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom
            fontWeight="bold"
          >
            {communityDetails ? 'Unirse a la comunidad' : 'Buscar comunidad'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {communityDetails 
              ? 'Completa tus datos para unirte a esta comunidad' 
              : 'Ingresa el código o enlace de la comunidad a la que quieres unirte'}
          </Typography>
        </Box>
        
        <Paper 
          elevation={2}
          sx={{ 
            p: { xs: 3, md: 4 },
            borderRadius: 3
          }}
        >
          {!communityId && !communityDetails ? (
            renderSearchForm()
          ) : (
            <>
              <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 5 }}>
                {steps.map((label, index) => (
                  <Step key={label}>
                    <StepLabel StepIconProps={{
                      icon: <EditIcon />
                    }}>
                      {label}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
              
              <Box sx={{ mt: 2, mb: 4 }}>
                {renderCommunityForm()}
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2, justifyContent: 'space-between' }}>
                <Button 
                  variant="outlined"
                  color="secondary"
                  size="large"
                  onClick={() => navigate('/')}
                  sx={{ py: 1.5, px: 3 }}
                >
                  Cancelar
                </Button>
                
                <Button 
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={handleSubmit}
                  sx={{ py: 1.5, px: 4, fontSize: '1.1rem' }}
                >
                  Unirme a la comunidad
                </Button>
              </Box>
            </>
          )}
        </Paper>
      </Container>
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={3000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default JoinCommunity;
