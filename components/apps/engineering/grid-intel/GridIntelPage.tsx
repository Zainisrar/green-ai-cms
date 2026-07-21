'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Loading from '@/components/layouts/loading';
import IconEdit from '@/components/icon/icon-edit';
import IconEye from '@/components/icon/icon-eye';
import IconPlus from '@/components/icon/icon-plus';
import IconSearch from '@/components/icon/icon-search';
import IconCloudDownload from '@/components/icon/icon-cloud-download';
import { useRouter } from 'next/navigation';
import GridIntelBase from './GridIntelBase';

async function fetchGridIntel(): Promise<any | null> {
    try {
        const response = await fetch('/api/engineering/grid-intel');
        if (response.ok) {
            const data = await response.json();
            return data;
        }
        return null;
    } catch (error) {
        console.error('Error fetching Grid Intel:', error);
        throw error;
    }
}

export default function GridIntelPage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [showEditor, setShowEditor] = useState(false);

    const {
        data: gridIntelData,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['engineering-grid-intel'],
        queryFn: fetchGridIntel,
    });

    const handleEdit = () => {
        setShowEditor(true);
    };

    const handleView = (section: string) => {
        router.push(`/engineering/grid-intel/${section}`);
    };

    const handleCreate = () => {
        setShowEditor(true);
    };

    if (showEditor) {
        return <GridIntelBase />;
    }

    if (isLoading) {
        return <Loading />;
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-lg text-red-600">Error loading Grid Intel data</div>
            </div>
        );
    }

    // Table data for different sections
    const tableData = [
        {
            id: 'main-page',
            section: 'Main Page',
            title: gridIntelData?.mainPage?.title || 'Not Set',
            description: gridIntelData?.mainPage?.subtitle || 'No description',
            status: gridIntelData?.mainPage ? 'Active' : 'Inactive',
            lastUpdated: gridIntelData?.updatedAt ? new Date(gridIntelData.updatedAt).toLocaleDateString() : 'Never',
            route: 'main-page'
        },
        {
            id: 'product-integration',
            section: 'Product Integration',
            title: gridIntelData?.productIntegration?.title || 'Not Set',
            description: gridIntelData?.productIntegration?.subtitle || 'No description',
            status: gridIntelData?.productIntegration ? 'Active' : 'Inactive',
            lastUpdated: gridIntelData?.updatedAt ? new Date(gridIntelData.updatedAt).toLocaleDateString() : 'Never',
            route: 'modal1'
        },
        {
            id: 'technology-stack',
            section: 'Technology Stack',
            title: gridIntelData?.technologyStack?.title || 'Not Set',
            description: gridIntelData?.technologyStack?.subtitle || 'No description',
            status: gridIntelData?.technologyStack ? 'Active' : 'Inactive',
            lastUpdated: gridIntelData?.updatedAt ? new Date(gridIntelData.updatedAt).toLocaleDateString() : 'Never',
            route: 'modal2'
        },
        {
            id: 'scenarios',
            section: 'Built for Scenarios',
            title: gridIntelData?.scenarios?.title || 'Not Set',
            description: gridIntelData?.scenarios?.subtitle || 'No description',
            status: gridIntelData?.scenarios ? 'Active' : 'Inactive',
            lastUpdated: gridIntelData?.updatedAt ? new Date(gridIntelData.updatedAt).toLocaleDateString() : 'Never',
            route: 'modal3'
        },
        {
            id: 'why-different',
            section: 'Why Different',
            title: gridIntelData?.whyDifferent?.title || 'Not Set',
            description: gridIntelData?.whyDifferent?.subtitle || 'No description',
            status: gridIntelData?.whyDifferent ? 'Active' : 'Inactive',
            lastUpdated: gridIntelData?.updatedAt ? new Date(gridIntelData.updatedAt).toLocaleDateString() : 'Never',
            route: 'modal4'
        },
        {
            id: 'what-solves',
            section: 'What Solves',
            title: gridIntelData?.whatSolves?.title || 'Not Set',
            description: gridIntelData?.whatSolves?.subtitle || 'No description',
            status: gridIntelData?.whatSolves ? 'Active' : 'Inactive',
            lastUpdated: gridIntelData?.updatedAt ? new Date(gridIntelData.updatedAt).toLocaleDateString() : 'Never',
            route: 'modal5'
        },
        {
            id: 'challenge',
            section: 'The Challenge',
            title: gridIntelData?.challenge?.title || 'Not Set',
            description: gridIntelData?.challenge?.subtitle || 'No description',
            status: gridIntelData?.challenge ? 'Active' : 'Inactive',
            lastUpdated: gridIntelData?.updatedAt ? new Date(gridIntelData.updatedAt).toLocaleDateString() : 'Never',
            route: 'modal6'
        }
    ];

    // Filter data based on search term
    const filteredData = tableData.filter(item =>
        item.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="panel">
            <div className="mb-5 flex items-center justify-between">
                <h5 className="text-lg font-semibold dark:text-white-light">Grid Intel Management</h5>
                <div className="flex items-center gap-2">
                    {!gridIntelData ? (
                        <button type="button" className="btn btn-primary btn-sm" onClick={handleCreate}>
                            <IconPlus className="h-4 w-4 mr-1" />
                            Create Grid Intel
                        </button>
                    ) : (
                        <button type="button" className="btn btn-primary btn-sm" onClick={handleEdit}>
                            <IconEdit className="h-4 w-4 mr-1" />
                            Edit All Content
                        </button>
                    )}
                </div>
            </div>

            {/* Search Bar */}
            <div className="mb-5">
                <div className="relative">
                    <input
                        type="text"
                        className="form-input pl-10 pr-4"
                        placeholder="Search sections, titles, or descriptions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="panel bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold">{tableData.length}</div>
                            <div className="text-sm opacity-80">Total Sections</div>
                        </div>
                        <div className="text-3xl opacity-80">📊</div>
                    </div>
                </div>
                <div className="panel bg-gradient-to-r from-green-500 to-green-600 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold">{tableData.filter(item => item.status === 'Active').length}</div>
                            <div className="text-sm opacity-80">Active Sections</div>
                        </div>
                        <div className="text-3xl opacity-80">✅</div>
                    </div>
                </div>
                <div className="panel bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold">{tableData.filter(item => item.status === 'Inactive').length}</div>
                            <div className="text-sm opacity-80">Inactive Sections</div>
                        </div>
                        <div className="text-3xl opacity-80">⚠️</div>
                    </div>
                </div>
                <div className="panel bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold">{gridIntelData ? '1' : '0'}</div>
                            <div className="text-sm opacity-80">Grid Intel Systems</div>
                        </div>
                        <div className="text-3xl opacity-80">⚡</div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="panel">
                <div className="table-responsive">
                    <table className="table-hover">
                        <thead>
                            <tr>
                                <th>Section</th>
                                <th>Title</th>
                                <th>Description</th>
                                <th>Status</th>
                                <th>Last Updated</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length > 0 ? (
                                filteredData.map((item) => (
                                    <tr key={item.id}>
                                        <td>
                                            <div className="flex items-center space-x-2">
                                                <div className="text-lg">
                                                    {item.section === 'Main Page' && '🏠'}
                                                    {item.section === 'Product Integration' && '🔗'}
                                                    {item.section === 'Technology Stack' && '⚡'}
                                                    {item.section === 'Built for Scenarios' && '🏗️'}
                                                    {item.section === 'Why Different' && '🎯'}
                                                    {item.section === 'What Solves' && '💡'}
                                                    {item.section === 'The Challenge' && '⚠️'}
                                                </div>
                                                <span className="font-medium">{item.section}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {item.title}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="text-gray-600 dark:text-gray-300 max-w-xs truncate">
                                                {item.description}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${item.status === 'Active' ? 'badge-outline-success' : 'badge-outline-warning'}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="text-sm text-gray-500">
                                                {item.lastUpdated}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-primary btn-sm"
                                                    onClick={() => handleView(item.route)}
                                                    title="View Section"
                                                >
                                                    <IconEye className="h-4 w-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-success btn-sm"
                                                    onClick={handleEdit}
                                                    title="Edit Content"
                                                >
                                                    <IconEdit className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="text-center py-8">
                                        <div className="text-gray-500">
                                            {searchTerm ? 'No sections found matching your search.' : 'No Grid Intel data found.'}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="panel">
                    <div className="flex items-center space-x-3">
                        <div className="text-2xl">📊</div>
                        <div>
                            <h6 className="font-semibold">Content Management</h6>
                            <p className="text-sm text-gray-600">Edit all Grid Intel sections and content</p>
                        </div>
                    </div>
                </div>
                <div className="panel">
                    <div className="flex items-center space-x-3">
                        <div className="text-2xl">🖼️</div>
                        <div>
                            <h6 className="font-semibold">Image Upload</h6>
                            <p className="text-sm text-gray-600">Upload images with Cloudinary support</p>
                        </div>
                    </div>
                </div>
                <div className="panel">
                    <div className="flex items-center space-x-3">
                        <div className="text-2xl">👁️</div>
                        <div>
                            <h6 className="font-semibold">Preview Pages</h6>
                            <p className="text-sm text-gray-600">View public-facing Grid Intel pages</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}