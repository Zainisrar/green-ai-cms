'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import IconPlus from '@/components/icon/icon-plus';
import IconEdit from '@/components/icon/icon-edit';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api-client';

interface PublicEventsVolunteeringData {
    id: number;
    mainPage: {
        title: string;
        subHeadline: string;
        description: {
            text: string;
            highlighted: string;
        };
        quote: {
            text: string;
            highlighted: string;
        };
        cta: Array<{
            text: string;
            href: string;
        }>;
    };
    modals: {
        whyWeEngage: {
            title: string;
            subHeadline: string;
            img: {
                src: string;
                alt: string;
            };
            quote: {
                text: string;
                highlighted: string;
            };
            content: string;
        };
        waysGetInvolved: {
            title: string;
            download: {
                text: string;
                href: string;
            };
            items: Array<{
                title: string;
                description: string;
                cta: {
                    text: string;
                    href: string;
                };
                img: {
                    src: string;
                    alt: string;
                };
            }>;
        };
        whoCanJoin: {
            title: string;
            items: Array<{
                title: string;
                description: string;
                optionalimg: {
                    src: string;
                    alt: string;
                };
            }>;
        };
        volunteerSignUp: {
            title: string;
            items: Array<{
                step: string;
                action: string;
            }>;
            quote: {
                text: string;
                highlighted: string;
            };
        };
        pastHighlights: {
            title: string;
            items: Array<{
                img: {
                    src: string;
                    alt: string;
                };
                title: string;
                description: string;
                year: string;
            }>;
            browse: {
                text: string;
                highlighted: string;
            };
        };
    };
    createdAt: string;
    updatedAt: string;
}

