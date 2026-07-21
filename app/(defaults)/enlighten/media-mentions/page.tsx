'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import IconPlus from '@/components/icon/icon-plus';
import IconEdit from '@/components/icon/icon-edit';
import IconTrash from '@/components/icon/icon-trash';
import IconVideo from '@/components/icon/icon-video';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api-client';
import ImageUploadField from '@/components/shared/ImageUploadField';
import VideoUploadField from '@/components/shared/VideoUploadField';

interface MediaMentionImage {
    src: string;
    alt: string;
}

interface MediaMentionCTA {
    text: string;
    href: string;
}

interface MediaMentionKey {
    text: string;
    highlighted: string;
}

interface MediaMentionHighlight {
    title: string;
    description: string;
    featuredImg: MediaMentionImage;
    video: string;
    year: string;
    datetime: string;
}

interface MediaMentionMainPage {
    title: string;
    subHeadline: string;
    description: string;
    key: MediaMentionKey;
    cta: MediaMentionCTA[];
    recentHighlights: MediaMentionHighlight[];
}

interface MediaMentionsData {
    id?: number;
    mainPage: MediaMentionMainPage;
}

const MediaMentionsPage = () => {
    const router = useRouter();
    const [mediaMentionsData, setMediaMentionsData] = useState<MediaMentionsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [showMainPageModal, setShowMainPageModal] = useState(false);
    const [showHighlightModal, setShowHighlightModal] = useState(false);
    const [editingHighlight, setEditingHighlight] = useState<MediaMentionHighlight | null>(null);
    const [newHighlight, setNewHighlight] = useState<MediaMentionHighlight>({
        title: '',
        description: '',
        featuredImg: { src: '', alt: '' },
        video: '',
        year: new Date().getFullYear().toString(),
        datetime: new Date().toISOString(),
    });

    useEffect(() => {
        fetchMediaMentionsData();
    }, []);

    const fetchMediaMentionsData = async () => {
        try {
            const result = await apiClient.get('/api/enlighten/media-mentions');
            if (result.success) {
                setMediaMentionsData(result.data);
            }
        } catch (error: any) {
            console.error('Fetch media mentions data error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveMainPage = async (mainPageData: MediaMentionMainPage) => {
        try {
            const payload = {
                id: mediaMentionsData?.id,
                mainPage: mainPageData,
            };

            const result = mediaMentionsData?.id ? await apiClient.put('/api/enlighten/media-mentions', payload) : await apiClient.post('/api/enlighten/media-mentions', payload);

            if (result.success) {
                Swal.fire('Success', 'Main page updated successfully', 'success');
                setShowMainPageModal(false);
                fetchMediaMentionsData();
            } else {
                Swal.fire('Error', result.error || 'Failed to save main page', 'error');
            }
        } catch (error: any) {
            console.error('Save main page error:', error);
            Swal.fire('Error', error.message || 'Failed to save main page', 'error');
        }
    };

    const handleSaveHighlight = async () => {
        if (!newHighlight.title.trim() || !newHighlight.description.trim()) {
            Swal.fire('Error', 'Title and description are required', 'error');
            return;
        }

        try {
            const updatedHighlights = editingHighlight
                ? mediaMentionsData?.mainPage.recentHighlights.map((highlight) => (highlight.title === editingHighlight.title ? newHighlight : highlight)) || []
                : [...(mediaMentionsData?.mainPage.recentHighlights || []), newHighlight];

            const updatedMainPage = {
                ...mediaMentionsData?.mainPage,
                recentHighlights: updatedHighlights,
            } as MediaMentionMainPage;

            await handleSaveMainPage(updatedMainPage);
            handleCloseHighlightModal();
        } catch (error: any) {
            console.error('Save highlight error:', error);
            Swal.fire('Error', error.message || 'Failed to save highlight', 'error');
        }
    };

    const handleEditHighlight = (highlight: MediaMentionHighlight) => {
        setNewHighlight(highlight);
        setEditingHighlight(highlight);
        setShowHighlightModal(true);
    };

    const handleDeleteHighlight = async (highlight: MediaMentionHighlight) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Delete highlight "${highlight.title}"? This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
        });

        if (result.isConfirmed) {
            try {
                const updatedHighlights = mediaMentionsData?.mainPage.recentHighlights.filter((h) => h.title !== highlight.title) || [];

                const updatedMainPage = {
                    ...mediaMentionsData?.mainPage,
                    recentHighlights: updatedHighlights,
                } as MediaMentionMainPage;

                await handleSaveMainPage(updatedMainPage);
                Swal.fire('Deleted!', 'Highlight has been deleted.', 'success');
            } catch (error: any) {
                console.error('Delete highlight error:', error);
                Swal.fire('Error', error.message || 'Failed to delete highlight', 'error');
            }
        }
    };

    const handleCloseHighlightModal = () => {
        setShowHighlightModal(false);
        setEditingHighlight(null);
        setNewHighlight({
            title: '',
            description: '',
            featuredImg: { src: '', alt: '' },
            video: '',
            year: new Date().getFullYear().toString(),
            datetime: new Date().toISOString(),
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <ProtectedRoute requiredPermission={{ resource: 'enlighten', action: 'view' }}>
            <div className="panel">
                <div className="flex items-center justify-between mb-5">
                    <h5 className="font-semibold text-lg dark:text-white-light">Media & Mentions</h5>
                    <div className="flex gap-2">
                        <button onClick={() => router.push('/enlighten/media-mentions/edit-main-page')} className="btn btn-outline-primary border-green-600 text-green-600 hover:bg-green-600">
                            Edit Main Page
                        </button>
                        <button onClick={() => router.push('/enlighten/media-mentions/add-highlight')} className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600">
                            <IconPlus className="w-5 h-5 mr-2" />
                            Add Highlight
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-10">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
                    </div>
                ) : (
                    <>
                        {/* Main Page Info */}
                        {mediaMentionsData?.mainPage && (
                            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <h3 className="text-lg font-semibold mb-2">{mediaMentionsData.mainPage.title}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{mediaMentionsData.mainPage.subHeadline}</p>
                                <p className="text-sm mb-2">{mediaMentionsData.mainPage.description}</p>
                                <div className="text-sm italic mb-2">
                                    "{mediaMentionsData.mainPage.key.text}" - <span className="font-semibold">{mediaMentionsData.mainPage.key.highlighted}</span>
                                </div>
                                {mediaMentionsData.mainPage.cta.length > 0 && (
                                    <div className="flex gap-2">
                                        {mediaMentionsData.mainPage.cta.map((cta, index) => (
                                            <a key={index} href={cta.href} className="btn btn-sm btn-outline-primary" target="_blank" rel="noopener noreferrer">
                                                {cta.text}
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Recent Highlights */}
                        <div>
                            <h4 className="text-lg font-semibold mb-4">Recent Highlights</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {mediaMentionsData?.mainPage.recentHighlights?.map((highlight, index) => (
                                    <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                                        {highlight.video ? (
                                            <video src={highlight.video} controls className="w-full h-48 object-cover" preload="metadata">
                                                Your browser does not support the video tag.
                                            </video>
                                        ) : highlight.featuredImg.src ? (
                                            <img src={highlight.featuredImg.src} alt={highlight.featuredImg.alt} className="w-full h-48 object-cover" />
                                        ) : null}
                                        <div className="p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-lg font-semibold">{highlight.title}</h3>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleEditHighlight(highlight)} className="text-blue-600 hover:text-blue-800" title="Edit Highlight">
                                                        <IconEdit className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDeleteHighlight(highlight)} className="text-red-600 hover:text-red-800" title="Delete Highlight">
                                                        <IconTrash className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{highlight.description}</p>
                                            <div className="text-xs text-gray-500 mb-2">
                                                <span className="mr-4">📅 {highlight.year}</span>
                                                {highlight.video && (
                                                    <span className="inline-flex items-center">
                                                        <IconVideo className="w-3 h-3 mr-1" />
                                                        Video
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-400">{formatDate(highlight.datetime)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {(!mediaMentionsData?.mainPage.recentHighlights || mediaMentionsData.mainPage.recentHighlights.length === 0) && (
                                <div className="text-center py-10">
                                    <p className="text-gray-500">No highlights available. Add your first highlight!</p>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Main Page Modal */}
                {showMainPageModal && <MainPageModal mainPage={mediaMentionsData?.mainPage} onSave={handleSaveMainPage} onClose={() => setShowMainPageModal(false)} />}

                {/* Add/Edit Highlight Modal */}
                {showHighlightModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <h3 className="text-lg font-semibold mb-4">{editingHighlight ? 'Edit Highlight' : 'Add New Highlight'}</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Title *</label>
                                    <input
                                        type="text"
                                        className="form-input w-full"
                                        placeholder="Enter highlight title"
                                        value={newHighlight.title}
                                        onChange={(e) => setNewHighlight((prev) => ({ ...prev, title: e.target.value }))}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Description *</label>
                                    <textarea
                                        className="form-textarea w-full"
                                        rows={3}
                                        placeholder="Enter description"
                                        value={newHighlight.description}
                                        onChange={(e) => setNewHighlight((prev) => ({ ...prev, description: e.target.value }))}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Year</label>
                                        <input
                                            type="text"
                                            className="form-input w-full"
                                            placeholder="2024"
                                            value={newHighlight.year}
                                            onChange={(e) => setNewHighlight((prev) => ({ ...prev, year: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Date & Time</label>
                                        <input
                                            type="datetime-local"
                                            className="form-input w-full"
                                            value={newHighlight.datetime.slice(0, 16)}
                                            onChange={(e) => setNewHighlight((prev) => ({ ...prev, datetime: e.target.value + ':00.000Z' }))}
                                        />
                                    </div>
                                </div>

                                <VideoUploadField
                                    value={newHighlight.video}
                                    onChange={(video) =>
                                        setNewHighlight((prev) => ({
                                            ...prev,
                                            video: video,
                                        }))
                                    }
                                    folder="enlighten/media-mentions"
                                    label="Video Upload"
                                />

                                <ImageUploadField
                                    value={newHighlight.featuredImg}
                                    onChange={(img) =>
                                        setNewHighlight((prev) => ({
                                            ...prev,
                                            featuredImg: img,
                                        }))
                                    }
                                    folder="enlighten/media-mentions"
                                    label="Featured Image (fallback if no video)"
                                />
                            </div>

                            <div className="flex gap-2 mt-6">
                                <button onClick={handleSaveHighlight} className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600">
                                    {editingHighlight ? 'Update Highlight' : 'Create Highlight'}
                                </button>
                                <button onClick={handleCloseHighlightModal} className="btn btn-outline-secondary">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
};

// Main Page Modal Component
interface MainPageModalProps {
    mainPage?: MediaMentionMainPage;
    onSave: (mainPage: MediaMentionMainPage) => void;
    onClose: () => void;
}

const MainPageModal: React.FC<MainPageModalProps> = ({ mainPage, onSave, onClose }) => {
    const [formData, setFormData] = useState<MediaMentionMainPage>(
        mainPage || {
            title: '',
            subHeadline: '',
            description: '',
            key: { text: '', highlighted: '' },
            cta: [],
            recentHighlights: [],
        },
    );

    const handleSave = () => {
        if (!formData.title.trim() || !formData.subHeadline.trim()) {
            Swal.fire('Error', 'Title and sub-headline are required', 'error');
            return;
        }
        onSave(formData);
    };

    const addCTA = () => {
        setFormData((prev) => ({
            ...prev,
            cta: [...prev.cta, { text: '', href: '' }],
        }));
    };

    const updateCTA = (index: number, field: 'text' | 'href', value: string) => {
        setFormData((prev) => ({
            ...prev,
            cta: prev.cta.map((cta, i) => (i === index ? { ...cta, [field]: value } : cta)),
        }));
    };

    const removeCTA = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            cta: prev.cta.filter((_, i) => i !== index),
        }));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-semibold mb-4">Edit Main Page</h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Title *</label>
                        <input
                            type="text"
                            className="form-input w-full"
                            placeholder="Enter main page title"
                            value={formData.title}
                            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Sub-Headline *</label>
                        <input
                            type="text"
                            className="form-input w-full"
                            placeholder="Enter sub-headline"
                            value={formData.subHeadline}
                            onChange={(e) => setFormData((prev) => ({ ...prev, subHeadline: e.target.value }))}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Description</label>
                        <textarea
                            className="form-textarea w-full"
                            rows={3}
                            placeholder="Enter description"
                            value={formData.description}
                            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Key Text</label>
                            <input
                                type="text"
                                className="form-input w-full"
                                placeholder="Key message"
                                value={formData.key.text}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        key: { ...prev.key, text: e.target.value },
                                    }))
                                }
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Highlighted Text</label>
                            <input
                                type="text"
                                className="form-input w-full"
                                placeholder="Highlighted part"
                                value={formData.key.highlighted}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        key: { ...prev.key, highlighted: e.target.value },
                                    }))
                                }
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium">Call-to-Action Buttons</label>
                            <button type="button" onClick={addCTA} className="btn btn-sm btn-outline-primary">
                                Add CTA
                            </button>
                        </div>
                        {formData.cta.map((cta, index) => (
                            <div key={index} className="grid grid-cols-2 gap-2 mb-2">
                                <input type="text" className="form-input" placeholder="Button text" value={cta.text} onChange={(e) => updateCTA(index, 'text', e.target.value)} />
                                <div className="flex gap-2">
                                    <input type="url" className="form-input flex-1" placeholder="Button URL" value={cta.href} onChange={(e) => updateCTA(index, 'href', e.target.value)} />
                                    <button type="button" onClick={() => removeCTA(index)} className="btn btn-sm btn-outline-danger">
                                        ×
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex gap-2 mt-6">
                    <button onClick={handleSave} className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600">
                        Save Main Page
                    </button>
                    <button onClick={onClose} className="btn btn-outline-secondary">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MediaMentionsPage;
