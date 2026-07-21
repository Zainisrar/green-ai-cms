import { Metadata } from 'next';
import AddEnlightenInsightsArticle from '@/components/apps/enlighten/insights-articles/AddEnlightenInsightsArticle';

export const metadata: Metadata = {
    title: 'Add New Insights Article',
    description: 'Create a new insights article for the Enlighten platform',
};

const AddArticlePage = () => {
    return <AddEnlightenInsightsArticle />;
};

export default AddArticlePage;