import { Metadata } from 'next';
import React from 'react';
import AddNavigation from '@/components/apps/navigation/AddNavigation';

export const metadata: Metadata = {
    title: 'Add Navigation',
};

const AddNavigationPage = () => {
    return <AddNavigation />;
};

export default AddNavigationPage;