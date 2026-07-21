'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { homeApi, CreateHomeData, TextSection } from '@/lib/api/home';
import Swal from 'sweetalert2';
import IconArrowBackward from '@/components/icon/icon-arrow-backward';
import IconSave from '@/components/icon/icon-save';

const HomeCreateForm = () => {
    const router = useRouter();
    const [formData, setFormData] = useState<CreateHomeData>({
        text1: { headline: '', description: '' },
        text2: { headline: '', description: '' },
        text3: { headline: '', description: '' },
        text4: { headline: '', description: '' },
        text5: { headline: '', description: '' },
        slug: '/home/',
    });

    const createMutation = useMutation({
        mutationFn: (data: CreateHomeData) => homeApi.create(data),
        onSuccess: () => {
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Home page created successfully',
                showConfirmButton: false,
                timer: 2000,
            });
            router.push('/home');
        },
        onError: (error: any) => {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to create home page',
            });
        },
    });

    const updateTextSection = (key: keyof CreateHomeData, field: keyof TextSection, value: string) => {
        if (key === 'slug') return;
        setFormData((prev) => ({
            ...prev,
            [key]: {
                ...(prev[key] as TextSection),
                [field]: value,
            },
        }));

        // Auto-generate slug when text1 headline changes
        if (key === 'text1' && field === 'headline') {
            const slug = value
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '') // Remove special characters
                .replace(/\s+/g, '-') // Replace spaces with hyphens
                .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
            
            setFormData((prev) => ({
                ...prev,
                slug: `/home/${slug}`,
            }));
        }
    };

    // Handle slug change - ensure it starts with /home/
    const handleSlugChange = (value: string) => {
        // Remove /home/ prefix if present to get the editable part
        let slugPart = value.replace(/^\/home\//, '');
        
        // Clean the slug part
        slugPart = slugPart
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
        
        setFormData((prev) => ({
            ...prev,
            slug: `/home/${slugPart}`,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate slug
        if (!formData.slug.startsWith('/home/')) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Slug',
                text: 'Slug must start with "/home/"',
            });
            return;
        }

        // Validate all headlines are filled
        const textFields = ['text1', 'text2', 'text3', 'text4', 'text5'] as const;
        for (const field of textFields) {
            if (!formData[field].headline.trim()) {
                Swal.fire({
                    icon: 'error',
                    title: 'Missing Field',
                    text: `${field} headline is required`,
                });
                return;
            }
        }

        createMutation.mutate(formData);
    };

    return (
        <div className="panel">
            <div className="flex items-center justify-between mb-5">
                <h1 className="text-2xl font-bold">Create New Home Page</h1>
                <button
                    onClick={() => router.push('/home')}
                    className="btn btn-outline-danger flex items-center gap-2"
                >
                    <IconArrowBackward />
                    Back to List
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Slug Field */}
                <div>
                    <label className="form-label">
                        Slug <span className="text-danger">*</span>
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500 dark:text-gray-400">
                            /home/
                        </div>
                        <input
                            type="text"
                            className="form-input pl-16"
                            placeholder="your-page-name"
                            value={formData.slug.replace(/^\/home\//, '')}
                            onChange={(e) => handleSlugChange(e.target.value)}
                            required
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Auto-generated from Section 1 headline. You can edit if needed.</p>
                </div>

                {/* Text Sections */}
                {(['text1', 'text2', 'text3', 'text4', 'text5'] as const).map((key, index) => (
                    <div key={key} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h3 className="text-lg font-semibold mb-4">
                            Section {index + 1}
                        </h3>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="form-label">
                                    Headline <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder={`Enter headline for section ${index + 1}`}
                                    value={formData[key].headline}
                                    onChange={(e) => updateTextSection(key, 'headline', e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="form-label">Description (Optional)</label>
                                <textarea
                                    className="form-textarea"
                                    rows={3}
                                    placeholder={`Enter description for section ${index + 1}`}
                                    value={formData[key].description || ''}
                                    onChange={(e) => updateTextSection(key, 'description', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                ))}

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        type="button"
                        onClick={() => router.push('/home')}
                        className="btn btn-outline-danger"
                        disabled={createMutation.isPending}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary flex items-center gap-2"
                        disabled={createMutation.isPending}
                    >
                        <IconSave />
                        {createMutation.isPending ? 'Creating...' : 'Create Home Page'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default HomeCreateForm;
