import { Metadata } from 'next';
import GridIntelMainPage from '@/components/apps/engineering/grid-intel/GridIntelMainPage';

export const metadata: Metadata = {
    title: 'Grid Intel - Main Page',
};

export default function GridIntelMainPageRoute() {
    return <GridIntelMainPage />;
}