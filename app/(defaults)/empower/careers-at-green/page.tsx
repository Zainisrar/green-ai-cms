'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import IconPlus from '@/components/icon/icon-plus';
import IconEdit from '@/components/icon/icon-edit';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api-client';

interface CareersImage {
    src: string;
    alt: string;
}

interface CareersCTA {
    text: string;
    href: string;
}

interface CareersDescription {
    text: string;
    highlighted: string;
}

interface CareersQuote {
    text: string;
    highlighted: string;
}

interface CareersKey {
    text: string;
    cta: {
        text: string;
    };
}

interface CareersMainPage {
    title: string;
    subHeadline: string;
    description: CareersDescription;
    quote1: CareersQuote;
    quote2: CareersQuote;
    keys: CareersKey[];
    cta: CareersCTA[];
}

interface WhyWorkWithGreenIcon {
    img: CareersImage;
    title: string;
    description: string;
}

interface WhyWorkWithGreenQuote {
    text1: string;
    text2: string;
    highlighted1: string;
    highlighted2?: string;
}

interface WhyWorkWithGreenModal {
    title: string;
    description: string;
    icons: WhyWorkWithGreenIcon[];
    quote: WhyWorkWithGreenQuote;
}

interface CareerRole {
    type: string;
    description: string;
}

interface CareerTrackSupport {
    title: string;
    role: CareerRole[];
}

interface KeyPoint {
    text1: string;
    text2: string;
}

interface WhatMakesGreenDifferent {
    title: string;
    featuredImg: CareersImage;
    keyPoints: KeyPoint[];
}

interface OpenRole {
    name: string;
    place: string;
    closing: string;
}

interface OpenRoles {
    title: string;
    roles: OpenRole[];
}

interface CareersAtGreenData {
    id?: number;
    mainPage: CareersMainPage;
    whyWorkWithGreenModal: WhyWorkWithGreenModal;
    careerTrackSupport: CareerTrackSupport;
    whatMakesGreenDifferent: WhatMakesGreenDifferent;
    openRoles: OpenRoles;
}

