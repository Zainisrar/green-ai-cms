'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import IconPlus from '@/components/icon/icon-plus';
import IconEdit from '@/components/icon/icon-edit';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api-client';

interface PartnerWithUsData {
    id: number;
    mainPage: {
        title: string;
        subHeadline: string;
        description: {
            text: string;
            highlighted: string;
        };
        key: Array<{
            title: string;
            description: string;
            cta: string;
        }>;
        quote: {
            text: string;
            highlighted: string;
        };
        img: {
            src: string;
            alt: string;
        };
        cta: Array<{
            text: string;
            href: string;
        }>;
    };
    modal: {
        whyGreen: {
            title: string;
            subHeadline: string;
            key: Array<{
                title: string;
                description: string;
            }>;
            quote: {
                text: string;
                highlighted: string;
            };
        };
        partnerShipTypes: {
            title: string;
            subHeadline: string;
            keys: Array<{
                icon: {
                    src: string;
                    alt: string;
                };
                title: string;
                description: string;
            }>;
        };
        whatYouCanExpect: {
            title: string;
            subHeadline: string;
            keys: string[];
        };
        abortionChannels: {
            title: string;
            subHeadline: string;
            key1: {
                title: string;
                items: string[];
            };
            key2: {
                title: string;
                items: string[];
            };
        };
        trustedBy: {
            title: string;
            subHeadline: string;
            icons: Array<{
                src: string;
                alt: string;
            }>;
        };
    };
    createdAt: string;
    updatedAt: string;
}

