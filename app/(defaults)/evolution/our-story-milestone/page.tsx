import { Metadata } from 'next';
import OurStoryMilestonePage from '@/components/apps/evolution/our-story-milestone/OurStoryMilestonePage';

export const metadata: Metadata = {
    title: 'Our Story Milestone - Evolution',
};

const EvolutionOurStoryMilestone = () => {
    return <OurStoryMilestonePage contentKey="Our Story & Milestone" />;
};

export default EvolutionOurStoryMilestone;