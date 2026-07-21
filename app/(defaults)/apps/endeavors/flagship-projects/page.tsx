import { Metadata } from 'next';
import FlagshipProjectBase from '@/components/apps/endeavors/flagship-projects/FlagshipProjectBase';

export const metadata: Metadata = {
    title: 'Flagship Project - Endeavors',
};

const FlagshipProjectPage = () => {
    return <FlagshipProjectBase />;
};

export default FlagshipProjectPage;