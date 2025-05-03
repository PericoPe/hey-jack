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
  Snackbar
} from '@mui/material';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GroupIcon from '@mui/icons-material/Group';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';

const steps = ['Completar'];

const JoinCommunity = () => {
  const navigate = useNavigate();
  const { communityId } = useParams();
  const location = useLocation();
  const [activeStep, setActiveStep] = useState(0);
  const [communityCode, setCommunityCode] = useState('');
  const [joined, setJoined] = useState(false);
  const [communityDetails, setCommunityDetails] = useState(null);
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
      
      // Extraer las partes del ID (formato: INSTITUCION+SALAoGRADO+DIVISION+TIMESTAMP)
      const parts = decodedId.split('+');
      
      if (parts.length >= 3) {
        // Extraer y formatear los componentes del ID
        const institution = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
        const gradeLevel = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
        const division = parts[2].charAt(0).toUpperCase() + parts[2].slice(1);
        
        // Configurar los detalles de la comunidad
        setCommunityDetails({
          name: `${institution} - ${gradeLevel} - ${division}`,
          institution: institution,
          gradeLevel: gradeLevel,
          division: division,
          contributionAmount: "1.500",
          communityId: decodedId
        });
      }
    }
  }, [communityId, location.pathname]);

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
  
  const handleNext = () => {
    // Simulación de completar el proceso
    setJoined(true);
    setSnackbar({
      open: true,
      message: '¡Te has unido exitosamente a la comunidad!',
      severity: 'success'
    });
    
    // Redireccionar al dashboard después de un breve retraso
    setTimeout(() => {
      navigate('/dashboard');
    }, 1500);
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
          Completa tus datos
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Para unirte a la comunidad {communityDetails?.name || communityCode}, necesitamos algunos datos.
        </Typography>
        {communityId && (
          <Typography 
            variant="body2" 
            color="primary.main" 
            sx={{ mb: 2, fontWeight: 'medium' }}
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
          {communityDetails ? (
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
              
              <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                <Button
                  color="inherit"
                  onClick={handleBack}
                  sx={{ mr: 1 }}
                >
                  Atrás
                </Button>
                <Box sx={{ flex: '1 1 auto' }} />
                
                <Button 
                  variant="contained"
                  onClick={handleNext}
                >
                  Siguiente
                </Button>
              </Box>
            </>
          ) : (
            renderSearchForm()
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
