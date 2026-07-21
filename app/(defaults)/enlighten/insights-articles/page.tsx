import { Metadata } from 'next';
import EnlightenInsightsArticlesPage from '@/components/apps/enlighten/insights-articles/EnlightenInsightsArticlesPage';

export const metadata: Metadata = {
    title: 'Enlighten Insights Articles',
    description: 'Manage insights articles for the Enlighten platform',
};

const InsightsArticlesPage = () => {
    return <EnlightenInsightsArticlesPage />;
};

export default InsightsArticlesPage;