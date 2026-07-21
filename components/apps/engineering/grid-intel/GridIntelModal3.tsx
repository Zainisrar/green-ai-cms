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

export default function GridIntelModal3() {
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

    if (!gridIntelData?.scenarios) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-lg text-gray-600">No Scenarios data found</div>
            </div>
        );
    }

    const { scenarios } = gridIntelData;

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <Link 
                            href="/engineering/grid-intel/main-page"
                            className="text-orange-600 hover:text-orange-700 font-medium"
                        >
                            ← Back to Main Page
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">Built for These Scenarios</h1>
                        <div></div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                    {/* Hero Section */}
                    <div className="relative">
                        {scenarios.image?.src && (
                            <div className="h-64 md:h-96 overflow-hidden">
                                <img
                                    src={scenarios.image.src}
                                    alt={scenarios.image.alt || 'Built for Scenarios'}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-900 to-yellow-900 bg-opacity-80 flex items-center justify-center">
                            <div className="text-center text-white">
                                <h2 className="text-4xl md:text-6xl font-bold mb-4">
                                    {scenarios.title}
                                </h2>
                                {scenarios.subtitle && (
                                    <p className="text-xl md:text-2xl font-light">
                                        {scenarios.subtitle}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    {scenarios.description && (
                        <div className="p-8 bg-gradient-to-r from-orange-50 to-yellow-50">
                            <p className="text-lg text-gray-700 text-center max-w-4xl mx-auto leading-relaxed">
                                {scenarios.description}
                            </p>
                        </div>
                    )}

                    {/* Scenarios List */}
                    {scenarios.scenarios && scenarios.scenarios.length > 0 && (
                        <div className="p-8">
                            <h3 className="text-3xl font-bold text-gray-900 mb-2 text-center">
                                Where GRID-INTEL™ is Already Running
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                                {scenarios.scenarios.map((scenario: any, index: number) => (
                                    <div key={index} className="flex items-start space-x-4 p-6 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border-l-4 border-orange-500 hover:shadow-lg transition-shadow duration-300">
                                        <div className="flex-shrink-0">
                                            {scenario.icon?.src ? (
                                                <img 
                                                    src={scenario.icon.src} 
                                                    alt={scenario.icon.alt || 'Scenario icon'} 
                                                    className="w-10 h-10 object-contain"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                                                    <span className="text-gray-500">?</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-gray-800 font-medium leading-relaxed">
                                                {scenario.text}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tagline */}
                    {scenarios.tagline && (
                        <div className="bg-gradient-to-r from-orange-600 to-yellow-600 text-white p-8">
                            <p className="text-2xl font-semibold text-center italic">
                                {scenarios.tagline}
                            </p>
                        </div>
                    )}

                    {/* Bottom Statement */}
                    <div className="bg-gray-900 text-white p-8">
                        <div className="text-center">
                            <p className="text-xl font-semibold mb-2">
                                GRID-INTEL™ Is Deployed Where Energy Failure Is Unacceptable
                            </p>
                            <p className="text-lg opacity-90">
                                — And Intelligence Is Essential.
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
                            href="/engineering/grid-intel/modal1"
                            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-4 text-center border-2 border-transparent hover:border-orange-500"
                        >
                            <div className="text-orange-600 text-2xl mb-2">🔗</div>
                            <h4 className="font-semibold text-gray-900">Product Integration</h4>
                        </Link>
                        <Link 
                            href="/engineering/grid-intel/modal2"
                            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-4 text-center border-2 border-transparent hover:border-orange-500"
                        >
                            <div className="text-orange-600 text-2xl mb-2">⚡</div>
                            <h4 className="font-semibold text-gray-900">Technology Stack</h4>
                        </Link>
                        <Link 
                            href="/engineering/grid-intel/main-page"
                            className="bg-orange-600 text-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-4 text-center"
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