import React from 'react';
import { Box, Container, Grid, Typography, Paper, Stack } from '@mui/material';
import MessageIcon from '@mui/icons-material/Message';
import CalculateIcon from '@mui/icons-material/Calculate';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SecurityIcon from '@mui/icons-material/Security';

const ProblemSolution = () => {
  const problems = [
    {
      icon: <MessageIcon fontSize="large" color="error" />,
      title: 'Cadenas interminables de mensajes',
      description: 'Grupos de WhatsApp saturados con mensajes sobre la colecta que nadie lee.'
    },
    {
      icon: <CalculateIcon fontSize="large" color="error" />,
      title: 'Conteo manual del dinero',
      description: 'Llevar registro de quién pagó y cuánto falta es un dolor de cabeza.'
    },
    {
      icon: <NotificationsIcon fontSize="large" color="error" />,
      title: 'Recordatorios incómodos',
      description: 'La incomodidad de tener que reclamar a los que faltan por aportar.'
    }
  ];

  const solutions = [
    {
      icon: <CheckCircleOutlineIcon fontSize="large" color="primary" />,
      title: 'Comunicación organizada',
      description: 'Hey Jack gestiona toda la comunicación sobre la colecta de forma automatizada.'
    },
    {
      icon: <AutoAwesomeIcon fontSize="large" color="primary" />,
      title: 'Seguimiento automático',
      description: 'Registro automático de pagos y recordatorios amigables a quienes faltan por contribuir.'
    },
    {
      icon: <SecurityIcon fontSize="large" color="primary" />,
      title: 'Transparencia total',
      description: 'Todos los participantes pueden ver el estado de la colecta en tiempo real.'
    }
  ];

  return (
    <Box className="section-padding" sx={{ background: '#ffffff' }}>
      <Container maxWidth="lg">
        <Grid container spacing={8}>
          {/* Problem Section */}
          <Grid item xs={12} md={6}>
            <Typography 
              variant="h2" 
              component="h2" 
              gutterBottom
              sx={{ 
                fontSize: { xs: '2rem', md: '2.5rem' },
                fontWeight: 600,
                mb: 4
              }}
            >
              El problema de las colectas grupales
            </Typography>
            
            <Stack spacing={3}>
              {problems.map((problem, index) => (
                <Paper 
                  key={index}
                  elevation={0}
                  sx={{ 
                    p: 3, 
                    borderRadius: 2,
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                      transform: 'translateY(-5px)'
                    }
                  }}
                >
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={2}>
                      {problem.icon}
                    </Grid>
                    <Grid item xs={10}>
                      <Typography variant="h6" component="h3" gutterBottom>
                        {problem.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {problem.description}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              ))}
            </Stack>
          </Grid>
          
          {/* Solution Section */}
          <Grid item xs={12} md={6}>
            <Typography 
              variant="h2" 
              component="h2" 
              gutterBottom
              sx={{ 
                fontSize: { xs: '2rem', md: '2.5rem' },
                fontWeight: 600,
                mb: 4
              }}
            >
              La solución con{' '}
              <Box component="span" className="text-gradient">
                Hey Jack
              </Box>
            </Typography>
            
            <Stack spacing={3}>
              {solutions.map((solution, index) => (
                <Paper 
                  key={index}
                  elevation={0}
                  sx={{ 
                    p: 3, 
                    borderRadius: 2,
                    border: '1px solid rgba(78, 125, 240, 0.2)',
                    backgroundColor: 'rgba(78, 125, 240, 0.03)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 8px 16px rgba(78, 125, 240, 0.15)',
                      transform: 'translateY(-5px)'
                    }
                  }}
                >
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={2}>
                      {solution.icon}
                    </Grid>
                    <Grid item xs={10}>
                      <Typography variant="h6" component="h3" gutterBottom>
                        {solution.title}
                      </Typography>
                      <Typography variant="body2">
                        {solution.description}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              ))}
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ProblemSolution;
