import { Metadata } from 'next';
import React from 'react';
import EditExpertise from '@/components/apps/expertise/EditExpertise';

interface ExpertiseEditPageProps {
    params: {
        id: string;
    };
}

export async function generateMetadata({ params }: ExpertiseEditPageProps): Promise<Metadata> {
    return {
        title: `Edit Expertise - ${params.id}`,
    };
}

const ExpertiseEditPage = ({ params }: ExpertiseEditPageProps) => {
    return <EditExpertise id={params.id} />;
};

export default ExpertiseEditPage;