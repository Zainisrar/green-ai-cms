'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import IconPlus from '@/components/icon/icon-plus';
import IconEdit from '@/components/icon/icon-edit';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api-client';

interface EditorialImage {
    src: string;
    alt: string;
}

interface EditorialCTA {
    text: string;
    href: string;
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface Editorial {
    title: string;
    description: string;
    featuredImg: EditorialImage;
    writer: User;
    categories: string[];
    cta: EditorialCTA;
}

interface ThoughtLeadershipMainPage {
    title: string;
    subTitle: string;
    description: string;
    editorialsTitle: string;
    quote: {
        text: string;
        highlighted: string;
    };
    cta: EditorialCTA[];
}

interface ThoughtLeadershipData {
    id?: number;
    editorials: Editorial[];
    mainPage: ThoughtLeadershipMainPage;
}

const ThoughtLeadershipPage = () => {
    const router = useRouter();
    const [thoughtLeadershipData, setThoughtLeadershipData] = useState<ThoughtLeadershipData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchThoughtLeadershipData();
    }, []);

    const fetchThoughtLeadershipData = async () => {
        try {
            const result = await apiClient.get('/api/enlighten/thought-leadership');
            console.log('API Response:', result);
            if (result.success) {
                setThoughtLeadershipData(result.data);
            } else {
                console.error('API Error:', result.error);
                Swal.fire('Error', result.error || 'Failed to fetch thought leadership data', 'error');
            }
        } catch (error: any) {
            console.error('Fetch thought leadership data error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditEditorial = (editorial: Editorial, index: number) => {
        router.push(`/enlighten/thought-leadership/edit/${index}`);
    };

    const handleDeleteEditorial = async (editorial: Editorial) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Delete editorial "${editorial.title}"? This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
        });

        if (result.isConfirmed) {
            try {
                const updatedEditorials = thoughtLeadershipData?.editorials.filter((e) => e.title !== editorial.title) || [];

                const payload = {
                    id: thoughtLeadershipData?.id,
                    editorials: updatedEditorials,
                    mainPage: thoughtLeadershipData?.mainPage,
                };

                const deleteResult = await apiClient.put('/api/enlighten/thought-leadership', payload);
                if (deleteResult.success) {
                    Swal.fire('Deleted!', 'Editorial has been deleted.', 'success');
                    fetchThoughtLeadershipData();
                } else {
                    Swal.fire('Error', deleteResult.error || 'Failed to delete editorial', 'error');
                }
            } catch (error: any) {
                console.error('Delete editorial error:', error);
                Swal.fire('Error', error.message || 'Failed to delete editorial', 'error');
            }
        }
    };

    if (loading) {
        return (
            <ProtectedRoute requiredPermission={{ resource: 'enlighten', action: 'view' }}>
                <div className="panel">
                    <div className="flex items-center justify-center py-10">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute requiredPermission={{ resource: 'enlighten', action: 'view' }}>
            <div className="panel">
                <div className="flex items-center justify-between mb-5">
                    <h5 className="font-semibold text-lg dark:text-white-light">Thought Leadership</h5>
                    <button onClick={() => router.push('/enlighten/thought-leadership/add')} className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600">
                        <IconPlus className="w-5 h-5 mr-2" />
                        Add Editorial
                    </button>
                </div>

                {/* Main Page Info */}
                {thoughtLeadershipData?.mainPage && (
                    <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-semibold">{thoughtLeadershipData.mainPage.title}</h3>
                            <button onClick={() => router.push('/enlighten/thought-leadership/edit-main-page')} className="text-blue-600 hover:text-blue-800" title="Edit Main Page">
                                <IconEdit className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{thoughtLeadershipData.mainPage.subTitle}</p>
                        <p className="text-sm mb-2">{thoughtLeadershipData.mainPage.description}</p>
                        <div className="text-sm italic">"{thoughtLeadershipData.mainPage.quote.text}"</div>
                    </div>
                )}

                {/* Editorials Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {thoughtLeadershipData?.editorials?.map((editorial, index) => (
                        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                            {editorial.featuredImg.src && <img src={editorial.featuredImg.src} alt={editorial.featuredImg.alt} className="w-full h-48 object-cover" />}
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-semibold">{editorial.title}</h3>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEditEditorial(editorial, index)} className="text-blue-600 hover:text-blue-800" title="Edit Editorial">
                                            <IconEdit className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDeleteEditorial(editorial)} className="text-red-600 hover:text-red-800" title="Delete Editorial">
                                            ×
                                        </button>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{editorial.description}</p>
                                <div className="text-xs text-gray-500 mb-2">
                                    <span>✍️ By {editorial.writer.name}</span>
                                </div>
                                {editorial.categories && editorial.categories.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-2">
                                        {editorial.categories.map((category, catIndex) => (
                                            <span key={catIndex} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                                {category}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {editorial.cta.text && (
                                    <a
                                        href={editorial.cta.href}
                                        className="inline-block bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {editorial.cta.text}
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {(!thoughtLeadershipData?.editorials || thoughtLeadershipData.editorials.length === 0) && (
                    <div className="text-center py-10">
                        <p className="text-gray-500">No editorials available. Add your first editorial!</p>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
};

export default ThoughtLeadershipPage;
