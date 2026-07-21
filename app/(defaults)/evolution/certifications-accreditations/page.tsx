import React from 'react';
import CertificationsAccreditationsBase from '@/components/apps/evolution/certifications-accreditations/CertificationsAccreditationsBase';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Certifications & Accreditations | Evolution CMS',
  description: 'Manage certifications and accreditations content including ESG standards, ISO certifications, and Clean Energy Council accreditation.',
};

const CertificationsAccreditationsRoute: React.FC = () => {
  return <CertificationsAccreditationsBase />;
};

export default CertificationsAccreditationsRoute;