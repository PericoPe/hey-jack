import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Stepper, 
  Step, 
  StepLabel, 
  Button, 
  Paper,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Snackbar,
  Alert
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CreateIcon from '@mui/icons-material/Create';
import EditIcon from '@mui/icons-material/Edit';
import ShareIcon from '@mui/icons-material/Share';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const steps = ['Crear', 'Completar', 'Compartir'];

const CreateCommunity = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [formData, setFormData] = useState({
    institution: '',
    gradeLevel: '',
    division: '',
    contributionAmount: '',
    childName: '',
    childBirthdate: '',
    parentName: '',
    whatsapp: '',
    email: '',
    mercadoPagoAlias: '',
    communityId: ''
  });

  const handleNext = () => {
    if (activeStep === 0) {
      // Generar ID único para la comunidad en el primer paso
      const uniqueId = generateCommunityId();
      setFormData(prev => ({ ...prev, communityId: uniqueId }));
    }
    
    if (activeStep === steps.length - 1) {
      // Aquí iría la lógica para guardar los datos y redirigir al dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const formatNumber = (value) => {
    // Eliminar caracteres no numéricos
    const numericValue = value.replace(/[^0-9]/g, '');
    
    // Formatear con separador de miles
    if (numericValue) {
      return new Intl.NumberFormat('es-AR').format(parseInt(numericValue));
    }
    return '';
  };
  
  const handleAmountChange = (e) => {
    const formattedValue = formatNumber(e.target.value);
    setFormData({
      ...formData,
      contributionAmount: formattedValue
    });
  };
  
  const handleCopyLink = () => {
    const link = generateCommunityLink();
    navigator.clipboard.writeText(link);
    setSnackbar({
      open: true,
      message: '¡Enlace copiado al portapapeles!',
      severity: 'success'
    });
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };
  
  // Función para generar un ID único para la comunidad
  const generateCommunityId = () => {
    // Convertir a minúsculas, reemplazar espacios y caracteres especiales
    const institutionSlug = formData.institution.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
      .replace(/\s+/g, '') // Eliminar espacios
      .replace(/[^a-z0-9]/g, ''); // Solo permitir letras y números
      
    const gradeLevelSlug = formData.gradeLevel.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '')
      .replace(/[^a-z0-9]/g, '');
      
    const divisionSlug = formData.division.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '')
      .replace(/[^a-z0-9]/g, '');
    
    // Añadir un timestamp como variable adicional para garantizar unicidad
    const timestamp = new Date().getTime().toString().slice(-6);
    
    // Generar el ID único con el formato INSTITUCION+SALAoGRADO+DIVISION+TIMESTAMP
    return `${institutionSlug}+${gradeLevelSlug}+${divisionSlug}+${timestamp}`;
  };
  
  // Función para generar el enlace completo de la comunidad
  const generateCommunityLink = () => {
    // Si ya tenemos un ID de comunidad, lo usamos
    if (formData.communityId) {
      return `${window.location.origin}/unirse-comunidad/${formData.communityId}`;
    }
    
    // Si no tenemos ID (no debería ocurrir), generamos uno nuevo
    const communityId = generateCommunityId();
    return `${window.location.origin}/unirse-comunidad/${communityId}`;
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h5" gutterBottom>
              Crea tu comunidad
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Comienza configurando los detalles básicos de tu colecta.
            </Typography>
            
            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="¿A qué institución corresponde?"
                  name="institution"
                  value={formData.institution}
                  onChange={handleChange}
                  placeholder="Ej: Escuela San Martín"
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>¿Sala o Grado?</InputLabel>
                  <Select
                    name="gradeLevel"
                    value={formData.gradeLevel}
                    onChange={handleChange}
                    label="¿Sala o Grado?"
                  >
                    <MenuItem value="Maternal">Maternal</MenuItem>
                    <MenuItem value="Sala 3">Sala 3</MenuItem>
                    <MenuItem value="Sala 4">Sala 4</MenuItem>
                    <MenuItem value="Sala 5">Sala 5</MenuItem>
                    <MenuItem value="1er. Grado">1er. Grado</MenuItem>
                    <MenuItem value="2do. Grado">2do. Grado</MenuItem>
                    <MenuItem value="3er. Grado">3er. Grado</MenuItem>
                    <MenuItem value="4to. Grado">4to. Grado</MenuItem>
                    <MenuItem value="5to. Grado">5to. Grado</MenuItem>
                    <MenuItem value="6to. Grado">6to. Grado</MenuItem>
                    <MenuItem value="7mo. Grado">7mo. Grado</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="¿División?"
                  name="division"
                  value={formData.division}
                  onChange={handleChange}
                  placeholder="Ej: Rojo, Verde, A, B, etc."
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="¿Cuánto aporta cada persona por regalo?"
                  name="contributionAmount"
                  value={formData.contributionAmount}
                  onChange={handleAmountChange}
                  placeholder="Ej: 1.000, 10.000"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h5" gutterBottom>
              Completa los detalles
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Información personal para gestionar la colecta.
            </Typography>
            
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
      case 2:
        return (
          <Box>
            <Typography variant="h5" gutterBottom>
              ¡Listo para compartir!
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Tu comunidad ha sido creada. Comparte el enlace con los participantes.
            </Typography>
            
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                mt: 3,
                mb: 4,
                borderRadius: 2,
                backgroundColor: 'rgba(78, 125, 240, 0.05)',
                border: '1px dashed rgba(78, 125, 240, 0.3)'
              }}
            >
              <Typography variant="body2" gutterBottom>
                Enlace para compartir:
              </Typography>
              <Typography 
                variant="subtitle1" 
                fontWeight="bold"
                sx={{ 
                  wordBreak: 'break-all',
                  color: 'primary.main'
                }}
              >
                {generateCommunityLink()}
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ mt: 2 }}
              >
                ID único de la comunidad: <span style={{ fontWeight: 'bold' }}>{formData.communityId}</span>
              </Typography>
            </Paper>
            
            <Button
              variant="contained"
              color="success"
              startIcon={<WhatsAppIcon />}
              fullWidth
              size="large"
              sx={{ mb: 2, py: 1.5 }}
              component="a"
              href={`https://wa.me/?text=¡Hola! Te invito a unirte a nuestra colecta en Hey Jack: ${generateCommunityLink()}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Compartir por WhatsApp
            </Button>
            
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              size="large"
              sx={{ py: 1.5 }}
              startIcon={<ContentCopyIcon />}
              onClick={handleCopyLink}
            >
              Copiar enlace
            </Button>
          </Box>
        );
      default:
        return 'Paso desconocido';
    }
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
            Crear una nueva comunidad
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Sigue los pasos para configurar tu colecta y empezar a recibir aportes.
          </Typography>
        </Box>
        
        <Paper 
          elevation={2}
          sx={{ 
            p: { xs: 3, md: 4 },
            borderRadius: 3
          }}
        >
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 5 }}>
            {steps.map((label, index) => {
              const stepProps = {};
              const labelProps = {};
              
              return (
                <Step key={label} {...stepProps}>
                  <StepLabel 
                    {...labelProps}
                    StepIconProps={{
                      icon: index === 0 ? <CreateIcon /> : 
                             index === 1 ? <EditIcon /> : 
                             <ShareIcon />
                    }}
                  >
                    {label}
                  </StepLabel>
                </Step>
              );
            })}
          </Stepper>
          
          <Box sx={{ mt: 2, mb: 4 }}>
            {getStepContent(activeStep)}
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
            <Button
              color="inherit"
              disabled={activeStep === 0}
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
              {activeStep === steps.length - 1 ? 'Finalizar' : 'Siguiente'}
            </Button>
          </Box>
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

export default CreateCommunity;
