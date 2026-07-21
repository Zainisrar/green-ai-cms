import { Metadata } from 'next';
import React from 'react';
import ExpertiseList from '@/components/apps/expertise/ExpertiseList';

export const metadata: Metadata = {
    title: 'Expertise Management',
};

const ExpertisePage = () => {
    return <ExpertiseList />;
};

export default ExpertisePage;