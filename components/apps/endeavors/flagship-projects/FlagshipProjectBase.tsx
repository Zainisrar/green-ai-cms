'use client';
import React, { useState, useEffect } from 'react';
import Loading from '@/components/layouts/loading';
import IconEdit from '@/components/icon/icon-edit';
import IconCheck from '@/components/icon/icon-checks';
import IconX from '@/components/icon/icon-x';
import IconCloudDownload from '@/components/icon/icon-cloud-download';
import IconPlus from '@/components/icon/icon-plus';
import IconTrash from '@/components/icon/icon-trash';
import Swal from 'sweetalert2';
import { useEndeavorsFlagshipProject, useUpdateEndeavorsFlagshipProject } from './hooks/useEndeavorsFlagshipProjects';
import { FlagshipProjectFormData } from '@/lib/api/endeavorsFlagshipProjects';
import { uploadProjectImage } from '@/lib/api/uploadProjectImage';
import MediaPicker from '@/components/apps/media/MediaPicker';
import { navigationApi, navigationKeys } from '@/lib/api/navigation';
import { useQuery } from '@tanstack/react-query';

const FlagshipProjectBase = () => {
    const { data: project, isLoading } = useEndeavorsFlagshipProject();
    const updateMutation = useUpdateEndeavorsFlagshipProject();
    const [isEditing, setIsEditing] = useState(false);

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
        cta: [{ text: '', href: '' }],
    });

    // Media picker state
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [mediaPickerTarget, setMediaPickerTarget] = useState<number | null>(null);

    // CTA link type state for each CTA
    const [ctaLinkTypes, setCtaLinkTypes] = useState<{ [key: number]: 'navigation' | 'manual' }>({});

    // Fetch navigation items
    const { data: navigationItems = [] } = useQuery({
        queryKey: navigationKeys.lists(),
        queryFn: () => navigationApi.getAll(),
    });

    // Flatten navigation items for dropdown
    const flattenNavItems = (items: any[], prefix = ''): any[] => {
        let result: any[] = [];
        items.forEach((item) => {
            const displayName = prefix ? `${prefix} > ${item.name}` : item.name;
            result.push({ ...item, displayName });
            if (item.children && item.children.length > 0) {
                result = result.concat(flattenNavItems(item.children, displayName));
            }
        });
        return result;
    };

    const allNavItems = flattenNavItems(navigationItems);

    // Open media picker for icon
    const openMediaPicker = (iconIndex: number) => {
        setMediaPickerTarget(iconIndex);
        setShowMediaPicker(true);
    };

    // Handle media selection
    const handleMediaSelect = (url: string, file?: any) => {
        if (mediaPickerTarget === null) return;

        const newIcons = [...formData.icons];
        newIcons[mediaPickerTarget] = {
            ...newIcons[mediaPickerTarget],
            img: { ...newIcons[mediaPickerTarget].img, src: url, alt: file?.alt || newIcons[mediaPickerTarget].img.alt },
        };
        setFormData({ ...formData, icons: newIcons });
        setShowMediaPicker(false);
        setMediaPickerTarget(null);
    };

    useEffect(() => {
        if (project) {
            setFormData({
                title: project.title || '',
                subheadline: project.subheadline || '',
                key: project.key || { title: '', subtitle: '' },
                icons: project.icons || [],
                description: project.description || '',
                footer: project.footer || { title: '', subheadline: '' },
                cta: project.cta || [{ text: '', href: '' }],
            });
        }
    }, [project]);

    const handleIconImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, iconIndex: number) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            Swal.fire({
                title: 'Uploading...',
                text: 'Please wait while we upload your image',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            const result = await uploadProjectImage(file);
            const newIcons = [...formData.icons];
            newIcons[iconIndex] = {
                ...newIcons[iconIndex],
                img: { ...newIcons[iconIndex].img, src: result.url },
            };
            setFormData({ ...formData, icons: newIcons });

            Swal.close();
            Swal.fire({
                title: 'Success!',
                text: 'Image uploaded successfully',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
            });
        } catch (error) {
            Swal.close();
            const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
            Swal.fire({
                title: 'Error!',
                text: errorMessage,
                icon: 'error',
            });
        }
    };

    const addIcon = () => {
        setFormData({
            ...formData,
            icons: [...formData.icons, { img: { src: '', alt: '' }, title: '', description: '' }],
        });
    };

    const removeIcon = (index: number) => {
        const newIcons = formData.icons.filter((_, i) => i !== index);
        setFormData({ ...formData, icons: newIcons });
    };

    const updateIcon = (index: number, field: keyof typeof formData.icons[0], value: any) => {
        const newIcons = [...formData.icons];
        if (field === 'img') {
            newIcons[index] = { ...newIcons[index], img: value };
        } else {
            newIcons[index] = { ...newIcons[index], [field]: value };
        }
        setFormData({ ...formData, icons: newIcons });
    };

    const addCTA = () => {
        setFormData({
            ...formData,
            cta: [...formData.cta, { text: '', href: '' }],
        });
    };

    const removeCTA = (index: number) => {
        const newCTA = formData.cta.filter((_, i) => i !== index);
        setFormData({ ...formData, cta: newCTA });
    };

    const updateCTA = (index: number, field: 'text' | 'href', value: string) => {
        const newCTA = [...formData.cta];
        newCTA[index] = { ...newCTA[index], [field]: value };
        setFormData({ ...formData, cta: newCTA });
    };

    const handleSave = async () => {
        if (!formData.title.trim()) {
            Swal.fire({
                title: 'Error!',
                text: 'Please fill in the title',
                icon: 'error',
            });
            return;
        }

        if (!formData.subheadline.trim()) {
            Swal.fire({
                title: 'Error!',
                text: 'Please fill in the subheadline',
                icon: 'error',
            });
            return;
        }

        if (!formData.description.trim()) {
            Swal.fire({
                title: 'Error!',
                text: 'Please fill in the description',
                icon: 'error',
            });
            return;
        }

        if (formData.cta.length === 0) {
            Swal.fire({
                title: 'Error!',
                text: 'At least one CTA button is required',
                icon: 'error',
            });
            return;
        }

        for (const ctaItem of formData.cta) {
            if (!ctaItem.text.trim() || !ctaItem.href.trim()) {
                Swal.fire({
                    title: 'Error!',
                    text: 'All CTA buttons must have both text and href',
                    icon: 'error',
                });
                return;
            }
        }

        try {
            const updatedProject = await updateMutation.mutateAsync(formData);
            // Force immediate UI update with the returned data
            setFormData({
                title: updatedProject.title || '',
                subheadline: updatedProject.subheadline || '',
                key: updatedProject.key || { title: '', subtitle: '' },
                icons: updatedProject.icons || [],
                description: updatedProject.description || '',
                footer: updatedProject.footer || { title: '', subheadline: '' },
                cta: updatedProject.cta || [{ text: '', href: '' }],
            });
            setIsEditing(false);
            Swal.fire({
                title: 'Success!',
                text: 'Flagship project updated successfully',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
            });
        } catch (error) {
            Swal.fire({
                title: 'Error!',
                text: 'Failed to update flagship project',
                icon: 'error',
            });
        }
    };

    const handleCancel = () => {
        if (project) {
            setFormData({
                title: project.title || '',
                subheadline: project.subheadline || '',
                key: project.key || { title: '', subtitle: '' },
                icons: project.icons || [],
                description: project.description || '',
                footer: project.footer || { title: '', subheadline: '' },
                cta: project.cta || [{ text: '', href: '' }],
            });
        }
        setIsEditing(false);
    };

    if (isLoading) {
        return <Loading />;
    }

    return (
        <div className="panel">
            <div className="mb-5 flex items-center justify-between">
                <div>
                    <h5 className="text-lg font-semibold dark:text-white-light">Flagship Project</h5>
                    <p className="text-sm text-gray-500">Manage your flagship project content</p>
                </div>
                <div className="flex items-center gap-2">
                    {isEditing ? (
                        <>
                            <button
                                type="button"
                                className="btn btn-success btn-sm"
                                onClick={handleSave}
                                disabled={updateMutation.isPending}
                            >
                                <IconCheck className="h-4 w-4 mr-1" />
                                {updateMutation.isPending ? 'Saving...' : 'Save'}
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline-danger btn-sm"
                                onClick={handleCancel}
                            >
                                <IconX className="h-4 w-4 mr-1" />
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => setIsEditing(true)}
                        >
                            <IconEdit className="h-4 w-4 mr-1" />
                            Edit
                        </button>
                    )}
                </div>
            </div>

            {isEditing ? (
                <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="form-label">Title *</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="FLAGSHIP PROJECTS"
                                required
                            />
                        </div>
                        <div>
                            <label className="form-label">Subheadline *</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.subheadline}
                                onChange={(e) => setFormData({ ...formData, subheadline: e.target.value })}
                                placeholder="PNG's First Utility-Scale Grid-Connected Solar Power Plant, 3MW, Baiyer (2025)"
                                required
                            />
                        </div>
                    </div>

                    {/* Key Section */}
                    <div>
                        <label className="form-label">Key Section</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.key.title}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            key: { ...formData.key, title: e.target.value },
                                        })
                                    }
                                    placeholder="Key Title"
                                />
                            </div>
                            <div>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.key.subtitle}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            key: { ...formData.key, subtitle: e.target.value },
                                        })
                                    }
                                    placeholder="Key Subtitle"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Icons Section */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <label className="form-label">Icons</label>
                            <button type="button" className="btn btn-outline-primary btn-sm" onClick={addIcon}>
                                <IconPlus className="h-4 w-4 mr-1" />
                                Add Icon
                            </button>
                        </div>
                        <div className="space-y-4">
                            {formData.icons.map((icon, index) => (
                                <div key={index} className="border rounded p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h6 className="font-medium">Icon {index + 1}</h6>
                                        <button
                                            type="button"
                                            className="btn btn-outline-danger btn-sm"
                                            onClick={() => removeIcon(index)}
                                        >
                                            <IconTrash className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="form-label text-sm">Image</label>
                                            <div className="space-y-2">
                                                <button
                                                    type="button"
                                                    onClick={() => openMediaPicker(index)}
                                                    className="btn btn-outline-primary btn-sm w-full"
                                                >
                                                    Browse Media
                                                </button>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => handleIconImageUpload(e, index)}
                                                        className="hidden"
                                                        id={`icon-upload-${index}`}
                                                    />
                                                    <label
                                                        htmlFor={`icon-upload-${index}`}
                                                        className="btn btn-outline-primary btn-sm cursor-pointer"
                                                    >
                                                        <IconCloudDownload className="h-4 w-4 mr-1" />
                                                        Upload
                                                    </label>
                                                </div>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    value={icon.img.src}
                                                    onChange={(e) =>
                                                        updateIcon(index, 'img', { ...icon.img, src: e.target.value })
                                                    }
                                                    placeholder="Or paste URL manually"
                                                />
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    value={icon.img.alt}
                                                    onChange={(e) =>
                                                        updateIcon(index, 'img', { ...icon.img, alt: e.target.value })
                                                    }
                                                    placeholder="Alt text"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div>
                                                <label className="form-label text-sm">Title</label>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    value={icon.title}
                                                    onChange={(e) => updateIcon(index, 'title', e.target.value)}
                                                    placeholder="Icon title"
                                                />
                                            </div>
                                            <div>
                                                <label className="form-label text-sm">Description</label>
                                                <textarea
                                                    className="form-textarea"
                                                    rows={3}
                                                    value={icon.description}
                                                    onChange={(e) => updateIcon(index, 'description', e.target.value)}
                                                    placeholder="Icon description"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    {icon.img.src && (
                                        <div className="mt-3">
                                            <img
                                                src={icon.img.src}
                                                alt={icon.img.alt}
                                                className="w-16 h-16 object-cover rounded border"
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="form-label">Description *</label>
                        <textarea
                            className="form-textarea"
                            rows={4}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Main description content"
                            required
                        />
                    </div>

                    {/* Footer Section */}
                    <div>
                        <label className="form-label">Footer Section</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.footer.title}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            footer: { ...formData.footer, title: e.target.value },
                                        })
                                    }
                                    placeholder="Footer Title"
                                />
                            </div>
                            <div>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.footer.subheadline}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            footer: { ...formData.footer, subheadline: e.target.value },
                                        })
                                    }
                                    placeholder="Footer Subheadline"
                                />
                            </div>
                        </div>
                    </div>

                    {/* CTA Buttons */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <label className="form-label">CTA Buttons *</label>
                            <button type="button" className="btn btn-outline-primary btn-sm" onClick={addCTA}>
                                <IconPlus className="h-4 w-4 mr-1" />
                                Add CTA
                            </button>
                        </div>
                        <div className="space-y-4">
                            {formData.cta.map((ctaItem, index) => (
                                <div key={index} className="border rounded p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h6 className="font-medium">CTA Button {index + 1}</h6>
                                        {formData.cta.length > 1 && (
                                            <button
                                                type="button"
                                                className="btn btn-outline-danger btn-sm"
                                                onClick={() => removeCTA(index)}
                                            >
                                                <IconTrash className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="form-label text-sm">Button Text</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={ctaItem.text}
                                                onChange={(e) => updateCTA(index, 'text', e.target.value)}
                                                placeholder="Button Text"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label text-sm">Link Type</label>
                                            <div className="flex gap-4 mb-2">
                                                <label className="flex items-center cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        className="form-radio"
                                                        checked={ctaLinkTypes[index] === 'navigation'}
                                                        onChange={() => setCtaLinkTypes({ ...ctaLinkTypes, [index]: 'navigation' })}
                                                    />
                                                    <span className="ml-2">Navigation</span>
                                                </label>
                                                <label className="flex items-center cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        className="form-radio"
                                                        checked={ctaLinkTypes[index] !== 'navigation'}
                                                        onChange={() => setCtaLinkTypes({ ...ctaLinkTypes, [index]: 'manual' })}
                                                    />
                                                    <span className="ml-2">Manual URL</span>
                                                </label>
                                            </div>
                                            {ctaLinkTypes[index] === 'navigation' ? (
                                                <select
                                                    className="form-select"
                                                    value={ctaItem.href}
                                                    onChange={(e) => {
                                                        const selectedNav = allNavItems.find((item) => item.slug === e.target.value);
                                                        updateCTA(index, 'href', selectedNav?.slug || '');
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
                                                    type="text"
                                                    className="form-input"
                                                    value={ctaItem.href}
                                                    onChange={(e) => updateCTA(index, 'href', e.target.value)}
                                                    placeholder="Button Link (href)"
                                                    required
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {!project ? (
                        <div className="text-center py-12">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                No flagship project configured
                            </h3>
                            <p className="text-gray-500 mb-6">
                                Click Edit to configure your flagship project content.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Display Mode */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="form-label">Title</label>
                                    <div className="form-input bg-gray-50">{project.title || 'Not set'}</div>
                                </div>
                                <div>
                                    <label className="form-label">Subheadline</label>
                                    <div className="form-input bg-gray-50">{project.subheadline || 'Not set'}</div>
                                </div>
                            </div>

                            <div>
                                <label className="form-label">Key Section</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="form-input bg-gray-50">{project.key?.title || 'Not set'}</div>
                                    <div className="form-input bg-gray-50">{project.key?.subtitle || 'Not set'}</div>
                                </div>
                            </div>

                            <div>
                                <label className="form-label">Description</label>
                                <div className="form-input bg-gray-50">{project.description || 'Not set'}</div>
                            </div>

                            {project.icons && project.icons.length > 0 && (
                                <div>
                                    <label className="form-label">Icons ({project.icons.length})</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {project.icons.map((icon, index) => (
                                            <div key={index} className="border rounded p-3 bg-gray-50">
                                                <div className="flex items-center gap-3">
                                                    {icon.img?.src && (
                                                        <img
                                                            src={icon.img.src}
                                                            alt={icon.img.alt}
                                                            className="w-12 h-12 object-cover rounded"
                                                        />
                                                    )}
                                                    <div>
                                                        <div className="font-medium">{icon.title}</div>
                                                        <div className="text-sm text-gray-600">{icon.description}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="form-label">Footer Section</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="form-input bg-gray-50">{project.footer?.title || 'Not set'}</div>
                                    <div className="form-input bg-gray-50">{project.footer?.subheadline || 'Not set'}</div>
                                </div>
                            </div>

                            {project.cta && project.cta.length > 0 && (
                                <div>
                                    <label className="form-label">CTA Buttons ({project.cta.length})</label>
                                    <div className="space-y-2">
                                        {project.cta.map((ctaItem, index) => (
                                            <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="form-input bg-gray-50">{ctaItem.text}</div>
                                                <div className="form-input bg-gray-50">{ctaItem.href}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* Media Picker Modal */}
            {showMediaPicker && (
                <MediaPicker
                    isOpen={showMediaPicker}
                    onClose={() => {
                        setShowMediaPicker(false);
                        setMediaPickerTarget(null);
                    }}
                    onSelect={handleMediaSelect}
                    title={`Select Icon Image ${mediaPickerTarget !== null ? mediaPickerTarget + 1 : ''}`}
                />
            )}
        </div>
    );
};

export default FlagshipProjectBase;