import { Metadata } from 'next';
import EngineeringProductsPage from '@/components/apps/engineering/products/EngineeringProductsPage';

export const metadata: Metadata = {
    title: 'Engineering Products',
};

const ProductsPage = () => {
    return <EngineeringProductsPage />;
};

export default ProductsPage;