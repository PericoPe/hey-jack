import React from 'react';
import { Box, Button, Container, Grid, Typography, AppBar, Toolbar } from '@mui/material';
import { Link } from 'react-router-dom';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import LoginIcon from '@mui/icons-material/Login';
import { heroImage } from '../assets/index';
// Importación condicional para evitar errores si el archivo no existe
let AnimatedTitle;
try {
  AnimatedTitle = require('./AnimatedTitle').default;
} catch (error) {
  AnimatedTitle = () => null; // Componente vacío si no se puede importar
}

const HeroSection = () => {
  return (
    <Box 
      sx={{ 
        background: 'linear-gradient(180deg, #f5f9ff 0%, #ffffff 100%)',
        pb: { xs: 2, md: 3 },
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header con título y botón de ingreso */}
      <AppBar position="static" color="transparent" elevation={0} sx={{ mb: { xs: 2, md: 3 } }}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Typography 
              variant="h5" 
              component="div" 
              sx={{ 
                fontWeight: 700, 
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              Hey-Jack! <AnimatedTitle phrases={['beta...', 'only friends']} />
            </Typography>
          </Box>
          
          <Button
            component={Link}
            to="/login"
            variant="contained"
            color="secondary"
            startIcon={<LoginIcon />}
            sx={{ 
              borderRadius: 2,
              boxShadow: '0 4px 10px rgba(255, 152, 0, 0.3)',
              '&:hover': {
                boxShadow: '0 6px 15px rgba(255, 152, 0, 0.4)'
              },
              fontWeight: 'bold'
            }}
          >
            Ingresar
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ pt: { xs: 0, md: 0 } }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography 
              variant="h1" 
              component="h1" 
              sx={{ 
                fontSize: { xs: '2.25rem', md: '3.25rem' },
                fontWeight: 700,
                lineHeight: 1.1,
                mb: 2
              }}
            >
              ¿Cansado/a de perseguir padres por la colecta de un cumple?{' '}
              <Box component="span" className="text-gradient">
                Hey-Jack! se ocupa por vos.
              </Box>
            </Typography>
            
            <Typography 
              variant="h6" 
              component="p" 
              color="text.secondary"
              sx={{ mb: 3, fontSize: { xs: '1rem', md: '1.25rem' } }}
            >
              El asistente IA de WhatsApp que simplifica las colectas grupales para cumpleaños de hijos, profes y más.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: { xs: 'wrap', sm: 'nowrap' }, mb: 2 }}>
              <Button 
                component={Link}
                to="/crear-comunidad"
                variant="contained" 
                color="secondary" 
                size="medium"
                startIcon={<WhatsAppIcon />}
                sx={{ 
                  py: 1,
                  px: 2,
                  fontSize: '1rem',
                  width: { xs: '100%', sm: 'auto' }
                }}
              >
                Crear Comunidad
              </Button>
              
              <Button
                component={Link}
                to="/unirse-comunidad"
                variant="outlined"
                color="primary"
                size="medium"
                startIcon={<GroupAddIcon />}
                sx={{ 
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  borderWidth: 1
                }}
              >
                Unirse a Comunidad
              </Button>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: { xs: 'center', sm: 'flex-start' }, mb: 1 }}>
              <Typography 
                variant="body2" 
                color="text.secondary"
              >
                Ya ayudamos a +500 padres a organizar colectas sin estrés
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box 
              sx={{ 
                display: 'flex',
                justifyContent: 'center',
                position: 'relative'
              }}
            >
              <Box 
                component="img"
                src={heroImage}
                alt="Hey Jack WhatsApp Assistant"
                className="hero-animation"
                sx={{ 
                  width: '100%',
                  maxWidth: { xs: '100%', md: '90%' },
                  borderRadius: '12px',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                  transform: { xs: 'none', md: 'translateY(-10px)' }
                }}
              />
              
              {/* Decorative elements */}
              <Box 
                sx={{
                  position: 'absolute',
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'rgba(78, 125, 240, 0.1)',
                  top: -10,
                  right: { xs: 10, md: 20 },
                  zIndex: -1
                }}
              />
              
              <Box 
                sx={{
                  position: 'absolute',
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: 'rgba(255, 152, 0, 0.1)',
                  bottom: -5,
                  left: { xs: 10, md: 20 },
                  zIndex: -1
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default HeroSection;
