import { Metadata } from 'next';
import AddEndeavorsProject from '@/components/apps/endeavors/projects/AddEndeavorsProject';

export const metadata: Metadata = {
    title: 'Add Project - Endeavors',
};

const AddProjectPage = () => {
    return <AddEndeavorsProject />;
};

export default AddProjectPage;