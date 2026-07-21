import { Metadata } from 'next';
import React from 'react';
import HomeCreateForm from '@/components/apps/home/HomeCreateForm';

export const metadata: Metadata = {
    title: 'Create Home Page',
};

const HomeCreatePage = () => {
    return <HomeCreateForm />;
};

export default HomeCreatePage;
