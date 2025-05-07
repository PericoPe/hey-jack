import React from 'react';
import { Box, Container, Grid, Typography, Link, Divider } from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';

const Footer = () => {
  return (
    <Box 
      sx={{ 
        background: '#1a2a5e',
        color: 'white',
        pt: 8,
        pb: 4
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" component="h3" gutterBottom fontWeight="bold">
              Hey-Jack!
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, opacity: 0.8 }}>
              El asistente IA de WhatsApp que simplifica las colectas grupales para cumpleaños de hijos, profes y más.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Link href="#" color="inherit" aria-label="WhatsApp">
                <WhatsAppIcon />
              </Link>
              <Link href="#" color="inherit" aria-label="Email">
                <EmailIcon />
              </Link>
              <Link href="#" color="inherit" aria-label="Instagram">
                <InstagramIcon />
              </Link>
              <Link href="#" color="inherit" aria-label="Facebook">
                <FacebookIcon />
              </Link>
              <Link href="#" color="inherit" aria-label="Twitter">
                <TwitterIcon />
              </Link>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle1" component="h3" gutterBottom fontWeight="bold">
              Producto
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              <Box component="li" sx={{ mb: 1 }}>
                <Link href="#" color="inherit" underline="hover" sx={{ opacity: 0.8 }}>
                  Características
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link href="#" color="inherit" underline="hover" sx={{ opacity: 0.8 }}>
                  Precios
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link href="#" color="inherit" underline="hover" sx={{ opacity: 0.8 }}>
                  Tiendas Asociadas
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link href="#" color="inherit" underline="hover" sx={{ opacity: 0.8 }}>
                  Testimonios
                </Link>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle1" component="h3" gutterBottom fontWeight="bold">
              Soporte
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              <Box component="li" sx={{ mb: 1 }}>
                <Link href="#" color="inherit" underline="hover" sx={{ opacity: 0.8 }}>
                  Centro de Ayuda
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link href="#" color="inherit" underline="hover" sx={{ opacity: 0.8 }}>
                  Contacto
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link href="#" color="inherit" underline="hover" sx={{ opacity: 0.8 }}>
                  Preguntas Frecuentes
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link href="#" color="inherit" underline="hover" sx={{ opacity: 0.8 }}>
                  Tutoriales
                </Link>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle1" component="h3" gutterBottom fontWeight="bold">
              Empresa
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              <Box component="li" sx={{ mb: 1 }}>
                <Link href="#" color="inherit" underline="hover" sx={{ opacity: 0.8 }}>
                  Sobre Nosotros
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link href="#" color="inherit" underline="hover" sx={{ opacity: 0.8 }}>
                  Blog
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link href="#" color="inherit" underline="hover" sx={{ opacity: 0.8 }}>
                  Prensa
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link href="#" color="inherit" underline="hover" sx={{ opacity: 0.8 }}>
                  Trabaja con Nosotros
                </Link>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle1" component="h3" gutterBottom fontWeight="bold">
              Legal
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              <Box component="li" sx={{ mb: 1 }}>
                <Link href="#" color="inherit" underline="hover" sx={{ opacity: 0.8 }}>
                  Términos de Servicio
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link href="#" color="inherit" underline="hover" sx={{ opacity: 0.8 }}>
                  Política de Privacidad
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link href="#" color="inherit" underline="hover" sx={{ opacity: 0.8 }}>
                  Cookies
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link href="#" color="inherit" underline="hover" sx={{ opacity: 0.8 }}>
                  Seguridad
                </Link>
              </Box>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 4, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
        
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'center', sm: 'flex-start' } }}>
          <Typography variant="body2" sx={{ opacity: 0.7, mb: { xs: 2, sm: 0 } }}>
            © {new Date().getFullYear()} Hey-Jack!. Todos los derechos reservados.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Link href="#" color="inherit" underline="hover" sx={{ opacity: 0.7, fontSize: '0.875rem' }}>
              Términos
            </Link>
            <Link href="#" color="inherit" underline="hover" sx={{ opacity: 0.7, fontSize: '0.875rem' }}>
              Privacidad
            </Link>
            <Link href="#" color="inherit" underline="hover" sx={{ opacity: 0.7, fontSize: '0.875rem' }}>
              Cookies
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
