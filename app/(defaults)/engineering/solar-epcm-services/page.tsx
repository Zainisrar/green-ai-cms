import React from 'react';
import SolarEPCMBase from '@/components/apps/engineering/solar-epcm-services/SolarEPCMBase';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Solar EPCM Services | Engineering CMS',
  description: 'Manage solar EPCM services content including engineering, procurement, construction, and management services.',
};

const SolarEPCMRoute: React.FC = () => {
  return <SolarEPCMBase />;
};

export default SolarEPCMRoute;