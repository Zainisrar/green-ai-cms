import { Metadata } from 'next';
import EditEndeavorsProject from '@/components/apps/endeavors/projects/EditEndeavorsProject';

export const metadata: Metadata = {
    title: 'Edit Project - Endeavors',
};

interface EditProjectPageProps {
    params: {
        id: string;
    };
}

const EditProjectPage = ({ params }: EditProjectPageProps) => {
    return <EditEndeavorsProject projectId={params.id} />;
};

export default EditProjectPage;