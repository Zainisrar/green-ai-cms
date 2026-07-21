import { Metadata } from 'next';
import React from 'react';
import AddExpertise from '@/components/apps/expertise/AddExpertise';

export const metadata: Metadata = {
    title: 'Add New Expertise',
};

const ExpertiseAddPage = () => {
    return <AddExpertise />;
};

export default ExpertiseAddPage;