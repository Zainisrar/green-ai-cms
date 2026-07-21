'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Loading from '@/components/layouts/loading';
import Link from 'next/link';

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

export default function GridIntelModal4() {
    const {
        data: gridIntelData,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['engineering-grid-intel'],
        queryFn: fetchGridIntel,
    });

    if (isLoading) {
        return <Loading />;
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-lg text-red-600">Error loading Grid Intel</div>
            </div>
        );
    }

    if (!gridIntelData?.whyDifferent) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-lg text-gray-600">No Why Different data found</div>
            </div>
        );
    }

    const { whyDifferent } = gridIntelData;

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <Link 
                            href="/engineering/grid-intel/main-page"
                            className="text-purple-600 hover:text-purple-700 font-medium"
                        >
                            ← Back to Main Page
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">Why GRID-INTEL™ is Different</h1>
                        <div></div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                    {/* Hero Section */}
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-12">
                        <div className="text-center">
                            <h2 className="text-4xl md:text-6xl font-bold mb-4">
                                {whyDifferent.title}
                            </h2>
                            {whyDifferent.subtitle && (
                                <p className="text-xl md:text-2xl font-light opacity-90">
                                    {whyDifferent.subtitle}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    {whyDifferent.description && (
                        <div className="p-8 bg-gradient-to-r from-purple-50 to-pink-50">
                            <p className="text-lg text-gray-700 text-center max-w-4xl mx-auto leading-relaxed">
                                {whyDifferent.description}
                            </p>
                        </div>
                    )}

                    {/* Comparison Table */}
                    {whyDifferent.comparisonTable && whyDifferent.comparisonTable.length > 0 && (
                        <div className="p-8">
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse bg-white rounded-lg shadow-lg overflow-hidden">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                                            <th className="px-6 py-4 text-left font-semibold">Feature</th>
                                            <th className="px-6 py-4 text-center font-semibold">GRID-INTEL™</th>
                                            <th className="px-6 py-4 text-center font-semibold">Conventional Controllers</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {whyDifferent.comparisonTable.map((row: any, index: number) => (
                                            <tr key={index} className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-purple-50 transition-colors duration-200`}>
                                                <td className="px-6 py-4 font-medium text-gray-900">
                                                    {row.feature}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                                        {row.gridIntel}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                                                        {row.conventional}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Call to Action */}
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-8">
                        <div className="text-center">
                            <h3 className="text-2xl font-bold mb-4">
                                Experience the GRID-INTEL™ Difference
                            </h3>
                            <p className="text-lg opacity-90">
                                Advanced intelligence for superior energy management
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation to other modals */}
                <div className="mt-12">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                        Explore More Grid Intel Features
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link 
                            href="/engineering/grid-intel/modal5"
                            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-4 text-center border-2 border-transparent hover:border-purple-500"
                        >
                            <div className="text-purple-600 text-2xl mb-2">💡</div>
                            <h4 className="font-semibold text-gray-900">What Solves</h4>
                        </Link>
                        <Link 
                            href="/engineering/grid-intel/modal6"
                            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-4 text-center border-2 border-transparent hover:border-purple-500"
                        >
                            <div className="text-purple-600 text-2xl mb-2">⚠️</div>
                            <h4 className="font-semibold text-gray-900">The Challenge</h4>
                        </Link>
                        <Link 
                            href="/engineering/grid-intel/main-page"
                            className="bg-purple-600 text-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-4 text-center"
                        >
                            <div className="text-2xl mb-2">🏠</div>
                            <h4 className="font-semibold">Back to Main</h4>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}