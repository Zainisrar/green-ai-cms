import { Metadata } from 'next';
import EditInsightForm from '@/components/apps/insights/EditInsightForm';

export const metadata: Metadata = {
    title: 'Edit Banner Insight',
    description: 'Edit banner insight',
};

interface EditInsightPageProps {
    params: {
        id: string;
    };
}

export default function EditInsightPage({ params }: EditInsightPageProps) {
    return <EditInsightForm insightId={params.id} />;
}