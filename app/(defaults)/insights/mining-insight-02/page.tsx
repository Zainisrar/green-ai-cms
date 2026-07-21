import { Metadata } from 'next';
import React from 'react';
import MiningInsight02 from '@/components/apps/insights/MiningInsight02';

export const metadata: Metadata = {
    title: 'Mining Insight 02',
};

const MiningInsight02Page = () => {
    return <MiningInsight02 />;
};

export default MiningInsight02Page;