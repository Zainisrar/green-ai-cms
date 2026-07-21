'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import IconPlus from '@/components/icon/icon-plus';
import IconEdit from '@/components/icon/icon-edit';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api-client';

interface GreenTalentData {
    id: number;
    mainPage: {
        title: string;
        subHeadline: string;
        description: {
            text: string;
            headline: string;
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
        whyWeBuiltThis: {
            title: string;
            description: string;
            key: {
                title: string;
                items: string[];
            };
            quote: {
                text: string;
                highlighted: string;
            };
        };
        whatWeOffer: {
            title: string;
            items: Array<{
                title: string;
                description: {
                    text: string;
                    highlighted: string;
                };
            }>;
        };
        ourModel: {
            title: {
                step1: string;
                step2: string;
                step3: string;
            };
            description: string;
            key: Array<{
                title: string;
                description: string;
            }>;
            quote: {
                text: string;
                highlighted: string;
            };
        };
        partnerWithUs: {
            title: string;
            description: string;
            keys: Array<{
                title: string;
                description: string;
            }>;
        };
        alumniVoices: {
            title: string;
            voices: {
                text1: string;
                text2: string;
            };
        };
    };
    createdAt: string;
    updatedAt: string;
}

const GreenTalentIncubatorPage = () => {
    const router = useRouter();
    const [greenTalentData, setGreenTalentData] = useState<GreenTalentData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGreenTalentData();
    }, []);

    const fetchGreenTalentData = async () => {
        try {
            const result = await apiClient.get('/api/empower/green-talent-incubator');
            if (result.success) {
                setGreenTalentData(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch green talent incubator data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        router.push('/empower/green-talent-incubator/create');
    };

    const handleEditMainPage = () => {
        if (greenTalentData) {
            router.push(`/empower/green-talent-incubator/edit-main-page/${greenTalentData.id}`);
        }
    };

    const handleEditModal = (modalName: string) => {
        if (greenTalentData) {
            router.push(`/empower/green-talent-incubator/edit-${modalName}/${greenTalentData.id}`);
        }
    };

    const handleDelete = async () => {
        if (!greenTalentData) return;

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'This will permanently delete the green talent incubator data!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it!',
        });

        if (result.isConfirmed) {
            try {
                const deleteResult = await apiClient.delete(`/api/empower/green-talent-incubator/${greenTalentData.id}`);
                if (deleteResult.success) {
                    Swal.fire('Deleted!', 'Green talent incubator data has been deleted.', 'success');
                    setGreenTalentData(null);
                } else {
                    Swal.fire('Error', deleteResult.error || 'Failed to delete green talent incubator data', 'error');
                }
            } catch (error) {
                console.error('Delete error:', error);
                Swal.fire('Error', 'Failed to delete green talent incubator data', 'error');
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
                    <h5 className="font-semibold text-lg dark:text-white-light">Green Talent Incubator Management</h5>
                    {!greenTalentData && (
                        <button
                            onClick={handleCreate}
                            className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600"
                        >
                            <IconPlus className="w-4 h-4 mr-2" />
                            Create Green Talent Incubator
                        </button>
                    )}
                </div>

                {greenTalentData ? (
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
                                    <p className="text-gray-700 dark:text-gray-300">{greenTalentData.mainPage.title}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Sub-Headline</label>
                                    <p className="text-gray-700 dark:text-gray-300">{greenTalentData.mainPage.subHeadline}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Description</label>
                                    <p className="text-gray-700 dark:text-gray-300">{greenTalentData.mainPage.description.text}</p>
                                    {greenTalentData.mainPage.description.headline && (
                                        <p className="text-sm text-green-600 font-medium">{greenTalentData.mainPage.description.headline}</p>
                                    )}
                                </div>

                                {greenTalentData.mainPage.cta && greenTalentData.mainPage.cta.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Call-to-Action Buttons</label>
                                        <div className="space-y-2">
                                            {greenTalentData.mainPage.cta.map((cta, index) => (
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
                            {/* Why We Built This Modal */}
                            <div className="panel">
                                <div className="flex items-center justify-between mb-4">
                                    <h6 className="text-lg font-semibold">Why We Built This</h6>
                                    <button
                                        onClick={() => handleEditModal('why-we-built-this')}
                                        className="btn btn-sm btn-outline-primary border-green-600 text-green-600 hover:bg-green-600"
                                    >
                                        <IconEdit className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{greenTalentData.modals.whyWeBuiltThis.title}</p>
                                    <p className="text-xs text-gray-500">{greenTalentData.modals.whyWeBuiltThis.description}</p>
                                </div>
                            </div>

                            {/* What We Offer Modal */}
                            <div className="panel">
                                <div className="flex items-center justify-between mb-4">
                                    <h6 className="text-lg font-semibold">What We Offer</h6>
                                    <button
                                        onClick={() => handleEditModal('what-we-offer')}
                                        className="btn btn-sm btn-outline-primary border-green-600 text-green-600 hover:bg-green-600"
                                    >
                                        <IconEdit className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{greenTalentData.modals.whatWeOffer.title}</p>
                                    <p className="text-xs text-gray-500">{greenTalentData.modals.whatWeOffer.items.length} items</p>
                                </div>
                            </div>

                            {/* Our Model Modal */}
                            <div className="panel">
                                <div className="flex items-center justify-between mb-4">
                                    <h6 className="text-lg font-semibold">Our Model</h6>
                                    <button
                                        onClick={() => handleEditModal('our-model')}
                                        className="btn btn-sm btn-outline-primary border-green-600 text-green-600 hover:bg-green-600"
                                    >
                                        <IconEdit className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{greenTalentData.modals.ourModel.description}</p>
                                    <p className="text-xs text-gray-500">3 steps, {greenTalentData.modals.ourModel.key.length} key points</p>
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
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{greenTalentData.modals.partnerWithUs.title}</p>
                                    <p className="text-xs text-gray-500">{greenTalentData.modals.partnerWithUs.keys.length} partnership keys</p>
                                </div>
                            </div>

                            {/* Alumni Voices Modal */}
                            <div className="panel">
                                <div className="flex items-center justify-between mb-4">
                                    <h6 className="text-lg font-semibold">Alumni Voices</h6>
                                    <button
                                        onClick={() => handleEditModal('alumni-voices')}
                                        className="btn btn-sm btn-outline-primary border-green-600 text-green-600 hover:bg-green-600"
                                    >
                                        <IconEdit className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{greenTalentData.modals.alumniVoices.title}</p>
                                    <p className="text-xs text-gray-500">Alumni testimonials</p>
                                </div>
                            </div>
                        </div>

                        <div className="text-sm text-gray-500 pt-4 border-t">
                            <p>Created: {new Date(greenTalentData.createdAt).toLocaleDateString()}</p>
                            <p>Updated: {new Date(greenTalentData.updatedAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="mb-4">
                            <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                <IconPlus className="w-8 h-8 text-gray-400" />
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No Green Talent Incubator Created</h3>
                        <p className="text-gray-500 mb-4">Create a green talent incubator page to get started.</p>
                        <button
                            onClick={handleCreate}
                            className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600"
                        >
                            <IconPlus className="w-4 h-4 mr-2" />
                            Create Green Talent Incubator
                        </button>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
};

export default GreenTalentIncubatorPage;