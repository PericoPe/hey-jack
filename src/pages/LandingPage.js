import React from 'react';
import { Box, Container } from '@mui/material';

import HeroSection from '../components/HeroSection';
import ProblemSolution from '../components/ProblemSolution';
import HowItWorks from '../components/HowItWorks';
import Benefits from '../components/Benefits';
import GiftSection from '../components/GiftSection';
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FAQ';
import FinalCTA from '../components/FinalCTA';
import Footer from '../components/Footer';

const LandingPage = () => {


  return (
    <Box>
      <HeroSection />
      <ProblemSolution />
      <HowItWorks />
      <Benefits />
      <GiftSection />
      <Testimonials />
      <FAQ />
      <FinalCTA />
      <Footer />
    </Box>
  );
};

export default LandingPage;
