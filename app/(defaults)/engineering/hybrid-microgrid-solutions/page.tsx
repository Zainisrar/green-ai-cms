import React from 'react';
import HybridMicrogridBase from '@/components/apps/engineering/hybrid-microgrid-solutions/HybridMicrogridBase';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hybrid & Microgrid Solutions | Engineering CMS',
  description: 'Manage hybrid and microgrid solutions content including hybrid systems, microgrids, use cases, and call-to-actions.',
};

const HybridMicrogridRoute: React.FC = () => {
  return <HybridMicrogridBase />;
};

export default HybridMicrogridRoute;