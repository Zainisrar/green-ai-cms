import { Metadata } from 'next';
import EditEngineeringProduct from '@/components/apps/engineering/products/EditEngineeringProduct';

export const metadata: Metadata = {
    title: 'Edit Engineering Product',
};

interface EditProductPageProps {
    params: {
        id: string;
    };
}

const EditProductPage = ({ params }: EditProductPageProps) => {
    return <EditEngineeringProduct productId={params.id} />;
};

export default EditProductPage;