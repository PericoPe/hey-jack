import React from 'react';
import { Box, Container, Grid, Typography, Button, Paper } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { giftSectionImage as giftImage } from '../assets/index';

const GiftSection = () => {
  // Jugueterías argentinas como aliados comerciales
  const ecommercePartners = [
    { name: 'El Mundo del Juguete', url: 'https://www.elmundodeljuguete.com.ar/' },
    { name: 'Cebra Jugueterías', url: 'https://www.cebra.com.ar/' },
    { name: 'City Kids', url: 'https://www.citykids.com.ar/' },
    { name: 'Mono Coco', url: 'https://monococojugueterias.com/' },
    { name: 'The Toy Store', url: 'https://www.thetoystore.com.ar/' },
    { name: 'Kids Point', url: 'https://www.kidspoint.com.ar/' },
    { name: 'Carrousel Jugueterías', url: 'https://jugueteriascarrousel.com.ar/' },
    { name: 'Toy Store Argentina', url: 'https://www.toystore.com.ar/' }
  ];

  return (
    <Box 
      className="section-padding" 
      sx={{ 
        background: 'linear-gradient(180deg, #f5f9ff 0%, #ffffff 100%)'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography 
              variant="h2" 
              component="h2"
              sx={{ 
                fontSize: { xs: '2rem', md: '2.5rem' },
                fontWeight: 600,
                mb: 3
              }}
            >
              Encuentra el Regalo Ideal Directamente con Hey-Jack!
            </Typography>
            
            <Typography 
              variant="body1" 
              sx={{ mb: 4 }}
            >
              Una vez recaudado el dinero, Hey-Jack! te ayuda a encontrar el regalo perfecto gracias a nuestras integraciones con las principales tiendas online. Olvídate de buscar en decenas de sitios web, nosotros te mostramos las mejores opciones según el presupuesto y preferencias.
            </Typography>
            
            <Button 
              variant="contained" 
              color="secondary" 
              size="large"
              startIcon={<ShoppingCartIcon />}
              sx={{ 
                py: 1.5,
                px: 3,
                fontSize: '1.1rem',
                mb: 4
              }}
            >
              Descubre Nuestras Tiendas Aliadas
            </Button>
            
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                borderRadius: 2,
                backgroundColor: 'rgba(78, 125, 240, 0.05)',
                border: '1px dashed rgba(78, 125, 240, 0.3)'
              }}
            >
              <Typography variant="h6" gutterBottom>
                Nuestros Aliados Comerciales
              </Typography>
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {ecommercePartners.map((partner, index) => (
                  <Grid item xs={6} sm={3} key={index}>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      href={partner.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        height: '60px',
                        textTransform: 'none',
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 12px rgba(0,0,0,0.15)'
                        }
                      }}
                    >
                      {partner.name}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box 
              sx={{ 
                position: 'relative',
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <Box 
                component="img"
                src={giftImage}
                alt="Encuentra el regalo perfecto con Hey-Jack!"
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
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  background: 'rgba(255, 152, 0, 0.1)',
                  top: -20,
                  left: { xs: 20, md: 40 },
                  zIndex: -1
                }}
              />
              
              <Box 
                sx={{
                  position: 'absolute',
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: 'rgba(78, 125, 240, 0.1)',
                  bottom: 30,
                  right: { xs: 20, md: 60 },
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

export default GiftSection;
