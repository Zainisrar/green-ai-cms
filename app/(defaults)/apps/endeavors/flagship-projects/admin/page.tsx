import { Metadata } from 'next';
import FlagshipProjectAdmin from '@/components/apps/endeavors/flagship-projects/FlagshipProjectAdmin';

export const metadata: Metadata = {
    title: 'Flagship Project Admin - Endeavors',
};

const FlagshipProjectAdminPage = () => {
    return <FlagshipProjectAdmin />;
};

export default FlagshipProjectAdminPage;