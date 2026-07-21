import { Metadata } from 'next';
import React from 'react';
import ExpertiseDetail from '@/components/apps/expertise/ExpertiseDetail';

interface ExpertiseDetailPageProps {
    params: {
        slug: string;
    };
}

export async function generateMetadata({ params }: ExpertiseDetailPageProps): Promise<Metadata> {
    return {
        title: `Expertise - ${params.slug}`,
    };
}

const ExpertiseDetailPage = ({ params }: ExpertiseDetailPageProps) => {
    return <ExpertiseDetail slug={params.slug} />;
};

export default ExpertiseDetailPage;