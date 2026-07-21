import { Metadata } from 'next';
import React from 'react';
import HomeEditForm from '@/components/apps/home/HomeEditForm';

export const metadata: Metadata = {
    title: 'Edit Home Page',
};

interface HomeEditPageProps {
    params: {
        id: string;
    };
}

const HomeEditPage = ({ params }: HomeEditPageProps) => {
    return <HomeEditForm id={params.id} />;
};

export default HomeEditPage;
