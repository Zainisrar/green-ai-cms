'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ecosystemTechnologyInnovationAlliancesApi } from '@/lib/api/ecosystemTechnologyInnovationAlliances';
import type { EcosystemTechnologyInnovationAlliances, TechnologyInnovationAlliancesModal } from '@/db/schema';
import ImageUploadField from '@/components/shared/ImageUploadField';
import MediaPicker from '@/components/apps/media/MediaPicker';
import { useImageUpload } from '@/hooks/useImageUpload';
import ImageUploading, { ImageListType } from 'react-images-uploading';

export default function EditModalsTechnologyInnovationAlliancesPage() {
    const router = useRouter();
    const params = useParams();
    const id = parseInt(params.id as string);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<EcosystemTechnologyInnovationAlliances | null>(null);
    const { uploadImage, isUploading } = useImageUpload();
    
    // Media Picker states
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [currentModalIndex, setCurrentModalIndex] = useState<number>(0);
    const [modalImages, setModalImages] = useState<{ [key: number]: ImageListType }>({});

    const [modals, setModals] = useState<TechnologyInnovationAlliancesModal[]>([
        {
            title: '',
            subHeadline: '',
            description: '',
            img: { src: '', alt: '' },
            keys: [{ text: '', highlighted: '' }],
            quote: { text: '', highlighted: '' },
        },
    ]);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await ecosystemTechnologyInnovationAlliancesApi.getById(id);
            setData(result);
            setModals(result.modals);
        } catch (err) {
            setError('Failed to fetch data');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            await ecosystemTechnologyInnovationAlliancesApi.update(id, {
                modals,
            });
            router.push('/ecosystem/technology-innovation-alliances');
        } catch (err) {
            setError('Failed to update modals');
            console.error('Error:', err);
        } finally {
            setSaving(false);
        }
    };

    // Modal functions
    const addModal = () => {
        setModals((prev) => [
            ...prev,
            {
                title: '',
                subHeadline: '',
                description: '',
                img: { src: '', alt: '' },
                keys: [{ text: '', highlighted: '' }],
                quote: { text: '', highlighted: '' },
            },
        ]);
    };

    const removeModal = (index: number) => {
        setModals((prev) => prev.filter((_, i) => i !== index));
    };

    const addModalKey = (modalIndex: number) => {
        const newModals = [...modals];
        newModals[modalIndex].keys.push({ text: '', highlighted: '' });
        setModals(newModals);
    };

    const removeModalKey = (modalIndex: number, keyIndex: number) => {
        const newModals = [...modals];
        newModals[modalIndex].keys = newModals[modalIndex].keys.filter((_, i) => i !== keyIndex);
        setModals(newModals);
    };

    // Media Picker handlers
    const openMediaPicker = (modalIndex: number) => {
        setCurrentModalIndex(modalIndex);
        setShowMediaPicker(true);
    };

    const handleMediaSelect = (url: string) => {
        const newModals = [...modals];
        newModals[currentModalIndex].img.src = url;
        setModals(newModals);
        setShowMediaPicker(false);
    };

    const handleModalImageChange = async (modalIndex: number, imageList: ImageListType) => {
        setModalImages((prev) => ({ ...prev, [modalIndex]: imageList }));
        if (imageList.length > 0 && imageList[0].file) {
            try {
                const result = await uploadImage(imageList[0].file, 'ecosystem/technology-innovation-alliances/modals');
                const newModals = [...modals];
                newModals[modalIndex].img.src = result.url;
                setModals(newModals);
            } catch (error) {
                console.error('Error uploading image:', error);
            }
        } else if (imageList.length === 0) {
            const newModals = [...modals];
            newModals[modalIndex].img.src = '';
            setModals(newModals);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error && !data) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-red-600 text-xl">{error}</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Edit Modals - Technology Innovation Alliances</h1>
                <button onClick={() => router.back()} className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                    Back
                </button>
            </div>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Modals Section */}
                <div className="bg-white shadow-md rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Modals</h2>
                        <button type="button" onClick={addModal} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors">
                            Add Modal
                        </button>
                    </div>

                    {modals.map((modal, modalIndex) => (
                        <div key={modalIndex} className="border rounded-lg p-4 mb-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium">Modal {modalIndex + 1}</h3>
                                {modals.length > 1 && (
                                    <button type="button" onClick={() => removeModal(modalIndex)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors">
                                        Remove Modal
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                                    <input
                                        type="text"
                                        value={modal.title}
                                        onChange={(e) => {
                                            const newModals = [...modals];
                                            newModals[modalIndex].title = e.target.value;
                                            setModals(newModals);
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Sub Headline</label>
                                    <input
                                        type="text"
                                        value={modal.subHeadline}
                                        onChange={(e) => {
                                            const newModals = [...modals];
                                            newModals[modalIndex].subHeadline = e.target.value;
                                            setModals(newModals);
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <textarea
                                    value={modal.description}
                                    onChange={(e) => {
                                        const newModals = [...modals];
                                        newModals[modalIndex].description = e.target.value;
                                        setModals(newModals);
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={3}
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Modal {modalIndex + 1} Image
                                </label>
                                
                                {/* Show existing image if available */}
                                {modal.img.src && (!modalImages[modalIndex] || modalImages[modalIndex]?.length === 0) ? (
                                    <div className="space-y-2">
                                        <div className="relative inline-block">
                                            <img 
                                                src={modal.img.src} 
                                                alt={modal.img.alt || 'Modal image'} 
                                                className="w-48 h-48 object-cover rounded-lg border" 
                                            />
                                            <div className="absolute top-2 right-2 flex gap-1">
                                                <ImageUploading 
                                                    value={[]} 
                                                    onChange={(imageList) => handleModalImageChange(modalIndex, imageList)} 
                                                    maxNumber={1} 
                                                    dataURLKey="dataURL"
                                                >
                                                    {({ onImageUpload }) => (
                                                        <button
                                                            type="button"
                                                            onClick={onImageUpload}
                                                            className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 transition-colors"
                                                            disabled={isUploading}
                                                        >
                                                            Change
                                                        </button>
                                                    )}
                                                </ImageUploading>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newModals = [...modals];
                                                        newModals[modalIndex].img.src = '';
                                                        newModals[modalIndex].img.alt = '';
                                                        setModals(newModals);
                                                    }}
                                                    className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 transition-colors"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Image Alt Text
                                            </label>
                                            <input
                                                type="text"
                                                value={modal.img.alt}
                                                onChange={(e) => {
                                                    const newModals = [...modals];
                                                    newModals[modalIndex].img.alt = e.target.value;
                                                    setModals(newModals);
                                                }}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Image description for accessibility"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <ImageUploading 
                                        value={modalImages[modalIndex] || []} 
                                        onChange={(imageList) => handleModalImageChange(modalIndex, imageList)} 
                                        maxNumber={1} 
                                        dataURLKey="dataURL"
                                    >
                                        {({ imageList, onImageUpload, onImageUpdate, onImageRemove, isDragging, dragProps }) => (
                                            <div className="space-y-2">
                                                {imageList.length === 0 ? (
                                                    <div
                                                        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                                                            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'
                                                        } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                                                        onClick={onImageUpload}
                                                        {...dragProps}
                                                    >
                                                        <div className="space-y-2">
                                                            <div className="text-gray-500">
                                                                {isUploading ? 'Uploading...' : 'Click or drag image here'}
                                                            </div>
                                                            <div className="text-sm text-gray-400">
                                                                Supports: JPG, PNG, GIF (Max: 10MB)
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2">
                                                        {imageList.map((image, index) => (
                                                            <div key={index} className="relative inline-block">
                                                                <img 
                                                                    src={image.dataURL} 
                                                                    alt="Upload preview" 
                                                                    className="w-48 h-48 object-cover rounded-lg border" 
                                                                />
                                                                <div className="absolute top-2 right-2 flex gap-1">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => onImageUpdate(index)}
                                                                        className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 transition-colors"
                                                                        disabled={isUploading}
                                                                    >
                                                                        Update
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => onImageRemove(index)}
                                                                        className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 transition-colors"
                                                                        disabled={isUploading}
                                                                    >
                                                                        Remove
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        
                                                        <div className="mt-2">
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                Image Alt Text
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={modal.img.alt}
                                                                onChange={(e) => {
                                                                    const newModals = [...modals];
                                                                    newModals[modalIndex].img.alt = e.target.value;
                                                                    setModals(newModals);
                                                                }}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                placeholder="Image description for accessibility"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </ImageUploading>
                                )}

                                {/* Browse Media Library Button */}
                                <button
                                    type="button"
                                    onClick={() => openMediaPicker(modalIndex)}
                                    className="mt-2 w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                                >
                                    Browse Media Library
                                </button>
                            </div>

                            {/* Modal Keys */}
                            <div className="mb-4">
                                <div className="flex justify-between items-center mb-3">
                                    <label className="block text-sm font-medium text-gray-700">Modal Keys</label>
                                    <button type="button" onClick={() => addModalKey(modalIndex)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors">
                                        Add Key
                                    </button>
                                </div>

                                {modal.keys.map((key, keyIndex) => (
                                    <div key={keyIndex} className="border rounded p-3 mb-2">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-gray-700">Key {keyIndex + 1}</span>
                                            <button 
                                                type="button" 
                                                onClick={() => removeModalKey(modalIndex, keyIndex)} 
                                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                                            >
                                                Remove
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <input
                                                type="text"
                                                placeholder="Key text"
                                                value={key.text}
                                                onChange={(e) => {
                                                    const newModals = [...modals];
                                                    newModals[modalIndex].keys[keyIndex].text = e.target.value;
                                                    setModals(newModals);
                                                }}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Highlighted text"
                                                value={key.highlighted}
                                                onChange={(e) => {
                                                    const newModals = [...modals];
                                                    newModals[modalIndex].keys[keyIndex].highlighted = e.target.value;
                                                    setModals(newModals);
                                                }}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Modal Quote */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Quote Text</label>
                                    <textarea
                                        value={modal.quote.text}
                                        onChange={(e) => {
                                            const newModals = [...modals];
                                            newModals[modalIndex].quote.text = e.target.value;
                                            setModals(newModals);
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Quote Highlighted</label>
                                    <textarea
                                        value={modal.quote.highlighted}
                                        onChange={(e) => {
                                            const newModals = [...modals];
                                            newModals[modalIndex].quote.highlighted = e.target.value;
                                            setModals(newModals);
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end space-x-4">
                    <button type="button" onClick={() => router.back()} className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                        Cancel
                    </button>
                    <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>

            {/* Media Picker Modal */}
            <MediaPicker
                isOpen={showMediaPicker}
                onClose={() => setShowMediaPicker(false)}
                onSelect={handleMediaSelect}
                allowedTypes={['image']}
                title="Select Modal Image"
            />
        </div>
    );
}
