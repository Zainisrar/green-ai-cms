import { Metadata } from 'next';
import EditEnlightenInsightsArticle from '@/components/apps/enlighten/insights-articles/EditEnlightenInsightsArticle';

export const metadata: Metadata = {
    title: 'Edit Insights Article',
    description: 'Edit an existing insights article for the Enlighten platform',
};

interface EditArticlePageProps {
    params: {
        id: string;
    };
}

const EditArticlePage = ({ params }: EditArticlePageProps) => {
    const articleId = parseInt(params.id);
    
    if (isNaN(articleId)) {
        return (
            <div className="panel">
                <div className="text-center py-10">
                    <p className="text-red-500">Invalid article ID</p>
                </div>
            </div>
        );
    }

    return <EditEnlightenInsightsArticle articleId={articleId} />;
};

export default EditArticlePage;