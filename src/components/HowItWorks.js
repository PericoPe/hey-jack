import React from 'react';
import { Box, Container, Grid, Typography, Paper, Divider } from '@mui/material';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import SmartToyIcon from '@mui/icons-material/SmartToy';


const HowItWorks = () => {
  const steps = [
    {
      number: 1,
      icon: <GroupAddIcon style={{ fontSize: 80, color: "#1976d2" }} />,
      title: 'Crear la Comunidad',
      description: 'Crea tu colecta indicando el nombre, el agasajado y el monto objetivo que quieres alcanzar.'
    },
    {
      number: 2,
      icon: <MailOutlineIcon style={{ fontSize: 80, color: "#1976d2" }} />,
      title: 'Invitar a los Padres',
      description: 'Comparte el enlace o código con los padres para que se unan a la colecta fácilmente.'
    },
    {
      number: 3,
      icon: <SmartToyIcon style={{ fontSize: 80, color: "#1976d2" }} />,
      title: 'Hey-Jack! se Encarga del Resto',
      description: 'Nuestro asistente automáticamente recauda dinero, automatiza próximos eventos y encuentra el mejor regalo.'
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
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pt: 4 }}>
                  <Box sx={{ position: 'relative', mb: 2 }}>
                    {step.icon}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
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
