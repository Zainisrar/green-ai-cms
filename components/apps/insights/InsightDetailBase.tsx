'use client';
import React, { useState, useEffect } from 'react';
import { useInsightDetailItem } from './hooks/useInsightDetailItem';
import { useUpdateInsightDetail } from './hooks/useUpdateInsightDetail';
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

interface InsightDetailBaseProps {
    detailId: string;
    title: string;
}

const InsightDetailBase = ({ detailId, title }: InsightDetailBaseProps) => {
    const router = useRouter();
    const { data: detail, isLoading, error, isError } = useInsightDetailItem({ id: detailId });
    const { mutate: updateDetail, isPending, isSuccess } = useUpdateInsightDetail();

    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        bgImg: '',
        backgroundImg: '',
        navigation: { items: [{ name: '', link: '' }] },
        title: '',
        subheadline: '',
        description: '',
        name1: '',
        name2: '',
        cardTitle: '',
        keypoints: [{ icon: '', text: '' }],
        slug: '',
        imageDirection: 'left' as 'left' | 'right',
    });

    const [selectedBgImage, setSelectedBgImage] = useState<File | null>(null);
    const [selectedKeyIcons, setSelectedKeyIcons] = useState<{ [key: number]: File }>({});
    const bgImageInputRef = React.useRef<HTMLInputElement>(null);

    // Initialize edit data when detail loads
    useEffect(() => {
        if (detail) {
            setEditData({
                bgImg: detail.bgImg,
                backgroundImg: detail.backgroundImg || '',
                navigation: detail.navigation,
                title: detail.title,
                subheadline: detail.subheadline,
                description: detail.description,
                name1: detail.name1,
                name2: detail.name2,
                cardTitle: detail.cardTitle,
                keypoints: detail.keypoints,
                slug: detail.slug || '',
                imageDirection: detail.imageDirection || 'left',
            });
        }
    }, [detail]);

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
                title: 'Insight detail updated successfully!',
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
            const updatedKeypoints = [...updatedData.keypoints];
            for (const [index, file] of Object.entries(selectedKeyIcons)) {
                const uploadResult = await handleImageUpload(file);
                updatedKeypoints[parseInt(index)].icon = uploadResult.url;
            }
            updatedData.keypoints = updatedKeypoints;

            updateDetail({
                id: detailId,
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
        if (detail) {
            setEditData({
                bgImg: detail.bgImg,
                backgroundImg: detail.backgroundImg || '',
                navigation: detail.navigation,
                title: detail.title,
                subheadline: detail.subheadline,
                description: detail.description,
                name1: detail.name1,
                name2: detail.name2,
                cardTitle: detail.cardTitle,
                keypoints: detail.keypoints,
                slug: detail.slug || '',
                imageDirection: detail.imageDirection || 'left',
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

    const addNavItem = () => {
        setEditData((prev) => ({
            ...prev,
            navigation: {
                items: [...prev.navigation.items, { name: '', link: '' }],
            },
        }));
    };

    const removeNavItem = (index: number) => {
        setEditData((prev) => ({
            ...prev,
            navigation: {
                items: prev.navigation.items.filter((_, i) => i !== index),
            },
        }));
    };

    const updateNavItem = (index: number, field: 'name' | 'link', value: string) => {
        setEditData((prev) => ({
            ...prev,
            navigation: {
                items: prev.navigation.items.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
            },
        }));
    };

    const addKeypoint = () => {
        setEditData((prev) => ({
            ...prev,
            keypoints: [...prev.keypoints, { icon: '', text: '' }],
        }));
    };

    const removeKeypoint = (index: number) => {
        setEditData((prev) => ({
            ...prev,
            keypoints: prev.keypoints.filter((_, i) => i !== index),
        }));
    };

    const updateKeypoint = (index: number, field: 'icon' | 'text', value: string) => {
        setEditData((prev) => ({
            ...prev,
            keypoints: prev.keypoints.map((keypoint, i) => (i === index ? { ...keypoint, [field]: value } : keypoint)),
        }));
    };

    if (isLoading) return <Loading />;

    if (isError) {
        return (
            <div className="panel mt-6">
                <div className="text-center py-10">
                    <p className="text-red-500">Error loading insight detail: {error?.message}</p>
                    <button onClick={() => window.location.reload()} className="btn btn-primary mt-4">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!detail) return <Loading />;

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
                        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage and edit insight detail content</p>
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
                {/* Background Images */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Background Image</label>
                        {isEditing ? (
                            <div className="space-y-4">
                                <div className="relative h-32 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600">
                                    {selectedBgImage ? (
                                        <div className="relative h-full">
                                            <img src={URL.createObjectURL(selectedBgImage)} alt="Selected Background" className="w-full h-full object-cover" />
                                            <button onClick={() => setSelectedBgImage(null)} className="absolute top-2 right-2 btn btn-danger btn-sm">
                                                <IconTrash className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <button onClick={() => bgImageInputRef.current?.click()} className="btn btn-primary btn-sm">
                                                Upload Image
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <input type="file" ref={bgImageInputRef} onChange={handleBgImageChange} accept="image/*" className="hidden" />
                            </div>
                        ) : (
                            <div className="relative h-32 rounded-lg overflow-hidden">
                                <img src={detail.bgImg} alt="Background" className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">CSS Background Class</label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={editData.backgroundImg}
                                onChange={(e) => setEditData((prev) => ({ ...prev, backgroundImg: e.target.value }))}
                                className="form-input w-full"
                                placeholder="md:bg-[url('/images/bg.jpg')]"
                            />
                        ) : (
                            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                <code className="text-sm">{detail.backgroundImg || 'No CSS background'}</code>
                            </div>
                        )}
                    </div>
                </div>

                {/* Title and Subheadline */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Title</label>
                        {isEditing ? (
                            <input type="text" value={editData.title} onChange={(e) => setEditData((prev) => ({ ...prev, title: e.target.value }))} className="form-input w-full" />
                        ) : (
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{detail.title}</h2>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Subheadline</label>
                        {isEditing ? (
                            <input type="text" value={editData.subheadline} onChange={(e) => setEditData((prev) => ({ ...prev, subheadline: e.target.value }))} className="form-input w-full" />
                        ) : (
                            <h3 className="text-lg text-gray-700 dark:text-gray-300">{detail.subheadline}</h3>
                        )}
                    </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Description</label>
                    {isEditing ? (
                        <textarea value={editData.description} onChange={(e) => setEditData((prev) => ({ ...prev, description: e.target.value }))} className="form-textarea w-full h-32" rows={4} />
                    ) : (
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{detail.description}</p>
                    )}
                </div>

                {/* Names and Card Title */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Name 1</label>
                        {isEditing ? (
                            <input type="text" value={editData.name1} onChange={(e) => setEditData((prev) => ({ ...prev, name1: e.target.value }))} className="form-input w-full" />
                        ) : (
                            <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">{detail.name1}</span>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Name 2</label>
                        {isEditing ? (
                            <input type="text" value={editData.name2} onChange={(e) => setEditData((prev) => ({ ...prev, name2: e.target.value }))} className="form-input w-full" />
                        ) : (
                            <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">{detail.name2}</span>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Card Title</label>
                        {isEditing ? (
                            <input type="text" value={editData.cardTitle} onChange={(e) => setEditData((prev) => ({ ...prev, cardTitle: e.target.value }))} className="form-input w-full" />
                        ) : (
                            <p className="text-gray-700 dark:text-gray-300 font-medium">{detail.cardTitle}</p>
                        )}
                    </div>
                </div>

                {/* Slug and Image Direction */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Slug</label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={editData.slug}
                                onChange={(e) => setEditData((prev) => ({ ...prev, slug: e.target.value }))}
                                className="form-input w-full"
                                placeholder="url-friendly-slug"
                            />
                        ) : (
                            <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{detail.slug || 'No slug set'}</code>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Image Direction</label>
                        {isEditing ? (
                            <select
                                value={editData.imageDirection}
                                onChange={(e) => setEditData((prev) => ({ ...prev, imageDirection: e.target.value as 'left' | 'right' }))}
                                className="form-select w-full"
                            >
                                <option value="left">Left</option>
                                <option value="right">Right</option>
                            </select>
                        ) : (
                            <span
                                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                    detail.imageDirection === 'left' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                                }`}
                            >
                                {detail.imageDirection === 'left' ? '← Left' : 'Right →'}
                            </span>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <label className="block text-sm font-medium">Navigation Items</label>
                        {isEditing && (
                            <button onClick={addNavItem} className="btn btn-outline-primary btn-sm flex items-center space-x-1">
                                <IconPlus className="w-4 h-4" />
                                <span>Add Item</span>
                            </button>
                        )}
                    </div>
                    <div className="space-y-4">
                        {(isEditing ? editData.navigation.items : detail.navigation.items).map((item, index) => (
                            <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                {isEditing ? (
                                    <>
                                        <input
                                            type="text"
                                            value={item.name}
                                            onChange={(e) => updateNavItem(index, 'name', e.target.value)}
                                            className="form-input flex-1"
                                            placeholder="Navigation name"
                                        />
                                        <input
                                            type="text"
                                            value={item.link}
                                            onChange={(e) => updateNavItem(index, 'link', e.target.value)}
                                            className="form-input flex-1"
                                            placeholder="Navigation link"
                                        />
                                        <button onClick={() => removeNavItem(index)} className="btn btn-outline-danger btn-sm">
                                            <IconTrash className="w-4 h-4" />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <span className="font-medium text-gray-900 dark:text-white">{item.name}</span>
                                        <span className="text-gray-500">→</span>
                                        <a href={item.link} className="text-blue-600 hover:text-blue-800">
                                            {item.link}
                                        </a>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Keypoints */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <label className="block text-sm font-medium">Key Points</label>
                        {isEditing && (
                            <button onClick={addKeypoint} className="btn btn-outline-primary btn-sm flex items-center space-x-1">
                                <IconPlus className="w-4 h-4" />
                                <span>Add Keypoint</span>
                            </button>
                        )}
                    </div>
                    <div className="space-y-4">
                        {(isEditing ? editData.keypoints : detail.keypoints).map((keypoint, index) => (
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
                                                    <img src={keypoint.icon} alt="Current Icon" className="w-12 h-12 object-cover rounded opacity-50" />
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
                                        <textarea
                                            value={keypoint.text}
                                            onChange={(e) => updateKeypoint(index, 'text', e.target.value)}
                                            className="form-textarea flex-1 h-20"
                                            placeholder="Keypoint text (HTML supported)"
                                        />
                                        <button onClick={() => removeKeypoint(index)} className="btn btn-outline-danger btn-sm">
                                            <IconTrash className="w-4 h-4" />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <img src={keypoint.icon} alt="Icon" className="w-8 h-8 object-cover rounded" />
                                        <div className="text-gray-700 dark:text-gray-300 flex-1" dangerouslySetInnerHTML={{ __html: keypoint.text }} />
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InsightDetailBase;
