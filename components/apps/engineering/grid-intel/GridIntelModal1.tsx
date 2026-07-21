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

export default function GridIntelModal1() {
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

    if (!gridIntelData?.productIntegration) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-lg text-gray-600">No Product Integration data found</div>
            </div>
        );
    }

    const { productIntegration } = gridIntelData;

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <Link 
                            href="/engineering/grid-intel/main-page"
                            className="text-green-600 hover:text-green-700 font-medium"
                        >
                            ← Back to Main Page
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">Product Integration</h1>
                        <div></div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                    {/* Hero Section */}
                    <div className="relative">
                        {productIntegration.image?.src && (
                            <div className="h-64 md:h-96 overflow-hidden">
                                <img
                                    src={productIntegration.image.src}
                                    alt={productIntegration.image.alt || 'Product Integration'}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                            <div className="text-center text-white">
                                <h2 className="text-4xl md:text-6xl font-bold mb-4">
                                    {productIntegration.title}
                                </h2>
                                {productIntegration.subtitle && (
                                    <p className="text-xl md:text-2xl font-light">
                                        {productIntegration.subtitle}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    {productIntegration.description && (
                        <div className="p-8 bg-gray-50">
                            <p className="text-lg text-gray-700 text-center max-w-4xl mx-auto leading-relaxed">
                                {productIntegration.description}
                            </p>
                        </div>
                    )}

                    {/* Integration Items */}
                    {productIntegration.items && productIntegration.items.length > 0 && (
                        <div className="p-8">
                            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                                GRID-INTEL™ is fully integrated with:
                            </h3>
                            <div className="space-y-6">
                                {productIntegration.items.map((item: any, index: number) => (
                                    <div key={index} className="flex items-start space-x-6 p-6 bg-white rounded-lg shadow-md border-l-4 border-green-500">
                                        <div className="flex-shrink-0">
                                            {item.icon?.src ? (
                                                <img 
                                                    src={item.icon.src} 
                                                    alt={item.icon.alt || 'Integration icon'} 
                                                    className="w-12 h-12 object-contain"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                                    <span className="text-gray-500">?</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-xl font-semibold text-gray-900 mb-2">
                                                {item.title}
                                            </h4>
                                            <p className="text-gray-700 leading-relaxed">
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tagline */}
                    {productIntegration.tagline && (
                        <div className="bg-green-600 text-white p-8">
                            <p className="text-2xl font-semibold text-center italic">
                                {productIntegration.tagline}
                            </p>
                        </div>
                    )}
                </div>

                {/* Navigation to other modals */}
                <div className="mt-12">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                        Explore More Grid Intel Features
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link 
                            href="/engineering/grid-intel/modal2"
                            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-4 text-center border-2 border-transparent hover:border-green-500"
                        >
                            <div className="text-green-600 text-2xl mb-2">⚡</div>
                            <h4 className="font-semibold text-gray-900">Technology Stack</h4>
                        </Link>
                        <Link 
                            href="/engineering/grid-intel/modal3"
                            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-4 text-center border-2 border-transparent hover:border-green-500"
                        >
                            <div className="text-green-600 text-2xl mb-2">🏗️</div>
                            <h4 className="font-semibold text-gray-900">Built for Scenarios</h4>
                        </Link>
                        <Link 
                            href="/engineering/grid-intel/main-page"
                            className="bg-green-600 text-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-4 text-center"
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