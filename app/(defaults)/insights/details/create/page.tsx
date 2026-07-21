import { Metadata } from 'next';
import CreateDetailForm from '@/components/apps/insights/CreateDetailForm';

export const metadata: Metadata = {
    title: 'Create Banner Detail',
    description: 'Create a new banner insight detail',
};

export default function CreateDetailPage() {
    return <CreateDetailForm />;
}