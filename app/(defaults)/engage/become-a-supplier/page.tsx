'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import IconPlus from '@/components/icon/icon-plus';
import IconEdit from '@/components/icon/icon-edit';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api-client';

interface BecomeSupplierData {
    id: number;
    mainPage: {
        title: string;
        subHeadline: string;
        description: {
            text: string;
            highlighted: string;
        };
        quote1: {
            text: string;
            highlighted: string;
        };
        quote2: {
            text: string;
            highlighted: string;
        };
        cta: Array<{
            text: string;
            href: string;
        }>;
    };
    modals: {
        whatWeLookFor: {
            title: string;
            headline: string;
            keys: string[];
            quote: {
                text: string;
                highlighted: string;
            };
        };
        keySupplyCategories: {
            title: string;
            headline: string;
            category: {
                title: string;
                items: string[];
            };
            examples: {
                title: string;
                items: string[];
            };
        };
        howGetStarted: {
            title: string;
            items: Array<{
                step: string;
                action: string;
            }>;
        };
    };
    createdAt: string;
    updatedAt: string;
}

const BecomeSupplierPage = () => {
    const router = useRouter();
    const [becomeSupplierData, setBecomeSupplierData] = useState<BecomeSupplierData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBecomeSupplierData();
    }, []);

    const fetchBecomeSupplierData = async () => {
        try {
            const result = await apiClient.get('/api/engage/become-a-supplier');
            if (result.success) {
                setBecomeSupplierData(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch become a supplier data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        router.push('/engage/become-a-supplier/create');
    };

    const handleEditMainPage = () => {
        if (becomeSupplierData) {
            router.push(`/engage/become-a-supplier/edit-main-page/${becomeSupplierData.id}`);
        }
    };

    const handleEditModal = (modalName: string) => {
        if (becomeSupplierData) {
            router.push(`/engage/become-a-supplier/edit-${modalName}/${becomeSupplierData.id}`);
        }
    };

    const handleDelete = async () => {
        if (!becomeSupplierData) return;

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'This will permanently delete the become a supplier data!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it!',
        });

        if (result.isConfirmed) {
            try {
                const deleteResult = await apiClient.delete(`/api/engage/become-a-supplier/${becomeSupplierData.id}`);
                if (deleteResult.success) {
                    Swal.fire('Deleted!', 'Become a supplier data has been deleted.', 'success');
                    setBecomeSupplierData(null);
                } else {
                    Swal.fire('Error', deleteResult.error || 'Failed to delete become a supplier data', 'error');
                }
            } catch (error) {
                console.error('Delete error:', error);
                Swal.fire('Error', 'Failed to delete become a supplier data', 'error');
            }
        }
    };

    if (loading) {
        return (
            <ProtectedRoute requiredPermission={{ resource: 'engage', action: 'view' }}>
                <div className="panel">
                    <div className="flex items-center justify-center py-10">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute requiredPermission={{ resource: 'engage', action: 'view' }}>
            <div className="panel">
                <div className="flex items-center justify-between mb-5">
                    <h5 className="font-semibold text-lg dark:text-white-light">Become a Supplier Management</h5>
                    {!becomeSupplierData && (
                        <button
                            onClick={handleCreate}
                            className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600"
                        >
                            <IconPlus className="w-4 h-4 mr-2" />
                            Create Become a Supplier
                        </button>
                    )}
                </div>

                {becomeSupplierData ? (
                    <div className="space-y-6">
                        {/* Main Page Card */}
                        <div className="panel">
                            <div className="flex items-center justify-between mb-4">
                                <h6 className="text-lg font-semibold">Main Page Content</h6>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleEditMainPage}
                                        className="btn btn-outline-primary border-green-600 text-green-600 hover:bg-green-600"
                                    >
                                        <IconEdit className="w-4 h-4 mr-2" />
                                        Edit Main Page
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="btn btn-outline-danger"
                                    >
                                        Delete All
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Title</label>
                                    <p className="text-gray-700 dark:text-gray-300">{becomeSupplierData.mainPage.title}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Sub-Headline</label>
                                    <p className="text-gray-700 dark:text-gray-300">{becomeSupplierData.mainPage.subHeadline}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Description</label>
                                    <p className="text-gray-700 dark:text-gray-300">{becomeSupplierData.mainPage.description.text}</p>
                                    {becomeSupplierData.mainPage.description.highlighted && (
                                        <p className="text-sm text-green-600 font-medium">{becomeSupplierData.mainPage.description.highlighted}</p>
                                    )}
                                </div>

                                {becomeSupplierData.mainPage.cta && becomeSupplierData.mainPage.cta.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Call-to-Action Buttons</label>
                                        <div className="space-y-2">
                                            {becomeSupplierData.mainPage.cta.map((cta, index) => (
                                                <div key={index} className="flex items-center gap-2">
                                                    <span className="text-gray-700 dark:text-gray-300">{cta.text}</span>
                                                    <span className="text-gray-500">→</span>
                                                    <a href={cta.href} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                                                        {cta.href}
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modals Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* What We Look For Modal */}
                            <div className="panel">
                                <div className="flex items-center justify-between mb-4">
                                    <h6 className="text-lg font-semibold">What We Look For</h6>
                                    <button
                                        onClick={() => handleEditModal('what-we-look-for')}
                                        className="btn btn-sm btn-outline-primary border-green-600 text-green-600 hover:bg-green-600"
                                    >
                                        <IconEdit className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{becomeSupplierData.modals.whatWeLookFor.title}</p>
                                    <p className="text-xs text-gray-500">{becomeSupplierData.modals.whatWeLookFor.headline}</p>
                                    <p className="text-xs text-gray-500">{becomeSupplierData.modals.whatWeLookFor.keys.length} criteria</p>
                                </div>
                            </div>

                            {/* Key Supply Categories Modal */}
                            <div className="panel">
                                <div className="flex items-center justify-between mb-4">
                                    <h6 className="text-lg font-semibold">Key Supply Categories</h6>
                                    <button
                                        onClick={() => handleEditModal('key-supply-categories')}
                                        className="btn btn-sm btn-outline-primary border-green-600 text-green-600 hover:bg-green-600"
                                    >
                                        <IconEdit className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{becomeSupplierData.modals.keySupplyCategories.title}</p>
                                    <p className="text-xs text-gray-500">{becomeSupplierData.modals.keySupplyCategories.headline}</p>
                                    <p className="text-xs text-gray-500">
                                        Categories: {becomeSupplierData.modals.keySupplyCategories.category.items.length}, 
                                        Examples: {becomeSupplierData.modals.keySupplyCategories.examples.items.length}
                                    </p>
                                </div>
                            </div>

                            {/* How to Get Started Modal */}
                            <div className="panel">
                                <div className="flex items-center justify-between mb-4">
                                    <h6 className="text-lg font-semibold">How to Get Started</h6>
                                    <button
                                        onClick={() => handleEditModal('how-get-started')}
                                        className="btn btn-sm btn-outline-primary border-green-600 text-green-600 hover:bg-green-600"
                                    >
                                        <IconEdit className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{becomeSupplierData.modals.howGetStarted.title}</p>
                                    <p className="text-xs text-gray-500">{becomeSupplierData.modals.howGetStarted.items.length} steps</p>
                                </div>
                            </div>
                        </div>

                        <div className="text-sm text-gray-500 pt-4 border-t">
                            <p>Created: {new Date(becomeSupplierData.createdAt).toLocaleDateString()}</p>
                            <p>Updated: {new Date(becomeSupplierData.updatedAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="mb-4">
                            <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                <IconPlus className="w-8 h-8 text-gray-400" />
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No Become a Supplier Page Created</h3>
                        <p className="text-gray-500 mb-4">Create a become a supplier page to get started.</p>
                        <button
                            onClick={handleCreate}
                            className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600"
                        >
                            <IconPlus className="w-4 h-4 mr-2" />
                            Create Become a Supplier
                        </button>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
};

export default BecomeSupplierPage;