const CareersAtGreenPage = () => {
    const router = useRouter();
    const [careersData, setCareersData] = useState<CareersAtGreenData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCareersData();
    }, []);

    const fetchCareersData = async () => {
        try {
            const result = await apiClient.get('/api/empower/careers-at-green');
            if (result.success) {
                setCareersData(result.data);
            }
        } catch (error: any) {
            console.error('Fetch careers data error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteRole = async (roleIndex: number) => {
        if (!careersData) return;

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Delete this open role? This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                const updatedRoles = careersData.openRoles.roles.filter((_, index) => index !== roleIndex);

                const payload = {
                    id: careersData.id,
                    mainPage: careersData.mainPage,
                    whyWorkWithGreenModal: careersData.whyWorkWithGreenModal,
                    careerTrackSupport: careersData.careerTrackSupport,
                    whatMakesGreenDifferent: careersData.whatMakesGreenDifferent,
                    openRoles: {
                        ...careersData.openRoles,
                        roles: updatedRoles
                    }
                };

                const updateResult = await apiClient.put('/api/empower/careers-at-green', payload);
                if (updateResult.success) {
                    Swal.fire('Deleted!', 'Open role has been deleted.', 'success');
                    fetchCareersData();
                } else {
                    Swal.fire('Error', updateResult.error || 'Failed to delete role', 'error');
                }
            } catch (error: any) {
                console.error('Delete role error:', error);
                Swal.fire('Error', error.message || 'Failed to delete role', 'error');
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
                    <h5 className="font-semibold text-lg dark:text-white-light">Careers at Green</h5>
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => router.push('/empower/careers-at-green/edit-main-page')}
                            className="btn btn-outline-primary border-green-600 text-green-600 hover:bg-green-600"
                        >
                            <IconEdit className="w-4 h-4 mr-2" />
                            Edit Main Page
                        </button>
                        <button
                            onClick={() => router.push('/empower/careers-at-green/edit-why-work-with-green')}
                            className="btn btn-outline-primary border-green-600 text-green-600 hover:bg-green-600"
                        >
                            <IconEdit className="w-4 h-4 mr-2" />
                            Edit Why Work With Green
                        </button>
                        <button
                            onClick={() => router.push('/empower/careers-at-green/edit-career-track-support')}
                            className="btn btn-outline-primary border-green-600 text-green-600 hover:bg-green-600"
                        >
                            <IconEdit className="w-4 h-4 mr-2" />
                            Edit Career Track
                        </button>
                        <button
                            onClick={() => router.push('/empower/careers-at-green/edit-what-makes-different')}
                            className="btn btn-outline-primary border-green-600 text-green-600 hover:bg-green-600"
                        >
                            <IconEdit className="w-4 h-4 mr-2" />
                            Edit What Makes Different
                        </button>
                        <button
                            onClick={() => router.push('/empower/careers-at-green/add-open-role')}
                            className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600"
                        >
                            <IconPlus className="w-5 h-5 mr-2" />
                            Add Open Role
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-10">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
                    </div>
                ) : (
                    <>
                        {/* Main Page Info */}
                        {careersData?.mainPage && (careersData.mainPage.title || careersData.mainPage.subHeadline) ? (
                            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                {careersData.mainPage.title && (
                                    <h3 className="text-lg font-semibold mb-2">{careersData.mainPage.title}</h3>
                                )}
                                {careersData.mainPage.subHeadline && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{careersData.mainPage.subHeadline}</p>
                                )}
                                {(careersData.mainPage.description.text || careersData.mainPage.description.highlighted) && (
                                    <div className="text-sm mb-2">
                                        {careersData.mainPage.description.text} {careersData.mainPage.description.highlighted && <span className="font-semibold">{careersData.mainPage.description.highlighted}</span>}
                                    </div>
                                )}
                                {(careersData.mainPage.quote1.text || careersData.mainPage.quote2.text) && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                        {careersData.mainPage.quote1.text && (
                                            <div className="text-sm italic">
                                                Quote 1: "{careersData.mainPage.quote1.text}" {careersData.mainPage.quote1.highlighted && <span className="font-semibold">- {careersData.mainPage.quote1.highlighted}</span>}
                                            </div>
                                        )}
                                        {careersData.mainPage.quote2.text && (
                                            <div className="text-sm italic">
                                                Quote 2: "{careersData.mainPage.quote2.text}" {careersData.mainPage.quote2.highlighted && <span className="font-semibold">- {careersData.mainPage.quote2.highlighted}</span>}
                                            </div>
                                        )}
                                    </div>
                                )}
                                {careersData.mainPage.cta.length > 0 && (
                                    <div className="flex gap-2 mt-4">
                                        {careersData.mainPage.cta.map((cta, index) => (
                                            cta.text && cta.href && (
                                                <a 
                                                    key={index}
                                                    href={cta.href}
                                                    className="btn btn-sm btn-outline-primary"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    {cta.text}
                                                </a>
                                            )
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                                <p className="text-gray-500">No main page content available. Click "Edit Main Page" to add content.</p>
                            </div>
                        )}

                        {/* Key Features */}
                        {careersData?.mainPage?.keys && careersData.mainPage.keys.length > 0 && (
                            <div className="mb-6">
                                <h4 className="text-lg font-semibold mb-4">Key Features</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {careersData.mainPage.keys.map((key, index) => (
                                        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                                            <p className="text-sm mb-3">{key.text}</p>
                                            {key.cta.text && (
                                                <button className="btn btn-sm btn-primary bg-green-600 hover:bg-green-700">
                                                    {key.cta.text}
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Open Roles */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-semibold">Open Roles</h4>
                            </div>
                            
                            {careersData?.openRoles && (careersData.openRoles.title || careersData.openRoles.roles.length > 0) ? (
                                <>
                                    {careersData.openRoles.title && (
                                        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <h5 className="font-semibold">{careersData.openRoles.title}</h5>
                                        </div>
                                    )}

                                    {careersData.openRoles.roles.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {careersData.openRoles.roles.map((role, roleIndex) => (
                                                <div key={roleIndex} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="flex-1">
                                                            <h3 className="text-lg font-semibold mb-1">{role.name}</h3>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">📍 {role.place}</p>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">⏰ Closes: {role.closing}</p>
                                                        </div>
                                                        <button
                                                            onClick={() => handleDeleteRole(roleIndex)}
                                                            className="text-red-600 hover:text-red-800 ml-2"
                                                            title="Delete Role"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-10">
                                            <p className="text-gray-500">No open roles available. Add your first open role!</p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-10">
                                    <p className="text-gray-500">No open roles section configured. Add your first open role!</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </ProtectedRoute>
    );
};

export default CareersAtGreenPage;