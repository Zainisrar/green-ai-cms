'use client';
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { homeApi, homeKeys } from '@/lib/api/home';
import { useUpdateHome } from './hooks/useUpdateHome';
import { TextSection } from '@/lib/api/home';
import Loading from '@/components/layouts/loading';
import IconEdit from '@/components/icon/icon-edit';
import IconCheck from '@/components/icon/icon-checks';
import IconX from '@/components/icon/icon-x';
import IconArrowBackward from '@/components/icon/icon-arrow-backward';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

interface HomePageBaseProps {
    id: string;
    title: string;
}

const HomePageBase = ({ id, title }: HomePageBaseProps) => {
    const router = useRouter();
    const {
        data: homeData,
        isLoading,
        error,
        isError,
    } = useQuery({
        queryKey: homeKeys.detail(id),
        queryFn: () => homeApi.getById(id),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!id,
    });
    const { mutate: updateHome, isPending, isSuccess } = useUpdateHome();

    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<{
        text1: TextSection;
        text2: TextSection;
        text3: TextSection;
        text4: TextSection;
        text5: TextSection;
        slug: string;
    }>({
        text1: { headline: '', description: '' },
        text2: { headline: '', description: '' },
        text3: { headline: '', description: '' },
        text4: { headline: '', description: '' },
        text5: { headline: '', description: '' },
        slug: '',
    });

    // Initialize edit data when home data loads
    useEffect(() => {
        if (homeData) {
            setEditData({
                text1: homeData.text1,
                text2: homeData.text2,
                text3: homeData.text3,
                text4: homeData.text4,
                text5: homeData.text5,
                slug: homeData.slug,
            });
        }
    }, [homeData]);

    // Handle success
    useEffect(() => {
        if (isSuccess) {
            const toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
            });
            toast.fire({
                icon: 'success',
                title: 'Home page updated successfully!',
            });
            setIsEditing(false);
        }
    }, [isSuccess]);

    const handleSave = () => {
        updateHome({
            id: id,
            data: editData,
        });
    };

    const handleCancel = () => {
        if (homeData) {
            setEditData({
                text1: homeData.text1,
                text2: homeData.text2,
                text3: homeData.text3,
                text4: homeData.text4,
                text5: homeData.text5,
                slug: homeData.slug,
            });
        }
        setIsEditing(false);
    };

    const updateTextSection = (section: 'text1' | 'text2' | 'text3' | 'text4' | 'text5', field: 'headline' | 'description', value: string) => {
        setEditData((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value,
            },
        }));
    };

    if (isLoading) return <Loading />;

    if (isError) {
        return (
            <div className="panel mt-6">
                <div className="text-center py-10">
                    <p className="text-red-500">Error loading home page: {error?.message}</p>
                    <button onClick={() => window.location.reload()} className="btn btn-primary mt-4">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!homeData) return <Loading />;

    const textSections = [
        { key: 'text1' as const, label: 'Section 1', data: isEditing ? editData.text1 : homeData.text1 },
        { key: 'text2' as const, label: 'Section 2', data: isEditing ? editData.text2 : homeData.text2 },
        { key: 'text3' as const, label: 'Section 3', data: isEditing ? editData.text3 : homeData.text3 },
        { key: 'text4' as const, label: 'Section 4', data: isEditing ? editData.text4 : homeData.text4 },
        { key: 'text5' as const, label: 'Section 5', data: isEditing ? editData.text5 : homeData.text5 },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <button onClick={() => router.back()} className="cursor-pointer hover:text-primary transition-colors">
                        <IconArrowBackward width={30} />
                    </button>
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{title}</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage and edit home page content</p>
                        <div className="mt-2">
                            <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">{homeData.slug}</span>
                        </div>
                    </div>
                </div>
                <div className="flex space-x-2">
                    {!isEditing ? (
                        <button onClick={() => setIsEditing(true)} className="btn btn-primary flex items-center space-x-2">
                            <IconEdit className="w-4 h-4" />
                            <span>Edit</span>
                        </button>
                    ) : (
                        <>
                            <button onClick={handleSave} disabled={isPending} className="btn btn-success flex items-center space-x-2">
                                <IconCheck className="w-4 h-4" />
                                <span>{isPending ? 'Saving...' : 'Save'}</span>
                            </button>
                            <button onClick={handleCancel} className="btn btn-secondary flex items-center space-x-2">
                                <IconX className="w-4 h-4" />
                                <span>Cancel</span>
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Slug Editor */}
            {isEditing && (
                <div className="panel">
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Page Slug</label>
                        <input
                            type="text"
                            value={editData.slug}
                            onChange={(e) => setEditData((prev) => ({ ...prev, slug: e.target.value }))}
                            className="form-input w-full"
                            placeholder="/home/page-name"
                        />
                        <p className="text-sm text-gray-500 mt-1">Must start with "/home/"</p>
                    </div>
                </div>
            )}

            {/* Text Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {textSections.map((section) => (
                    <div key={section.key} className="panel">
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{section.label}</h3>

                            {/* Headline */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Headline</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={section.data.headline}
                                        onChange={(e) => updateTextSection(section.key, 'headline', e.target.value)}
                                        className="form-input w-full"
                                        placeholder="Enter headline"
                                        required
                                    />
                                ) : (
                                    <h4 className="text-xl font-bold text-gray-900 dark:text-white">{section.data.headline}</h4>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Description
                                    <span className="text-gray-400 text-xs ml-1">(optional)</span>
                                </label>
                                {isEditing ? (
                                    <textarea
                                        value={section.data.description || ''}
                                        onChange={(e) => updateTextSection(section.key, 'description', e.target.value)}
                                        className="form-textarea w-full h-24"
                                        placeholder="Enter description (optional)"
                                        rows={3}
                                    />
                                ) : (
                                    <div>
                                        {section.data.description ? (
                                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{section.data.description}</p>
                                        ) : (
                                            <p className="text-gray-400 italic">No description provided</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Metadata */}
            <div className="panel">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Page Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div>
                        <span className="font-medium">Created:</span> {homeData.createdAt ? new Date(homeData.createdAt).toLocaleString() : 'Unknown'}
                    </div>
                    <div>
                        <span className="font-medium">Last Updated:</span> {homeData.updatedAt ? new Date(homeData.updatedAt).toLocaleString() : 'Unknown'}
                    </div>
                    <div>
                        <span className="font-medium">Page ID:</span> {homeData.id}
                    </div>
                    <div>
                        <span className="font-medium">Slug:</span> {homeData.slug}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePageBase;
