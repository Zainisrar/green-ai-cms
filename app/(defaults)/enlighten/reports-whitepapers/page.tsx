import { Metadata } from 'next';
import EnlightenReportsWhitepapersPage from '@/components/apps/enlighten/reports-whitepapers/EnlightenReportsWhitepapersPage';

export const metadata: Metadata = {
    title: 'Reports & Whitepapers',
    description: 'Manage reports and whitepapers for the Enlighten platform',
};

const ReportsWhitepapersPage = () => {
    return <EnlightenReportsWhitepapersPage />;
};

export default ReportsWhitepapersPage;