import { Metadata } from 'next';
import React from 'react';
import MiningInsight01Detail from '@/components/apps/insights/MiningInsight01Detail';

export const metadata: Metadata = {
    title: 'Mining Insight 01 - Detail',
};

const MiningInsight01DetailPage = () => {
    return <MiningInsight01Detail />;
};

export default MiningInsight01DetailPage;