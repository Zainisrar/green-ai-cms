import { Metadata } from 'next';
import AddEnlightenReportsWhitepaper from '@/components/apps/enlighten/reports-whitepapers/AddEnlightenReportsWhitepaper';

export const metadata: Metadata = {
    title: 'Add New Report & Whitepaper',
    description: 'Create a new report or whitepaper for the Enlighten platform',
};

const AddReportPage = () => {
    return <AddEnlightenReportsWhitepaper />;
};

export default AddReportPage;