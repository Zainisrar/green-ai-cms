'use client';

import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import IconCloudDownload from '@/components/icon/icon-cloud-download';
import IconPlusCircle from '@/components/icon/icon-plus-circle';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import Loading from '@/components/layouts/loading';
import { useEndeavorsFlagshipProject, useUpdateEndeavorsFlagshipProject } from './hooks/useEndeavorsFlagshipProjects';
import { FlagshipProjectFormData } from '@/lib/api/endeavorsFlagshipProjects';

const FlagshipProjectAdmin = () => {
    const { data: project, isLoading } = useEndeavorsFlagshipProject();
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

    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        if (project && !isInitialized) {
            setFormData({
                title: project.title || '',
                subheadline: project.subheadline || '',
                key: project.key || { title: '', subtitle: '' },
                icons: project.icons || [],
                description: project.description || '',
                footer: project.footer || { title: '', subheadline: '' },
                cta: project.cta || [],
            });
            setIsInitialized(true);
        } else if (!project && !isLoading && !isInitialized) {
            // No project exists yet, keep default empty form
            setIsInitialized(true);
        }
    }, [project, isLoading, isInitialized]);

    const handleInputChange = (field: keyof FlagshipProjectFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNestedChange = (parent: 'key' | 'footer', field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [parent]: { ...(prev[parent] as any), [field]: value }
        }));
    };

    const addIcon = () => {
        setFormData(prev => ({
            ...prev,
            icons: [...prev.icons, { img: { src: '', alt: '' }, title: '', description: '' }]
        }));
    };

    const updateIcon = (index: number, field: string, value: string | { src: string; alt: string }) => {
        setFormData(prev => ({
            ...prev,
            icons: prev.icons.map((icon, i) => 
                i === index ? { ...icon, [field]: value } : icon
            )
        }));
    };

    const removeIcon = (index: number) => {
        setFormData(prev => ({
            ...prev,
            icons: prev.icons.filter((_, i) => i !== index)
        }));
    };

    const addCTA = () => {
        setFormData(prev => ({
            ...prev,
            cta: [...prev.cta, { text: '', href: '' }]
        }));
    };

    const updateCTA = (index: number, field: 'text' | 'href', value: string) => {
        setFormData(prev => ({
            ...prev,
            cta: prev.cta.map((cta, i) => 
                i === index ? { ...cta, [field]: value } : cta
            )
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

        if (!formData.title.trim()) {
            Swal.fire({
                title: 'Error!',
                text: 'Please fill in the project title',
                icon: 'error',
                confirmButtonColor: '#10b981',
            });
            return;
        }

        if (!formData.description.trim()) {
            Swal.fire({
                title: 'Error!',
                text: 'Please fill in the project description',
                icon: 'error',
                confirmButtonColor: '#10b981',
            });
            return;
        }

        try {
            await updateMutation.mutateAsync(formData);
            Swal.fire({
                title: 'Success!',
                text: 'Flagship project updated successfully',
                icon: 'success',
                confirmButtonColor: '#10b981',
                timer: 2000,
                showConfirmButton: false,
            });
        } catch (error) {
            Swal.fire({
                title: 'Error!',
                text: 'Failed to update flagship project',
                icon: 'error',
                confirmButtonColor: '#10b981',
            });
        }
    };

    if (isLoading) {
        return <Loading />;
    }

    return (
        <div className="panel">
            <div className="mb-5">
                <h5 className="text-lg font-semibold dark:text-white-light">Flagship Project Admin</h5>
                <p className="text-sm text-gray-500">Manage your flagship project information</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="panel">
                    <h6 className="text-lg font-semibold mb-4">Basic Information</h6>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="form-label">Title *</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                placeholder="Enter project title"
                                required
                            />
                        </div>
                        <div>
                            <label className="form-label">Subheadline</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.subheadline}
                                onChange={(e) => handleInputChange('subheadline', e.target.value)}
                                placeholder="Enter project subheadline"
                            />
                        </div>
                    </div>

                    <div className="mt-6">
                        <label className="form-label">Description *</label>
                        <textarea
                            className="form-textarea"
                            rows={4}
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            placeholder="Enter project description"
                            required
                        />
                    </div>
                </div>

                {/* Key Section */}
                <div className="panel">
                    <h6 className="text-lg font-semibold mb-4">Key Information</h6>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="form-label">Key Title</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.key.title}
                                onChange={(e) => handleNestedChange('key', 'title', e.target.value)}
                                placeholder="Enter key title"
                            />
                        </div>
                        <div>
                            <label className="form-label">Key Subtitle</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.key.subtitle}
                                onChange={(e) => handleNestedChange('key', 'subtitle', e.target.value)}
                                placeholder="Enter key subtitle"
                            />
                        </div>
                    </div>
                </div>

                {/* Icons Section */}
                <div className="panel">
                    <div className="flex items-center justify-between mb-4">
                        <h6 className="text-lg font-semibold">Project Icons</h6>
                        <button
                            type="button"
                            onClick={addIcon}
                            className="btn btn-primary btn-sm bg-green-600 hover:bg-green-700 border-green-600"
                        >
                            <IconPlusCircle className="w-4 h-4 mr-2" />
                            Add Icon
                        </button>
                    </div>

                    <div className="space-y-4">
                        {formData.icons.map((icon, index) => (
                            <div key={index} className="p-4 border rounded-lg">
                                <div className="flex items-center justify-between mb-3">
                                    <h6 className="font-medium">Icon {index + 1}</h6>
                                    <button
                                        type="button"
                                        onClick={() => removeIcon(index)}
                                        className="btn btn-outline-danger btn-sm"
                                    >
                                        <IconTrashLines className="w-4 h-4" />
                                    </button>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="form-label text-sm">Image URL</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="https://example.com/icon.png"
                                            value={icon.img.src}
                                            onChange={(e) => updateIcon(index, 'img', { ...icon.img, src: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label text-sm">Alt Text</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Icon description"
                                            value={icon.img.alt}
                                            onChange={(e) => updateIcon(index, 'img', { ...icon.img, alt: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label text-sm">Title</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Icon title"
                                            value={icon.title}
                                            onChange={(e) => updateIcon(index, 'title', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <label className="form-label text-sm">Description</label>
                                    <textarea
                                        className="form-textarea"
                                        rows={2}
                                        placeholder="Icon description"
                                        value={icon.description}
                                        onChange={(e) => updateIcon(index, 'description', e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}

                        {formData.icons.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                <p>No icons added yet. Click "Add Icon" to get started.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Section */}
                <div className="panel">
                    <h6 className="text-lg font-semibold mb-4">Footer Information</h6>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="form-label">Footer Title</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.footer.title}
                                onChange={(e) => handleNestedChange('footer', 'title', e.target.value)}
                                placeholder="Enter footer title"
                            />
                        </div>
                        <div>
                            <label className="form-label">Footer Subheadline</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.footer.subheadline}
                                onChange={(e) => handleNestedChange('footer', 'subheadline', e.target.value)}
                                placeholder="Enter footer subheadline"
                            />
                        </div>
                    </div>
                </div>

                {/* CTA Buttons */}
                <div className="panel">
                    <div className="flex items-center justify-between mb-4">
                        <h6 className="text-lg font-semibold">Call-to-Action Buttons</h6>
                        <button
                            type="button"
                            onClick={addCTA}
                            className="btn btn-primary btn-sm bg-green-600 hover:bg-green-700 border-green-600"
                        >
                            <IconPlusCircle className="w-4 h-4 mr-2" />
                            Add CTA Button
                        </button>
                    </div>

                    <div className="space-y-4">
                        {formData.cta.map((cta, index) => (
                            <div key={index} className="p-4 border rounded-lg">
                                <div className="flex items-center justify-between mb-3">
                                    <h6 className="font-medium">CTA Button {index + 1}</h6>
                                    <button
                                        type="button"
                                        onClick={() => removeCTA(index)}
                                        className="btn btn-outline-danger btn-sm"
                                    >
                                        <IconTrashLines className="w-4 h-4" />
                                    </button>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="form-label text-sm">Button Text</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Enter button text"
                                            value={cta.text}
                                            onChange={(e) => updateCTA(index, 'text', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label text-sm">Button Link</label>
                                        <input
                                            type="url"
                                            className="form-input"
                                            placeholder="https://example.com"
                                            value={cta.href}
                                            onChange={(e) => updateCTA(index, 'href', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}

                        {formData.cta.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                <p>No CTA buttons added yet. Click "Add CTA Button" to get started.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600"
                        disabled={updateMutation.isPending}
                    >
                        {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FlagshipProjectAdmin;