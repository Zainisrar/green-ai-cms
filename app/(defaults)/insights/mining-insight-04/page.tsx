import { Metadata } from 'next';
import React from 'react';
import MiningInsight04 from '@/components/apps/insights/MiningInsight04';

export const metadata: Metadata = {
    title: 'Mining Insight 04',
};

const MiningInsight04Page = () => {
    return <MiningInsight04 />;
};

export default MiningInsight04Page;