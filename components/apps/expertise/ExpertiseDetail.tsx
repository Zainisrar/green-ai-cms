'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { expertiseApi, expertiseKeys } from '@/lib/api/expertise';
import Loading from '@/components/layouts/loading';
import IconArrowBackward from '@/components/icon/icon-arrow-backward';
import { useRouter } from 'next/navigation';

interface ExpertiseDetailProps {
    slug: string;
}

const ExpertiseDetail = ({ slug }: ExpertiseDetailProps) => {
    const router = useRouter();
    
    const { data: expertise, isLoading, error, isError } = useQuery({
        queryKey: expertiseKeys.bySlug(slug),
        queryFn: () => expertiseApi.getBySlug(slug),
        enabled: !!slug,
    });

    if (isLoading) return <Loading />;
    
    if (isError) {
        return (
            <div className="panel mt-6">
                <div className="text-center py-10">
                    <p className="text-red-500">Error loading expertise: {error?.message}</p>
                    <button 
                        onClick={() => router.push('/expertise')} 
                        className="btn btn-primary mt-4"
                    >
                        Back to List
                    </button>
                </div>
            </div>
        );
    }

    if (!expertise) {
        return (
            <div className="panel mt-6">
                <div className="text-center py-10">
                    <p className="text-gray-500">Expertise not found</p>
                    <button 
                        onClick={() => router.push('/expertise')} 
                        className="btn btn-primary mt-4"
                    >
                        Back to List
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-4">
                <button
                    onClick={() => router.push('/expertise')}
                    className="cursor-pointer hover:text-primary transition-colors"
                >
                    <IconArrowBackward width={30} />
                </button>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {expertise.title}
                </h1>
            </div>

            {/* Main Content */}
            <div className="panel">
                <div className="space-y-8">
                    {/* Hero Section */}
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {expertise.highlightedTitle}
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300">
                            {expertise.subtitlePage}
                        </p>
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 border-2 border-dashed border-gray-300 dark:border-gray-600">
                            <div className="text-gray-500 dark:text-gray-400 text-center">
                                <div className="text-lg font-medium mb-2">Main Image Placeholder</div>
                                <div className="text-sm">"{expertise.title}" Hero Image</div>
                                <div className="text-xs mt-2 text-gray-400">Image URL: {expertise.image}</div>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="prose max-w-none dark:prose-invert">
                        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                            {expertise.descriptionPage}
                        </p>
                    </div>

                    {/* Icons Section */}
                    {expertise.icons && expertise.icons.length > 0 && (
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
                                Key Features
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {expertise.icons.map((icon, index) => (
                                    <div key={index} className="text-center space-y-4">
                                        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 border-2 border-dashed border-gray-300 dark:border-gray-600">
                                            <div className="text-gray-500 dark:text-gray-400">
                                                <div className="font-medium mb-1">Icon {index + 1}</div>
                                                <div className="text-sm">{icon.img.alt}</div>
                                                <div className="text-xs mt-2 text-gray-400 break-all">
                                                    {icon.img.src}
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                                {icon.title}
                                            </h4>
                                            <p className="text-gray-600 dark:text-gray-300 text-sm">
                                                {icon.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Carousel Section */}
                    {expertise.carousel && expertise.carousel.length > 0 && (
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
                                Gallery
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {expertise.carousel.map((item, index) => (
                                    <div key={index} className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 border-2 border-dashed border-gray-300 dark:border-gray-600">
                                        <div className="text-gray-500 dark:text-gray-400 text-center">
                                            <div className="font-medium mb-2">Gallery Image {index + 1}</div>
                                            <div className="text-sm mb-2">{item.img.alt}</div>
                                            <div className="text-xs text-gray-400 break-all">
                                                {item.img.src}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Key Points Section */}
                    {expertise.keys && expertise.keys.length > 0 && (
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
                                Key Points
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {expertise.keys.map((key, index) => (
                                    <div key={index} className="bg-primary/10 rounded-lg p-4 text-center">
                                        <div className="text-primary font-medium">
                                            {key.text}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Metadata */}
                    <div className="border-t pt-6 mt-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <div>
                                <strong>Slug:</strong> {expertise.slug}
                            </div>
                            <div>
                                <strong>Highlighted:</strong> {expertise.highlighted}
                            </div>
                            {expertise.createdAt && (
                                <div>
                                    <strong>Created:</strong> {new Date(expertise.createdAt).toLocaleDateString()}
                                </div>
                            )}
                            {expertise.updatedAt && (
                                <div>
                                    <strong>Updated:</strong> {new Date(expertise.updatedAt).toLocaleDateString()}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExpertiseDetail;