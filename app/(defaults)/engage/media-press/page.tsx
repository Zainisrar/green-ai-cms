'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import IconPlus from '@/components/icon/icon-plus';
import IconEdit from '@/components/icon/icon-edit';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api-client';

interface MediaPressData {
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
    latestPressReleases: {
        title: string;
        items: Array<{
            img: {
                src: string;
                alt: string;
            };
            title: string;
            date: string;
            datetime: string;
            cta: {
                text: string;
                href: string;
            };
        }>;
    };
    mediaContactRequests: {
        title: string;
        contactType: string[];
        email: string[];
        phoneNumber: {
            src: string;
            text: string;
        };
        timings: string;
    };
    mediaKitDownload: {
        title: string;
        kits: Array<{
            src: string;
            title: string;
        }>;
    };
    greenNews: {
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
    };
    officialSpokesPeople: {
        title: string;
        items: Array<{
            img: {
                src: string;
                alt: string;
            };
            title: string;
            member: {
                name: string;
                designation: string;
            };
        }>;
    };
    createdAt: string;
    updatedAt: string;
}

const MediaPressPage = () => {
    const router = useRouter();
    const [mediaPressData, setMediaPressData] = useState<MediaPressData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMediaPressData();
    }, []);

    const fetchMediaPressData = async () => {
        try {
            const result = await apiClient.get('/api/engage/media-press');
            if (result.success) {
                setMediaPressData(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch media press data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        router.push('/engage/media-press/create');
    };

    const handleEditMainPage = () => {
        if (mediaPressData) {
            router.push(`/engage/media-press/edit-main-page/${mediaPressData.id}`);
        }
    };

    const handleEditModal = (modalName: string) => {
        if (mediaPressData) {
            router.push(`/engage/media-press/edit-${modalName}/${mediaPressData.id}`);
        }
    };

    const handleDelete = async () => {
        if (!mediaPressData) return;

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'This will permanently delete the media press data!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it!',
        });

        if (result.isConfirmed) {
            try {
                const deleteResult = await apiClient.delete(`/api/engage/media-press/${mediaPressData.id}`);
                if (deleteResult.success) {
                    Swal.fire('Deleted!', 'Media press data has been deleted.', 'success');
                    setMediaPressData(null);
                } else {
                    Swal.fire('Error', deleteResult.error || 'Failed to delete media press data', 'error');
                }
            } catch (error) {
                console.error('Delete error:', error);
                Swal.fire('Error', 'Failed to delete media press data', 'error');
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
                    <h5 className="font-semibold text-lg dark:text-white-light">Media Press Management</h5>
                    {!mediaPressData && (
                        <button
                            onClick={handleCreate}
                            className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600"
                        >
                            <IconPlus className="w-4 h-4 mr-2" />
                            Create Media Press
                        </button>
                    )}
                </div>

                {mediaPressData ? (
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
                                    <p className="text-gray-700 dark:text-gray-300">{mediaPressData.mainPage.title}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Sub-Headline</label>
                                    <p className="text-gray-700 dark:text-gray-300">{mediaPressData.mainPage.subHeadline}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Description</label>
                                    <p className="text-gray-700 dark:text-gray-300">{mediaPressData.mainPage.description.text}</p>
                                    {mediaPressData.mainPage.description.highlighted && (
                                        <p className="text-sm text-green-600 font-medium">{mediaPressData.mainPage.description.highlighted}</p>
                                    )}
                                </div>

                                {mediaPressData.mainPage.cta && mediaPressData.mainPage.cta.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Call-to-Action Buttons</label>
                                        <div className="space-y-2">
                                            {mediaPressData.mainPage.cta.map((cta, index) => (
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
                            {/* Latest Press Releases Modal */}
                            <div className="panel">
                                <div className="flex items-center justify-between mb-4">
                                    <h6 className="text-lg font-semibold">Latest Press Releases</h6>
                                    <button
                                        onClick={() => handleEditModal('latest-press-releases')}
                                        className="btn btn-sm btn-outline-primary border-green-600 text-green-600 hover:bg-green-600"
                                    >
                                        <IconEdit className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{mediaPressData.latestPressReleases.title}</p>
                                    <p className="text-xs text-gray-500">{mediaPressData.latestPressReleases.items.length} press releases</p>
                                </div>
                            </div>

                            {/* Media Contact Requests Modal */}
                            <div className="panel">
                                <div className="flex items-center justify-between mb-4">
                                    <h6 className="text-lg font-semibold">Media Contact Requests</h6>
                                    <button
                                        onClick={() => handleEditModal('media-contact-requests')}
                                        className="btn btn-sm btn-outline-primary border-green-600 text-green-600 hover:bg-green-600"
                                    >
                                        <IconEdit className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{mediaPressData.mediaContactRequests.title}</p>
                                    <p className="text-xs text-gray-500">
                                        Contact Types: {mediaPressData.mediaContactRequests.contactType.length}, 
                                        Emails: {mediaPressData.mediaContactRequests.email.length}
                                    </p>
                                </div>
                            </div>

                            {/* Media Kit Download Modal */}
                            <div className="panel">
                                <div className="flex items-center justify-between mb-4">
                                    <h6 className="text-lg font-semibold">Media Kit Download</h6>
                                    <button
                                        onClick={() => handleEditModal('media-kit-download')}
                                        className="btn btn-sm btn-outline-primary border-green-600 text-green-600 hover:bg-green-600"
                                    >
                                        <IconEdit className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{mediaPressData.mediaKitDownload.title}</p>
                                    <p className="text-xs text-gray-500">{mediaPressData.mediaKitDownload.kits.length} media kits</p>
                                </div>
                            </div>

                            {/* Green News Modal */}
                            <div className="panel">
                                <div className="flex items-center justify-between mb-4">
                                    <h6 className="text-lg font-semibold">Green News</h6>
                                    <button
                                        onClick={() => handleEditModal('green-news')}
                                        className="btn btn-sm btn-outline-primary border-green-600 text-green-600 hover:bg-green-600"
                                    >
                                        <IconEdit className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{mediaPressData.greenNews.title}</p>
                                    <p className="text-xs text-gray-500 line-clamp-2">{mediaPressData.greenNews.description}</p>
                                </div>
                            </div>

                            {/* Official Spokes People Modal */}
                            <div className="panel">
                                <div className="flex items-center justify-between mb-4">
                                    <h6 className="text-lg font-semibold">Official Spokes People</h6>
                                    <button
                                        onClick={() => handleEditModal('official-spokes-people')}
                                        className="btn btn-sm btn-outline-primary border-green-600 text-green-600 hover:bg-green-600"
                                    >
                                        <IconEdit className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{mediaPressData.officialSpokesPeople.title}</p>
                                    <p className="text-xs text-gray-500">{mediaPressData.officialSpokesPeople.items.length} spokes people</p>
                                </div>
                            </div>
                        </div>

                        <div className="text-sm text-gray-500 pt-4 border-t">
                            <p>Created: {new Date(mediaPressData.createdAt).toLocaleDateString()}</p>
                            <p>Updated: {new Date(mediaPressData.updatedAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="mb-4">
                            <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                <IconPlus className="w-8 h-8 text-gray-400" />
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No Media Press Page Created</h3>
                        <p className="text-gray-500 mb-4">Create a media press page to get started.</p>
                        <button
                            onClick={handleCreate}
                            className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600"
                        >
                            <IconPlus className="w-4 h-4 mr-2" />
                            Create Media Press
                        </button>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
};

export default MediaPressPage;