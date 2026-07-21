import { Metadata } from 'next';
import ExploreWhyGreenPage from '@/components/apps/explore/why-green/ExploreWhyGreenPage';

export const metadata: Metadata = {
    title: 'Why Green - Explore',
};

const ExploreWhyGreen = () => {
    return <ExploreWhyGreenPage entryId="1" />;
};

export default ExploreWhyGreen;