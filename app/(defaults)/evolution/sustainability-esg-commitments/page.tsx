import React from 'react';
import SustainabilityESGBase from '@/components/apps/evolution/sustainability-esg-commitments/SustainabilityESGBase';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sustainability & ESG Commitments | Evolution CMS',
  description: 'Manage sustainability and ESG commitments content including environmental stewardship, social responsibility, and ethical governance.',
};

const SustainabilityESGRoute: React.FC = () => {
  return <SustainabilityESGBase />;
};

export default SustainabilityESGRoute;