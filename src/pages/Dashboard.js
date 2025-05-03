import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  Divider,
  Card,
  CardContent,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  LinearProgress,
  Chip
} from '@mui/material';
import { Link } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';

const Dashboard = () => {
  // Datos simulados de la comunidad
  const communityData = {
    name: "Escuela San Martín - 3er. Grado - A",
    contributionAmount: "1.500",
    totalContributions: "12.000",
    targetAmount: "15.000",
    progress: 80,
    participants: [
      { id: 1, name: "María García", status: "paid", amount: "1.500", date: "2025-05-01" },
      { id: 2, name: "Carlos López", status: "paid", amount: "1.500", date: "2025-05-02" },
      { id: 3, name: "Ana Rodríguez", status: "paid", amount: "1.500", date: "2025-05-01" },
      { id: 4, name: "Juan Martínez", status: "paid", amount: "1.500", date: "2025-05-02" },
      { id: 5, name: "Laura Sánchez", status: "paid", amount: "1.500", date: "2025-05-01" },
      { id: 6, name: "Pedro González", status: "paid", amount: "1.500", date: "2025-05-02" },
      { id: 7, name: "Sofía Fernández", status: "paid", amount: "1.500", date: "2025-05-01" },
      { id: 8, name: "Diego Pérez", status: "paid", amount: "1.500", date: "2025-05-02" },
      { id: 9, name: "Valentina Torres", status: "pending", amount: "0", date: "" },
      { id: 10, name: "Mateo Ramírez", status: "pending", amount: "0", date: "" }
    ]
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f9ff' }}>
      {/* Header */}
      <Box sx={{ backgroundColor: 'primary.main', color: 'white', py: 2 }}>
        <Container>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" component="h1" fontWeight="bold">
              Hey Jack
            </Typography>
            <Button 
              component={Link} 
              to="/"
              variant="outlined" 
              color="inherit" 
              size="small"
              startIcon={<HomeIcon />}
            >
              Inicio
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Container sx={{ py: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom fontWeight="bold">
          Dashboard
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          Bienvenido al dashboard de tu comunidad. Aquí puedes ver el estado de la colecta y gestionar los participantes.
        </Typography>

        {/* Community Info */}
        <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <Typography variant="h5" gutterBottom>
            {communityData.name}
          </Typography>
          
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <PeopleIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Participantes
                  </Typography>
                  <Typography variant="h6">
                    {communityData.participants.length}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                  <MonetizationOnIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Aporte por persona
                  </Typography>
                  <Typography variant="h6">
                    ${communityData.contributionAmount}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <CardGiftcardIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Monto recaudado
                  </Typography>
                  <Typography variant="h6">
                    ${communityData.totalContributions} / ${communityData.targetAmount}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Progreso de la colecta</Typography>
              <Typography variant="body2" fontWeight="bold">{communityData.progress}%</Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={communityData.progress} 
              sx={{ height: 10, borderRadius: 5 }}
            />
          </Box>
        </Paper>

        {/* Participants */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Participantes
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {communityData.participants.map((participant) => (
                    <ListItem 
                      key={participant.id}
                      secondaryAction={
                        <Chip 
                          icon={participant.status === 'paid' ? <CheckCircleIcon /> : <PendingIcon />}
                          label={participant.status === 'paid' ? 'Pagado' : 'Pendiente'}
                          color={participant.status === 'paid' ? 'success' : 'default'}
                          size="small"
                        />
                      }
                      sx={{
                        mb: 1,
                        borderRadius: 1,
                        backgroundColor: participant.status === 'paid' ? 'rgba(76, 175, 80, 0.08)' : 'transparent'
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={participant.name} 
                        secondary={participant.status === 'paid' ? `$${participant.amount} · ${new Date(participant.date).toLocaleDateString()}` : 'No ha realizado el aporte'}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 2, height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Acciones
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  startIcon={<PeopleIcon />}
                  sx={{ mb: 2 }}
                >
                  Invitar participantes
                </Button>
                
                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  startIcon={<MonetizationOnIcon />}
                  sx={{ mb: 2 }}
                >
                  Registrar pago
                </Button>
                
                <Button
                  variant="outlined"
                  color="secondary"
                  fullWidth
                  startIcon={<CardGiftcardIcon />}
                  sx={{ mb: 2 }}
                >
                  Explorar regalos
                </Button>
                
                <Divider sx={{ my: 3 }} />
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  Comparte el enlace de tu comunidad para que más personas puedan unirse:
                </Typography>
                
                <Paper
                  elevation={0}
                  sx={{ 
                    p: 2, 
                    backgroundColor: 'rgba(78, 125, 240, 0.05)',
                    border: '1px dashed rgba(78, 125, 240, 0.3)',
                    borderRadius: 2,
                    wordBreak: 'break-all'
                  }}
                >
                  <Typography variant="body2" color="primary.main">
                    https://heyjack.com/c/escuela-san-martin-3er-grado-a
                  </Typography>
                </Paper>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;
