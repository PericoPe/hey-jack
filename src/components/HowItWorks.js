import React from 'react';
import { Box, Container, Grid, Typography, Paper, Divider } from '@mui/material';
import CreateIcon from '@mui/icons-material/Create';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { step1Image, step2Image, step3Image } from '../assets/index';

const HowItWorks = () => {
  const steps = [
    {
      number: 1,
      icon: <CreateIcon fontSize="large" color="primary" />,
      title: 'Crear la Comunidad',
      description: 'Crea tu colecta indicando el nombre, el agasajado y el monto objetivo que quieres alcanzar.',
      image: step1Image
    },
    {
      number: 2,
      icon: <GroupAddIcon fontSize="large" color="primary" />,
      title: 'Invitar a los Padres',
      description: 'Comparte el enlace o código con los padres para que se unan a la colecta fácilmente.',
      image: step2Image
    },
    {
      number: 3,
      icon: <AutoAwesomeIcon fontSize="large" color="primary" />,
      title: 'Hey-Jack! se Encarga del Resto',
      description: 'Nuestro asistente automáticamente envía recordatorios, hace seguimiento de pagos y centraliza toda la información.',
      image: step3Image
    }
  ];

  return (
    <Box 
      className="section-padding" 
      sx={{ 
        background: 'linear-gradient(180deg, #ffffff 0%, #f5f9ff 100%)'
      }}
      id="how-it-works"
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography 
            variant="h2" 
            component="h2"
            sx={{ 
              fontSize: { xs: '2rem', md: '2.5rem' },
              fontWeight: 600,
              mb: 2
            }}
          >
            Así de Fácil es Organizar una Colecta con Hey-Jack!
          </Typography>
          <Typography 
            variant="h6" 
            component="p" 
            color="text.secondary"
            sx={{ 
              maxWidth: 700, 
              mx: 'auto',
              fontSize: { xs: '1rem', md: '1.1rem' }
            }}
          >
            En solo 3 pasos simples, olvídate del estrés de coordinar colectas grupales
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {steps.map((step, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Paper
                elevation={2}
                sx={{
                  borderRadius: 4,
                  overflow: 'hidden',
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-10px)',
                    boxShadow: '0 12px 24px rgba(78, 125, 240, 0.15)'
                  }
                }}
              >
                <Box 
                  sx={{ 
                    position: 'relative',
                    height: 200,
                    backgroundColor: 'primary.light',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <Box
                    component="img"
                    src={step.image}
                    alt={`Paso ${step.number}: ${step.title}`}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 16,
                      left: 16,
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: 'primary.main',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '1.2rem',
                      boxShadow: '0 4px 8px rgba(78, 125, 240, 0.3)'
                    }}
                  >
                    {step.number}
                  </Box>
                </Box>

                <Box sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {step.icon}
                    <Typography 
                      variant="h5" 
                      component="h3" 
                      sx={{ ml: 1, fontWeight: 600 }}
                    >
                      {step.title}
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body1">
                    {step.description}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default HowItWorks;
