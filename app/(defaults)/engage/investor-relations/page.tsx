'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import IconPlus from '@/components/icon/icon-plus';
import IconEdit from '@/components/icon/icon-edit';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api-client';

interface InvestorRelationsData {
    id: number;
    mainPage: {
        title: string;
        subHeadline: string;
        description: {
            text: string;
            highlighted: string;
        };
        quote1: {
            text: string;
            highlighted: string;
        };
        quote2: {
            text: string;
            highlighted: string;
        };
        cta: Array<{
            text: string;
            href: string;
        }>;
    };
    whyInvestGreen: {
        title: string;
        headline: string;
        key: Array<{
            icon: {
                src: string;
                alt: string;
            };
            text: string;
        }>;
        quote: {
            text: string;
            highlighted: string;
        };
    };
    investmentInstruments: {
        title: string;
        headline: string;
        key: Array<{
            icon: {
                src: string;
                alt: string;
            };
            text: string;
        }>;
        quote: {
            text: string;
            highlighted: string;
        };
    };
    investmentFocusArea: {
        title: string;
        headline: string;
        focusArea: {
            items: string[];
        };
        capitalUse: {
            items: string[];
        };
        returnProfile: {
            items: string[];
        };
    };
    performanceSnapshots: {
        title: string;
        headline: string;
        metric: {
            items: string[];
        };
        value: {
            items: string[];
        };
    };
    createdAt: string;
    updatedAt: string;
}

