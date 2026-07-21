'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import IconArrowBackward from '@/components/icon/icon-arrow-backward';
import IconPlus from '@/components/icon/icon-plus';
import IconTrash from '@/components/icon/icon-trash';
import { FlagshipProjectFormData } from '@/lib/api/endeavorsFlagshipProjects';
import { useUpdateEndeavorsFlagshipProject } from './hooks/useEndeavorsFlagshipProjects';
import { uploadProjectImage } from '@/lib/api/uploadProjectImage';

const AddEndeavorsFlagshipProject = () => {
    const router = useRouter();
    const updateMutation = useUpdateEndeavorsFlagshipProject();

    const [formData, setFormData] = useState<FlagshipProjectFormData>({
        title: '',
        subheadline: '',
        key: {
            title: '',
            subtitle: '',
        },
        icons: [],
        description: '',
        footer: {
            title: '',
            subheadline: '',
        },
        cta: [],
    });

    const handleInputChange = (field: keyof FlagshipProjectFormData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleKeyChange = (field: 'title' | 'subtitle', value: string) => {
        setFormData((prev) => ({
            ...prev,
            key: { ...prev.key, [field]: value },
        }));
    };

    const handleFooterChange = (field: 'title' | 'subheadline', value: string) => {
        setFormData((prev) => ({
            ...prev,
            footer: { ...prev.footer, [field]: value },
        }));
    };

    const addIcon = () => {
        setFormData((prev) => ({
            ...prev,
            icons: [...prev.icons, { img: { src: '', alt: '' }, title: '', description: '' }],
        }));
    };

    const removeIcon = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            icons: prev.icons.filter((_, i) => i !== index),
        }));
    };

    const updateIcon = (index: number, field: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            icons: prev.icons.map((icon, i) => (i === index ? { ...icon, [field]: value } : icon)),
        }));
    };

    const addCTA = () => {
        setFormData((prev) => ({
            ...prev,
            cta: [...prev.cta, { text: '', href: '' }],
        }));
    };

    const removeCTA = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            cta: prev.cta.filter((_, i) => i !== index),
        }));
    };

    const updateCTA = (index: number, field: 'text' | 'href', value: string) => {
        setFormData((prev) => ({
            ...prev,
            cta: prev.cta.map((cta, i) => (i === index ? { ...cta, [field]: value } : cta)),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            Swal.fire({
                title: 'Error!',
                text: 'Please fill in the project title',
                icon: 'error',
            });
            return;
        }

        try {
            await updateMutation.mutateAsync(formData);
            Swal.fire({
                title: 'Success!',
                text: 'Flagship project updated successfully',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
            });
            router.push('/endeavors/flagship-projects');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update flagship project';
            Swal.fire({
                title: 'Error!',
                text: errorMessage,
                icon: 'error',
            });
        }
    };

    return (
        <div className="panel">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                    <button onClick={() => router.back()} className="btn btn-outline-primary btn-sm">
                        <IconArrowBackward className="w-4 h-4" />
                    </button>
                    <h5 className="font-semibold text-lg dark:text-white-light">Add Flagship Project</h5>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                    <label className="block text-sm font-medium mb-2">Title *</label>
                    <input type="text" className="form-input" placeholder="Enter project title" value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} required />
                </div>

                {/* Subheadline */}
                <div>
                    <label className="block text-sm font-medium mb-2">Subheadline</label>
                    <input type="text" className="form-input" placeholder="Enter subheadline" value={formData.subheadline} onChange={(e) => handleInputChange('subheadline', e.target.value)} />
                </div>

                {/* Key Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Key Title</label>
                        <input type="text" className="form-input" placeholder="Enter key title" value={formData.key.title} onChange={(e) => handleKeyChange('title', e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Key Subtitle</label>
                        <input type="text" className="form-input" placeholder="Enter key subtitle" value={formData.key.subtitle} onChange={(e) => handleKeyChange('subtitle', e.target.value)} />
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                        className="form-textarea"
                        rows={4}
                        placeholder="Enter project description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                    />
                </div>

                {/* Footer Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Footer Title</label>
                        <input type="text" className="form-input" placeholder="Enter footer title" value={formData.footer.title} onChange={(e) => handleFooterChange('title', e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Footer Subheadline</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Enter footer subheadline"
                            value={formData.footer.subheadline}
                            onChange={(e) => handleFooterChange('subheadline', e.target.value)}
                        />
                    </div>
                </div>

                {/* Icons Section */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <label className="block text-sm font-medium">Icons</label>
                        <button type="button" onClick={addIcon} className="btn btn-outline-primary btn-sm">
                            <IconPlus className="w-4 h-4 mr-1" />
                            Add Icon
                        </button>
                    </div>
                    {formData.icons.map((icon, index) => (
                        <div key={index} className="border rounded-lg p-4 mb-4">
                            <div className="flex justify-between items-center mb-3">
                                <h6 className="font-medium">Icon {index + 1}</h6>
                                <button type="button" onClick={() => removeIcon(index)} className="btn btn-outline-danger btn-sm">
                                    <IconTrash className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Image URL</label>
                                    <input
                                        type="url"
                                        className="form-input"
                                        placeholder="Enter image URL"
                                        value={icon.img.src}
                                        onChange={(e) => updateIcon(index, 'img', { ...icon.img, src: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Alt Text</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Enter alt text"
                                        value={icon.img.alt}
                                        onChange={(e) => updateIcon(index, 'img', { ...icon.img, alt: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Title</label>
                                    <input type="text" className="form-input" placeholder="Enter title" value={icon.title} onChange={(e) => updateIcon(index, 'title', e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Description</label>
                                    <textarea
                                        className="form-textarea"
                                        rows={2}
                                        placeholder="Enter description"
                                        value={icon.description}
                                        onChange={(e) => updateIcon(index, 'description', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA Section */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <label className="block text-sm font-medium">Call to Action Buttons</label>
                        <button type="button" onClick={addCTA} className="btn btn-outline-primary btn-sm">
                            <IconPlus className="w-4 h-4 mr-1" />
                            Add CTA
                        </button>
                    </div>
                    {formData.cta.map((cta, index) => (
                        <div key={index} className="border rounded-lg p-4 mb-4">
                            <div className="flex justify-between items-center mb-3">
                                <h6 className="font-medium">CTA {index + 1}</h6>
                                <button type="button" onClick={() => removeCTA(index)} className="btn btn-outline-danger btn-sm">
                                    <IconTrash className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Button Text</label>
                                    <input type="text" className="form-input" placeholder="Enter button text" value={cta.text} onChange={(e) => updateCTA(index, 'text', e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Button Link</label>
                                    <input type="url" className="form-input" placeholder="Enter button link" value={cta.href} onChange={(e) => updateCTA(index, 'href', e.target.value)} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Submit Button */}
                <div className="flex gap-2 pt-4">
                    <button type="submit" disabled={updateMutation.isPending} className="btn btn-primary">
                        {updateMutation.isPending ? 'Saving...' : 'Save Project'}
                    </button>
                    <button type="button" onClick={() => router.back()} className="btn btn-outline-secondary">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddEndeavorsFlagshipProject;
