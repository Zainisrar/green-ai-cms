'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ecosystemBecomeSupplierApi } from '@/lib/api/ecosystemBecomeSupplier';
import { EcosystemBecomeSupplier } from '@/db/schema';

export default function EcosystemBecomeSupplierPage() {
    const [data, setData] = useState<EcosystemBecomeSupplier | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await ecosystemBecomeSupplierApi.get();
            setData(result);
        } catch (err) {
            setError('Failed to load become a supplier data');
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
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Become a Supplier</h1>
                <div className="flex flex-wrap gap-3">
                    {!data ? (
                        <button
                            onClick={() => router.push('/ecosystem/become-a-supplier/create')}
                            className="btn btn-primary"
                        >
                            Create New
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={() => router.push(`/ecosystem/become-a-supplier/edit-main-page/${data.id}`)}
                                className="btn btn-outline-primary btn-sm"
                            >
                                Edit Main Page
                            </button>
                            <button
                                onClick={() => router.push(`/ecosystem/become-a-supplier/edit-modals/${data.id}`)}
                                className="btn btn-outline-success btn-sm"
                            >
                                Edit Modals
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
                                <div className="ml-4 border-l-4 border-gray-300 pl-4">
                                    <p className="text-gray-900">{data.mainPage.description.text}</p>
                                    <p className="text-primary font-medium">{data.mainPage.description.highlighted}</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-700">Quotes:</h3>
                                {data.mainPage.quote.map((q, index) => (
                                    <div key={index} className="ml-4 border-l-4 border-gray-300 pl-4 mb-2">
                                        <p className="text-gray-900">{q.text}</p>
                                        <p className="text-primary font-medium">{q.highlighted}</p>
                                    </div>
                                ))}
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-700">CTAs:</h3>
                                {data.mainPage.cta.map((c, index) => (
                                    <div key={index} className="ml-4">
                                        <a href={c.href} className="text-blue-600 hover:underline">{c.text}</a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* What You Need Section */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-2xl font-semibold mb-4">What You Need</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-medium text-gray-700">Title:</h3>
                                <p className="text-gray-900">{data.whatYouNeed.title}</p>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-700">Requirements:</h3>
                                <ul className="list-disc list-inside ml-4">
                                    {(data.whatYouNeed?.keys || []).map((key, index) => (
                                        <li key={index} className="text-gray-900">{key}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Why Green Section */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-2xl font-semibold mb-4">Why Green</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-medium text-gray-700">Title:</h3>
                                <p className="text-gray-900">{data.whyGreen.title}</p>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-700">Image:</h3>
                                <p className="text-gray-900">
                                    {data.whyGreen?.img?.src ? 
                                        `${data.whyGreen.img.src} - ${data.whyGreen.img.alt}` : 
                                        'No image data'
                                    }
                                </p>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-700">Benefits:</h3>
                                <ul className="list-disc list-inside ml-4">
                                    {(data.whyGreen?.keys || []).map((key, index) => (
                                        <li key={index} className="text-gray-900">{key}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No become a supplier data found.</p>
                    <button
                        onClick={() => router.push('/ecosystem/become-a-supplier/create')}
                        className="btn btn-primary"
                    >
                        Create New Become a Supplier
                    </button>
                </div>
            )}
        </div>
    );
}