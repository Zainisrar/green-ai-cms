'use client';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { homeApi, homeKeys } from '@/lib/api/home';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import IconPlus from '@/components/icon/icon-plus';
import IconEdit from '@/components/icon/icon-edit';
import IconTrash from '@/components/icon/icon-trash';
import Loading from '@/components/layouts/loading';

const HomeManagement = () => {
    const router = useRouter();
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const {
        data: homeEntries = [],
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: homeKeys.all,
        queryFn: homeApi.getAll,
        staleTime: 5 * 60 * 1000,
    });

    const handleDelete = async (id: number, slug: string) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Delete home page: ${slug}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
        });

        if (result.isConfirmed) {
            setDeletingId(id);
            try {
                await homeApi.delete(String(id));
                await refetch();
                Swal.fire('Deleted!', 'Home page has been deleted.', 'success');
            } catch (error) {
                console.error('Error deleting home page:', error);
                Swal.fire('Error', 'Failed to delete home page', 'error');
            } finally {
                setDeletingId(null);
            }
        }
    };

    if (isLoading) {
        return <Loading />;
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-danger mb-4">Error loading home pages</h3>
                    <button onClick={() => refetch()} className="btn btn-primary">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="panel">
            <div className="flex items-center justify-between mb-5">
                <h1 className="text-2xl font-bold">Home Pages Management</h1>
                <button
                    onClick={() => router.push('/home/create')}
                    className="btn btn-primary flex items-center gap-2"
                >
                    <IconPlus />
                    Add New Home Page
                </button>
            </div>

            {homeEntries.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-gray-500 mb-4">No home pages found</p>
                    <button
                        onClick={() => router.push('/home/create')}
                        className="btn btn-primary"
                    >
                        Create Your First Home Page
                    </button>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table-hover">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Slug</th>
                                <th>Text 1 Headline</th>
                                <th>Created At</th>
                                <th>Updated At</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {homeEntries.map((entry) => (
                                <tr key={entry.id}>
                                    <td>{entry.id}</td>
                                    <td>
                                        <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                            {entry.slug}
                                        </code>
                                    </td>
                                    <td>{entry.text1.headline}</td>
                                    <td>{new Date(entry.createdAt!).toLocaleDateString()}</td>
                                    <td>{new Date(entry.updatedAt!).toLocaleDateString()}</td>
                                    <td>
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => router.push(`/home/edit/${String(entry.id)}`)}
                                                className="btn btn-sm btn-info flex items-center gap-1"
                                                title="Edit"
                                            >
                                                <IconEdit className="w-4 h-4" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(entry.id!, entry.slug)}
                                                disabled={deletingId === entry.id}
                                                className="btn btn-sm btn-danger flex items-center gap-1"
                                                title="Delete"
                                            >
                                                <IconTrash className="w-4 h-4" />
                                                {deletingId === entry.id ? 'Deleting...' : 'Delete'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default HomeManagement;
