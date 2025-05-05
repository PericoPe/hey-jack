import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CreateCommunity from './pages/CreateCommunity';
import JoinCommunity from './pages/JoinCommunity';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import AdminPanel from './pages/AdminPanel';

// Create a custom theme for Hey Jack
const theme = createTheme({
  palette: {
    primary: {
      main: '#4e7df0', // A friendly blue color
      light: '#7da1ff',
      dark: '#1852bd',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ff9800', // A warm orange for CTAs
      light: '#ffc947',
      dark: '#c66900',
      contrastText: '#000000',
    },
    background: {
      default: '#ffffff',
      paper: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
        },
        containedPrimary: {
          boxShadow: '0 4px 10px rgba(78, 125, 240, 0.3)',
          '&:hover': {
            boxShadow: '0 6px 15px rgba(78, 125, 240, 0.4)',
          },
        },
        containedSecondary: {
          boxShadow: '0 4px 10px rgba(255, 152, 0, 0.3)',
          '&:hover': {
            boxShadow: '0 6px 15px rgba(255, 152, 0, 0.4)',
          },
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/" element={<LandingPage />} />
          <Route path="/crear" element={<CreateCommunity />} />
          <Route path="/unirse" element={<JoinCommunity />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/hey-jackadmin" element={<AdminPanel />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
