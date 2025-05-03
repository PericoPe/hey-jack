import React from 'react';
import { Box, Container, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const FAQ = () => {
  const faqs = [
    {
      question: '¿Es seguro usar Hey Jack para las colectas?',
      answer: 'Absolutamente. Hey Jack utiliza plataformas de pago seguras y certificadas para todas las transacciones. Además, toda la información personal está protegida y encriptada siguiendo los más altos estándares de seguridad.'
    },
    {
      question: '¿Tiene algún costo usar Hey Jack?',
      answer: 'Hey Jack es completamente gratuito para organizar colectas básicas. Contamos con un plan premium con funcionalidades adicionales para quienes organizan colectas frecuentemente, pero la versión gratuita es totalmente funcional y sin limitaciones importantes.'
    },
    {
      question: '¿Qué pasa si no se alcanza el monto objetivo de la colecta?',
      answer: 'No hay problema. Puedes decidir extender el plazo de la colecta o simplemente utilizar el monto recaudado hasta el momento. Hey Jack te mostrará opciones de regalos que se ajusten al presupuesto disponible.'
    },
    {
      question: '¿Cómo se retira el dinero recaudado?',
      answer: 'Una vez finalizada la colecta, el organizador puede transferir el dinero a su cuenta bancaria o utilizarlo directamente para comprar el regalo a través de nuestras tiendas asociadas, sin comisiones adicionales.'
    },
    {
      question: '¿Necesito descargar una aplicación para usar Hey Jack?',
      answer: 'No, Hey Jack funciona directamente dentro de WhatsApp, la aplicación que ya usas a diario. No necesitas descargar nada adicional ni crear nuevas cuentas.'
    },
    {
      question: '¿Puedo organizar múltiples colectas al mismo tiempo?',
      answer: 'Sí, puedes organizar tantas colectas como necesites simultáneamente. Hey Jack te ayudará a mantenerlas organizadas y separadas para que no haya confusiones.'
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
            Preguntas Comunes sobre Hey Jack
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
            Resolvemos tus dudas para que puedas comenzar a usar Hey Jack con confianza
          </Typography>
        </Box>

        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          {faqs.map((faq, index) => (
            <Accordion 
              key={index} 
              className="faq-item"
              elevation={0}
              sx={{ 
                mb: 2, 
                borderRadius: '8px !important',
                overflow: 'hidden',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                '&:before': {
                  display: 'none'
                }
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon color="primary" />}
                sx={{ 
                  px: 3,
                  '& .MuiAccordionSummary-content': {
                    my: 2
                  }
                }}
              >
                <Typography variant="h6" fontWeight={500}>
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
                <Typography variant="body1" color="text.secondary">
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default FAQ;
