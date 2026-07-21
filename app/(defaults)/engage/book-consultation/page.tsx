'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import IconPlus from '@/components/icon/icon-plus';
import IconEdit from '@/components/icon/icon-edit';
import IconTrash from '@/components/icon/icon-trash';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api-client';

interface BookConsultationData {
    id: number;
    title: string;
    subHeadline: string;
    description: {
        text: string;
        highlighted: string;
    };
    consultationFocusAreas: {
        benefit: string;
        description: string;
    }[];
    bookingDetails: string[];
    timings: {
        text1: string;
        text2: string;
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

const BookConsultationPage = () => {
    const router = useRouter();
    const [bookConsultationData, setBookConsultationData] = useState<BookConsultationData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBookConsultationData();
    }, []);

    const fetchBookConsultationData = async () => {
        try {
            const result = await apiClient.get('/api/engage/book-consultation');
            if (result.success) {
                setBookConsultationData(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        router.push('/engage/book-consultation/create');
    };

    const handleEdit = () => {
        if (bookConsultationData) {
            router.push(`/engage/book-consultation/edit/${bookConsultationData.id}`);
        }
    };

    const handleDelete = async () => {
        if (!bookConsultationData) return;

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'This will permanently delete the book consultation data!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it!',
        });

        if (result.isConfirmed) {
            try {
                const deleteResult = await apiClient.delete(`/api/engage/book-consultation/${bookConsultationData.id}`);
                if (deleteResult.success) {
                    Swal.fire('Deleted!', 'Book consultation data has been deleted.', 'success');
                    setBookConsultationData(null);
                } else {
                    Swal.fire('Error', deleteResult.error || 'Failed to delete book consultation data', 'error');
                }
            } catch (error) {
                console.error('Delete error:', error);
                Swal.fire('Error', 'Failed to delete book consultation data', 'error');
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
                    <h5 className="font-semibold text-lg dark:text-white-light">Book a Consultation Management</h5>
                    {!bookConsultationData && (
                        <button
                            onClick={handleCreate}
                            className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600"
                        >
                            <IconPlus className="w-4 h-4 mr-2" />
                            Create Book Consultation
                        </button>
                    )}
                </div>

                {bookConsultationData ? (
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
                                    <p className="text-gray-700 dark:text-gray-300">{bookConsultationData.title}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Sub-Headline</label>
                                    <p className="text-gray-700 dark:text-gray-300">{bookConsultationData.subHeadline}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Description</label>
                                    <p className="text-gray-700 dark:text-gray-300">{bookConsultationData.description.text}</p>
                                    {bookConsultationData.description.highlighted && (
                                        <p className="text-sm text-green-600 font-medium">{bookConsultationData.description.highlighted}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Quote</label>
                                    <p className="text-gray-700 dark:text-gray-300">{bookConsultationData.quote.text}</p>
                                    {bookConsultationData.quote.highlighted && (
                                        <p className="text-sm text-green-600 font-medium">{bookConsultationData.quote.highlighted}</p>
                                    )}
                                </div>
                            </div>

                            {/* Timings */}
                            <div className="mt-6">
                                <label className="block text-sm font-medium mb-2">Timings</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Text 1:</p>
                                        <p className="text-gray-700 dark:text-gray-300">{bookConsultationData.timings.text1}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Text 2:</p>
                                        <p className="text-gray-700 dark:text-gray-300">{bookConsultationData.timings.text2}</p>
                                    </div>
                                </div>
                            </div>

                            {/* CTA Buttons */}
                            {bookConsultationData.cta && bookConsultationData.cta.length > 0 && (
                                <div className="mt-6">
                                    <label className="block text-sm font-medium mb-2">Call-to-Action Buttons</label>
                                    <div className="flex flex-wrap gap-2">
                                        {bookConsultationData.cta.map((cta, index) => (
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

                        {/* Focus Areas */}
                        <div className="panel">
                            <h6 className="text-lg font-semibold mb-4">Consultation Focus Areas</h6>
                            {bookConsultationData.consultationFocusAreas.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {bookConsultationData.consultationFocusAreas.map((area, index) => (
                                        <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                            <h6 className="font-medium text-green-600 mb-2">{area.benefit}</h6>
                                            <p className="text-sm text-gray-700 dark:text-gray-300">{area.description}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">No focus areas defined</p>
                            )}
                        </div>

                        {/* Booking Details */}
                        <div className="panel">
                            <h6 className="text-lg font-semibold mb-4">Booking Details</h6>
                            {bookConsultationData.bookingDetails.length > 0 ? (
                                <ul className="space-y-2">
                                    {bookConsultationData.bookingDetails.map((detail, index) => (
                                        <li key={index} className="flex items-start">
                                            <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                            <span className="text-gray-700 dark:text-gray-300">{detail}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500">No booking details defined</p>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <div className="mb-4">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <IconPlus className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Book Consultation Data</h3>
                            <p className="text-gray-500 mb-6">Get started by creating your book consultation content.</p>
                            <button
                                onClick={handleCreate}
                                className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600"
                            >
                                <IconPlus className="w-4 h-4 mr-2" />
                                Create Book Consultation
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
};

export default BookConsultationPage;