import { Metadata } from 'next';
import EndeavorsProjectsPage from '@/components/apps/endeavors/projects/EndeavorsProjectsPage';

export const metadata: Metadata = {
    title: 'Endeavors Projects',
};

const ProjectsPage = () => {
    return <EndeavorsProjectsPage />;
};

export default ProjectsPage;