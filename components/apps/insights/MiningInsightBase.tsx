'use client';
import React, { useState, useEffect } from 'react';
import { useInsightItem } from './hooks/useInsightItem';
import { useUpdateInsight } from './hooks/useUpdateInsight';
import { navigationApi } from '@/lib/api/navigation';
import Loading from '@/components/layouts/loading';
import IconEdit from '@/components/icon/icon-edit';
import IconCheck from '@/components/icon/icon-checks';
import IconX from '@/components/icon/icon-x';
import IconPlus from '@/components/icon/icon-plus';
import IconTrash from '@/components/icon/icon-trash';
import IconArrowBackward from '@/components/icon/icon-arrow-backward';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

interface MiningInsightBaseProps {
    insightId: string;
    title: string;
}

const MiningInsightBase = ({ insightId, title }: MiningInsightBaseProps) => {
    const router = useRouter();
    const { data: insight, isLoading, error, isError } = useInsightItem({ id: insightId });
    const { mutate: updateInsight, isPending, isSuccess } = useUpdateInsight();

    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        headline: '',
        subheadline: '',
        highlighted: '',
        description: '',
        bgImg: '',
        keys: [{ icon: '', text: '' }],
        cta1: { text: '', link: '' },
        cta2: { text: '', link: '' },
    });

    const [selectedBgImage, setSelectedBgImage] = useState<File | null>(null);
    const [selectedKeyIcons, setSelectedKeyIcons] = useState<{ [key: number]: File }>({});
    const bgImageInputRef = React.useRef<HTMLInputElement>(null);

    // Initialize edit data when insight loads
    useEffect(() => {
        if (insight) {
            setEditData({
                headline: insight.headline,
                subheadline: insight.subheadline,
                highlighted: insight.highlighted,
                description: insight.description,
                bgImg: insight.bgImg,
                keys: insight.keys,
                cta1: insight.cta1,
                cta2: insight.cta2,
            });
        }
    }, [insight]);

    // Handle success
    useEffect(() => {
        if (isSuccess) {
            const toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
            });
            toast.fire({
                icon: 'success',
                title: 'Insight updated successfully!',
            });
            setIsEditing(false);
        }
    }, [isSuccess]);

    const handleImageUpload = async (file: File) => {
        try {
            return await navigationApi.uploadImage(file);
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    };

    const handleSave = async () => {
        try {
            let updatedData = { ...editData };

            // Upload background image if selected
            if (selectedBgImage) {
                const uploadResult = await handleImageUpload(selectedBgImage);
                updatedData.bgImg = uploadResult.url;
            }

            // Upload key icons if selected
            const updatedKeys = [...updatedData.keys];
            for (const [index, file] of Object.entries(selectedKeyIcons)) {
                const uploadResult = await handleImageUpload(file);
                updatedKeys[parseInt(index)].icon = uploadResult.url;
            }
            updatedData.keys = updatedKeys;

            updateInsight({
                id: insightId,
                data: updatedData,
            });
        } catch (error) {
            console.error('Error uploading images:', error);
            Swal.fire({
                icon: 'error',
                title: 'Upload Error',
                text: 'Failed to upload images. Please try again.',
            });
        }
    };

    const handleCancel = () => {
        if (insight) {
            setEditData({
                headline: insight.headline,
                subheadline: insight.subheadline,
                highlighted: insight.highlighted,
                description: insight.description,
                bgImg: insight.bgImg,
                keys: insight.keys,
                cta1: insight.cta1,
                cta2: insight.cta2,
            });
        }
        setSelectedBgImage(null);
        setSelectedKeyIcons({});
        setIsEditing(false);
    };

    const handleBgImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedBgImage(e.target.files[0]);
        }
    };

    const handleKeyIconChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedKeyIcons((prev) => ({
                ...prev,
                [index]: e.target.files![0],
            }));
        }
    };

    const addKey = () => {
        setEditData((prev) => ({
            ...prev,
            keys: [...prev.keys, { icon: '', text: '' }],
        }));
    };

    const removeKey = (index: number) => {
        setEditData((prev) => ({
            ...prev,
            keys: prev.keys.filter((_, i) => i !== index),
        }));
    };

    const updateKey = (index: number, field: 'icon' | 'text', value: string) => {
        setEditData((prev) => ({
            ...prev,
            keys: prev.keys.map((key, i) => (i === index ? { ...key, [field]: value } : key)),
        }));
    };

    if (isLoading) return <Loading />;

    if (isError) {
        return (
            <div className="panel mt-6">
                <div className="text-center py-10">
                    <p className="text-red-500">Error loading insight: {error?.message}</p>
                    <button onClick={() => window.location.reload()} className="btn btn-primary mt-4">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!insight) return <Loading />;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <button onClick={() => router.back()} className="cursor-pointer hover:text-primary transition-colors">
                        <IconArrowBackward width={30} />
                    </button>
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{title}</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage and edit banner insight content</p>
                    </div>
                </div>
                <div className="flex space-x-2">
                    {!isEditing ? (
                        <button onClick={() => setIsEditing(true)} className="btn btn-primary flex items-center space-x-2">
                            <IconEdit className="w-4 h-4" />
                            <span>Edit</span>
                        </button>
                    ) : (
                        <>
                            <button onClick={handleSave} disabled={isPending} className="btn btn-success flex items-center space-x-2">
                                <IconCheck className="w-4 h-4" />
                                <span>{isPending ? 'Saving...' : 'Save'}</span>
                            </button>
                            <button onClick={handleCancel} className="btn btn-secondary flex items-center space-x-2">
                                <IconX className="w-4 h-4" />
                                <span>Cancel</span>
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="panel">
                {/* Background Image */}
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Background Image</label>
                    {isEditing ? (
                        <div className="space-y-4">
                            <div className="relative h-64 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600">
                                {selectedBgImage ? (
                                    <div className="relative h-full">
                                        <img src={URL.createObjectURL(selectedBgImage)} alt="Selected Background" className="w-full h-full object-cover" />
                                        <button onClick={() => setSelectedBgImage(null)} className="absolute top-2 right-2 btn btn-danger btn-sm">
                                            <IconTrash className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="text-center">
                                            <img src={insight.bgImg} alt="Current Background" className="w-full h-full object-cover absolute inset-0 opacity-50" />
                                            <div className="relative z-10">
                                                <p className="text-gray-500 dark:text-gray-400 mb-2">Current image or click to change</p>
                                                <button onClick={() => bgImageInputRef.current?.click()} className="btn btn-primary">
                                                    Choose New Image
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <input type="file" ref={bgImageInputRef} onChange={handleBgImageChange} accept="image/*" className="hidden" />
                            {!selectedBgImage && (
                                <button onClick={() => bgImageInputRef.current?.click()} className="btn btn-outline-primary w-full">
                                    Upload New Background Image
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="relative h-64 rounded-lg overflow-hidden">
                            <img src={insight.bgImg} alt="Background" className="w-full h-full object-cover" />
                        </div>
                    )}
                </div>

                {/* Headlines */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Headline</label>
                        {isEditing ? (
                            <input type="text" value={editData.headline} onChange={(e) => setEditData((prev) => ({ ...prev, headline: e.target.value }))} className="form-input w-full" />
                        ) : (
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{insight.headline}</h2>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Subheadline</label>
                        {isEditing ? (
                            <input type="text" value={editData.subheadline} onChange={(e) => setEditData((prev) => ({ ...prev, subheadline: e.target.value }))} className="form-input w-full" />
                        ) : (
                            <h3 className="text-lg text-gray-700 dark:text-gray-300">{insight.subheadline}</h3>
                        )}
                    </div>
                </div>

                {/* Highlighted Text */}
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Highlighted Text</label>
                    {isEditing ? (
                        <input type="text" value={editData.highlighted} onChange={(e) => setEditData((prev) => ({ ...prev, highlighted: e.target.value }))} className="form-input w-full" />
                    ) : (
                        <span className="inline-block bg-primary text-white px-4 py-2 rounded-full text-sm font-medium">{insight.highlighted}</span>
                    )}
                </div>

                {/* Description */}
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Description</label>
                    {isEditing ? (
                        <textarea value={editData.description} onChange={(e) => setEditData((prev) => ({ ...prev, description: e.target.value }))} className="form-textarea w-full h-32" rows={4} />
                    ) : (
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{insight.description}</p>
                    )}
                </div>

                {/* Keys */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <label className="block text-sm font-medium">Key Points</label>
                        {isEditing && (
                            <button onClick={addKey} className="btn btn-outline-primary btn-sm flex items-center space-x-1">
                                <IconPlus className="w-4 h-4" />
                                <span>Add Key</span>
                            </button>
                        )}
                    </div>
                    <div className="space-y-4">
                        {(isEditing ? editData.keys : insight.keys).map((key, index) => (
                            <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                {isEditing ? (
                                    <>
                                        <div className="flex flex-col items-center space-y-2">
                                            {selectedKeyIcons[index] ? (
                                                <div className="relative">
                                                    <img src={URL.createObjectURL(selectedKeyIcons[index])} alt="Selected Icon" className="w-12 h-12 object-cover rounded" />
                                                    <button
                                                        onClick={() => {
                                                            const newIcons = { ...selectedKeyIcons };
                                                            delete newIcons[index];
                                                            setSelectedKeyIcons(newIcons);
                                                        }}
                                                        className="absolute -top-1 -right-1 btn btn-danger btn-xs"
                                                    >
                                                        <IconX className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="relative">
                                                    <img src={key.icon} alt="Current Icon" className="w-12 h-12 object-cover rounded opacity-50" />
                                                    <button
                                                        onClick={() => {
                                                            const input = document.createElement('input');
                                                            input.type = 'file';
                                                            input.accept = 'image/*';
                                                            input.onchange = (e) => handleKeyIconChange(index, e as any);
                                                            input.click();
                                                        }}
                                                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded text-white text-xs"
                                                    >
                                                        <IconEdit className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                            <button
                                                onClick={() => {
                                                    const input = document.createElement('input');
                                                    input.type = 'file';
                                                    input.accept = 'image/*';
                                                    input.onchange = (e) => handleKeyIconChange(index, e as any);
                                                    input.click();
                                                }}
                                                className="btn btn-outline-primary btn-xs"
                                            >
                                                {selectedKeyIcons[index] ? 'Change' : 'Upload'}
                                            </button>
                                        </div>
                                        <input type="text" value={key.text} onChange={(e) => updateKey(index, 'text', e.target.value)} className="form-input flex-1" placeholder="Key point text" />
                                        <button onClick={() => removeKey(index)} className="btn btn-outline-danger btn-sm">
                                            <IconTrash className="w-4 h-4" />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <img src={key.icon} alt="Icon" className="w-8 h-8 object-cover rounded" />
                                        <span className="text-gray-700 dark:text-gray-300">{key.text}</span>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTAs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">CTA 1</label>
                        {isEditing ? (
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    value={editData.cta1.text}
                                    onChange={(e) =>
                                        setEditData((prev) => ({
                                            ...prev,
                                            cta1: { ...prev.cta1, text: e.target.value },
                                        }))
                                    }
                                    className="form-input w-full"
                                    placeholder="CTA text"
                                />
                                <input
                                    type="url"
                                    value={editData.cta1.link}
                                    onChange={(e) =>
                                        setEditData((prev) => ({
                                            ...prev,
                                            cta1: { ...prev.cta1, link: e.target.value },
                                        }))
                                    }
                                    className="form-input w-full"
                                    placeholder="CTA link"
                                />
                            </div>
                        ) : (
                            <a href={insight.cta1.link} className="btn btn-primary inline-block">
                                {insight.cta1.text}
                            </a>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">CTA 2</label>
                        {isEditing ? (
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    value={editData.cta2.text}
                                    onChange={(e) =>
                                        setEditData((prev) => ({
                                            ...prev,
                                            cta2: { ...prev.cta2, text: e.target.value },
                                        }))
                                    }
                                    className="form-input w-full"
                                    placeholder="CTA text"
                                />
                                <input
                                    type="url"
                                    value={editData.cta2.link}
                                    onChange={(e) =>
                                        setEditData((prev) => ({
                                            ...prev,
                                            cta2: { ...prev.cta2, link: e.target.value },
                                        }))
                                    }
                                    className="form-input w-full"
                                    placeholder="CTA link"
                                />
                            </div>
                        ) : (
                            <a href={insight.cta2.link} className="btn btn-secondary inline-block">
                                {insight.cta2.text}
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MiningInsightBase;