const InvestorRelationsPage = () => {
    const router = useRouter();
    const [investorRelationsData, setInvestorRelationsData] = useState<InvestorRelationsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInvestorRelationsData();
    }, []);

    const fetchInvestorRelationsData = async () => {
        try {
            const result = await apiClient.get('/api/engage/investor-relations');
            if (result.success) {
                setInvestorRelationsData(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch investor relations data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        router.push('/engage/investor-relations/create');
    };

    const handleEditMainPage = () => {
        if (investorRelationsData) {
            router.push(`/engage/investor-relations/edit-main-page/${investorRelationsData.id}`);
        }
    };

    const handleEditModal = (modalName: string) => {
        if (investorRelationsData) {
            router.push(`/engage/investor-relations/edit-${modalName}/${investorRelationsData.id}`);
        }
    };

    const handleDelete = async () => {
        if (!investorRelationsData) return;

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'This will permanently delete the investor relations data!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it!',
        });

        if (result.isConfirmed) {
            try {
                const deleteResult = await apiClient.delete(`/api/engage/investor-relations/${investorRelationsData.id}`);
                if (deleteResult.success) {
                    Swal.fire('Deleted!', 'Investor relations data has been deleted.', 'success');
                    setInvestorRelationsData(null);
                } else {
                    Swal.fire('Error', deleteResult.error || 'Failed to delete investor relations data', 'error');
                }
            } catch (error) {
                console.error('Delete error:', error);
                Swal.fire('Error', 'Failed to delete investor relations data', 'error');
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
                    <h5 className="font-semibold text-lg dark:text-white-light">Investor Relations Management</h5>
                    {!investorRelationsData && (
                        <button
                            onClick={handleCreate}
                            className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600"
                        >
                            <IconPlus className="w-4 h-4 mr-2" />
                            Create Investor Relations
                        </button>
                    )}
                </div>

                {investorRelationsData ? (
                    <div className="space-y-6">
                        {/* Main Page Card */}
                        <div className="panel">
                            <div className="flex items-center justify-between mb-4">
                                <h6 className="text-lg font-semibold">Main Page Content</h6>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleEditMainPage}
                                        className="btn btn-outline-primary border-green-600 text-green-600 hover:bg-green-600"
                                    >
                                        <IconEdit className="w-4 h-4 mr-2" />
                                        Edit Main Page
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="btn btn-outline-danger"
                                    >
                                        Delete All
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Title</label>
                                    <p className="text-gray-700 dark:text-gray-300">{investorRelationsData.mainPage.title}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Sub-Headline</label>
                                    <p className="text-gray-700 dark:text-gray-300">{investorRelationsData.mainPage.subHeadline}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Description</label>
                                    <p className="text-gray-700 dark:text-gray-300">{investorRelationsData.mainPage.description.text}</p>
                                    {investorRelationsData.mainPage.description.highlighted && (
                                        <p className="text-sm text-green-600 font-medium">{investorRelationsData.mainPage.description.highlighted}</p>
                                    )}
                                </div>

                                {investorRelationsData.mainPage.cta && investorRelationsData.mainPage.cta.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Call-to-Action Buttons</label>
                                        <div className="space-y-2">
                                            {investorRelationsData.mainPage.cta.map((cta, index) => (
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
                            </div>
                        </div>

                        {/* Modals Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Why Invest Green Modal */}
                            <div className="panel">
                                <div className="flex items-center justify-between mb-4">
                                    <h6 className="text-lg font-semibold">Why Invest Green</h6>
                                    <button
                                        onClick={() => handleEditModal('why-invest-green')}
                                        className="btn btn-sm btn-outline-primary border-green-600 text-green-600 hover:bg-green-600"
                                    >
                                        <IconEdit className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{investorRelationsData.whyInvestGreen.title}</p>
                                    <p className="text-xs text-gray-500">{investorRelationsData.whyInvestGreen.headline}</p>
                                    <p className="text-xs text-gray-500">{investorRelationsData.whyInvestGreen.key.length} key points</p>
                                </div>
                            </div>

                            {/* Investment Instruments Modal */}
                            <div className="panel">
                                <div className="flex items-center justify-between mb-4">
                                    <h6 className="text-lg font-semibold">Investment Instruments</h6>
                                    <button
                                        onClick={() => handleEditModal('investment-instruments')}
                                        className="btn btn-sm btn-outline-primary border-green-600 text-green-600 hover:bg-green-600"
                                    >
                                        <IconEdit className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{investorRelationsData.investmentInstruments.title}</p>
                                    <p className="text-xs text-gray-500">{investorRelationsData.investmentInstruments.headline}</p>
                                    <p className="text-xs text-gray-500">{investorRelationsData.investmentInstruments.key.length} instruments</p>
                                </div>
                            </div>

                            {/* Investment Focus Area Modal */}
                            <div className="panel">
                                <div className="flex items-center justify-between mb-4">
                                    <h6 className="text-lg font-semibold">Investment Focus Area</h6>
                                    <button
                                        onClick={() => handleEditModal('investment-focus-area')}
                                        className="btn btn-sm btn-outline-primary border-green-600 text-green-600 hover:bg-green-600"
                                    >
                                        <IconEdit className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{investorRelationsData.investmentFocusArea.title}</p>
                                    <p className="text-xs text-gray-500">{investorRelationsData.investmentFocusArea.headline}</p>
                                    <p className="text-xs text-gray-500">
                                        Focus Areas: {investorRelationsData.investmentFocusArea.focusArea.items.length}, 
                                        Capital Use: {investorRelationsData.investmentFocusArea.capitalUse.items.length}, 
                                        Return Profile: {investorRelationsData.investmentFocusArea.returnProfile.items.length}
                                    </p>
                                </div>
                            </div>

                            {/* Performance Snapshots Modal */}
                            <div className="panel">
                                <div className="flex items-center justify-between mb-4">
                                    <h6 className="text-lg font-semibold">Performance Snapshots</h6>
                                    <button
                                        onClick={() => handleEditModal('performance-snapshots')}
                                        className="btn btn-sm btn-outline-primary border-green-600 text-green-600 hover:bg-green-600"
                                    >
                                        <IconEdit className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{investorRelationsData.performanceSnapshots.title}</p>
                                    <p className="text-xs text-gray-500">{investorRelationsData.performanceSnapshots.headline}</p>
                                    <p className="text-xs text-gray-500">
                                        Metrics: {investorRelationsData.performanceSnapshots.metric.items.length}, 
                                        Values: {investorRelationsData.performanceSnapshots.value.items.length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="text-sm text-gray-500 pt-4 border-t">
                            <p>Created: {new Date(investorRelationsData.createdAt).toLocaleDateString()}</p>
                            <p>Updated: {new Date(investorRelationsData.updatedAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="mb-4">
                            <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                <IconPlus className="w-8 h-8 text-gray-400" />
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No Investor Relations Page Created</h3>
                        <p className="text-gray-500 mb-4">Create an investor relations page to get started.</p>
                        <button
                            onClick={handleCreate}
                            className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600"
                        >
                            <IconPlus className="w-4 h-4 mr-2" />
                            Create Investor Relations
                        </button>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
};

export default InvestorRelationsPage;