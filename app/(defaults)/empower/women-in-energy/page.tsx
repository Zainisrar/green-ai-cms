'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import IconPlus from '@/components/icon/icon-plus';
import IconEdit from '@/components/icon/icon-edit';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api-client';

interface WomenInEnergyData {
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
    modal: {
        whyThisMatters: {
            title: string;
            subHeadline: string;
            description: string;
            img: {
                src: string;
                alt: string;
            };
            keys: string[];
            quote: {
                text: string;
                highlighted: string;
            };
        };
        initiativesUnderway: {
            title: string;
            subHeadline: string;
            key: Array<{
                program: string;
                description: string;
            }>;
            quote: {
                text: string;
                highlighted: string;
            };
        };
        voicesOfPower: {
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
        partnerWithUs: {
            title: string;
            description: string;
            keys: string[];
            quote: {
                text: string;
                highlighted: string;
            };
            img: {
                src: string;
                alt: string;
            };
        };
    };
    createdAt: string;
    updatedAt: string;
}

const WomenInEnergyPage = () => {
    const router = useRouter();
    const [womenInEnergyData, setWomenInEnergyData] = useState<WomenInEnergyData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWomenInEnergyData();
    }, []);

    const fetchWomenInEnergyData = async () => {
        try {
            const result = await apiClient.get('/api/empower/women-in-energy');
            if (result.success) {
                setWomenInEnergyData(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch women in energy data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        router.push('/empower/women-in-energy/create');
    };

    const handleEditMainPage = () => {
        if (womenInEnergyData) {
            router.push(`/empower/women-in-energy/edit-main-page/${womenInEnergyData.id}`);
        }
    };

    const handleEditModal = (modalName: string) => {
        if (womenInEnergyData) {
            router.push(`/empower/women-in-energy/edit-${modalName}/${womenInEnergyData.id}`);
        }
    };

    const handleDelete = async () => {
        if (!womenInEnergyData) return;

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'This will permanently delete the women in energy data!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it!',
        });

        if (result.isConfirmed) {
            try {
                const deleteResult = await apiClient.delete(`/api/empower/women-in-energy/${womenInEnergyData.id}`);
                if (deleteResult.success) {
                    Swal.fire('Deleted!', 'Women in energy data has been deleted.', 'success');
                    setWomenInEnergyData(null);
                } else {
                    Swal.fire('Error', deleteResult.error || 'Failed to delete women in energy data', 'error');
                }
            } catch (error) {
                console.error('Delete error:', error);
                Swal.fire('Error', 'Failed to delete women in energy data', 'error');
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
                    <h5 className="font-semibold text-lg dark:text-white-light">Women in Energy Management</h5>
                    {!womenInEnergyData && (
                        <button
                            onClick={handleCreate}
                            className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600"
                        >
                            <IconPlus className="w-4 h-4 mr-2" />
                            Create Women in Energy
                        </button>
                    )}
                </div>

                {womenInEnergyData ? (
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
                                    <p className="text-gray-700 dark:text-gray-300">{womenInEnergyData.mainPage.title}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Sub-Headline</label>
                                    <p className="text-gray-700 dark:text-gray-300">{womenInEnergyData.mainPage.subHeadline}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Description</label>
                                    <p className="text-gray-700 dark:text-gray-300">{womenInEnergyData.mainPage.description.text}</p>
                                    {womenInEnergyData.mainPage.description.highlighted && (
                                        <p className="text-sm text-green-600 font-medium">{womenInEnergyData.mainPage.description.highlighted}</p>
                                    )}
                                </div>

                                {womenInEnergyData.mainPage.cta && womenInEnergyData.mainPage.cta.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Call-to-Action Buttons</label>
                                        <div className="space-y-2">
                                            {womenInEnergyData.mainPage.cta.map((cta, index) => (
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Why This Matters Modal */}
                            <div className="panel">
                                <div className="flex items-center justify-between mb-4">
                                    <h6 className="text-lg font-semibold">Why This Matters</h6>
                                    <button
                                        onClick={() => handleEditModal('why-this-matters')}
                                        className="btn btn-sm btn-outline-primary border-green-600 text-green-600 hover:bg-green-600"
                                    >
                                        <IconEdit className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{womenInEnergyData.modal.whyThisMatters.title}</p>
                                    <p className="text-xs text-gray-500">{womenInEnergyData.modal.whyThisMatters.subHeadline}</p>
                                    <p className="text-xs text-gray-500">{womenInEnergyData.modal.whyThisMatters.keys.length} key points</p>
                                </div>
                            </div>

                            {/* Initiatives Underway Modal */}
                            <div className="panel">
                                <div className="flex items-center justify-between mb-4">
                                    <h6 className="text-lg font-semibold">Initiatives Underway</h6>
                                    <button
                                        onClick={() => handleEditModal('initiatives-underway')}
                                        className="btn btn-sm btn-outline-primary border-green-600 text-green-600 hover:bg-green-600"
                                    >
                                        <IconEdit className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{womenInEnergyData.modal.initiativesUnderway.title}</p>
                                    <p className="text-xs text-gray-500">{womenInEnergyData.modal.initiativesUnderway.subHeadline}</p>
                                    <p className="text-xs text-gray-500">{womenInEnergyData.modal.initiativesUnderway.key.length} programs</p>
                                </div>
                            </div>

                            {/* Voices of Power Modal */}
                            <div className="panel">
                                <div className="flex items-center justify-between mb-4">
                                    <h6 className="text-lg font-semibold">Voices of Power</h6>
                                    <button
                                        onClick={() => handleEditModal('voices-of-power')}
                                        className="btn btn-sm btn-outline-primary border-green-600 text-green-600 hover:bg-green-600"
                                    >
                                        <IconEdit className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{womenInEnergyData.modal.voicesOfPower.title}</p>
                                    <p className="text-xs text-gray-500">{womenInEnergyData.modal.voicesOfPower.items.length} voices</p>
                                </div>
                            </div>

                            {/* Partner With Us Modal */}
                            <div className="panel">
                                <div className="flex items-center justify-between mb-4">
                                    <h6 className="text-lg font-semibold">Partner With Us</h6>
                                    <button
                                        onClick={() => handleEditModal('partner-with-us')}
                                        className="btn btn-sm btn-outline-primary border-green-600 text-green-600 hover:bg-green-600"
                                    >
                                        <IconEdit className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{womenInEnergyData.modal.partnerWithUs.title}</p>
                                    <p className="text-xs text-gray-500">{womenInEnergyData.modal.partnerWithUs.description}</p>
                                    <p className="text-xs text-gray-500">{womenInEnergyData.modal.partnerWithUs.keys.length} partnership keys</p>
                                </div>
                            </div>
                        </div>

                        <div className="text-sm text-gray-500 pt-4 border-t">
                            <p>Created: {new Date(womenInEnergyData.createdAt).toLocaleDateString()}</p>
                            <p>Updated: {new Date(womenInEnergyData.updatedAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="mb-4">
                            <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                <IconPlus className="w-8 h-8 text-gray-400" />
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No Women in Energy Page Created</h3>
                        <p className="text-gray-500 mb-4">Create a women in energy page to get started.</p>
                        <button
                            onClick={handleCreate}
                            className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600"
                        >
                            <IconPlus className="w-4 h-4 mr-2" />
                            Create Women in Energy
                        </button>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
};

export default WomenInEnergyPage;