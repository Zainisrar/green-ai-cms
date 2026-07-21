import React from 'react';
import OMMonitoringBase from '@/components/apps/engineering/om-monitoring/OMMonitoringBase';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'O&M & Monitoring | Engineering CMS',
  description: 'Manage operations and maintenance monitoring content including philosophy, services, and call-to-actions.',
};

const OMMonitoringRoute: React.FC = () => {
  return <OMMonitoringBase />;
};

export default OMMonitoringRoute;