'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

import IconPlus from '@/components/icon/icon-plus';
import IconEdit from '@/components/icon/icon-edit';
import IconLink from '@/components/icon/icon-link';
import Loading from '@/components/layouts/loading';
import { useEndeavorsFlagshipProject } from './hooks/useEndeavorsFlagshipProjects';

const EndeavorsFlagshipProjectsPage = () => {
    const router = useRouter();
    const { data: project, isLoading } = useEndeavorsFlagshipProject();

    const handleEditProject = () => {
        router.push('/endeavors/flagship-projects/edit');
    };

    if (isLoading) {
        return <Loading />;
    }

    return (
        <div className="panel">
            <div className="mb-5 flex items-center justify-between">
                <h5 className="text-lg font-semibold dark:text-white-light">Flagship Projects</h5>
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleEditProject}
                >
                    <IconEdit className="h-4 w-4 mr-2" />
                    Edit Flagship Project
                </button>
            </div>

            {project ? (
                <div className="space-y-6">
                    <div className="panel">
                        <h6 className="text-lg font-semibold mb-4">{project.title}</h6>
                        <p className="text-gray-600 mb-4">{project.subheadline}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h6 className="font-semibold mb-2">Key Information</h6>
                                <p><strong>Title:</strong> {project.key.title}</p>
                                <p><strong>Subtitle:</strong> {project.key.subtitle}</p>
                            </div>
                            
                            <div>
                                <h6 className="font-semibold mb-2">Footer</h6>
                                <p><strong>Title:</strong> {project.footer.title}</p>
                                <p><strong>Subheadline:</strong> {project.footer.subheadline}</p>
                            </div>
                        </div>

                        <div className="mt-6">
                            <h6 className="font-semibold mb-2">Description</h6>
                            <p className="text-gray-600">{project.description}</p>
                        </div>

                        {project.icons && project.icons.length > 0 && (
                            <div className="mt-6">
                                <h6 className="font-semibold mb-4">Icons</h6>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {project.icons.map((icon, index) => (
                                        <div key={index} className="border rounded-lg p-4">
                                            <img src={icon.img.src} alt={icon.img.alt} className="w-12 h-12 mb-2" />
                                            <h6 className="font-medium">{icon.title}</h6>
                                            <p className="text-sm text-gray-600">{icon.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {project.cta && project.cta.length > 0 && (
                            <div className="mt-6">
                                <h6 className="font-semibold mb-4">Call to Action Buttons</h6>
                                <div className="flex flex-wrap gap-2">
                                    {project.cta.map((cta, index) => (
                                        <a
                                            key={index}
                                            href={cta.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-outline-primary"
                                        >
                                            {cta.text}
                                            <IconLink className="h-4 w-4 ml-2" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="text-gray-500 mb-4">
                        <svg
                            className="mx-auto h-12 w-12"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No flagship project found
                    </h3>
                    <p className="text-gray-500 mb-6">
                        Get started by creating your flagship project.
                    </p>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleEditProject}
                    >
                        <IconPlus className="h-4 w-4 mr-2" />
                        Create Flagship Project
                    </button>
                </div>
            )}
        </div>
    );
};

export default EndeavorsFlagshipProjectsPage;