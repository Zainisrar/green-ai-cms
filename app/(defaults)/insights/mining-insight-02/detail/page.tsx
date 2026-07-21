import { Metadata } from 'next';
import React from 'react';
import MiningInsight02Detail from '@/components/apps/insights/MiningInsight02Detail';

export const metadata: Metadata = {
    title: 'Mining Insight 02 - Detail',
};

const MiningInsight02DetailPage = () => {
    return <MiningInsight02Detail />;
};

export default MiningInsight02DetailPage;