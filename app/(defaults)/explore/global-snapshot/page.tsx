import { Metadata } from 'next';
import GlobalSnapshotPage from '@/components/apps/explore/global-snapshot/GlobalSnapshotPage';

export const metadata: Metadata = {
    title: 'Global Snapshot - Explore',
};

const ExploreGlobalSnapshot = () => {
    return <GlobalSnapshotPage entryId="1" />;
};

export default ExploreGlobalSnapshot;