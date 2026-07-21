'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Swal from 'sweetalert2';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api-client';
import ImageUploadField from '@/components/shared/ImageUploadField';
import MediaPicker from '@/components/apps/media/MediaPicker';
import { navigationApi, navigationKeys } from '@/lib/api/navigation';
import { useQuery } from '@tanstack/react-query';

interface EditorialImage {
    src: string;
    alt: string;
}

interface EditorialCTA {
    text: string;
    href: string;
}

interface Writer {
    id: number;
    name: string;
    email: string;
}

interface Editorial {
    title: string;
    description: string;
    featuredImg: EditorialImage;
    writer: number;
    categories: string[];
    cta: EditorialCTA;
}

interface ThoughtLeadershipData {
    id?: number;
    editorials: Editorial[];
    mainPage: any;
}

interface User {
    id: number;
    name: string;
    email: string;
}

const EditEditorialPage = () => {
    const router = useRouter();
    const params = useParams();
    const editorialIndex = parseInt(params.id as string);
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [thoughtLeadershipData, setThoughtLeadershipData] = useState<ThoughtLeadershipData | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [formData, setFormData] = useState<Editorial>({
        title: '',
        description: '',
        featuredImg: { src: '', alt: '' },
        writer: 0,
        categories: [],
        cta: { text: '', href: '' }
    });
    const [newCategory, setNewCategory] = useState('');
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [ctaLinkType, setCtaLinkType] = useState<'navigation' | 'manual'>('navigation');

    // Fetch navigation items for CTA dropdown
    const { data: navigationItems } = useQuery({
        queryKey: navigationKeys.lists(),
        queryFn: () => navigationApi.getAll(),
    });

    // Flatten navigation items to show hierarchy
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

    const handleMediaSelect = (url: string, file?: any) => {
        setFormData(prev => ({
            ...prev,
            featuredImg: {
                ...prev.featuredImg,
                src: url
            }
        }));
        setShowMediaPicker(false);
    };

    useEffect(() => {
        fetchData();
    }, [editorialIndex]);

    const fetchData = async () => {
        try {
            const [thoughtLeadershipResult, usersResult] = await Promise.all([
                apiClient.get('/api/enlighten/thought-leadership'),
                apiClient.get('/api/users/writers')
            ]);

            if (thoughtLeadershipResult.success) {
                setThoughtLeadershipData(thoughtLeadershipResult.data);
                
                // Find the editorial to edit by index
                const editorial = thoughtLeadershipResult.data.editorials[editorialIndex];
                if (editorial) {
                    setFormData({
                        ...editorial,
                        writer: typeof editorial.writer === 'object' ? editorial.writer.id : editorial.writer,
                        categories: editorial.categories || []
                    });
                } else {
                    Swal.fire('Error', 'Editorial not found', 'error');
                    router.push('/enlighten/thought-leadership');
                }
            }

            if (usersResult.success) {
                setUsers(usersResult.data);
            }
        } catch (error: any) {
            console.error('Fetch data error:', error);
            Swal.fire('Error', 'Failed to load editorial data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleWriterChange = (writerId: number) => {
        setFormData((prev) => ({
            ...prev,
            writer: writerId,
        }));
    };

    const handleCTAChange = (field: 'text' | 'href', value: string) => {
        setFormData((prev) => ({
            ...prev,
            cta: {
                ...prev.cta,
                [field]: value,
            },
        }));
    };

    const addCategory = () => {
        if (newCategory.trim() && !formData.categories.includes(newCategory.trim())) {
            setFormData((prev) => ({
                ...prev,
                categories: [...prev.categories, newCategory.trim()],
            }));
            setNewCategory('');
        }
    };

    const removeCategory = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            categories: prev.categories.filter((_, i) => i !== index),
        }));
    };



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        if (!formData.title.trim() || !formData.description.trim()) {
            Swal.fire('Error', 'Title and description are required', 'error');
            setSaving(false);
            return;
        }

        try {
            const updatedEditorials = thoughtLeadershipData?.editorials.map((editorial, index) => 
                index === editorialIndex ? formData : editorial
            ) || [];

            const payload = {
                id: thoughtLeadershipData?.id,
                editorials: updatedEditorials,
                mainPage: thoughtLeadershipData?.mainPage
            };

            const result = await apiClient.put('/api/enlighten/thought-leadership', payload);
            if (result.success) {
                Swal.fire('Success', 'Editorial updated successfully', 'success');
                router.push('/enlighten/thought-leadership');
            } else {
                Swal.fire('Error', result.error || 'Failed to update editorial', 'error');
            }
        } catch (error: any) {
            console.error('Update editorial error:', error);
            Swal.fire('Error', error.message || 'Failed to update editorial', 'error');
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
                    <h5 className="font-semibold text-lg dark:text-white-light">Edit Editorial</h5>
                    <button 
                        onClick={() => router.push('/enlighten/thought-leadership')} 
                        className="btn btn-outline-primary"
                    >
                        Back to Thought Leadership
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Title *</label>
                        <input 
                            type="text" 
                            value={formData.title} 
                            onChange={(e) => handleInputChange('title', e.target.value)} 
                            className="form-input w-full" 
                            required 
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Description *</label>
                        <textarea 
                            value={formData.description} 
                            onChange={(e) => handleInputChange('description', e.target.value)} 
                            className="form-textarea w-full" 
                            rows={4} 
                            required
                        />
                    </div>

                    {/* Writer */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Writer</label>
                        <select
                            className="form-select w-full"
                            value={formData.writer}
                            onChange={(e) => handleWriterChange(parseInt(e.target.value))}
                        >
                            <option value={0}>Select a writer</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.name} ({user.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Categories */}
                    <div className="border rounded-lg p-4">
                        <h3 className="text-lg font-medium mb-4">Categories (Tags)</h3>
                        
                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                placeholder="Add a category"
                                className="form-input flex-1"
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
                            />
                            <button 
                                type="button" 
                                onClick={addCategory}
                                className="btn btn-primary btn-sm bg-green-600 hover:bg-green-700 border-green-600"
                            >
                                Add
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {formData.categories.map((category, index) => (
                                <span 
                                    key={index}
                                    className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                                >
                                    {category}
                                    <button
                                        type="button"
                                        onClick={() => removeCategory(index)}
                                        className="text-green-600 hover:text-green-800"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>

                        {formData.categories.length === 0 && (
                            <p className="text-gray-500 text-center py-4">No categories added yet</p>
                        )}
                    </div>

                    {/* Featured Image */}
                    <div className="border rounded-lg p-4">
                        <h3 className="text-lg font-medium mb-4">Featured Image</h3>
                        <button
                            type="button"
                            onClick={() => setShowMediaPicker(true)}
                            className="btn btn-outline-primary btn-sm mb-3"
                        >
                            Browse Media Library
                        </button>
                        <ImageUploadField
                            value={formData.featuredImg}
                            onChange={(img) => setFormData(prev => ({ 
                                ...prev, 
                                featuredImg: img
                            }))}
                            folder="enlighten/thought-leadership"
                            label=""
                        />
                    </div>

                    {/* CTA Section */}
                    <div className="border rounded-lg p-4">
                        <h3 className="text-lg font-medium mb-4">Call to Action</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">CTA Text</label>
                                <input 
                                    type="text" 
                                    value={formData.cta.text} 
                                    onChange={(e) => handleCTAChange('text', e.target.value)} 
                                    className="form-input w-full"
                                    placeholder="Read More"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Link Type</label>
                                <div className="flex gap-4 mb-2">
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            className="form-radio"
                                            checked={ctaLinkType === 'navigation'}
                                            onChange={() => setCtaLinkType('navigation')}
                                        />
                                        <span className="ml-2">Navigation</span>
                                    </label>
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            className="form-radio"
                                            checked={ctaLinkType === 'manual'}
                                            onChange={() => setCtaLinkType('manual')}
                                        />
                                        <span className="ml-2">Manual URL</span>
                                    </label>
                                </div>
                                {ctaLinkType === 'navigation' ? (
                                    <select
                                        className="form-select"
                                        value={formData.cta.href}
                                        onChange={(e) => {
                                            const selectedNav = allNavItems.find((item) => item.slug === e.target.value);
                                            handleCTAChange('href', selectedNav?.slug || '');
                                        }}
                                    >
                                        <option value="">Select navigation item</option>
                                        {allNavItems.map((item) => (
                                            <option key={item.id} value={item.slug}>
                                                {item.displayName} - {item.slug}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <input 
                                        type="url" 
                                        value={formData.cta.href} 
                                        onChange={(e) => handleCTAChange('href', e.target.value)} 
                                        className="form-input w-full"
                                        placeholder="https://example.com or /path"
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-4">
                        <button 
                            type="button" 
                            onClick={() => router.push('/enlighten/thought-leadership')} 
                            className="btn btn-outline-secondary"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={saving} 
                            className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600"
                        >
                            {saving ? 'Saving...' : 'Update Editorial'}
                        </button>
                    </div>
                </form>

                {/* Media Picker Modal */}
                {showMediaPicker && (
                    <MediaPicker
                        isOpen={showMediaPicker}
                        onClose={() => setShowMediaPicker(false)}
                        onSelect={handleMediaSelect}
                        title="Select Featured Image"
                        allowedTypes={['image']}
                        allowUrlInput={false}
                    />
                )}
            </div>
        </ProtectedRoute>
    );
};

export default EditEditorialPage;