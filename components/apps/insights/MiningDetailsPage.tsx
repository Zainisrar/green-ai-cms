'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { insightDetailApi, insightDetailKeys, InsightDetailData } from '@/lib/api/insightDetails';
import Link from 'next/link';
import Swal from 'sweetalert2';

const MiningDetailsPage = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');

    const { data: details = [], isLoading, error } = useQuery({
        queryKey: insightDetailKeys.lists(),
        queryFn: insightDetailApi.getAll,
    });

    const deleteMutation = useMutation({
        mutationFn: insightDetailApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: insightDetailKeys.lists() });
            Swal.fire({
                title: 'Deleted!',
                text: 'Mining detail has been deleted successfully.',
                icon: 'success',
                confirmButtonText: 'OK'
            });
        },
        onError: () => {
            Swal.fire({
                title: 'Error!',
                text: 'Failed to delete mining detail.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    });

    const handleDelete = async (id: number, title: string) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to delete "${title}"? This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            deleteMutation.mutate(id.toString());
        }
    };

    const filteredDetails = details.filter((detail: InsightDetailData) =>
        detail.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        detail.subheadline.toLowerCase().includes(searchTerm.toLowerCase()) ||
        detail.cardTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (detail.slug && detail.slug.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Details</h2>
                    <p className="text-gray-600">Failed to load banner details. Please try again later.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pt-5">
            <div className="panel">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Banner Details</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage banner insight details</p>
                    </div>
                    <Link
                        href="/insights/details/create"
                        className="btn btn-primary gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create New Detail
                    </Link>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search details..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="form-input pl-10 pr-4 py-2 w-full max-w-md"
                        />
                        <svg
                            className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {/* Table */}
                <div className="table-responsive">
                    <table className="table-hover">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Title</th>
                                <th>Slug</th>
                                <th>Card Title</th>
                                <th>Image Direction</th>
                                <th>Key Points</th>
                                <th>Created At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDetails.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-8">
                                        <div className="text-gray-500">
                                            {searchTerm ? 'No details found matching your search.' : 'No details available.'}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredDetails.map((detail: InsightDetailData) => (
                                    <tr key={detail.id}>
                                        <td className="font-semibold">{detail.id}</td>
                                        <td>
                                            <div className="max-w-xs truncate" title={detail.title}>
                                                {detail.title}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="max-w-xs truncate" title={detail.slug || 'No slug'}>
                                                <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                                    {detail.slug || 'No slug'}
                                                </code>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="max-w-xs truncate" title={detail.cardTitle}>
                                                {detail.cardTitle}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${(detail.imageDirection || 'left') === 'left' ? 'badge-outline-info' : 'badge-outline-warning'}`}>
                                                {(detail.imageDirection || 'left') === 'left' ? '← Left' : 'Right →'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="badge badge-outline-primary">
                                                {detail.keypoints.length} points
                                            </span>
                                        </td>
                                        <td>
                                            {detail.createdAt ? new Date(detail.createdAt).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/insights/details/edit/${detail.id}`}
                                                    className="btn btn-sm btn-outline-primary"
                                                    title="Edit"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(detail.id!, detail.title)}
                                                    className="btn btn-sm btn-outline-danger"
                                                    title="Delete"
                                                    disabled={deleteMutation.isPending}
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Summary */}
                <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
                    Showing {filteredDetails.length} of {details.length} details
                </div>
            </div>
        </div>
    );
};

export default MiningDetailsPage;