const PublicEventsVolunteeringPage = () => {
    const router = useRouter();
    const [publicEventsVolunteeringData, setPublicEventsVolunteeringData] = useState<PublicEventsVolunteeringData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPublicEventsVolunteeringData();
    }, []);

    const fetchPublicEventsVolunteeringData = async () => {
        try {
            const result = await apiClient.get('/api/engage/public-events-volunteering');
            if (result.success) {
                setPublicEventsVolunteeringData(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch public events volunteering data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        router.push('/engage/public-events-volunteering/create');
    };

    const handleEditMainPage = () => {
        if (publicEventsVolunteeringData) {
            router.push(`/engage/public-events-volunteering/edit-main-page/${publicEventsVolunteeringData.id}`);
        }
    };

    const handleEditModal = (modalName: string) => {
        if (publicEventsVolunteeringData) {
            router.push(`/engage/public-events-volunteering/edit-${modalName}/${publicEventsVolunteeringData.id}`);
        }
    };

    const handleDelete = async () => {
        if (!publicEventsVolunteeringData) return;

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'This will permanently delete the public events volunteering data!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it!',
        });

        if (result.isConfirmed) {
            try {
                const deleteResult = await apiClient.delete(`/api/engage/public-events-volunteering/${publicEventsVolunteeringData.id}`);
                if (deleteResult.success) {
                    Swal.fire('Deleted!', 'Public events volunteering data has been deleted.', 'success');
                    setPublicEventsVolunteeringData(null);
                } else {
                    Swal.fire('Error', deleteResult.error || 'Failed to delete public events volunteering data', 'error');
                }
            } catch (error) {
                console.error('Delete error:', error);
                Swal.fire('Error', 'Failed to delete public events volunteering data', 'error');
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
                    <h5 className="font-semibold text-lg dark:text-white-light">Public Events Volunteering Management</h5>
                    {!publicEventsVolunteeringData && (
                        <button
                            onClick={handleCreate}
                            className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600"
                        >
                            <IconPlus className="w-4 h-4 mr-2" />
                            Create Public Events Volunteering
                        </button>
                    )}
                </div>

                {publicEventsVolunteeringData ? (
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
                                    <p className="text-gray-700 dark:text-gray-300">{publicEventsVolunteeringData.mainPage.title}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Sub-Headline</label>
                                    <p className="text-gray-700 dark:text-gray-300">{publicEventsVolunteeringData.mainPage.subHeadline}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Description</label>
                                    <p className="text-gray-700 dark:text-gray-300">{publicEventsVolunteeringData.mainPage.description.text}</p>
                                    {publicEventsVolunteeringData.mainPage.description.highlighted && (
                                        <p className="text-sm text-green-600 font-medium">{publicEventsVolunteeringData.mainPage.description.highlighted}</p>
                                    )}
                                </div>

                                {publicEventsVolunteeringData.mainPage.cta && publicEventsVolunteeringData.mainPage.cta.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Call-to-Action Buttons</label>
                                        <div className="space-y-2">
                                            {publicEventsVolunteeringData.mainPage.cta.map((cta, index) => (
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
                            {/* Why We Engage Modal */}
                            <div className="panel">
                                <div className="flex items-center justify-between mb-4">
                                    <h6 className="text-lg font-semibold">Why We Engage</h6>
                                    <button
                                        onClick={() => handleEditModal('why-we-engage')}
                                        className="btn btn-sm btn-outline-primary border-green-600 text-green-600 hover:bg-green-600"
                                    >
                                        <IconEdit className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{publicEventsVolunteeringData.modals.whyWeEngage.title}</p>
                                    <p className="text-xs text-gray-500">{publicEventsVolunteeringData.modals.whyWeEngage.subHeadline}</p>
                                    <p className="text-xs text-gray-500">Rich text content included</p>
                                </div>
                            </div>

                            {/* Ways to Get Involved Modal */}
                            <div className="panel">
                                <div className="flex items-center justify-between mb-4">
                                    <h6 className="text-lg font-semibold">Ways to Get Involved</h6>
                                    <button
                                        onClick={() => handleEditModal('ways-get-involved')}
                                        className="btn btn-sm btn-outline-primary border-green-600 text-green-600 hover:bg-green-600"
                                    >
                                        <IconEdit className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{publicEventsVolunteeringData.modals.waysGetInvolved.title}</p>
                                    <p className="text-xs text-gray-500">{publicEventsVolunteeringData.modals.waysGetInvolved.items.length} ways to get involved</p>
                                    {publicEventsVolunteeringData.modals.waysGetInvolved.download.text && (
                                        <p className="text-xs text-blue-600">Download available</p>
                                    )}
                                </div>
                            </div>

                            {/* Who Can Join Modal */}
                            <div className="panel">
                                <div className="flex items-center justify-between mb-4">
                                    <h6 className="text-lg font-semibold">Who Can Join</h6>
                                    <button
                                        onClick={() => handleEditModal('who-can-join')}
                                        className="btn btn-sm btn-outline-primary border-green-600 text-green-600 hover:bg-green-600"
                                    >
                                        <IconEdit className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{publicEventsVolunteeringData.modals.whoCanJoin.title}</p>
                                    <p className="text-xs text-gray-500">{publicEventsVolunteeringData.modals.whoCanJoin.items.length} eligibility criteria</p>
                                </div>
                            </div>

                            {/* Volunteer Sign Up Modal */}
                            <div className="panel">
                                <div className="flex items-center justify-between mb-4">
                                    <h6 className="text-lg font-semibold">Volunteer Sign Up</h6>
                                    <button
                                        onClick={() => handleEditModal('volunteer-sign-up')}
                                        className="btn btn-sm btn-outline-primary border-green-600 text-green-600 hover:bg-green-600"
                                    >
                                        <IconEdit className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{publicEventsVolunteeringData.modals.volunteerSignUp.title}</p>
                                    <p className="text-xs text-gray-500">{publicEventsVolunteeringData.modals.volunteerSignUp.items.length} sign-up steps</p>
                                </div>
                            </div>

                            {/* Past Highlights Modal */}
                            <div className="panel">
                                <div className="flex items-center justify-between mb-4">
                                    <h6 className="text-lg font-semibold">Past Highlights</h6>
                                    <button
                                        onClick={() => handleEditModal('past-highlights')}
                                        className="btn btn-sm btn-outline-primary border-green-600 text-green-600 hover:bg-green-600"
                                    >
                                        <IconEdit className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{publicEventsVolunteeringData.modals.pastHighlights.title}</p>
                                    <p className="text-xs text-gray-500">{publicEventsVolunteeringData.modals.pastHighlights.items.length} past highlights</p>
                                </div>
                            </div>
                        </div>

                        <div className="text-sm text-gray-500 pt-4 border-t">
                            <p>Created: {new Date(publicEventsVolunteeringData.createdAt).toLocaleDateString()}</p>
                            <p>Updated: {new Date(publicEventsVolunteeringData.updatedAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="mb-4">
                            <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                <IconPlus className="w-8 h-8 text-gray-400" />
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No Public Events Volunteering Page Created</h3>
                        <p className="text-gray-500 mb-4">Create a public events volunteering page to get started.</p>
                        <button
                            onClick={handleCreate}
                            className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600"
                        >
                            <IconPlus className="w-4 h-4 mr-2" />
                            Create Public Events Volunteering
                        </button>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
};

export default PublicEventsVolunteeringPage;