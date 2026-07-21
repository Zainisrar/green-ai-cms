import { Metadata } from 'next';
import AddEngineeringProduct from '@/components/apps/engineering/products/AddEngineeringProduct';

export const metadata: Metadata = {
    title: 'Add Engineering Product',
};

const AddProductPage = () => {
    return <AddEngineeringProduct />;
};

export default AddProductPage;