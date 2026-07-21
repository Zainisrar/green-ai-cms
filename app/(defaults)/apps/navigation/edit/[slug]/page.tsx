'use client';
import React from 'react';
import EditNavigation from '@/components/apps/navigation/EditNavigation';

interface PageProps {
    params: {
        slug: string;
    };
}

const EditNavigationPage = ({ params }: PageProps) => {
    return (
        <React.Fragment>
            <EditNavigation id={params.slug} />
        </React.Fragment>
    );
};

export default EditNavigationPage;
