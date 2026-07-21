'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import IconPlus from '@/components/icon/icon-plus';
import IconEdit from '@/components/icon/icon-edit';
import IconTrash from '@/components/icon/icon-trash';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api-client';

interface NewsletterSignupData {
    id: number;
    title: string;
    subHeadline: string;
    description: {
        text: string;
        highlighted: string;
    };
    whySubscribe: {
        benefit: string;
        description: string;
    }[];
    contact: string;
    whatYouReceive: string[];
    quote: {
        text: string;
        highlighted: string;
    };
    cta: {
        text: string;
        href: string;
    }[];
}

const NewsletterSignupPage = () => {
    const router = useRouter();
    const [newsletterSignupData, setNewsletterSignupData] = useState<NewsletterSignupData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNewsletterSignupData();
    }, []);

    const fetchNewsletterSignupData = async () => {
        try {
            const result = await apiClient.get('/api/engage/newsletter-signup');
            if (result.success) {
                setNewsletterSignupData(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        router.push('/engage/newsletter-signup/create');
    };

    const handleEdit = () => {
        if (newsletterSignupData) {
            router.push(`/engage/newsletter-signup/edit/${newsletterSignupData.id}`);
        }
    };

    const handleDelete = async () => {
        if (!newsletterSignupData) return;

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'This will permanently delete the newsletter signup data!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it!',
        });

        if (result.isConfirmed) {
            try {
                const deleteResult = await apiClient.delete(`/api/engage/newsletter-signup/${newsletterSignupData.id}`);
                if (deleteResult.success) {
                    Swal.fire('Deleted!', 'Newsletter signup data has been deleted.', 'success');
                    setNewsletterSignupData(null);
                } else {
                    Swal.fire('Error', deleteResult.error || 'Failed to delete newsletter signup data', 'error');
                }
            } catch (error) {
                console.error('Delete error:', error);
                Swal.fire('Error', 'Failed to delete newsletter signup data', 'error');
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
                    <h5 className="font-semibold text-lg dark:text-white-light">Newsletter Signup Management</h5>
                    {!newsletterSignupData && (
                        <button
                            onClick={handleCreate}
                            className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600"
                        >
                            <IconPlus className="w-4 h-4 mr-2" />
                            Create Newsletter Signup
                        </button>
                    )}
                </div>

                {newsletterSignupData ? (
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
                                    <p className="text-gray-700 dark:text-gray-300">{newsletterSignupData.title}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Sub-Headline</label>
                                    <p className="text-gray-700 dark:text-gray-300">{newsletterSignupData.subHeadline}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Description</label>
                                    <p className="text-gray-700 dark:text-gray-300">{newsletterSignupData.description.text}</p>
                                    {newsletterSignupData.description.highlighted && (
                                        <p className="text-sm text-green-600 font-medium">{newsletterSignupData.description.highlighted}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Contact</label>
                                    <p className="text-gray-700 dark:text-gray-300">{newsletterSignupData.contact}</p>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-1">Quote</label>
                                    <p className="text-gray-700 dark:text-gray-300">{newsletterSignupData.quote.text}</p>
                                    {newsletterSignupData.quote.highlighted && (
                                        <p className="text-sm text-green-600 font-medium">{newsletterSignupData.quote.highlighted}</p>
                                    )}
                                </div>
                            </div>

                            {/* CTA Buttons */}
                            {newsletterSignupData.cta && newsletterSignupData.cta.length > 0 && (
                                <div className="mt-6">
                                    <label className="block text-sm font-medium mb-2">Call-to-Action Buttons</label>
                                    <div className="flex flex-wrap gap-2">
                                        {newsletterSignupData.cta.map((cta, index) => (
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

                        {/* Why Subscribe */}
                        <div className="panel">
                            <h6 className="text-lg font-semibold mb-4">Why Subscribe</h6>
                            {newsletterSignupData.whySubscribe.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {newsletterSignupData.whySubscribe.map((item, index) => (
                                        <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                            <h6 className="font-medium text-green-600 mb-2">{item.benefit}</h6>
                                            <p className="text-sm text-gray-700 dark:text-gray-300">{item.description}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">No subscription benefits defined</p>
                            )}
                        </div>

                        {/* What You Receive */}
                        <div className="panel">
                            <h6 className="text-lg font-semibold mb-4">What You Receive</h6>
                            {newsletterSignupData.whatYouReceive.length > 0 ? (
                                <ul className="space-y-2">
                                    {newsletterSignupData.whatYouReceive.map((item, index) => (
                                        <li key={index} className="flex items-start">
                                            <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                            <span className="text-gray-700 dark:text-gray-300">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500">No newsletter content defined</p>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <div className="mb-4">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <IconPlus className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Newsletter Signup Data</h3>
                            <p className="text-gray-500 mb-6">Get started by creating your newsletter signup content.</p>
                            <button
                                onClick={handleCreate}
                                className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600"
                            >
                                <IconPlus className="w-4 h-4 mr-2" />
                                Create Newsletter Signup
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
};

export default NewsletterSignupPage;