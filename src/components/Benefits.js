import React from 'react';
import { Box, Container, Grid, Typography, Card, CardContent } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import SecurityIcon from '@mui/icons-material/Security';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';

const Benefits = () => {
  const benefits = [
    {
      icon: <AccessTimeIcon fontSize="large" color="primary" />,
      title: 'Ahorro de Tiempo y Esfuerzo',
      description: 'Automatización de recordatorios y seguimiento, para que puedas enfocarte en lo importante.'
    },
    {
      icon: <VisibilityIcon fontSize="large" color="primary" />,
      title: 'Transparencia Total',
      description: 'Todos los participantes pueden ver quién pagó y cuánto falta para alcanzar el objetivo.'
    },
    {
      icon: <PhoneAndroidIcon fontSize="large" color="primary" />,
      title: 'Comodidad Absoluta',
      description: 'Todo dentro de WhatsApp, la herramienta que ya usas a diario. Sin necesidad de descargar otra app.'
    },
    {
      icon: <SecurityIcon fontSize="large" color="primary" />,
      title: 'Seguridad Garantizada',
      description: 'Integración con plataformas de pago confiables para que cada transacción sea segura.'
    },
    {
      icon: <TouchAppIcon fontSize="large" color="primary" />,
      title: 'Facilidad de Uso',
      description: 'Interfaz conversacional intuitiva. Si sabes usar WhatsApp, ya sabes usar Hey-Jack!.'
    },
    {
      icon: <CardGiftcardIcon fontSize="large" color="primary" />,
      title: 'Encuentra el Regalo Perfecto',
      description: 'Integración con tiendas online para encontrar y comprar el regalo ideal con un solo click.'
    }
  ];

  return (
    <Box className="section-padding" sx={{ background: '#ffffff' }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography 
            variant="h2" 
            component="h2"
            sx={{ 
              fontSize: { xs: '2rem', md: '2.5rem' },
              fontWeight: 600,
              mb: 2
            }}
          >
            ¿Por qué elegir{' '}
            <Box component="span" className="text-gradient">
              Hey-Jack!
            </Box>
            {' '}para tu próxima colecta?
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
            Descubre cómo nuestro asistente hace que organizar colectas sea más fácil que nunca
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {benefits.map((benefit, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card 
                elevation={0}
                sx={{ 
                  height: '100%',
                  borderRadius: 3,
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 8px 16px rgba(78, 125, 240, 0.15)',
                    transform: 'translateY(-5px)',
                    borderColor: 'primary.light'
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box 
                    sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      backgroundColor: 'rgba(78, 125, 240, 0.1)',
                      mb: 2
                    }}
                  >
                    {benefit.icon}
                  </Box>
                  <Typography 
                    variant="h5" 
                    component="h3" 
                    gutterBottom
                    sx={{ fontWeight: 600 }}
                  >
                    {benefit.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {benefit.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Benefits;
