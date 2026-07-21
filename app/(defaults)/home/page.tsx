import { Metadata } from 'next';
import React from 'react';
import HomeManagement from '@/components/apps/home/HomeManagement';

export const metadata: Metadata = {
    title: 'Home Pages Management',
};

const HomePage = () => {
    return <HomeManagement />;
};

export default HomePage;
