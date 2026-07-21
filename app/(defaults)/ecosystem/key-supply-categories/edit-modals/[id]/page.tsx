'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ecosystemKeySupplyCategoriesApi } from '@/lib/api/ecosystemKeySupplyCategories';
import { EcosystemKeySupplyCategories, KeySupplyCategoriesModal } from '@/db/schema';

export default function EditModalsKeySupplyCategoriesPage() {
    const router = useRouter();
    const params = useParams();
    const id = parseInt(params.id as string);

    const [data, setData] = useState<EcosystemKeySupplyCategories | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<KeySupplyCategoriesModal[]>([
        {
            title: '',
            item: [{ component: '', technicalNotes: '' }]
        }
    ]);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await ecosystemKeySupplyCategoriesApi.getById(id);
            setData(result);
            setFormData(result.modals);
        } catch (err) {
            setError('Failed to load key supply categories data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            await ecosystemKeySupplyCategoriesApi.update(id, {
                modals: formData
            });
            router.push('/ecosystem/key-supply-categories');
        } catch (err) {
            setError('Failed to update modals');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const addModal = () => {
        setFormData(prev => [...prev, { title: '', item: [{ component: '', technicalNotes: '' }] }]);
    };

    const removeModal = (index: number) => {
        setFormData(prev => prev.filter((_, i) => i !== index));
    };

    const addModalItem = (modalIndex: number) => {
        setFormData(prev => prev.map((modal, index) => 
            index === modalIndex 
                ? { ...modal, item: [...modal.item, { component: '', technicalNotes: '' }] }
                : modal
        ));
    };

    const removeModalItem = (modalIndex: number, itemIndex: number) => {
        setFormData(prev => prev.map((modal, index) => 
            index === modalIndex 
                ? { ...modal, item: modal.item.filter((_, i) => i !== itemIndex) }
                : modal
        ));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error && !data) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Edit Modals - Key Supply Categories</h1>
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

            <form onSubmit={handleSubmit} className="space-y-6">
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
                    
                    {formData.map((modal, modalIndex) => (
                        <div key={modalIndex} className="border border-gray-200 p-4 rounded mb-4">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-lg font-semibold">Modal {modalIndex + 1}</h3>
                                {formData.length > 1 && (
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
                                            const newModals = [...formData];
                                            newModals[modalIndex].title = e.target.value;
                                            setFormData(newModals);
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
                                                            const newModals = [...formData];
                                                            newModals[modalIndex].item[itemIndex].component = e.target.value;
                                                            setFormData(newModals);
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
                                                            const newModals = [...formData];
                                                            newModals[modalIndex].item[itemIndex].technicalNotes = e.target.value;
                                                            setFormData(newModals);
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
                        disabled={saving}
                        className="bg-primary text-white px-6 py-2 rounded hover:bg-primary/90 disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}