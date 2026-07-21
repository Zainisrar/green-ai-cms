import { Metadata } from 'next';
import GridIntelPage from '@/components/apps/engineering/grid-intel/GridIntelPage';

export const metadata: Metadata = {
    title: 'Grid Intel Management',
};

export default function GridIntelRoute() {
    return <GridIntelPage />;
}