'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api-client';

interface EventCTA {
    text: string;
    href: string;
}

interface EventsMainPage {
    title: string;
    subHeadline: string;
    description: string;
    quote: {
        text: string;
        highlighted: string;
    };
    cta: EventCTA[];
}

interface EventsData {
    id?: number;
    upcomingEvents: any[];
    mainPage: EventsMainPage;
}

const EditMainPagePage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [eventsData, setEventsData] = useState<EventsData | null>(null);
    const [formData, setFormData] = useState<EventsMainPage>({
        title: '',
        subHeadline: '',
        description: '',
        quote: {
            text: '',
            highlighted: ''
        },
        cta: []
    });

    useEffect(() => {
        fetchEventsData();
    }, []);

    const fetchEventsData = async () => {
        try {
            const result = await apiClient.get('/api/enlighten/events-webinars');
            if (result.success) {
                setEventsData(result.data);
                setFormData(result.data.mainPage);
            }
        } catch (error: any) {
            console.error('Fetch events data error:', error);
            Swal.fire('Error', 'Failed to load main page data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleQuoteChange = (field: 'text' | 'highlighted', value: string) => {
        setFormData(prev => ({
            ...prev,
            quote: {
                ...prev.quote,
                [field]: value
            }
        }));
    };

    const handleCTAChange = (index: number, field: 'text' | 'href', value: string) => {
        setFormData(prev => ({
            ...prev,
            cta: prev.cta.map((item, i) => 
                i === index ? { ...item, [field]: value } : item
            )
        }));
    };

    const addCTA = () => {
        setFormData(prev => ({
            ...prev,
            cta: [...prev.cta, { text: '', href: '' }]
        }));
    };

    const removeCTA = (index: number) => {
        setFormData(prev => ({
            ...prev,
            cta: prev.cta.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const payload = {
                id: eventsData?.id,
                upcomingEvents: eventsData?.upcomingEvents || [],
                mainPage: formData
            };

            const result = await apiClient.put('/api/enlighten/events-webinars', payload);
            if (result.success) {
                Swal.fire('Success', 'Main page updated successfully', 'success');
                router.push('/enlighten/events-webinars');
            } else {
                Swal.fire('Error', result.error || 'Failed to update main page', 'error');
            }
        } catch (error: any) {
            console.error('Update main page error:', error);
            Swal.fire('Error', error.message || 'Failed to update main page', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <ProtectedRoute requiredPermission={{ resource: 'enlighten', action: 'edit' }}>
                <div className="panel">
                    <div className="flex items-center justify-center py-10">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute requiredPermission={{ resource: 'enlighten', action: 'edit' }}>
            <div className="panel">
                <div className="flex items-center justify-between mb-5">
                    <h5 className="font-semibold text-lg dark:text-white-light">Edit Main Page - Events & Webinars</h5>
                    <button
                        onClick={() => router.push('/enlighten/events-webinars')}
                        className="btn btn-outline-primary"
                    >
                        Back to Events
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            className="form-input w-full"
                            required
                        />
                    </div>

                    {/* Sub Headline */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Sub Headline</label>
                        <input
                            type="text"
                            value={formData.subHeadline}
                            onChange={(e) => handleInputChange('subHeadline', e.target.value)}
                            className="form-input w-full"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            className="form-textarea w-full"
                            rows={4}
                        />
                    </div>

                    {/* Quote Section */}
                    <div className="border rounded-lg p-4">
                        <h3 className="text-lg font-medium mb-4">Quote Section</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Quote Text</label>
                                <textarea
                                    value={formData.quote.text}
                                    onChange={(e) => handleQuoteChange('text', e.target.value)}
                                    className="form-textarea w-full"
                                    rows={3}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-2">Highlighted Text</label>
                                <input
                                    type="text"
                                    value={formData.quote.highlighted}
                                    onChange={(e) => handleQuoteChange('highlighted', e.target.value)}
                                    className="form-input w-full"
                                />
                            </div>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium">Call to Action Buttons</h3>
                            <button
                                type="button"
                                onClick={addCTA}
                                className="btn btn-primary btn-sm bg-green-600 hover:bg-green-700 border-green-600"
                            >
                                Add CTA
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            {formData.cta.map((cta, index) => (
                                <div key={index} className="border rounded p-3">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium">CTA {index + 1}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeCTA(index)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Button Text</label>
                                            <input
                                                type="text"
                                                value={cta.text}
                                                onChange={(e) => handleCTAChange(index, 'text', e.target.value)}
                                                className="form-input w-full"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Link URL</label>
                                            <input
                                                type="text"
                                                value={cta.href}
                                                onChange={(e) => handleCTAChange(index, 'href', e.target.value)}
                                                className="form-input w-full"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            
                            {formData.cta.length === 0 && (
                                <p className="text-gray-500 text-center py-4">No CTA buttons added yet</p>
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => router.push('/enlighten/events-webinars')}
                            className="btn btn-outline-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </ProtectedRoute>
    );
};

export default EditMainPagePage;