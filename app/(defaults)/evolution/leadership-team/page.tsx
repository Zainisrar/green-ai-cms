import { Metadata } from 'next';
import LeadershipTeamPage from '@/components/apps/evolution/leadership-team/LeadershipTeamPage';

export const metadata: Metadata = {
    title: 'Leadership Team - Evolution',
};

const EvolutionLeadershipTeam = () => {
    return <LeadershipTeamPage />;
};

export default EvolutionLeadershipTeam;