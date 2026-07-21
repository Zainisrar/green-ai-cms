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

export default function GridIntelModal6() {
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

    if (!gridIntelData?.challenge) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-lg text-gray-600">No Challenge data found</div>
            </div>
        );
    }

    const { challenge } = gridIntelData;

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <Link 
                            href="/engineering/grid-intel/main-page"
                            className="text-red-600 hover:text-red-700 font-medium"
                        >
                            ← Back to Main Page
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">The Challenge</h1>
                        <div></div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                    {/* Hero Section */}
                    <div className="relative">
                        {challenge.image?.src && (
                            <div className="h-64 md:h-96 overflow-hidden">
                                <img
                                    src={challenge.image.src}
                                    alt={challenge.image.alt || 'The Challenge'}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-red-900 to-orange-900 bg-opacity-80 flex items-center justify-center">
                            <div className="text-center text-white">
                                <h2 className="text-4xl md:text-6xl font-bold mb-4">
                                    {challenge.title}
                                </h2>
                                {challenge.subtitle && (
                                    <p className="text-xl md:text-2xl font-light">
                                        {challenge.subtitle}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    {challenge.description && (
                        <div className="p-8 bg-gradient-to-r from-red-50 to-orange-50">
                            <p className="text-lg text-gray-700 text-center max-w-4xl mx-auto leading-relaxed mb-6">
                                {challenge.description}
                            </p>
                        </div>
                    )}

                    {/* Challenges List */}
                    {challenge.challenges && challenge.challenges.length > 0 && (
                        <div className="p-8">
                            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                                Across emerging markets and decentralized energy deployments, key problems persist:
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {challenge.challenges.map((item: any, index: number) => (
                                    <div key={index} className="flex items-start space-x-4 p-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border-l-4 border-red-500 hover:shadow-lg transition-shadow duration-300">
                                        <div className="flex-shrink-0">
                                            <span className="text-3xl">{item.icon}</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-gray-800 font-medium leading-relaxed">
                                                {item.text}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Result Statement */}
                    {challenge.resultText && (
                        <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-8">
                            <p className="text-2xl font-bold text-center">
                                {challenge.resultText}
                            </p>
                        </div>
                    )}

                    {/* Solution Call to Action */}
                    <div className="bg-gray-900 text-white p-8">
                        <div className="text-center">
                            <h3 className="text-2xl font-bold mb-4">
                                GRID-INTEL™ is the Solution
                            </h3>
                            <p className="text-lg opacity-90 mb-6">
                                Transforming energy challenges into intelligent opportunities
                            </p>
                            <Link 
                                href="/engineering/grid-intel/modal5"
                                className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors duration-200"
                            >
                                See What GRID-INTEL™ Solves →
                            </Link>
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
                            href="/engineering/grid-intel/modal4"
                            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-4 text-center border-2 border-transparent hover:border-red-500"
                        >
                            <div className="text-red-600 text-2xl mb-2">🎯</div>
                            <h4 className="font-semibold text-gray-900">Why Different</h4>
                        </Link>
                        <Link 
                            href="/engineering/grid-intel/modal5"
                            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-4 text-center border-2 border-transparent hover:border-red-500"
                        >
                            <div className="text-red-600 text-2xl mb-2">💡</div>
                            <h4 className="font-semibold text-gray-900">What Solves</h4>
                        </Link>
                        <Link 
                            href="/engineering/grid-intel/main-page"
                            className="bg-red-600 text-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-4 text-center"
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