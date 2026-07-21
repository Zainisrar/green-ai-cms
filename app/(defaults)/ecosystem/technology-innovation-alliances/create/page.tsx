'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ecosystemTechnologyInnovationAlliancesApi } from '@/lib/api/ecosystemTechnologyInnovationAlliances';
import type { EcosystemTechnologyInnovationAlliancesInsert } from '@/db/schema';
import ImageUploading, { ImageListType } from 'react-images-uploading';
import { useImageUpload } from '@/components/apps/explore/about-us/hooks/useImageUpload';
import { navigationApi, navigationKeys } from '@/lib/api/navigation';
import { useQuery } from '@tanstack/react-query';

export default function CreateTechnologyInnovationAlliancesPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { uploadImage, isUploading } = useImageUpload();
    const [modalImages, setModalImages] = useState<{ [key: number]: ImageListType }>({});
    const [ctaLinkTypes, setCtaLinkTypes] = useState<{ [key: number]: 'navigation' | 'manual' }>({});

    const { data: navigationItems } = useQuery({
        queryKey: navigationKeys.lists(),
        queryFn: () => navigationApi.getAll(),
    });

    const flattenNavItems = (items: any[], parent = ''): any[] => {
        let result: any[] = [];
        items.forEach(item => {
            const displayName = parent ? `${parent} > ${item.name}` : item.name;
            result.push({ ...item, displayName });
            if (item.children && item.children.length > 0) {
                result = result.concat(flattenNavItems(item.children, displayName));
            }
        });
        return result;
    };

    const allNavItems = navigationItems ? flattenNavItems(navigationItems) : [];

    const [formData, setFormData] = useState<EcosystemTechnologyInnovationAlliancesInsert>({
        mainPage: {
            title: '',
            subHeadline: '',
            description: {
                text: '',
                highlighted: '',
            },
            quote: [
                {
                    text: '',
                    highlighted: '',
                },
            ],
            cta: [
                {
                    text: '',
                    href: '',
                },
            ],
        },

        modals: [
            {
                title: '',
                subHeadline: '',
                description: '',
                img: {
                    src: '',
                    alt: '',
                },
                keys: [
                    {
                        text: '',
                        highlighted: '',
                    },
                ],
                quote: {
                    text: '',
                    highlighted: '',
                },
            },
        ],
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await ecosystemTechnologyInnovationAlliancesApi.create(formData);
            router.push('/ecosystem/technology-innovation-alliances');
        } catch (err) {
            setError('Failed to create technology innovation alliances record');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateMainPage = (field: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            mainPage: {
                ...prev.mainPage,
                [field]: value,
            },
        }));
    };

    const addQuote = () => {
        setFormData((prev) => ({
            ...prev,
            mainPage: {
                ...prev.mainPage,
                quote: [...prev.mainPage.quote, { text: '', highlighted: '' }],
            },
        }));
    };

    const addCTA = () => {
        const newIndex = formData.mainPage.cta.length;
        setCtaLinkTypes(prev => ({ ...prev, [newIndex]: 'navigation' }));
        setFormData((prev) => ({
            ...prev,
            mainPage: {
                ...prev.mainPage,
                cta: [...prev.mainPage.cta, { text: '', href: '' }],
            },
        }));
    };

    const removeCTA = (index: number) => {
        setFormData(prev => ({
            ...prev,
            mainPage: {
                ...prev.mainPage,
                cta: prev.mainPage.cta.filter((_, i) => i !== index)
            }
        }));
        // Re-index link types
        const newLinkTypes: { [key: number]: 'navigation' | 'manual' } = {};
        Object.keys(ctaLinkTypes).forEach(key => {
            const idx = parseInt(key);
            if (idx < index) {
                newLinkTypes[idx] = ctaLinkTypes[idx];
            } else if (idx > index) {
                newLinkTypes[idx - 1] = ctaLinkTypes[idx];
            }
        });
        setCtaLinkTypes(newLinkTypes);
    };

    const addModal = () => {
        setFormData((prev) => ({
            ...prev,
            modals: [
                ...prev.modals,
                {
                    title: '',
                    subHeadline: '',
                    description: '',
                    img: { src: '', alt: '' },
                    keys: [{ text: '', highlighted: '' }],
                    quote: { text: '', highlighted: '' },
                },
            ],
        }));
    };

    const handleModalImageChange = async (modalIndex: number, imageList: ImageListType) => {
        setModalImages((prev) => ({ ...prev, [modalIndex]: imageList }));
        if (imageList.length > 0 && imageList[0].file) {
            try {
                const result = await uploadImage(imageList[0].file, 'ecosystem/technology-innovation-alliances/modals');
                const newModals = [...formData.modals];
                newModals[modalIndex].img.src = result.url;
                setFormData((prev) => ({ ...prev, modals: newModals }));
            } catch (error) {
                console.error('Error uploading image:', error);
            }
        } else if (imageList.length === 0) {
            const newModals = [...formData.modals];
            newModals[modalIndex].img.src = '';
            setFormData((prev) => ({ ...prev, modals: newModals }));
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Create Technology Innovation Alliances</h1>
                <button onClick={() => router.back()} className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                    Back
                </button>
            </div>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Main Page Section */}
                <div className="bg-white shadow-md rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Main Page</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                            <input
                                type="text"
                                value={formData.mainPage.title}
                                onChange={(e) => updateMainPage('title', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Sub Headline</label>
                            <input
                                type="text"
                                value={formData.mainPage.subHeadline}
                                onChange={(e) => updateMainPage('subHeadline', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description Text</label>
                            <textarea
                                value={formData.mainPage.description.text}
                                onChange={(e) => updateMainPage('description', { ...formData.mainPage.description, text: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={3}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description Highlighted</label>
                            <textarea
                                value={formData.mainPage.description.highlighted}
                                onChange={(e) => updateMainPage('description', { ...formData.mainPage.description, highlighted: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={3}
                            />
                        </div>
                    </div>

                    {/* Quotes */}
                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700">Quotes</label>
                            <button type="button" onClick={addQuote} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm">
                                Add Quote
                            </button>
                        </div>
                        {formData.mainPage.quote.map((quote, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2 p-3 border rounded">
                                <input
                                    type="text"
                                    placeholder="Quote text"
                                    value={quote.text}
                                    onChange={(e) => {
                                        const newQuotes = [...formData.mainPage.quote];
                                        newQuotes[index].text = e.target.value;
                                        updateMainPage('quote', newQuotes);
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <input
                                    type="text"
                                    placeholder="Highlighted text"
                                    value={quote.highlighted}
                                    onChange={(e) => {
                                        const newQuotes = [...formData.mainPage.quote];
                                        newQuotes[index].highlighted = e.target.value;
                                        updateMainPage('quote', newQuotes);
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        ))}
                    </div>

                    {/* CTAs */}
                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700">Call to Actions</label>
                            <button type="button" onClick={addCTA} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm">
                                Add CTA
                            </button>
                        </div>
                        {formData.mainPage.cta.map((cta, index) => (
                            <div key={index} className="mb-4 p-4 border rounded-lg space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">CTA {index + 1}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeCTA(index)}
                                        className="text-red-600 hover:text-red-800 text-sm"
                                    >
                                        Remove
                                    </button>
                                </div>
                                
                                <input
                                    type="text"
                                    placeholder="CTA text"
                                    value={cta.text}
                                    onChange={(e) => {
                                        const newCTAs = [...formData.mainPage.cta];
                                        newCTAs[index].text = e.target.value;
                                        updateMainPage('cta', newCTAs);
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Link Type</label>
                                    <div className="flex gap-4 mb-3">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name={`linkType-${index}`}
                                                checked={ctaLinkTypes[index] === 'navigation'}
                                                onChange={() => setCtaLinkTypes(prev => ({ ...prev, [index]: 'navigation' }))}
                                                className="form-radio"
                                            />
                                            <span className="text-sm">Navigation Item</span>
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name={`linkType-${index}`}
                                                checked={ctaLinkTypes[index] === 'manual'}
                                                onChange={() => setCtaLinkTypes(prev => ({ ...prev, [index]: 'manual' }))}
                                                className="form-radio"
                                            />
                                            <span className="text-sm">Manual URL</span>
                                        </label>
                                    </div>

                                    {ctaLinkTypes[index] === 'navigation' ? (
                                        <select
                                            value={cta.href}
                                            onChange={(e) => {
                                                const newCTAs = [...formData.mainPage.cta];
                                                newCTAs[index].href = e.target.value;
                                                updateMainPage('cta', newCTAs);
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Select Navigation Item</option>
                                            {allNavItems.map((item: any) => (
                                                <option key={item.id} value={item.slug || item.href}>
                                                    {item.displayName}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type="text"
                                            placeholder="Enter URL (e.g., /about or https://example.com)"
                                            value={cta.href}
                                            onChange={(e) => {
                                                const newCTAs = [...formData.mainPage.cta];
                                                newCTAs[index].href = e.target.value;
                                                updateMainPage('cta', newCTAs);
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Modals Section */}
                <div className="bg-white shadow-md rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Modals</h2>
                        <button type="button" onClick={addModal} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm">
                            Add Modal
                        </button>
                    </div>

                    {formData.modals.map((modal, modalIndex) => (
                        <div key={modalIndex} className="border rounded p-4 mb-4">
                            <h3 className="text-lg font-medium mb-3">Modal {modalIndex + 1}</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <input
                                    type="text"
                                    placeholder="Modal title"
                                    value={modal.title}
                                    onChange={(e) => {
                                        const newModals = [...formData.modals];
                                        newModals[modalIndex].title = e.target.value;
                                        setFormData((prev) => ({ ...prev, modals: newModals }));
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <input
                                    type="text"
                                    placeholder="Modal sub headline"
                                    value={modal.subHeadline}
                                    onChange={(e) => {
                                        const newModals = [...formData.modals];
                                        newModals[modalIndex].subHeadline = e.target.value;
                                        setFormData((prev) => ({ ...prev, modals: newModals }));
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <textarea
                                placeholder="Modal description"
                                value={modal.description}
                                onChange={(e) => {
                                    const newModals = [...formData.modals];
                                    newModals[modalIndex].description = e.target.value;
                                    setFormData((prev) => ({ ...prev, modals: newModals }));
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                                rows={3}
                            />

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Modal {modalIndex + 1} Image</label>
                                <ImageUploading value={modalImages[modalIndex] || []} onChange={(imageList) => handleModalImageChange(modalIndex, imageList)} maxNumber={1} dataURLKey="dataURL">
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
                                                        <div className="text-gray-500">{isUploading ? 'Uploading...' : 'Click or drag image here'}</div>
                                                        <div className="text-sm text-gray-400">Supports: JPG, PNG, GIF (Max: 10MB)</div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    {imageList.map((image, index) => (
                                                        <div key={index} className="relative inline-block">
                                                            <img src={image.dataURL} alt="Upload preview" className="w-32 h-32 object-cover rounded-lg border" />
                                                            <div className="absolute top-2 right-2 flex gap-1">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => onImageUpdate(index)}
                                                                    className="bg-blue-500 text-white p-1 rounded text-xs hover:bg-blue-600 transition-colors"
                                                                    disabled={isUploading}
                                                                >
                                                                    Update
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => onImageRemove(index)}
                                                                    className="bg-red-500 text-white p-1 rounded text-xs hover:bg-red-600 transition-colors"
                                                                    disabled={isUploading}
                                                                >
                                                                    Remove
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </ImageUploading>

                                {modal.img.src && (
                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Image Alt Text</label>
                                        <input
                                            type="text"
                                            value={modal.img.alt}
                                            onChange={(e) => {
                                                const newModals = [...formData.modals];
                                                newModals[modalIndex].img.alt = e.target.value;
                                                setFormData((prev) => ({ ...prev, modals: newModals }));
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Image description for accessibility"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Modal Keys */}
                            <div className="mb-4">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-gray-700">Keys</label>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newModals = [...formData.modals];
                                            newModals[modalIndex].keys.push({ text: '', highlighted: '' });
                                            setFormData((prev) => ({ ...prev, modals: newModals }));
                                        }}
                                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                                    >
                                        Add Key
                                    </button>
                                </div>
                                {modal.keys.map((key, keyIndex) => (
                                    <div key={keyIndex} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2 p-3 border rounded">
                                        <input
                                            type="text"
                                            placeholder="Key text"
                                            value={key.text}
                                            onChange={(e) => {
                                                const newModals = [...formData.modals];
                                                newModals[modalIndex].keys[keyIndex].text = e.target.value;
                                                setFormData((prev) => ({ ...prev, modals: newModals }));
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Highlighted text"
                                            value={key.highlighted}
                                            onChange={(e) => {
                                                const newModals = [...formData.modals];
                                                newModals[modalIndex].keys[keyIndex].highlighted = e.target.value;
                                                setFormData((prev) => ({ ...prev, modals: newModals }));
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Modal Quote */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Quote</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        placeholder="Quote text"
                                        value={modal.quote.text}
                                        onChange={(e) => {
                                            const newModals = [...formData.modals];
                                            newModals[modalIndex].quote.text = e.target.value;
                                            setFormData((prev) => ({ ...prev, modals: newModals }));
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Highlighted text"
                                        value={modal.quote.highlighted}
                                        onChange={(e) => {
                                            const newModals = [...formData.modals];
                                            newModals[modalIndex].quote.highlighted = e.target.value;
                                            setFormData((prev) => ({ ...prev, modals: newModals }));
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                        {loading ? 'Creating...' : 'Create'}
                    </button>
                </div>
            </form>
        </div>
    );
}