const PartnerWithUsPage = () => {
    const router = useRouter();
    const [partnerWithUsData, setPartnerWithUsData] = useState<PartnerWithUsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPartnerWithUsData();
    }, []);

    const fetchPartnerWithUsData = async () => {
        try {
            const result = await apiClient.get('/api/engage/partner-with-us');
            if (result.success) {
                setPartnerWithUsData(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch partner with us data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        router.push('/engage/partner-with-us/create');
    };

    const handleEditMainPage = () => {
        if (partnerWithUsData) {
            router.push(`/engage/partner-with-us/edit-main-page/${partnerWithUsData.id}`);
        }
    };

    const handleEditModal = (modalName: string) => {
        if (partnerWithUsData) {
            router.push(`/engage/partner-with-us/edit-${modalName}/${partnerWithUsData.id}`);
        }
    };

    const handleDelete = async () => {
        if (!partnerWithUsData) return;

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'This will permanently delete the partner with us data!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it!',
        });

        if (result.isConfirmed) {
            try {
                const deleteResult = await apiClient.delete(`/api/engage/partner-with-us/${partnerWithUsData.id}`);
                if (deleteResult.success) {
                    Swal.fire('Deleted!', 'Partner with us data has been deleted.', 'success');
                    setPartnerWithUsData(null);
                } else {
                    Swal.fire('Error', deleteResult.error || 'Failed to delete partner with us data', 'error');
                }
            } catch (error) {
                console.error('Delete error:', error);
                Swal.fire('Error', 'Failed to delete partner with us data', 'error');
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
                    <h5 className="font-semibold text-lg dark:text-white-light">Partner With Us Management</h5>
                    {!partnerWithUsData && (
                        <button
                            onClick={handleCreate}
                            className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600"
                        >
                            <IconPlus className="w-4 h-4 mr-2" />
                            Create Partner With Us
                        </button>
                    )}
                </div>

                {partnerWithUsData ? (
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
                                    <p className="text-gray-700 dark:text-gray-300">{partnerWithUsData.mainPage.title}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Sub-Headline</label>
                                    <p className="text-gray-700 dark:text-gray-300">{partnerWithUsData.mainPage.subHeadline}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Description</label>
                                    <p className="text-gray-700 dark:text-gray-300">{partnerWithUsData.mainPage.description.text}</p>
                                    {partnerWithUsData.mainPage.description.highlighted && (
                                        <p className="text-sm text-green-600 font-medium">{partnerWithUsData.mainPage.description.highlighted}</p>
                                    )}
                                </div>

                                {partnerWithUsData.mainPage.key && partnerWithUsData.mainPage.key.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Key Points</label>
                                        <p className="text-sm text-gray-500">{partnerWithUsData.mainPage.key.length} key points</p>
                                    </div>
                                )}

                                {partnerWithUsData.mainPage.cta && partnerWithUsData.mainPage.cta.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Call-to-Action Buttons</label>
                                        <div className="space-y-2">
                                            {partnerWithUsData.mainPage.cta.map((cta, index) => (
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
                            {/* Why Green Modal */}
                            <div className="panel">
                                <div className="flex items-center justify-between mb-4">
                                    <h6 className="text-lg font-semibold">Why Green</h6>
                                    <button
                                        onClick={() => handleEditModal('why-green')}
                                        className="btn btn-sm btn-outline-primary border-green-600 text-green-600 hover:bg-green-600"
                                    >
                                        <IconEdit className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{partnerWithUsData.modal.whyGreen.title}</p>
                                    <p className="text-xs text-gray-500">{partnerWithUsData.modal.whyGreen.subHeadline}</p>
                                    <p className="text-xs text-gray-500">{partnerWithUsData.modal.whyGreen.key.length} key points</p>
                                </div>
                            </div>

                            {/* Partnership Types Modal */}
                            <div className="panel">
                                <div className="flex items-center justify-between mb-4">
                                    <h6 className="text-lg font-semibold">Partnership Types</h6>
                                    <button
                                        onClick={() => handleEditModal('partnership-types')}
                                        className="btn btn-sm btn-outline-primary border-green-600 text-green-600 hover:bg-green-600"
                                    >
                                        <IconEdit className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{partnerWithUsData.modal.partnerShipTypes.title}</p>
                                    <p className="text-xs text-gray-500">{partnerWithUsData.modal.partnerShipTypes.subHeadline}</p>
                                    <p className="text-xs text-gray-500">{partnerWithUsData.modal.partnerShipTypes.keys.length} partnership types</p>
                                </div>
                            </div>

                            {/* What You Can Expect Modal */}
                            <div className="panel">
                                <div className="flex items-center justify-between mb-4">
                                    <h6 className="text-lg font-semibold">What You Can Expect</h6>
                                    <button
                                        onClick={() => handleEditModal('what-you-can-expect')}
                                        className="btn btn-sm btn-outline-primary border-green-600 text-green-600 hover:bg-green-600"
                                    >
                                        <IconEdit className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{partnerWithUsData.modal.whatYouCanExpect.title}</p>
                                    <p className="text-xs text-gray-500">{partnerWithUsData.modal.whatYouCanExpect.subHeadline}</p>
                                    <p className="text-xs text-gray-500">{partnerWithUsData.modal.whatYouCanExpect.keys.length} expectations</p>
                                </div>
                            </div>

                            {/* Abortion Channels Modal */}
                            <div className="panel">
                                <div className="flex items-center justify-between mb-4">
                                    <h6 className="text-lg font-semibold">Abortion Channels</h6>
                                    <button
                                        onClick={() => handleEditModal('abortion-channels')}
                                        className="btn btn-sm btn-outline-primary border-green-600 text-green-600 hover:bg-green-600"
                                    >
                                        <IconEdit className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{partnerWithUsData.modal.abortionChannels.title}</p>
                                    <p className="text-xs text-gray-500">{partnerWithUsData.modal.abortionChannels.subHeadline}</p>
                                    <p className="text-xs text-gray-500">
                                        Key 1: {partnerWithUsData.modal.abortionChannels.key1.items.length} items, 
                                        Key 2: {partnerWithUsData.modal.abortionChannels.key2.items.length} items
                                    </p>
                                </div>
                            </div>

                            {/* Trusted By Modal */}
                            <div className="panel">
                                <div className="flex items-center justify-between mb-4">
                                    <h6 className="text-lg font-semibold">Trusted By</h6>
                                    <button
                                        onClick={() => handleEditModal('trusted-by')}
                                        className="btn btn-sm btn-outline-primary border-green-600 text-green-600 hover:bg-green-600"
                                    >
                                        <IconEdit className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{partnerWithUsData.modal.trustedBy.title}</p>
                                    <p className="text-xs text-gray-500">{partnerWithUsData.modal.trustedBy.subHeadline}</p>
                                    <p className="text-xs text-gray-500">{partnerWithUsData.modal.trustedBy.icons.length} trusted partners</p>
                                </div>
                            </div>
                        </div>

                        <div className="text-sm text-gray-500 pt-4 border-t">
                            <p>Created: {new Date(partnerWithUsData.createdAt).toLocaleDateString()}</p>
                            <p>Updated: {new Date(partnerWithUsData.updatedAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="mb-4">
                            <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                <IconPlus className="w-8 h-8 text-gray-400" />
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No Partner With Us Page Created</h3>
                        <p className="text-gray-500 mb-4">Create a partner with us page to get started.</p>
                        <button
                            onClick={handleCreate}
                            className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600"
                        >
                            <IconPlus className="w-4 h-4 mr-2" />
                            Create Partner With Us
                        </button>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
};

export default PartnerWithUsPage;