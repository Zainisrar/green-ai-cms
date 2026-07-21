import { Metadata } from 'next';
import React from 'react';
import MiningInsight01 from '@/components/apps/insights/MiningInsight01';

export const metadata: Metadata = {
    title: 'Mining Insight 01 - The Carbon Footprint of Mining',
};

const MiningInsight01Page = () => {
    return <MiningInsight01 />;
};

export default MiningInsight01Page;