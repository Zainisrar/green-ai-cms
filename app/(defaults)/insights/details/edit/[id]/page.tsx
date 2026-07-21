import { Metadata } from 'next';
import EditDetailForm from '@/components/apps/insights/EditDetailForm';

export const metadata: Metadata = {
    title: 'Edit Banner Detail',
    description: 'Edit banner insight detail',
};

interface EditDetailPageProps {
    params: {
        id: string;
    };
}

export default function EditDetailPage({ params }: EditDetailPageProps) {
    return <EditDetailForm detailId={params.id} />;
}