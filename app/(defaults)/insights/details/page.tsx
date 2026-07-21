import { Metadata } from 'next';
import MiningDetailsPage from '@/components/apps/insights/MiningDetailsPage';

export const metadata: Metadata = {
    title: 'Banner Details',
    description: 'Manage banner insight details',
};

export default function InsightDetailsPage() {
    return <MiningDetailsPage />;
}