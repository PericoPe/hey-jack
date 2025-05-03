import React from 'react';
import { Box, Button, Container, Grid, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import { heroImage } from '../assets/index';

const HeroSection = () => {
  return (
    <Box 
      sx={{ 
        background: 'linear-gradient(180deg, #f5f9ff 0%, #ffffff 100%)',
        pt: { xs: 8, md: 12 },
        pb: { xs: 8, md: 12 }
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography 
              variant="h1" 
              component="h1" 
              gutterBottom
              sx={{ 
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                fontWeight: 700,
                lineHeight: 1.2
              }}
            >
              ¿Cansado/a de perseguir padres por la colecta de un cumple?{' '}
              <Box component="span" className="text-gradient">
                Hey Jack al rescate.
              </Box>
            </Typography>
            
            <Typography 
              variant="h6" 
              component="p" 
              color="text.secondary"
              sx={{ mb: 4, fontSize: { xs: '1rem', md: '1.25rem' } }}
            >
              El asistente IA de WhatsApp que simplifica las colectas grupales para cumpleaños de hijos, profes y más.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
              <Button 
                component={Link}
                to="/crear-comunidad"
                variant="contained" 
                color="secondary" 
                size="large"
                startIcon={<WhatsAppIcon />}
                sx={{ 
                  py: 1.5,
                  px: 3,
                  fontSize: '1.1rem',
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
                size="large"
                startIcon={<GroupAddIcon />}
                sx={{ 
                  py: 1.5,
                  px: 3,
                  fontSize: '1.1rem',
                  width: { xs: '100%', sm: 'auto' }
                }}
              >
                Unirse a Comunidad
              </Button>
            </Box>
            
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ mt: 3, display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', sm: 'flex-start' } }}
            >
              Ya ayudamos a +500 padres a organizar colectas sin estrés
            </Typography>
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
                  maxWidth: 500,
                  height: 'auto',
                  borderRadius: 4,
                  boxShadow: '0 20px 40px rgba(78, 125, 240, 0.15)'
                }}
              />
              
              {/* Decorative elements */}
              <Box 
                sx={{
                  position: 'absolute',
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  background: 'rgba(78, 125, 240, 0.1)',
                  top: -20,
                  right: { xs: 20, md: 40 },
                  zIndex: -1
                }}
              />
              
              <Box 
                sx={{
                  position: 'absolute',
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'rgba(255, 152, 0, 0.1)',
                  bottom: -10,
                  left: { xs: 20, md: 40 },
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
