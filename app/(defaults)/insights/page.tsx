import { Metadata } from 'next';
import MiningInsightsPage from '@/components/apps/insights/MiningInsightsPage';

export const metadata: Metadata = {
    title: 'Banner Insights',
    description: 'Manage banner insights and data',
};

export default function InsightsPage() {
    return <MiningInsightsPage />;
}