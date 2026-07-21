'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import IconPlus from '@/components/icon/icon-plus';
import IconEdit from '@/components/icon/icon-edit';
import IconTrash from '@/components/icon/icon-trash';
import Loading from '@/components/layouts/loading';
import { useEndeavorsProjects, useDeleteEndeavorsProject } from './hooks/useEndeavorsProjects';

const EndeavorsProjectsPage = () => {
    const router = useRouter();
    const { data: projects, isLoading } = useEndeavorsProjects();
    const deleteMutation = useDeleteEndeavorsProject();

    const handleAddProject = () => {
        router.push('/apps/endeavors/projects/add');
    };

    const handleEditProject = (id: number) => {
        router.push(`/apps/endeavors/projects/edit/${id}`);
    };

    const handleDeleteProject = async (id: number, title: string) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `You are about to delete "${title}". This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
        });

        if (result.isConfirmed) {
            try {
                await deleteMutation.mutateAsync(id);
                Swal.fire({
                    title: 'Deleted!',
                    text: 'Project has been deleted successfully.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                });
            } catch (error) {
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to delete project.',
                    icon: 'error',
                });
            }
        }
    };

    if (isLoading) {
        return <Loading />;
    }

    return (
        <div className="panel">
            <div className="mb-5 flex items-center justify-between">
                <h5 className="text-lg font-semibold dark:text-white-light">Endeavors Projects</h5>
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleAddProject}
                >
                    <IconPlus className="h-4 w-4 mr-2" />
                    Add Project
                </button>
            </div>

            {projects && projects.length > 0 ? (
                <div className="table-responsive">
                    <table className="table-hover">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Title</th>
                                <th>Slug</th>
                                <th>Systems</th>
                                <th>Capacity</th>
                                <th>Generation</th>
                                <th>Created</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.map((project) => (
                                <tr key={project.id}>
                                    <td>
                                        <div className="w-12 h-12 rounded overflow-hidden bg-gray-100">
                                            {project.featuredImg ? (
                                                <img
                                                    src={project.featuredImg}
                                                    alt={project.title}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.currentTarget.src = '/assets/images/placeholder.jpg';
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="font-semibold">{project.title}</div>
                                    </td>
                                    <td>
                                        <span className="badge bg-primary/10 text-primary px-2 py-1 rounded">
                                            {project.slug}
                                        </span>
                                    </td>
                                    <td>{project.numberofsystems || '-'}</td>
                                    <td>{project.capacity || '-'}</td>
                                    <td>{project.totalgeneration || '-'}</td>
                                    <td>
                                        {new Date(project.createdAt).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                type="button"
                                                className="btn btn-outline-primary btn-sm"
                                                onClick={() => handleEditProject(project.id)}
                                                title="Edit Project"
                                            >
                                                <IconEdit className="h-4 w-4" />
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-outline-danger btn-sm"
                                                onClick={() => handleDeleteProject(project.id, project.title)}
                                                title="Delete Project"
                                            >
                                                <IconTrash className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
                        No projects found
                    </h3>
                    <p className="text-gray-500 mb-6">
                        Get started by creating your first endeavors project.
                    </p>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleAddProject}
                    >
                        <IconPlus className="h-4 w-4 mr-2" />
                        Add Your First Project
                    </button>
                </div>
            )}
        </div>
    );
};

export default EndeavorsProjectsPage;