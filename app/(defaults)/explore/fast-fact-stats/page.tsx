import { Metadata } from 'next';
import FastFactStatsPage from '@/components/apps/explore/fast-fact-stats/FastFactStatsPage';

export const metadata: Metadata = {
    title: 'Fast Facts & Stats - Explore',
};

const ExploreFastFactStats = () => {
    return <FastFactStatsPage />;
};

export default ExploreFastFactStats;