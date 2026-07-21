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

export default function GridIntelModal5() {
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

    if (!gridIntelData?.whatSolves) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-lg text-gray-600">No What Solves data found</div>
            </div>
        );
    }

    const { whatSolves } = gridIntelData;

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-cyan-50">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <Link 
                            href="/engineering/grid-intel/main-page"
                            className="text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                            ← Back to Main Page
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">What GRID-INTEL™ Solves</h1>
                        <div></div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                    {/* Hero Section */}
                    <div className="bg-gradient-to-r from-indigo-600 to-cyan-600 text-white p-12">
                        <div className="text-center">
                            <h2 className="text-4xl md:text-6xl font-bold mb-4">
                                {whatSolves.title}
                            </h2>
                            {whatSolves.subtitle && (
                                <p className="text-xl md:text-2xl font-light opacity-90">
                                    {whatSolves.subtitle}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    {whatSolves.description && (
                        <div className="p-8 bg-gradient-to-r from-indigo-50 to-cyan-50">
                            <p className="text-lg text-gray-700 text-center max-w-4xl mx-auto leading-relaxed">
                                {whatSolves.description}
                            </p>
                        </div>
                    )}

                    {/* Solutions Grid */}
                    {whatSolves.solutions && whatSolves.solutions.length > 0 && (
                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {whatSolves.solutions.map((solution: any, index: number) => (
                                    <div key={index} className="bg-gradient-to-br from-indigo-50 to-cyan-50 rounded-lg p-6 border-l-4 border-indigo-500 hover:shadow-lg transition-shadow duration-300">
                                        <div className="flex items-start space-x-4">
                                            <div className="flex-shrink-0">
                                                <span className="text-4xl">{solution.icon}</span>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-xl font-semibold text-gray-900 mb-3">
                                                    {solution.title}
                                                </h4>
                                                <p className="text-gray-700 leading-relaxed">
                                                    {solution.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tagline */}
                    {whatSolves.tagline && (
                        <div className="bg-gradient-to-r from-indigo-600 to-cyan-600 text-white p-8">
                            <p className="text-2xl font-semibold text-center italic">
                                {whatSolves.tagline}
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
                            href="/engineering/grid-intel/modal4"
                            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-4 text-center border-2 border-transparent hover:border-indigo-500"
                        >
                            <div className="text-indigo-600 text-2xl mb-2">🎯</div>
                            <h4 className="font-semibold text-gray-900">Why Different</h4>
                        </Link>
                        <Link 
                            href="/engineering/grid-intel/modal6"
                            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-4 text-center border-2 border-transparent hover:border-indigo-500"
                        >
                            <div className="text-indigo-600 text-2xl mb-2">⚠️</div>
                            <h4 className="font-semibold text-gray-900">The Challenge</h4>
                        </Link>
                        <Link 
                            href="/engineering/grid-intel/main-page"
                            className="bg-indigo-600 text-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-4 text-center"
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