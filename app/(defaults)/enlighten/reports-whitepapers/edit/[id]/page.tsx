import { Metadata } from 'next';
import EditEnlightenReportsWhitepaper from '@/components/apps/enlighten/reports-whitepapers/EditEnlightenReportsWhitepaper';

export const metadata: Metadata = {
    title: 'Edit Report & Whitepaper',
    description: 'Edit an existing report or whitepaper for the Enlighten platform',
};

interface EditReportPageProps {
    params: {
        id: string;
    };
}

const EditReportPage = ({ params }: EditReportPageProps) => {
    const reportId = parseInt(params.id);
    
    if (isNaN(reportId)) {
        return (
            <div className="panel">
                <div className="text-center py-10">
                    <p className="text-red-500">Invalid report ID</p>
                </div>
            </div>
        );
    }

    return <EditEnlightenReportsWhitepaper reportId={reportId} />;
};

export default EditReportPage;