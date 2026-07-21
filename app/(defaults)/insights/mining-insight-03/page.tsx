import { Metadata } from 'next';
import React from 'react';
import MiningInsight03 from '@/components/apps/insights/MiningInsight03';

export const metadata: Metadata = {
    title: 'Mining Insight 03',
};

const MiningInsight03Page = () => {
    return <MiningInsight03 />;
};

export default MiningInsight03Page;