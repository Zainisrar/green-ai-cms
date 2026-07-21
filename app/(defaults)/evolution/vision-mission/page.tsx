import { Metadata } from 'next';
import VisionMissionPage from '@/components/apps/evolution/vision-mission/VisionMissionPage';

export const metadata: Metadata = {
    title: 'Vision & Mission - Evolution',
};

const EvolutionVisionMission = () => {
    return <VisionMissionPage />;
};

export default EvolutionVisionMission;