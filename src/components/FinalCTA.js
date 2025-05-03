import React from 'react';
import { Box, Container, Typography, Button, Paper, Grid } from '@mui/material';
import { Link } from 'react-router-dom';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import GroupAddIcon from '@mui/icons-material/GroupAdd';

const FinalCTA = () => {
  return (
    <Box 
      className="section-padding" 
      sx={{ 
        background: 'linear-gradient(180deg, #ffffff 0%, #f5f9ff 100%)'
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={3}
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #4e7df0 0%, #1852bd 100%)',
            p: { xs: 4, md: 6 },
            textAlign: 'center',
            color: 'white',
            position: 'relative'
          }}
        >
          {/* Decorative elements */}
          <Box 
            sx={{
              position: 'absolute',
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              top: -40,
              right: -40,
              zIndex: 0
            }}
          />
          
          <Box 
            sx={{
              position: 'absolute',
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              bottom: -20,
              left: -20,
              zIndex: 0
            }}
          />
          
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography 
              variant="h2" 
              component="h2"
              sx={{ 
                fontSize: { xs: '2rem', md: '2.75rem' },
                fontWeight: 700,
                mb: 2
              }}
            >
              ¡Empieza hoy y olvídate del estrés de la próxima colecta!
            </Typography>
            
            <Typography 
              variant="h6" 
              component="p"
              sx={{ 
                maxWidth: 600, 
                mx: 'auto',
                mb: 4,
                opacity: 0.9
              }}
            >
              Organiza tu primera colecta en menos de 5 minutos y descubre lo fácil que puede ser
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Button 
                  component={Link}
                  to="/crear-comunidad"
                  variant="contained" 
                  color="secondary" 
                  size="large"
                  fullWidth
                  startIcon={<WhatsAppIcon />}
                  sx={{ 
                    py: 1.75,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    boxShadow: '0 8px 16px rgba(255, 152, 0, 0.3)'
                  }}
                >
                  Crear Comunidad
                </Button>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Button 
                  component={Link}
                  to="/unirse-comunidad"
                  variant="contained" 
                  color="primary" 
                  size="large"
                  fullWidth
                  startIcon={<GroupAddIcon />}
                  sx={{ 
                    py: 1.75,
                    fontSize: '1.1rem',
                    fontWeight: 600
                  }}
                >
                  Unirse a Comunidad
                </Button>
              </Grid>
            </Grid>
            
            <Typography 
              variant="body2" 
              sx={{ mt: 3, opacity: 0.8 }}
            >
              Sin compromisos, sin tarjeta de crédito, sin complicaciones
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default FinalCTA;
