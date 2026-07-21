'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import IconPlus from '@/components/icon/icon-plus';
import IconEdit from '@/components/icon/icon-edit';
import IconTrash from '@/components/icon/icon-trash';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api-client';

interface RequestProposalData {
    id: number;
    title: string;
    subHeadline: string;
    description: {
        text: string;
        highlighted: string;
    };
    whoShouldUseThis: {
        title: string;
        items: string[];
    };
    whatGreenDeliversProposal: string[];
    email: {
        text: string;
        href: string;
    };
    quote: {
        text: string;
        highlighted: string;
    };
    cta: {
        text: string;
        href: string;
    }[];
}

const RequestProposalPage = () => {
    const router = useRouter();
    const [requestProposalData, setRequestProposalData] = useState<RequestProposalData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequestProposalData();
    }, []);

    const fetchRequestProposalData = async () => {
        try {
            const result = await apiClient.get('/api/engage/request-a-proposal');
            if (result.success) {
                setRequestProposalData(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        router.push('/engage/request-a-proposal/create');
    };

    const handleEdit = () => {
        if (requestProposalData) {
            router.push(`/engage/request-a-proposal/edit/${requestProposalData.id}`);
        }
    };

    const handleDelete = async () => {
        if (!requestProposalData) return;

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'This will permanently delete the request proposal data!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it!',
        });

        if (result.isConfirmed) {
            try {
                const deleteResult = await apiClient.delete(`/api/engage/request-a-proposal/${requestProposalData.id}`);
                if (deleteResult.success) {
                    Swal.fire('Deleted!', 'Request proposal data has been deleted.', 'success');
                    setRequestProposalData(null);
                } else {
                    Swal.fire('Error', deleteResult.error || 'Failed to delete request proposal data', 'error');
                }
            } catch (error) {
                console.error('Delete error:', error);
                Swal.fire('Error', 'Failed to delete request proposal data', 'error');
            }
        }
    };

    if (loading) {
        return (
            <ProtectedRoute requiredPermission={{ resource: 'engage', action: 'view' }}>
                <div className="panel">
                    <div className="flex items-center justify-center py-10">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute requiredPermission={{ resource: 'engage', action: 'view' }}>
            <div className="panel">
                <div className="flex items-center justify-between mb-5">
                    <h5 className="font-semibold text-lg dark:text-white-light">Request a Proposal Management</h5>
                    {!requestProposalData && (
                        <button
                            onClick={handleCreate}
                            className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600"
                        >
                            <IconPlus className="w-4 h-4 mr-2" />
                            Create Request Proposal
                        </button>
                    )}
                </div>

                {requestProposalData ? (
                    <div className="space-y-6">
                        {/* Main Content Card */}
                        <div className="panel">
                            <div className="flex items-center justify-between mb-4">
                                <h6 className="text-lg font-semibold">Main Content</h6>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleEdit}
                                        className="btn btn-sm btn-outline-primary border-green-600 text-green-600 hover:bg-green-600"
                                    >
                                        <IconEdit className="w-4 h-4 mr-1" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="btn btn-sm btn-outline-danger"
                                    >
                                        <IconTrash className="w-4 h-4 mr-1" />
                                        Delete
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Title</label>
                                    <p className="text-gray-700 dark:text-gray-300">{requestProposalData.title}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Sub-Headline</label>
                                    <p className="text-gray-700 dark:text-gray-300">{requestProposalData.subHeadline}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Description</label>
                                    <p className="text-gray-700 dark:text-gray-300">{requestProposalData.description.text}</p>
                                    {requestProposalData.description.highlighted && (
                                        <p className="text-sm text-green-600 font-medium">{requestProposalData.description.highlighted}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Email Contact</label>
                                    <p className="text-gray-700 dark:text-gray-300">{requestProposalData.email.text}</p>
                                    <a href={requestProposalData.email.href} className="text-sm text-blue-600 hover:underline">
                                        {requestProposalData.email.href}
                                    </a>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-1">Quote</label>
                                    <p className="text-gray-700 dark:text-gray-300">{requestProposalData.quote.text}</p>
                                    {requestProposalData.quote.highlighted && (
                                        <p className="text-sm text-green-600 font-medium">{requestProposalData.quote.highlighted}</p>
                                    )}
                                </div>
                            </div>

                            {/* CTA Buttons */}
                            {requestProposalData.cta && requestProposalData.cta.length > 0 && (
                                <div className="mt-6">
                                    <label className="block text-sm font-medium mb-2">Call-to-Action Buttons</label>
                                    <div className="flex flex-wrap gap-2">
                                        {requestProposalData.cta.map((cta, index) => (
                                            <div key={index} className="bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded">
                                                <span className="text-sm font-medium">{cta.text}</span>
                                                <a href={cta.href} className="text-xs text-blue-600 block truncate max-w-48">
                                                    {cta.href}
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Who Should Use This */}
                        <div className="panel">
                            <h6 className="text-lg font-semibold mb-4">Who Should Use This</h6>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Title</label>
                                <p className="text-gray-700 dark:text-gray-300">{requestProposalData.whoShouldUseThis.title}</p>
                            </div>
                            {requestProposalData.whoShouldUseThis.items.length > 0 ? (
                                <div>
                                    <label className="block text-sm font-medium mb-2">Items</label>
                                    <ul className="space-y-2">
                                        {requestProposalData.whoShouldUseThis.items.map((item, index) => (
                                            <li key={index} className="flex items-start">
                                                <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                                <span className="text-gray-700 dark:text-gray-300">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : (
                                <p className="text-gray-500">No items defined</p>
                            )}
                        </div>

                        {/* What Green Delivers in Proposal */}
                        <div className="panel">
                            <h6 className="text-lg font-semibold mb-4">What Green Delivers in Proposal</h6>
                            {requestProposalData.whatGreenDeliversProposal.length > 0 ? (
                                <ul className="space-y-2">
                                    {requestProposalData.whatGreenDeliversProposal.map((item, index) => (
                                        <li key={index} className="flex items-start">
                                            <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                            <span className="text-gray-700 dark:text-gray-300">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500">No deliverables defined</p>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <div className="mb-4">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <IconPlus className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Request Proposal Data</h3>
                            <p className="text-gray-500 mb-6">Get started by creating your request proposal content.</p>
                            <button
                                onClick={handleCreate}
                                className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600"
                            >
                                <IconPlus className="w-4 h-4 mr-2" />
                                Create Request Proposal
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
};

export default RequestProposalPage;