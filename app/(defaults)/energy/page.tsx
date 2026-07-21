import { Metadata } from 'next';
import EnergyPage from '@/components/apps/energy/EnergyPage';

export const metadata: Metadata = {
    title: 'Energy Management',
};

const Energy = () => {
    return <EnergyPage />;
};

export default Energy;