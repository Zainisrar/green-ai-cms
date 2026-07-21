'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import IconPlus from '@/components/icon/icon-plus';
import IconEdit from '@/components/icon/icon-edit';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api-client';

interface CommunityVoicesData {
    id: number;
    mainPage: {
        title: string;
        subHeadline: string;
        description: {
            text: string;
            highlighted: string;
        };
        quote1: {
            text1: string;
            highlighted1: string;
            text2: string;
            highlighted2: string;
        };
        quote2: {
            text: string;
            highlighted: string;
        };
        cta: Array<{
            text: string;
            href: string;
        }>;
        modals: Array<{
            img: {
                src: string;
                alt: string;
            };
            cta: string;
        }>;
    };
    modals: {
        voicesFromField: {
            title: string;
            items: Array<{
                img: {
                    src: string;
                    alt: string;
                };
                title: string;
                description: string;
            }>;
        };
        whatMakesOurImpactDifferent: {
            title: string;
            key1: {
                title: string;
                items: string[];
            };
            key2: {
                title: string;
                items: string[];
            };
        };
    };
    createdAt: string;
    updatedAt: string;
}

const CommunityVoicesPage = () => {
    const router = useRouter();
    const [communityVoicesData, setCommunityVoicesData] = useState<CommunityVoicesData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCommunityVoicesData();
    }, []);

    const fetchCommunityVoicesData = async () => {
        try {
            const result = await apiClient.get('/api/empower/community-voices');
            if (result.success) {
                setCommunityVoicesData(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch community voices data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        router.push('/empower/community-voices/create');
    };

    const handleEditMainPage = () => {
        if (communityVoicesData) {
            router.push(`/empower/community-voices/edit-main-page/${communityVoicesData.id}`);
        }
    };

    const handleEditModal = (modalName: string) => {
        if (communityVoicesData) {
            router.push(`/empower/community-voices/edit-${modalName}/${communityVoicesData.id}`);
        }
    };

    const handleDelete = async () => {
        if (!communityVoicesData) return;

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'This will permanently delete the community voices data!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it!',
        });

        if (result.isConfirmed) {
            try {
                const deleteResult = await apiClient.delete(`/api/empower/community-voices/${communityVoicesData.id}`);
                if (deleteResult.success) {
                    Swal.fire('Deleted!', 'Community voices data has been deleted.', 'success');
                    setCommunityVoicesData(null);
                } else {
                    Swal.fire('Error', deleteResult.error || 'Failed to delete community voices data', 'error');
                }
            } catch (error) {
                console.error('Delete error:', error);
                Swal.fire('Error', 'Failed to delete community voices data', 'error');
            }
        }
    };

    if (loading) {
        return (
            <ProtectedRoute requiredPermission={{ resource: 'empower', action: 'view' }}>
                <div className="panel">
                    <div className="flex items-center justify-center py-10">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute requiredPermission={{ resource: 'empower', action: 'view' }}>
            <div className="panel">
                <div className="flex items-center justify-between mb-5">
                    <h5 className="font-semibold text-lg dark:text-white-light">Community Voices Management</h5>
                    {!communityVoicesData && (
                        <button
                            onClick={handleCreate}
                            className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600"
                        >
                            <IconPlus className="w-4 h-4 mr-2" />
                            Create Community Voices
                        </button>
                    )}
                </div>

                {communityVoicesData ? (
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
                                    <p className="text-gray-700 dark:text-gray-300">{communityVoicesData.mainPage.title}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Sub-Headline</label>
                                    <p className="text-gray-700 dark:text-gray-300">{communityVoicesData.mainPage.subHeadline}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Description</label>
                                    <p className="text-gray-700 dark:text-gray-300">{communityVoicesData.mainPage.description.text}</p>
                                    {communityVoicesData.mainPage.description.highlighted && (
                                        <p className="text-sm text-green-600 font-medium">{communityVoicesData.mainPage.description.highlighted}</p>
                                    )}
                                </div>

                                {communityVoicesData.mainPage.cta && communityVoicesData.mainPage.cta.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Call-to-Action Buttons</label>
                                        <div className="space-y-2">
                                            {communityVoicesData.mainPage.cta.map((cta, index) => (
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

                                {communityVoicesData.mainPage.modals && communityVoicesData.mainPage.modals.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Modal Items</label>
                                        <p className="text-sm text-gray-500">{communityVoicesData.mainPage.modals.length} modal items</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modals Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Voices From Field Modal */}
                            <div className="panel">
                                <div className="flex items-center justify-between mb-4">
                                    <h6 className="text-lg font-semibold">Voices From Field</h6>
                                    <button
                                        onClick={() => handleEditModal('voices-from-field')}
                                        className="btn btn-sm btn-outline-primary border-green-600 text-green-600 hover:bg-green-600"
                                    >
                                        <IconEdit className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{communityVoicesData.modals.voicesFromField.title}</p>
                                    <p className="text-xs text-gray-500">{communityVoicesData.modals.voicesFromField.items.length} voices</p>
                                </div>
                            </div>

                            {/* What Makes Our Impact Different Modal */}
                            <div className="panel">
                                <div className="flex items-center justify-between mb-4">
                                    <h6 className="text-lg font-semibold">What Makes Our Impact Different</h6>
                                    <button
                                        onClick={() => handleEditModal('what-makes-our-impact-different')}
                                        className="btn btn-sm btn-outline-primary border-green-600 text-green-600 hover:bg-green-600"
                                    >
                                        <IconEdit className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{communityVoicesData.modals.whatMakesOurImpactDifferent.title}</p>
                                    <p className="text-xs text-gray-500">
                                        Key 1: {communityVoicesData.modals.whatMakesOurImpactDifferent.key1.items.length} items
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Key 2: {communityVoicesData.modals.whatMakesOurImpactDifferent.key2.items.length} items
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="text-sm text-gray-500 pt-4 border-t">
                            <p>Created: {new Date(communityVoicesData.createdAt).toLocaleDateString()}</p>
                            <p>Updated: {new Date(communityVoicesData.updatedAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="mb-4">
                            <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                <IconPlus className="w-8 h-8 text-gray-400" />
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No Community Voices Page Created</h3>
                        <p className="text-gray-500 mb-4">Create a community voices page to get started.</p>
                        <button
                            onClick={handleCreate}
                            className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600"
                        >
                            <IconPlus className="w-4 h-4 mr-2" />
                            Create Community Voices
                        </button>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
};

export default CommunityVoicesPage;