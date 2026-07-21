import { Metadata } from 'next';
import CreateInsightForm from '@/components/apps/insights/CreateInsightForm';

export const metadata: Metadata = {
    title: 'Create Banner Insight',
    description: 'Create a new banner insight',
};

export default function CreateInsightPage() {
    return <CreateInsightForm />;
}