'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ecosystemOurProcurementPhilosophyApi } from '@/lib/api/ecosystemOurProcurementPhilosophy';
import { EcosystemOurProcurementPhilosophyInsert } from '@/db/schema';
import ImageUploadField from '@/components/shared/ImageUploadField';
import { navigationApi } from '@/lib/api/navigation';
import { navigationKeys } from '@/lib/api/navigation';
import { useQuery } from '@tanstack/react-query';
import MediaPicker from '@/components/apps/media/MediaPicker';

export default function CreateProcurementPhilosophyPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ctaLinkTypes, setCtaLinkTypes] = useState<{ [key: number]: 'navigation' | 'manual' }>({ 0: 'manual' });
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [mediaPickerTarget, setMediaPickerTarget] = useState<'whatWeWontCompromise' | 'procurementAlignedImpact' | 'strategicVendorRelationships' | null>(null);

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

    const [formData, setFormData] = useState<EcosystemOurProcurementPhilosophyInsert>({
        mainPage: {
            title: '',
            subHeadline: '',
            description: '',
            quote: [{ text: '', highlighted: '' }],
            cta: [{ text: '', href: '' }]
        },
        corePrinciples: {
            title: '',
            subHeadline: '',
            items: [{ principle: '', statement: '' }]
        },
        whatWeWontCompromise: {
            title: '',
            img: { src: '', alt: '' },
            keys: [''],
            quote: { text: '', highlighted: '' }
        },
        procurementAlignedImpact: {
            title: '',
            description: '',
            keys: [''],
            img: { src: '', alt: '' },
            quote: { text: '', highlighted: '' }
        },
        strategicVendorRelationships: {
            title: '',
            keys: [{ text: '', highlighted: '' }],
            img: { src: '', alt: '' }
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await ecosystemOurProcurementPhilosophyApi.create(formData);
            router.push('/ecosystem/our-procurement-philosophy');
        } catch (err) {
            setError('Failed to create procurement philosophy');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const addQuote = () => {
        setFormData(prev => ({
            ...prev,
            mainPage: {
                ...prev.mainPage,
                quote: [...prev.mainPage.quote, { text: '', highlighted: '' }]
            }
        }));
    };

    const removeQuote = (index: number) => {
        setFormData(prev => ({
            ...prev,
            mainPage: {
                ...prev.mainPage,
                quote: prev.mainPage.quote.filter((_, i) => i !== index)
            }
        }));
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

    const addPrinciple = () => {
        setFormData(prev => ({
            ...prev,
            corePrinciples: {
                ...prev.corePrinciples,
                items: [...prev.corePrinciples.items, { principle: '', statement: '' }]
            }
        }));
    };

    const removePrinciple = (index: number) => {
        setFormData(prev => ({
            ...prev,
            corePrinciples: {
                ...prev.corePrinciples,
                items: prev.corePrinciples.items.filter((_, i) => i !== index)
            }
        }));
    };

    const addKey = (section: 'whatWeWontCompromise' | 'procurementAlignedImpact') => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                keys: [...prev[section].keys, '']
            }
        }));
    };

    const removeKey = (section: 'whatWeWontCompromise' | 'procurementAlignedImpact', index: number) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                keys: prev[section].keys.filter((_, i) => i !== index)
            }
        }));
    };

    const addStrategicKey = () => {
        setFormData(prev => ({
            ...prev,
            strategicVendorRelationships: {
                ...prev.strategicVendorRelationships,
                keys: [...prev.strategicVendorRelationships.keys, { text: '', highlighted: '' }]
            }
        }));
    };

    const removeStrategicKey = (index: number) => {
        setFormData(prev => ({
            ...prev,
            strategicVendorRelationships: {
                ...prev.strategicVendorRelationships,
                keys: prev.strategicVendorRelationships.keys.filter((_, i) => i !== index)
            }
        }));
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Create Procurement Philosophy</h1>
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
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <textarea
                                value={formData.mainPage.description}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    mainPage: { ...prev.mainPage, description: e.target.value }
                                }))}
                                className="w-full p-3 border border-gray-300 rounded-md h-32"
                                required
                            />
                        </div>
                        
                        {/* Quotes */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">Quotes</label>
                                <button
                                    type="button"
                                    onClick={addQuote}
                                    className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                                >
                                    Add Quote
                                </button>
                            </div>
                            {formData.mainPage.quote.map((quote, index) => (
                                <div key={index} className="border border-gray-200 p-4 rounded mb-2">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-medium">Quote {index + 1}</span>
                                        {formData.mainPage.quote.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeQuote(index)}
                                                className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            placeholder="Quote text"
                                            value={quote.text}
                                            onChange={(e) => {
                                                const newQuotes = [...formData.mainPage.quote];
                                                newQuotes[index].text = e.target.value;
                                                setFormData(prev => ({
                                                    ...prev,
                                                    mainPage: { ...prev.mainPage, quote: newQuotes }
                                                }));
                                            }}
                                            className="w-full p-2 border border-gray-300 rounded"
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="Highlighted text"
                                            value={quote.highlighted}
                                            onChange={(e) => {
                                                const newQuotes = [...formData.mainPage.quote];
                                                newQuotes[index].highlighted = e.target.value;
                                                setFormData(prev => ({
                                                    ...prev,
                                                    mainPage: { ...prev.mainPage, quote: newQuotes }
                                                }));
                                            }}
                                            className="w-full p-2 border border-gray-300 rounded"
                                            required
                                        />
                                    </div>
                                </div>
                            ))}
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
                                    <div className="space-y-2">
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
                                            className="w-full p-2 border border-gray-300 rounded"
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
                                                className="w-full p-2 border border-gray-300 rounded"
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
                                                className="w-full p-2 border border-gray-300 rounded"
                                                required
                                            />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Core Principles Section */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-2xl font-semibold mb-4">Core Principles</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                            <input
                                type="text"
                                value={formData.corePrinciples.title}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    corePrinciples: { ...prev.corePrinciples, title: e.target.value }
                                }))}
                                className="w-full p-3 border border-gray-300 rounded-md"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Sub Headline</label>
                            <input
                                type="text"
                                value={formData.corePrinciples.subHeadline}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    corePrinciples: { ...prev.corePrinciples, subHeadline: e.target.value }
                                }))}
                                className="w-full p-3 border border-gray-300 rounded-md"
                                required
                            />
                        </div>
                        
                        {/* Principles */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">Principles</label>
                                <button
                                    type="button"
                                    onClick={addPrinciple}
                                    className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                                >
                                    Add Principle
                                </button>
                            </div>
                            {formData.corePrinciples.items.map((item, index) => (
                                <div key={index} className="border border-gray-200 p-4 rounded mb-2">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-medium">Principle {index + 1}</span>
                                        {formData.corePrinciples.items.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removePrinciple(index)}
                                                className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            placeholder="Principle"
                                            value={item.principle}
                                            onChange={(e) => {
                                                const newItems = [...formData.corePrinciples.items];
                                                newItems[index].principle = e.target.value;
                                                setFormData(prev => ({
                                                    ...prev,
                                                    corePrinciples: { ...prev.corePrinciples, items: newItems }
                                                }));
                                            }}
                                            className="w-full p-2 border border-gray-300 rounded"
                                            required
                                        />
                                        <textarea
                                            placeholder="Statement"
                                            value={item.statement}
                                            onChange={(e) => {
                                                const newItems = [...formData.corePrinciples.items];
                                                newItems[index].statement = e.target.value;
                                                setFormData(prev => ({
                                                    ...prev,
                                                    corePrinciples: { ...prev.corePrinciples, items: newItems }
                                                }));
                                            }}
                                            className="w-full p-2 border border-gray-300 rounded h-20"
                                            required
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* What We Won't Compromise Section */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-2xl font-semibold mb-4">What We Won't Compromise</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                            <input
                                type="text"
                                value={formData.whatWeWontCompromise.title}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    whatWeWontCompromise: { ...prev.whatWeWontCompromise, title: e.target.value }
                                }))}
                                className="w-full p-3 border border-gray-300 rounded-md"
                                required
                            />
                        </div>
                        
                        <ImageUploadField
                            value={formData.whatWeWontCompromise.img}
                            onChange={(img) => setFormData(prev => ({
                                ...prev,
                                whatWeWontCompromise: { ...prev.whatWeWontCompromise, img: img }
                            }))}
                            folder="ecosystem/procurement-philosophy"
                            label="Image"
                        />
                        <button
                            type="button"
                            onClick={() => {
                                setMediaPickerTarget('whatWeWontCompromise');
                                setShowMediaPicker(true);
                            }}
                            className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                        >
                            Browse Media Library
                        </button>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">Key Points</label>
                                <button
                                    type="button"
                                    onClick={() => addKey('whatWeWontCompromise')}
                                    className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                                >
                                    Add Key
                                </button>
                            </div>
                            {formData.whatWeWontCompromise.keys.map((key, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        placeholder="Enter key point"
                                        value={key}
                                        onChange={(e) => {
                                            const newKeys = [...formData.whatWeWontCompromise.keys];
                                            newKeys[index] = e.target.value;
                                            setFormData(prev => ({
                                                ...prev,
                                                whatWeWontCompromise: { ...prev.whatWeWontCompromise, keys: newKeys }
                                            }));
                                        }}
                                        className="flex-1 p-2 border border-gray-300 rounded"
                                        required
                                    />
                                    {formData.whatWeWontCompromise.keys.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeKey('whatWeWontCompromise', index)}
                                            className="bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Quote Text</label>
                                <textarea
                                    value={formData.whatWeWontCompromise.quote.text}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        whatWeWontCompromise: { 
                                            ...prev.whatWeWontCompromise, 
                                            quote: { ...prev.whatWeWontCompromise.quote, text: e.target.value }
                                        }
                                    }))}
                                    className="w-full p-3 border border-gray-300 rounded-md h-24"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Quote Highlighted</label>
                                <textarea
                                    value={formData.whatWeWontCompromise.quote.highlighted}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        whatWeWontCompromise: { 
                                            ...prev.whatWeWontCompromise, 
                                            quote: { ...prev.whatWeWontCompromise.quote, highlighted: e.target.value }
                                        }
                                    }))}
                                    className="w-full p-3 border border-gray-300 rounded-md h-24"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Procurement Aligned Impact Section */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-2xl font-semibold mb-4">Procurement Aligned Impact</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                            <input
                                type="text"
                                value={formData.procurementAlignedImpact.title}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    procurementAlignedImpact: { ...prev.procurementAlignedImpact, title: e.target.value }
                                }))}
                                className="w-full p-3 border border-gray-300 rounded-md"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <textarea
                                value={formData.procurementAlignedImpact.description}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    procurementAlignedImpact: { ...prev.procurementAlignedImpact, description: e.target.value }
                                }))}
                                className="w-full p-3 border border-gray-300 rounded-md h-32"
                                required
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">Key Points</label>
                                <button
                                    type="button"
                                    onClick={() => addKey('procurementAlignedImpact')}
                                    className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                                >
                                    Add Key
                                </button>
                            </div>
                            {formData.procurementAlignedImpact.keys.map((key, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        placeholder="Enter key point"
                                        value={key}
                                        onChange={(e) => {
                                            const newKeys = [...formData.procurementAlignedImpact.keys];
                                            newKeys[index] = e.target.value;
                                            setFormData(prev => ({
                                                ...prev,
                                                procurementAlignedImpact: { ...prev.procurementAlignedImpact, keys: newKeys }
                                            }));
                                        }}
                                        className="flex-1 p-2 border border-gray-300 rounded"
                                        required
                                    />
                                    {formData.procurementAlignedImpact.keys.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeKey('procurementAlignedImpact', index)}
                                            className="bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        
                        <ImageUploadField
                            value={formData.procurementAlignedImpact.img}
                            onChange={(img) => setFormData(prev => ({
                                ...prev,
                                procurementAlignedImpact: { ...prev.procurementAlignedImpact, img: img }
                            }))}
                            folder="ecosystem/procurement-philosophy"
                            label="Image"
                        />
                        <button
                            type="button"
                            onClick={() => {
                                setMediaPickerTarget('procurementAlignedImpact');
                                setShowMediaPicker(true);
                            }}
                            className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                        >
                            Browse Media Library
                        </button>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Quote Text</label>
                                <textarea
                                    value={formData.procurementAlignedImpact.quote.text}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        procurementAlignedImpact: { 
                                            ...prev.procurementAlignedImpact, 
                                            quote: { ...prev.procurementAlignedImpact.quote, text: e.target.value }
                                        }
                                    }))}
                                    className="w-full p-3 border border-gray-300 rounded-md h-24"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Quote Highlighted</label>
                                <textarea
                                    value={formData.procurementAlignedImpact.quote.highlighted}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        procurementAlignedImpact: { 
                                            ...prev.procurementAlignedImpact, 
                                            quote: { ...prev.procurementAlignedImpact.quote, highlighted: e.target.value }
                                        }
                                    }))}
                                    className="w-full p-3 border border-gray-300 rounded-md h-24"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Strategic Vendor Relationships Section */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-2xl font-semibold mb-4">Strategic Vendor Relationships</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                            <input
                                type="text"
                                value={formData.strategicVendorRelationships.title}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    strategicVendorRelationships: { ...prev.strategicVendorRelationships, title: e.target.value }
                                }))}
                                className="w-full p-3 border border-gray-300 rounded-md"
                                required
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">Key Points</label>
                                <button
                                    type="button"
                                    onClick={addStrategicKey}
                                    className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                                >
                                    Add Key
                                </button>
                            </div>
                            {formData.strategicVendorRelationships.keys.map((key, index) => (
                                <div key={index} className="border border-gray-200 p-4 rounded mb-2">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-medium">Key {index + 1}</span>
                                        {formData.strategicVendorRelationships.keys.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeStrategicKey(index)}
                                                className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            placeholder="Key text"
                                            value={key.text}
                                            onChange={(e) => {
                                                const newKeys = [...formData.strategicVendorRelationships.keys];
                                                newKeys[index].text = e.target.value;
                                                setFormData(prev => ({
                                                    ...prev,
                                                    strategicVendorRelationships: { ...prev.strategicVendorRelationships, keys: newKeys }
                                                }));
                                            }}
                                            className="w-full p-2 border border-gray-300 rounded"
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="Highlighted text"
                                            value={key.highlighted}
                                            onChange={(e) => {
                                                const newKeys = [...formData.strategicVendorRelationships.keys];
                                                newKeys[index].highlighted = e.target.value;
                                                setFormData(prev => ({
                                                    ...prev,
                                                    strategicVendorRelationships: { ...prev.strategicVendorRelationships, keys: newKeys }
                                                }));
                                            }}
                                            className="w-full p-2 border border-gray-300 rounded"
                                            required
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <ImageUploadField
                            value={formData.strategicVendorRelationships.img}
                            onChange={(img) => setFormData(prev => ({
                                ...prev,
                                strategicVendorRelationships: { ...prev.strategicVendorRelationships, img: img }
                            }))}
                            folder="ecosystem/procurement-philosophy"
                            label="Image"
                        />
                        <button
                            type="button"
                            onClick={() => {
                                setMediaPickerTarget('strategicVendorRelationships');
                                setShowMediaPicker(true);
                            }}
                            className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                        >
                            Browse Media Library
                        </button>
                    </div>
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
                        {loading ? 'Creating...' : 'Create Procurement Philosophy'}
                    </button>
                </div>
            </form>

            {showMediaPicker && (
                <MediaPicker
                    isOpen={showMediaPicker}
                    allowedTypes={['image']}
                    onSelect={(media) => {
                        if (mediaPickerTarget === 'whatWeWontCompromise') {
                            setFormData(prev => ({
                                ...prev,
                                whatWeWontCompromise: { 
                                    ...prev.whatWeWontCompromise, 
                                    img: { src: media, alt: '' } 
                                }
                            }));
                        } else if (mediaPickerTarget === 'procurementAlignedImpact') {
                            setFormData(prev => ({
                                ...prev,
                                procurementAlignedImpact: { 
                                    ...prev.procurementAlignedImpact, 
                                    img: { src: media, alt: '' } 
                                }
                            }));
                        } else if (mediaPickerTarget === 'strategicVendorRelationships') {
                            setFormData(prev => ({
                                ...prev,
                                strategicVendorRelationships: { 
                                    ...prev.strategicVendorRelationships, 
                                    img: { src: media, alt: '' } 
                                }
                            }));
                        }
                        setShowMediaPicker(false);
                        setMediaPickerTarget(null);
                    }}
                    onClose={() => {
                        setShowMediaPicker(false);
                        setMediaPickerTarget(null);
                    }}
                />
            )}
        </div>
    );
}