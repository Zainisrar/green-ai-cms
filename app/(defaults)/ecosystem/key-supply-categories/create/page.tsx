'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ecosystemKeySupplyCategoriesApi } from '@/lib/api/ecosystemKeySupplyCategories';
import { EcosystemKeySupplyCategoriesInsert } from '@/db/schema';
import { navigationApi } from '@/lib/api/navigation';
import { navigationKeys } from '@/lib/api/navigation';
import { useQuery } from '@tanstack/react-query';
import MediaPicker from '@/components/apps/media/MediaPicker';

export default function CreateKeySupplyCategoriesPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ctaLinkTypes, setCtaLinkTypes] = useState<{ [key: number]: 'navigation' | 'manual' }>({ 0: 'manual' });

    // Fetch navigation items
    const { data: navData } = useQuery({
        queryKey: navigationKeys.lists(),
        queryFn: () => navigationApi.getAll()
    });

    // Flatten navigation items for dropdown
    const flattenNavItems = (items: any[], prefix = ''): { label: string; href: string }[] => {
        let result: { label: string; href: string }[] = [];
        items.forEach(item => {
            const label = prefix ? `${prefix} > ${item.title}` : item.title;
            result.push({ label, href: item.href });
            if (item.children && item.children.length > 0) {
                result = result.concat(flattenNavItems(item.children, label));
            }
        });
        return result;
    };

    const allNavItems = navData ? flattenNavItems(navData) : [];

    const [formData, setFormData] = useState<EcosystemKeySupplyCategoriesInsert>({
        mainPage: {
            title: '',
            subHeadline: '',
            description: { text: '', highlighted: '' },
            quote: { text: '', highlighted: '' },
            cta: [{ text: '', href: '' }]
        },
        modals: [
            {
                title: '',
                item: [{ component: '', technicalNotes: '' }]
            }
        ]
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await ecosystemKeySupplyCategoriesApi.create(formData);
            router.push('/ecosystem/key-supply-categories');
        } catch (err) {
            setError('Failed to create key supply categories');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const addCTA = () => {
        const newIndex = formData.mainPage.cta.length;
        setCtaLinkTypes({ ...ctaLinkTypes, [newIndex]: 'manual' });
        setFormData(prev => ({
            ...prev,
            mainPage: {
                ...prev.mainPage,
                cta: [...prev.mainPage.cta, { text: '', href: '' }]
            }
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
        // Re-index remaining CTAs
        const newTypes: { [key: number]: 'navigation' | 'manual' } = {};
        Object.keys(ctaLinkTypes).forEach(key => {
            const keyNum = parseInt(key);
            if (keyNum < index) {
                newTypes[keyNum] = ctaLinkTypes[keyNum];
            } else if (keyNum > index) {
                newTypes[keyNum - 1] = ctaLinkTypes[keyNum];
            }
        });
        setCtaLinkTypes(newTypes);
    };

    const addModal = () => {
        setFormData(prev => ({
            ...prev,
            modals: [...prev.modals, { title: '', item: [{ component: '', technicalNotes: '' }] }]
        }));
    };

    const removeModal = (index: number) => {
        setFormData(prev => ({
            ...prev,
            modals: prev.modals.filter((_, i) => i !== index)
        }));
    };

    const addModalItem = (modalIndex: number) => {
        setFormData(prev => ({
            ...prev,
            modals: prev.modals.map((modal, index) => 
                index === modalIndex 
                    ? { ...modal, item: [...modal.item, { component: '', technicalNotes: '' }] }
                    : modal
            )
        }));
    };

    const removeModalItem = (modalIndex: number, itemIndex: number) => {
        setFormData(prev => ({
            ...prev,
            modals: prev.modals.map((modal, index) => 
                index === modalIndex 
                    ? { ...modal, item: modal.item.filter((_, i) => i !== itemIndex) }
                    : modal
            )
        }));
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Create Key Supply Categories</h1>
                <button
                    onClick={() => router.back()}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                    Back
                </button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Main Page Section */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-2xl font-semibold mb-4">Main Page</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                            <input
                                type="text"
                                value={formData.mainPage.title}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    mainPage: { ...prev.mainPage, title: e.target.value }
                                }))}
                                className="w-full p-3 border border-gray-300 rounded-md"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Sub Headline</label>
                            <input
                                type="text"
                                value={formData.mainPage.subHeadline}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    mainPage: { ...prev.mainPage, subHeadline: e.target.value }
                                }))}
                                className="w-full p-3 border border-gray-300 rounded-md"
                                required
                            />
                        </div>
                        
                        {/* Description */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description Text</label>
                                <textarea
                                    value={formData.mainPage.description.text}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        mainPage: { 
                                            ...prev.mainPage, 
                                            description: { ...prev.mainPage.description, text: e.target.value }
                                        }
                                    }))}
                                    className="w-full p-3 border border-gray-300 rounded-md h-24"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description Highlighted</label>
                                <textarea
                                    value={formData.mainPage.description.highlighted}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        mainPage: { 
                                            ...prev.mainPage, 
                                            description: { ...prev.mainPage.description, highlighted: e.target.value }
                                        }
                                    }))}
                                    className="w-full p-3 border border-gray-300 rounded-md h-24"
                                    required
                                />
                            </div>
                        </div>

                        {/* Quote */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Quote Text</label>
                                <textarea
                                    value={formData.mainPage.quote.text}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        mainPage: { 
                                            ...prev.mainPage, 
                                            quote: { ...prev.mainPage.quote, text: e.target.value }
                                        }
                                    }))}
                                    className="w-full p-3 border border-gray-300 rounded-md h-24"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Quote Highlighted</label>
                                <textarea
                                    value={formData.mainPage.quote.highlighted}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        mainPage: { 
                                            ...prev.mainPage, 
                                            quote: { ...prev.mainPage.quote, highlighted: e.target.value }
                                        }
                                    }))}
                                    className="w-full p-3 border border-gray-300 rounded-md h-24"
                                    required
                                />
                            </div>
                        </div>

                        {/* CTAs */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">CTAs</label>
                                <button
                                    type="button"
                                    onClick={addCTA}
                                    className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                                >
                                    Add CTA
                                </button>
                            </div>
                            {formData.mainPage.cta.map((cta, index) => (
                                <div key={index} className="border border-gray-200 p-4 rounded mb-2">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-medium">CTA {index + 1}</span>
                                        {formData.mainPage.cta.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeCTA(index)}
                                                className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                    <div className="mb-3">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Link Type
                                        </label>
                                        <div className="flex gap-4">
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name={`cta-type-${index}`}
                                                    value="navigation"
                                                    checked={ctaLinkTypes[index] === 'navigation'}
                                                    onChange={(e) => {
                                                        setCtaLinkTypes({ ...ctaLinkTypes, [index]: 'navigation' });
                                                    }}
                                                    className="mr-2"
                                                />
                                                Navigation
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name={`cta-type-${index}`}
                                                    value="manual"
                                                    checked={ctaLinkTypes[index] === 'manual'}
                                                    onChange={(e) => {
                                                        setCtaLinkTypes({ ...ctaLinkTypes, [index]: 'manual' });
                                                    }}
                                                    className="mr-2"
                                                />
                                                Manual
                                            </label>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="text"
                                            placeholder="CTA text"
                                            value={cta.text}
                                            onChange={(e) => {
                                                const newCTAs = [...formData.mainPage.cta];
                                                newCTAs[index].text = e.target.value;
                                                setFormData(prev => ({
                                                    ...prev,
                                                    mainPage: { ...prev.mainPage, cta: newCTAs }
                                                }));
                                            }}
                                            className="p-2 border border-gray-300 rounded"
                                            required
                                        />
                                        {ctaLinkTypes[index] === 'navigation' ? (
                                            <select
                                                value={cta.href}
                                                onChange={(e) => {
                                                    const newCTAs = [...formData.mainPage.cta];
                                                    newCTAs[index].href = e.target.value;
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        mainPage: { ...prev.mainPage, cta: newCTAs }
                                                    }));
                                                }}
                                                className="p-2 border border-gray-300 rounded"
                                                required
                                            >
                                                <option value="">Select navigation item</option>
                                                {allNavItems.map((item) => (
                                                    <option key={item.href} value={item.href}>
                                                        {item.label}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input
                                                type="text"
                                                placeholder="CTA href"
                                                value={cta.href}
                                                onChange={(e) => {
                                                    const newCTAs = [...formData.mainPage.cta];
                                                    newCTAs[index].href = e.target.value;
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        mainPage: { ...prev.mainPage, cta: newCTAs }
                                                    }));
                                                }}
                                                className="p-2 border border-gray-300 rounded"
                                                required
                                            />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Modals Section */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold">Modals</h2>
                        <button
                            type="button"
                            onClick={addModal}
                            className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                        >
                            Add Modal
                        </button>
                    </div>
                    
                    {formData.modals.map((modal, modalIndex) => (
                        <div key={modalIndex} className="border border-gray-200 p-4 rounded mb-4">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-lg font-semibold">Modal {modalIndex + 1}</h3>
                                {formData.modals.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeModal(modalIndex)}
                                        className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                                    >
                                        Remove Modal
                                    </button>
                                )}
                            </div>
                            
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Modal Title</label>
                                    <input
                                        type="text"
                                        value={modal.title}
                                        onChange={(e) => {
                                            const newModals = [...formData.modals];
                                            newModals[modalIndex].title = e.target.value;
                                            setFormData(prev => ({ ...prev, modals: newModals }));
                                        }}
                                        className="w-full p-2 border border-gray-300 rounded"
                                        required
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-medium text-gray-700">Modal Items</label>
                                        <button
                                            type="button"
                                            onClick={() => addModalItem(modalIndex)}
                                            className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600"
                                        >
                                            Add Item
                                        </button>
                                    </div>
                                    
                                    {modal.item.map((item, itemIndex) => (
                                        <div key={itemIndex} className="bg-gray-50 p-3 rounded mb-2">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-medium text-sm">Item {itemIndex + 1}</span>
                                                {modal.item.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeModalItem(modalIndex, itemIndex)}
                                                        className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">Component</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Component name"
                                                        value={item.component}
                                                        onChange={(e) => {
                                                            const newModals = [...formData.modals];
                                                            newModals[modalIndex].item[itemIndex].component = e.target.value;
                                                            setFormData(prev => ({ ...prev, modals: newModals }));
                                                        }}
                                                        className="w-full p-2 border border-gray-300 rounded text-sm"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">Technical Notes</label>
                                                    <textarea
                                                        placeholder="Technical notes"
                                                        value={item.technicalNotes}
                                                        onChange={(e) => {
                                                            const newModals = [...formData.modals];
                                                            newModals[modalIndex].item[itemIndex].technicalNotes = e.target.value;
                                                            setFormData(prev => ({ ...prev, modals: newModals }));
                                                        }}
                                                        className="w-full p-2 border border-gray-300 rounded text-sm h-16"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-primary text-white px-6 py-2 rounded hover:bg-primary/90 disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Create Key Supply Categories'}
                    </button>
                </div>
            </form>
        </div>
    );
}