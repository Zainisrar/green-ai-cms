import { Metadata } from 'next';
import ExploreAboutUsPage from '@/components/apps/explore/about-us/ExploreAboutUsPage';

export const metadata: Metadata = {
    title: 'About Us - Explore',
};

const ExploreAboutUs = () => {
    return <ExploreAboutUsPage contentKey="CLEAN LEAN GREEN" />;
};

export default ExploreAboutUs;