'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import IconArrowBackward from '@/components/icon/icon-arrow-backward';
import IconCloudDownload from '@/components/icon/icon-cloud-download';
import { useCreateEndeavorsProject } from './hooks/useEndeavorsProjects';
import { ProjectFormData } from '@/lib/api/endeavorsProjects';
import { uploadProjectImage } from '@/lib/api/uploadProjectImage';
import MediaPicker from '@/components/apps/media/MediaPicker';
import { navigationApi, navigationKeys } from '@/lib/api/navigation';
import { useQuery } from '@tanstack/react-query';

const AddEndeavorsProject = () => {
    const router = useRouter();
    const createMutation = useCreateEndeavorsProject();

    const [formData, setFormData] = useState<ProjectFormData>({
        title: '',
        slug: '',
        featuredImg: '',
        numberofsystems: '',
        noofdays: '',
        totalgeneration: '',
        battery: '',
        coalA: '',
        emissionreduction: '',
        treesplanted: '',
        capacity: '',
        todateproduct: '',
        consumption: '',
        totalenergydaily: '',
    });

    // Media picker state
    const [showMediaPicker, setShowMediaPicker] = useState(false);

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

    // Open media picker for featured image
    const openMediaPicker = () => {
        setShowMediaPicker(true);
    };

    // Handle media selection
    const handleMediaSelect = (url: string, file?: any) => {
        setFormData({ ...formData, featuredImg: url });
        setShowMediaPicker(false);
    };

    // Handle featured image upload
    const handleFeaturedImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
            setFormData({ ...formData, featuredImg: result.url });

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
            await createMutation.mutateAsync(formData);
            Swal.fire({
                title: 'Success!',
                text: 'Project created successfully',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
            });
            router.push('/apps/endeavors/projects');
        } catch (error) {
            Swal.fire({
                title: 'Error!',
                text: 'Failed to create project',
                icon: 'error',
            });
        }
    };

    const handleBack = () => {
        router.back();
    };

    return (
        <div className="panel">
            <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button type="button" className="btn btn-outline-primary btn-sm" onClick={handleBack}>
                        <IconArrowBackward className="h-4 w-4 mr-1" />
                        Back
                    </button>
                    <h5 className="text-lg font-semibold dark:text-white-light">Add New Project</h5>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="form-label">Title *</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Enter project title"
                            required
                        />
                    </div>
                    <div>
                        <label className="form-label">Slug</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                            placeholder="project-slug (auto-generated from title if empty)"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            Leave empty to auto-generate from title. Used for URLs.
                        </p>
                    </div>
                </div>

                {/* Featured Image */}
                <div>
                    <label className="form-label">Featured Image</label>
                    <div className="space-y-3">
                        <button
                            type="button"
                            onClick={openMediaPicker}
                            className="btn btn-outline-primary btn-sm w-full"
                        >
                            Browse Media
                        </button>
                        <div className="flex items-center gap-2">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFeaturedImageUpload}
                                className="hidden"
                                id="featured-image-upload"
                            />
                            <label
                                htmlFor="featured-image-upload"
                                className="btn btn-outline-primary btn-sm cursor-pointer"
                            >
                                <IconCloudDownload className="h-4 w-4 mr-1" />
                                Upload Image
                            </label>
                        </div>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.featuredImg}
                            onChange={(e) => setFormData({ ...formData, featuredImg: e.target.value })}
                            placeholder="Or paste URL manually"
                        />
                        {formData.featuredImg && (
                            <div className="mt-3">
                                <label className="form-label text-sm">Preview</label>
                                <div className="border rounded p-2 bg-gray-50">
                                    <img
                                        src={formData.featuredImg}
                                        alt="Featured image preview"
                                        className="max-w-full h-32 object-cover rounded"
                                        onError={(e) => {
                                            e.currentTarget.src = '/assets/images/placeholder.jpg';
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Project Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                        <label className="form-label">Number of Systems</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.numberofsystems}
                            onChange={(e) => setFormData({ ...formData, numberofsystems: e.target.value })}
                            placeholder="e.g., 150"
                        />
                    </div>
                    <div>
                        <label className="form-label">Number of Days</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.noofdays}
                            onChange={(e) => setFormData({ ...formData, noofdays: e.target.value })}
                            placeholder="e.g., 365"
                        />
                    </div>
                    <div>
                        <label className="form-label">Total Generation</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.totalgeneration}
                            onChange={(e) => setFormData({ ...formData, totalgeneration: e.target.value })}
                            placeholder="e.g., 1000 MWh"
                        />
                    </div>
                    <div>
                        <label className="form-label">Battery</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.battery}
                            onChange={(e) => setFormData({ ...formData, battery: e.target.value })}
                            placeholder="e.g., 500 kWh"
                        />
                    </div>
                    <div>
                        <label className="form-label">Coal A</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.coalA}
                            onChange={(e) => setFormData({ ...formData, coalA: e.target.value })}
                            placeholder="e.g., 200 tons"
                        />
                    </div>
                    <div>
                        <label className="form-label">Emission Reduction</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.emissionreduction}
                            onChange={(e) => setFormData({ ...formData, emissionreduction: e.target.value })}
                            placeholder="e.g., 500 tons CO2"
                        />
                    </div>
                    <div>
                        <label className="form-label">Trees Planted</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.treesplanted}
                            onChange={(e) => setFormData({ ...formData, treesplanted: e.target.value })}
                            placeholder="e.g., 1000"
                        />
                    </div>
                    <div>
                        <label className="form-label">Capacity</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.capacity}
                            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                            placeholder="e.g., 50 MW"
                        />
                    </div>
                    <div>
                        <label className="form-label">To Date Product</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.todateproduct}
                            onChange={(e) => setFormData({ ...formData, todateproduct: e.target.value })}
                            placeholder="e.g., 2500 units"
                        />
                    </div>
                    <div>
                        <label className="form-label">Consumption</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.consumption}
                            onChange={(e) => setFormData({ ...formData, consumption: e.target.value })}
                            placeholder="e.g., 800 kWh"
                        />
                    </div>
                    <div>
                        <label className="form-label">Total Energy Daily</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.totalenergydaily}
                            onChange={(e) => setFormData({ ...formData, totalenergydaily: e.target.value })}
                            placeholder="e.g., 100 kWh/day"
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-4">
                    <button type="button" className="btn btn-outline-danger" onClick={handleBack}>
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={createMutation.isPending}
                    >
                        {createMutation.isPending ? 'Creating...' : 'Create Project'}
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
                />
            )}
        </div>
    );
};

export default AddEndeavorsProject;