'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ecosystemImpactMeasurementESGApi } from '@/lib/api/ecosystemImpactMeasurementESG';
import { EcosystemImpactMeasurementESG } from '@/db/schema';

export default function EcosystemImpactMeasurementESGPage() {
    const [data, setData] = useState<EcosystemImpactMeasurementESG | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await ecosystemImpactMeasurementESGApi.getAll();
            setData(result);
        } catch (err) {
            setError('Failed to load data');
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };



    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Ecosystem Impact Measurement ESG
                </h1>
                <div className="space-x-4">
                    {!data && (
                        <button
                            onClick={() => router.push('/ecosystem/impact-measurement-esg/create')}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            Create New
                        </button>
                    )}
                </div>
            </div>

            {data ? (
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                                    {data.mainPage.title}
                                </h2>
                                <p className="text-gray-600 mb-4">{data.mainPage.subHeadline}</p>
                                <div className="text-gray-700">
                                    <span>{data.mainPage.description.text}</span>
                                    {data.mainPage.description.highlighted && (
                                        <span className="font-semibold text-green-600 ml-1">
                                            {data.mainPage.description.highlighted}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => router.push(`/ecosystem/impact-measurement-esg/edit-main-page/${data.id}`)}
                                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                                >
                                    Edit Main Page
                                </button>
                                <button
                                    onClick={() => router.push(`/ecosystem/impact-measurement-esg/edit-why-esg-matters-green/${data.id}`)}
                                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium px-4 py-2 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                                >
                                    Edit Why ESG Matters
                                </button>
                                <button
                                    onClick={() => router.push(`/ecosystem/impact-measurement-esg/edit-esg-integration-project-lifecycle/${data.id}`)}
                                    className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium px-4 py-2 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                                >
                                    Edit ESG Integration
                                </button>
                                <button
                                    onClick={() => router.push(`/ecosystem/impact-measurement-esg/edit-trust-signals/${data.id}`)}
                                    className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-medium px-4 py-2 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                                >
                                    Edit Trust Signals
                                </button>
                                <button
                                    onClick={() => router.push(`/ecosystem/impact-measurement-esg/edit-sample-metrics-snapshot/${data.id}`)}
                                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium px-4 py-2 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                                >
                                    Edit Metrics Snapshot
                                </button>
                                <button
                                    onClick={() => router.push(`/ecosystem/impact-measurement-esg/edit-how-we-measure-impact/${data.id}`)}
                                    className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-medium px-4 py-2 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                                >
                                    Edit How We Measure Impact
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-gray-900 mb-2">Quote</h3>
                                <div className="text-gray-700">
                                    <span>{data.mainPage.quote.text}</span>
                                    {data.mainPage.quote.highlighted && (
                                        <span className="font-semibold text-green-600 ml-1">
                                            {data.mainPage.quote.highlighted}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-gray-900 mb-2">Call to Actions</h3>
                                <div className="space-y-2">
                                    {data.mainPage.cta.map((cta, index) => (
                                        <div key={index} className="flex items-center space-x-2">
                                            <span className="text-blue-600">{cta.text}</span>
                                            <span className="text-gray-500">→</span>
                                            <span className="text-gray-600">{cta.href}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-gray-900 mb-2">Why ESG Matters Green</h3>
                                <p className="text-gray-600 mb-2">{data.whyEsgMattersGreen.title}</p>
                                <p className="text-sm text-gray-500 mb-2">{data.whyEsgMattersGreen.subHeadline}</p>
                                <p className="text-gray-700 mb-3">{data.whyEsgMattersGreen.description}</p>
                                <div className="space-y-1">
                                    {data.whyEsgMattersGreen.keys.map((key, index) => (
                                        <div key={index} className="text-sm">
                                            <span>{key.text}</span>
                                            {key.highlighted && (
                                                <span className="font-semibold text-green-600 ml-1">
                                                    {key.highlighted}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-gray-900 mb-2">ESG Integration Project Lifecycle</h3>
                                <p className="text-gray-600 mb-3">{data.esgIntegrationProjectLifeCycle.title}</p>
                                <div className="space-y-2 mb-3">
                                    {data.esgIntegrationProjectLifeCycle.items.map((item, index) => (
                                        <div key={index} className="border-l-2 border-green-500 pl-3">
                                            <h4 className="font-medium text-gray-900">{item.title}</h4>
                                            <p className="text-sm text-gray-600">{item.description}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="text-sm text-gray-700">
                                    <span>{data.esgIntegrationProjectLifeCycle.quote.text}</span>
                                    {data.esgIntegrationProjectLifeCycle.quote.highlighted && (
                                        <span className="font-semibold text-green-600 ml-1">
                                            {data.esgIntegrationProjectLifeCycle.quote.highlighted}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-gray-900 mb-2">Trust Signals</h3>
                                <p className="text-gray-600 mb-3">{data.trustSignals.title}</p>
                                <ul className="space-y-1 mb-3">
                                    {data.trustSignals.items.map((item, index) => (
                                        <li key={index} className="text-sm text-gray-700 flex items-center">
                                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <div className="text-sm text-gray-700">
                                    <span>{data.trustSignals.quote.text}</span>
                                    {data.trustSignals.quote.highlighted && (
                                        <span className="font-semibold text-green-600 ml-1">
                                            {data.trustSignals.quote.highlighted}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-gray-900 mb-2">Sample Metrics Snapshot</h3>
                                <p className="text-gray-600 mb-3">{data.sampleMetricsSnapshot.title}</p>
                                <div className="text-gray-700 mb-3">
                                    <span>{data.sampleMetricsSnapshot.description.text}</span>
                                    {data.sampleMetricsSnapshot.description.highlighted && (
                                        <span className="font-semibold text-green-600 ml-1">
                                            {data.sampleMetricsSnapshot.description.highlighted}
                                        </span>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    {data.sampleMetricsSnapshot.keys.map((key, index) => (
                                        <div key={index} className="text-sm">
                                            <span>{key.text}</span>
                                            {key.highlighted && (
                                                <span className="font-semibold text-green-600 ml-1">
                                                    {key.highlighted}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {data.howWeMeasureImpact && (
                            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-gray-900 mb-3">How We Measure Impact</h3>
                                <div className="space-y-3 mb-4">
                                    {data.howWeMeasureImpact.metrics.map((metric, index) => (
                                        <div key={index} className="bg-white p-3 rounded border border-gray-200">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div>
                                                    <span className="text-xs font-medium text-gray-500">Category:</span>
                                                    <p className="text-sm font-semibold text-gray-900">{metric.category}</p>
                                                </div>
                                                <div>
                                                    <span className="text-xs font-medium text-gray-500">Key Metrics Tracked:</span>
                                                    <p className="text-sm text-gray-700">{metric.keyMetricsTracked}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="text-sm text-gray-700 bg-white p-3 rounded border border-gray-200">
                                    <span>{data.howWeMeasureImpact.quote.text}</span>
                                    {data.howWeMeasureImpact.quote.highlighted && (
                                        <span className="font-semibold text-green-600 ml-1">
                                            {data.howWeMeasureImpact.quote.highlighted}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="mt-6 text-sm text-gray-500">
                            <p>Created: {new Date(data.createdAt).toLocaleDateString()}</p>
                            <p>Updated: {new Date(data.updatedAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="text-gray-500 mb-4">
                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Found</h3>
                    <p className="text-gray-500 mb-4">Get started by creating your first ecosystem impact measurement ESG data.</p>
                    <button
                        onClick={() => router.push('/ecosystem/impact-measurement-esg/create')}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                        Create New Data
                    </button>
                </div>
            )}
        </div>
    );
}