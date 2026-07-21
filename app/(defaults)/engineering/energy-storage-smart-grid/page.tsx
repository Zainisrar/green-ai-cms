import React from 'react';
import EnergyStorageSmartGridBase from '@/components/apps/engineering/energy-storage-smart-grid/EnergyStorageSmartGridBase';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Energy Storage & Smart Grid | Engineering CMS',
  description: 'Manage energy storage and smart grid content including storage architecture, systems, and call-to-actions.',
};

const EnergyStorageSmartGridRoute: React.FC = () => {
  return <EnergyStorageSmartGridBase />;
};

export default EnergyStorageSmartGridRoute;