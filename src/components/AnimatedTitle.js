import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';

/**
 * Componente que muestra un título con un efecto de escritura
 * y alterna entre diferentes frases
 */
const AnimatedTitle = () => {
  const phrases = ['beta...', 'only friends...'];
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    const currentPhrase = phrases[currentPhraseIndex];
    
    // Efecto de escritura
    const timer = setTimeout(() => {
      if (!isDeleting) {
        // Escribiendo
        setDisplayText(currentPhrase.substring(0, displayText.length + 1));
        
        // Si terminamos de escribir, esperar un momento y luego borrar
        if (displayText === currentPhrase) {
          setTimeout(() => {
            setIsDeleting(true);
          }, 1000);
        }
      } else {
        // Borrando
        setDisplayText(currentPhrase.substring(0, displayText.length - 1));
        
        // Si terminamos de borrar, pasar a la siguiente frase
        if (displayText === '') {
          setIsDeleting(false);
          setCurrentPhraseIndex((currentPhraseIndex + 1) % phrases.length);
        }
      }
    }, isDeleting ? 100 : 150);
    
    return () => clearTimeout(timer);
  }, [displayText, currentPhraseIndex, isDeleting]);
  
  return (
    <Box sx={{ display: 'inline-flex', height: '1.5rem', alignItems: 'center', ml: 1, backgroundColor: 'rgba(255, 152, 0, 0.1)', px: 1.5, py: 0.5, borderRadius: 2 }}>
      <Typography
        variant="body1"
        component="span"
        sx={{
          fontStyle: 'italic',
          color: 'secondary.main',
          fontWeight: 'bold',
          position: 'relative',
          letterSpacing: '0.5px',
          '&::after': {
            content: '""',
            position: 'absolute',
            right: '-4px',
            top: '0',
            height: '100%',
            width: '2px',
            backgroundColor: 'secondary.main',
            animation: 'blink 1s step-end infinite'
          },
          '@keyframes blink': {
            'from, to': { opacity: 1 },
            '50%': { opacity: 0 }
          }
        }}
      >
        {displayText}
      </Typography>
    </Box>
  );
};

export default AnimatedTitle;
