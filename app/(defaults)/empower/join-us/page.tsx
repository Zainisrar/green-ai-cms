'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import IconPlus from '@/components/icon/icon-plus';
import IconEdit from '@/components/icon/icon-edit';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api-client';

interface JoinUsData {
    id: number;
    title: string;
    subHeadline: string;
    description: string;
    existingUsersCtaLink: string;
    newUsersCtaLink: string;
    quote: {
        text: string;
        link: string;
    };
    cta: Array<{
        text: string;
        href: string;
    }>;
    keys: Array<{
        title: string;
        items: Array<{
            text: string;
            description?: string;
        }>;
    }>;
    dataPolicyEthics: {
        title: string;
        description: string;
    };
    email: {
        text: string;
        href: string;
    };
    phone: {
        text: string;
        href: string;
    };
    createdAt: string;
    updatedAt: string;
}

const JoinUsPage = () => {
    const router = useRouter();
    const [joinUsData, setJoinUsData] = useState<JoinUsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchJoinUsData();
    }, []);

    const fetchJoinUsData = async () => {
        try {
            const result = await apiClient.get('/api/empower/join-us');
            if (result.success) {
                setJoinUsData(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch join-us data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        router.push('/empower/join-us/create');
    };

    const handleEdit = () => {
        if (joinUsData) {
            router.push(`/empower/join-us/edit/${joinUsData.id}`);
        }
    };

    const handleDelete = async () => {
        if (!joinUsData) return;

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'This will permanently delete the join-us data!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it!',
        });

        if (result.isConfirmed) {
            try {
                const deleteResult = await apiClient.delete(`/api/empower/join-us/${joinUsData.id}`);
                if (deleteResult.success) {
                    Swal.fire('Deleted!', 'Join-us data has been deleted.', 'success');
                    setJoinUsData(null);
                } else {
                    Swal.fire('Error', deleteResult.error || 'Failed to delete join-us data', 'error');
                }
            } catch (error) {
                console.error('Delete error:', error);
                Swal.fire('Error', 'Failed to delete join-us data', 'error');
            }
        }
    };

    if (loading) {
        return (
            <ProtectedRoute requiredPermission={{ resource: 'empower', action: 'view' }}>
                <div className="panel">
                    <div className="flex items-center justify-center py-10">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute requiredPermission={{ resource: 'empower', action: 'view' }}>
            <div className="panel">
                <div className="flex items-center justify-between mb-5">
                    <h5 className="font-semibold text-lg dark:text-white-light">Join Us Management</h5>
                    {!joinUsData && (
                        <button
                            onClick={handleCreate}
                            className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600"
                        >
                            <IconPlus className="w-4 h-4 mr-2" />
                            Create Join Us Page
                        </button>
                    )}
                </div>

                {joinUsData ? (
                    <div className="space-y-6">
                        {/* Main Content Card */}
                        <div className="panel">
                            <div className="flex items-center justify-between mb-4">
                                <h6 className="text-lg font-semibold">Join Us Page Content</h6>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleEdit}
                                        className="btn btn-outline-primary border-green-600 text-green-600 hover:bg-green-600"
                                    >
                                        <IconEdit className="w-4 h-4 mr-2" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="btn btn-outline-danger"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Title</label>
                                    <p className="text-gray-700 dark:text-gray-300">{joinUsData.title}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Sub-Headline</label>
                                    <p className="text-gray-700 dark:text-gray-300">{joinUsData.subHeadline}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Description</label>
                                    <p className="text-gray-700 dark:text-gray-300">{joinUsData.description}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Existing Users CTA Link</label>
                                        <p className="text-gray-700 dark:text-gray-300">{joinUsData.existingUsersCtaLink}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">New Users CTA Link</label>
                                        <p className="text-gray-700 dark:text-gray-300">{joinUsData.newUsersCtaLink}</p>
                                    </div>
                                </div>

                                {joinUsData.quote && (
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Quote</label>
                                        <p className="text-gray-700 dark:text-gray-300">
                                            {joinUsData.quote.text}
                                            {joinUsData.quote.link && (
                                                <span className="ml-2">
                                                    <a href={joinUsData.quote.link} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                                                        Link
                                                    </a>
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                )}

                                {joinUsData.cta && joinUsData.cta.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Call-to-Action Buttons</label>
                                        <div className="space-y-2">
                                            {joinUsData.cta.map((cta, index) => (
                                                <div key={index} className="flex items-center gap-2">
                                                    <span className="text-gray-700 dark:text-gray-300">{cta.text}</span>
                                                    <span className="text-gray-500">→</span>
                                                    <a href={cta.href} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                                                        {cta.href}
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {joinUsData.keys && joinUsData.keys.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Key Sections</label>
                                        <div className="space-y-3">
                                            {joinUsData.keys.map((key, index) => (
                                                <div key={index} className="border rounded-lg p-3">
                                                    <h6 className="font-semibold mb-2">{key.title}</h6>
                                                    <div className="space-y-1">
                                                        {key.items.map((item, itemIndex) => (
                                                            <div key={itemIndex}>
                                                                <p className="text-gray-700 dark:text-gray-300">{item.text}</p>
                                                                {item.description && (
                                                                    <p className="text-sm text-gray-500 ml-4">{item.description}</p>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Email Contact</label>
                                        <p className="text-gray-700 dark:text-gray-300">
                                            {joinUsData.email.text}: 
                                            <a href={joinUsData.email.href} className="text-blue-600 hover:underline ml-1">
                                                {joinUsData.email.href}
                                            </a>
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Phone Contact</label>
                                        <p className="text-gray-700 dark:text-gray-300">
                                            {joinUsData.phone.text}: 
                                            <a href={joinUsData.phone.href} className="text-blue-600 hover:underline ml-1">
                                                {joinUsData.phone.href}
                                            </a>
                                        </p>
                                    </div>
                                </div>

                                {joinUsData.dataPolicyEthics && (
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Data Policy & Ethics</label>
                                        <h6 className="font-semibold">{joinUsData.dataPolicyEthics.title}</h6>
                                        <p className="text-gray-700 dark:text-gray-300">{joinUsData.dataPolicyEthics.description}</p>
                                    </div>
                                )}

                                <div className="text-sm text-gray-500 pt-4 border-t">
                                    <p>Created: {new Date(joinUsData.createdAt).toLocaleDateString()}</p>
                                    <p>Updated: {new Date(joinUsData.updatedAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="mb-4">
                            <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                <IconPlus className="w-8 h-8 text-gray-400" />
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No Join Us Page Created</h3>
                        <p className="text-gray-500 mb-4">Create a join us page to get started.</p>
                        <button
                            onClick={handleCreate}
                            className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600"
                        >
                            <IconPlus className="w-4 h-4 mr-2" />
                            Create Join Us Page
                        </button>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
};

export default JoinUsPage;