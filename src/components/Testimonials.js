import React from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, Avatar, Rating } from '@mui/material';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';

const Testimonials = () => {
  const testimonials = [
    {
      name: 'María González',
      role: 'Madre de 2 hijos',
      avatar: 'MG',
      rating: 5,
      text: 'Hey-Jack! me salvó de la locura de organizar la colecta para el regalo de la maestra. Todo fue tan fácil y rápido que no podía creerlo. ¡Definitivamente lo usaré para todas las colectas futuras!'
    },
    {
      name: 'Carlos Rodríguez',
      role: 'Padre delegado de curso',
      avatar: 'CR',
      rating: 5,
      text: 'Como delegado de curso, siempre me tocaba perseguir a los padres para las colectas. Con Hey-Jack!, todo el proceso fue automatizado y transparente. ¡Una maravilla!'
    },
    {
      name: 'Ana Martínez',
      role: 'Madre de un niño de primaria',
      avatar: 'AM',
      rating: 4,
      text: 'La facilidad de usar WhatsApp para organizar la colecta fue lo que más me gustó. No tuve que descargar otra aplicación ni crear nuevas cuentas. Todo muy intuitivo.'
    }
  ];

  return (
    <Box className="section-padding" sx={{ background: '#f5f9ff' }}>
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
            Lo que dicen los padres que ya usan Hey-Jack!
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
            Más de 500 padres ya han simplificado sus colectas con nuestra plataforma
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {testimonials.map((testimonial, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card 
                className="testimonial-card"
                elevation={2}
                sx={{ 
                  height: '100%',
                  borderRadius: 3,
                  position: 'relative',
                  overflow: 'visible'
                }}
              >
                <Box 
                  sx={{
                    position: 'absolute',
                    top: -20,
                    left: 20,
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: 'primary.main',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: 'white',
                    boxShadow: '0 4px 8px rgba(78, 125, 240, 0.3)'
                  }}
                >
                  <FormatQuoteIcon />
                </Box>
                
                <CardContent sx={{ p: 4, pt: 5 }}>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      mb: 3,
                      fontStyle: 'italic',
                      minHeight: 120
                    }}
                  >
                    "{testimonial.text}"
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: 'primary.main',
                        mr: 2
                      }}
                    >
                      {testimonial.avatar}
                    </Avatar>
                    
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {testimonial.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {testimonial.role}
                      </Typography>
                      <Rating value={testimonial.rating} readOnly size="small" sx={{ mt: 0.5 }} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        <Box 
          sx={{ 
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mt: 6,
            p: 3,
            borderRadius: 2,
            backgroundColor: 'rgba(78, 125, 240, 0.05)',
            border: '1px dashed rgba(78, 125, 240, 0.3)'
          }}
        >
          <Typography variant="h6" component="p" textAlign="center">
            Ya hemos ayudado a organizar más de 1,200 colectas y recaudado más de $150,000 para regalos
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Testimonials;
