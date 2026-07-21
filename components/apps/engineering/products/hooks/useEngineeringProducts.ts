import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    fetchEngineeringProducts, 
    createEngineeringProduct, 
    updateEngineeringProduct, 
    deleteEngineeringProduct,
    ProductFormData 
} from '@/lib/api/engineeringProducts';
import { EngineeringProduct } from '@/db/schema';

export const useEngineeringProducts = () => {
    return useQuery({
        queryKey: ['engineering-products'],
        queryFn: fetchEngineeringProducts,
    });
};

export const useCreateEngineeringProduct = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: createEngineeringProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['engineering-products'] });
        },
    });
};

export const useUpdateEngineeringProduct = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: ProductFormData }) => 
            updateEngineeringProduct(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['engineering-products'] });
        },
    });
};

export const useDeleteEngineeringProduct = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: deleteEngineeringProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['engineering-products'] });
        },
    });
};