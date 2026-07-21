'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ecosystemOurProcurementPhilosophyApi } from '@/lib/api/ecosystemOurProcurementPhilosophy';
import { EcosystemOurProcurementPhilosophy } from '@/db/schema';

export default function EcosystemOurProcurementPhilosophyPage() {
    const [data, setData] = useState<EcosystemOurProcurementPhilosophy | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await ecosystemOurProcurementPhilosophyApi.get();
            setData(result);
        } catch (err) {
            setError('Failed to load procurement philosophy data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Our Procurement Philosophy</h1>
                <div className="flex flex-wrap gap-3">
                    {!data ? (
                        <button onClick={() => router.push('/ecosystem/our-procurement-philosophy/create')} className="btn btn-primary">
                            Create New
                        </button>
                    ) : (
                        <>
                            <button onClick={() => router.push(`/ecosystem/our-procurement-philosophy/edit-main-page/${data.id}`)} className="btn btn-outline-primary btn-sm">
                                Edit Main Page
                            </button>
                            <button onClick={() => router.push(`/ecosystem/our-procurement-philosophy/edit-core-principles/${data.id}`)} className="btn btn-outline-success btn-sm">
                                Edit Core Principles
                            </button>
                            <button onClick={() => router.push(`/ecosystem/our-procurement-philosophy/edit-what-we-wont-compromise/${data.id}`)} className="btn btn-outline-warning btn-sm">
                                Edit What We Won't Compromise
                            </button>
                            <button onClick={() => router.push(`/ecosystem/our-procurement-philosophy/edit-procurement-aligned-impact/${data.id}`)} className="btn btn-outline-info btn-sm">
                                Edit Procurement Aligned Impact
                            </button>
                            <button onClick={() => router.push(`/ecosystem/our-procurement-philosophy/edit-strategic-vendor-relationships/${data.id}`)} className="btn btn-outline-secondary btn-sm">
                                Edit Strategic Vendor Relationships
                            </button>
                        </>
                    )}
                </div>
            </div>

            {data ? (
                <div className="space-y-8">
                    {/* Main Page Section */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-2xl font-semibold mb-4">Main Page</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-medium text-gray-700">Title:</h3>
                                <p className="text-gray-900">{data.mainPage.title}</p>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-700">Sub Headline:</h3>
                                <p className="text-gray-900">{data.mainPage.subHeadline}</p>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-700">Description:</h3>
                                <div className="text-gray-900">
                                    {typeof data.mainPage.description === 'string' ? (
                                        <p>{data.mainPage.description}</p>
                                    ) : (
                                        <>
                                            <p>{(data.mainPage.description as any)?.text || ''}</p>
                                            <p className="text-primary font-medium">{(data.mainPage.description as any)?.highlighted || ''}</p>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-700">Quotes:</h3>
                                {data.mainPage.quote.map((q, index) => (
                                    <div key={index} className="ml-4 border-l-4 border-gray-300 pl-4">
                                        <p className="text-gray-900">{q.text}</p>
                                        <p className="text-primary font-medium">{q.highlighted}</p>
                                    </div>
                                ))}
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-700">CTAs:</h3>
                                {data.mainPage.cta.map((c, index) => (
                                    <div key={index} className="ml-4">
                                        <a href={c.href} className="text-blue-600 hover:underline">
                                            {c.text}
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Core Principles Section */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-2xl font-semibold mb-4">Core Principles</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-medium text-gray-700">Title:</h3>
                                <p className="text-gray-900">{data.corePrinciples.title}</p>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-700">Sub Headline:</h3>
                                <p className="text-gray-900">{data.corePrinciples.subHeadline}</p>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-700">Principles:</h3>
                                {data.corePrinciples?.items?.map((item, index) => (
                                    <div key={index} className="ml-4 border border-gray-200 p-3 rounded">
                                        <p className="font-medium">{item.principle}</p>
                                        <p className="text-gray-700">{item.statement}</p>
                                    </div>
                                )) || (
                                    <div className="ml-4 text-gray-500">
                                        <p>No principles data available</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* What We Won't Compromise Section */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-2xl font-semibold mb-4">What We Won't Compromise</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-medium text-gray-700">Title:</h3>
                                <p className="text-gray-900">{data.whatWeWontCompromise.title}</p>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-700">Image:</h3>
                                {data.whatWeWontCompromise?.img?.src ? (
                                    <div className="mt-2">
                                        <img 
                                            src={data.whatWeWontCompromise.img.src} 
                                            alt={data.whatWeWontCompromise.img.alt}
                                            className="w-48 h-32 object-cover rounded border"
                                        />
                                        <p className="text-sm text-gray-600 mt-1">{data.whatWeWontCompromise.img.alt}</p>
                                    </div>
                                ) : (
                                    <p className="text-gray-500">No image uploaded</p>
                                )}
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-700">Keys:</h3>
                                <ul className="list-disc list-inside ml-4">
                                    {(data.whatWeWontCompromise?.keys || []).map((key, index) => (
                                        <li key={index} className="text-gray-900">
                                            {key}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-700">Quote:</h3>
                                <div className="ml-4 border-l-4 border-gray-300 pl-4">
                                    <p className="text-gray-900">{data.whatWeWontCompromise?.quote?.text || 'No quote text'}</p>
                                    <p className="text-primary font-medium">{data.whatWeWontCompromise?.quote?.highlighted || 'No highlighted text'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Procurement Aligned Impact Section */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-2xl font-semibold mb-4">Procurement Aligned Impact</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-medium text-gray-700">Title:</h3>
                                <p className="text-gray-900">{data.procurementAlignedImpact.title}</p>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-700">Description:</h3>
                                <p className="text-gray-900">{data.procurementAlignedImpact.description}</p>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-700">Keys:</h3>
                                <ul className="list-disc list-inside ml-4">
                                    {(data.procurementAlignedImpact?.keys || []).map((key, index) => (
                                        <li key={index} className="text-gray-900">
                                            {key}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-700">Image:</h3>
                                {data.procurementAlignedImpact?.img?.src ? (
                                    <div className="mt-2">
                                        <img 
                                            src={data.procurementAlignedImpact.img.src} 
                                            alt={data.procurementAlignedImpact.img.alt}
                                            className="w-48 h-32 object-cover rounded border"
                                        />
                                        <p className="text-sm text-gray-600 mt-1">{data.procurementAlignedImpact.img.alt}</p>
                                    </div>
                                ) : (
                                    <p className="text-gray-500">No image uploaded</p>
                                )}
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-700">Quote:</h3>
                                <div className="ml-4 border-l-4 border-gray-300 pl-4">
                                    <p className="text-gray-900">{data.procurementAlignedImpact?.quote?.text || 'No quote text'}</p>
                                    <p className="text-primary font-medium">{data.procurementAlignedImpact?.quote?.highlighted || 'No highlighted text'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Strategic Vendor Relationships Section */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-2xl font-semibold mb-4">Strategic Vendor Relationships</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-medium text-gray-700">Title:</h3>
                                <p className="text-gray-900">{data.strategicVendorRelationships.title}</p>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-700">Keys:</h3>
                                {(data.strategicVendorRelationships?.keys || []).map((key, index) => (
                                    <div key={index} className="ml-4 border border-gray-200 p-3 rounded">
                                        <p className="text-gray-900">{typeof key === 'object' && key?.text ? key.text : typeof key === 'string' ? key : 'No text available'}</p>
                                        <p className="text-primary font-medium">{typeof key === 'object' && key?.highlighted ? key.highlighted : ''}</p>
                                    </div>
                                ))}
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-700">Image:</h3>
                                {data.strategicVendorRelationships?.img?.src ? (
                                    <div className="mt-2">
                                        <img 
                                            src={data.strategicVendorRelationships.img.src} 
                                            alt={data.strategicVendorRelationships.img.alt}
                                            className="w-48 h-32 object-cover rounded border"
                                        />
                                        <p className="text-sm text-gray-600 mt-1">{data.strategicVendorRelationships.img.alt}</p>
                                    </div>
                                ) : (
                                    <p className="text-gray-500">No image uploaded</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No procurement philosophy data found.</p>
                    <button onClick={() => router.push('/ecosystem/our-procurement-philosophy/create')} className="btn btn-primary">
                        Create New Procurement Philosophy
                    </button>
                </div>
            )}
        </div>
    );
}
