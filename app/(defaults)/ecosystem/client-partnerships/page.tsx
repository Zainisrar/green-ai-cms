'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EcosystemClientPartnerships } from '@/db/schema';
import { ecosystemClientPartnershipsApi } from '@/lib/api/ecosystemClientPartnerships';

export default function EcosystemClientPartnershipsPage() {
    const [data, setData] = useState<EcosystemClientPartnerships | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await ecosystemClientPartnershipsApi.get();
            setData(result);
        } catch (err) {
            setError('Failed to load client partnerships data');
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };



    const handleCreate = () => {
        router.push('/ecosystem/client-partnerships/create');
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <p>{error}</p>
                    <button 
                        onClick={fetchData}
                        className="mt-2 btn btn-outline-danger btn-sm"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4">Client Partnerships</h1>
                    <p className="text-gray-600 mb-8">No client partnerships data found.</p>
                    <button
                        onClick={handleCreate}
                        className="btn btn-primary"
                    >
                        Create New Client Partnerships
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Client Partnerships</h1>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => router.push(`/ecosystem/client-partnerships/edit-main-page/${data.id}`)}
                        className="btn btn-outline-primary btn-sm"
                    >
                        Edit Main Page
                    </button>
                    <button
                        onClick={() => router.push(`/ecosystem/client-partnerships/edit-modals/${data.id}`)}
                        className="btn btn-outline-success btn-sm"
                    >
                        Edit Modals
                    </button>
                </div>
            </div>

            {/* Main Page Content */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <h2 className="text-2xl font-bold mb-4">{data.mainPage.title}</h2>
                <h3 className="text-xl text-gray-600 mb-4">{data.mainPage.subHeadline}</h3>
                <p className="text-gray-700 mb-6">{data.mainPage.description}</p>
                
                <div className="mb-6">
                    <h4 className="font-semibold mb-2">Quote 1:</h4>
                    <p className="text-gray-700">{data.mainPage.quote1.text1}</p>
                    <p className="text-gray-700">{data.mainPage.quote1.text2}</p>
                </div>

                <div className="mb-6">
                    <h4 className="font-semibold mb-2">Quote 2:</h4>
                    <p className="text-gray-700">{data.mainPage.quote2}</p>
                </div>

                <div className="mb-6">
                    <h4 className="font-semibold mb-2">Call to Actions:</h4>
                    <div className="flex flex-wrap gap-2">
                        {data.mainPage.cta.map((cta, index) => (
                            <a
                                key={index}
                                href={cta.href}
                                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                            >
                                {cta.text}
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            {/* Who We Partner With */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <h2 className="text-2xl font-bold mb-4">{data.whoWePartnerWith.title}</h2>
                <h3 className="text-xl text-gray-600 mb-4">{data.whoWePartnerWith.subHeadline}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.whoWePartnerWith.items.map((item, index) => (
                        <div key={index} className="border rounded-lg p-4">
                            <h4 className="font-semibold mb-2">{item.clientType}</h4>
                            <p className="text-gray-700">{item.valueDelivered}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Our Client Partnership */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <h2 className="text-2xl font-bold mb-4">{data.ourClientPartnership.title}</h2>
                <h3 className="text-xl text-gray-600 mb-4">{data.ourClientPartnership.subHeadline}</h3>
                <p className="text-gray-700 mb-4">{data.ourClientPartnership.description}</p>
                
                {data.ourClientPartnership.img && (
                    <div className="mb-4">
                        <img 
                            src={data.ourClientPartnership.img.src} 
                            alt={data.ourClientPartnership.img.alt}
                            className="w-full max-w-md mx-auto rounded-lg"
                        />
                    </div>
                )}

                <div className="mb-4">
                    <p className="text-gray-700">
                        {data.ourClientPartnership.quote.text}
                        <span className="font-semibold"> {data.ourClientPartnership.quote.highlighted}</span>
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.ourClientPartnership.items.map((item, index) => (
                        <div key={index} className="border rounded-lg p-4">
                            <h4 className="font-semibold mb-2">{item.title}</h4>
                            <p className="text-gray-700">{item.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* What Sets Green Apart */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <h2 className="text-2xl font-bold mb-4">{data.whatSetsGreenApart.title}</h2>
                <h3 className="text-xl text-gray-600 mb-4">{data.whatSetsGreenApart.subHeadline}</h3>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-4 py-2 text-left">Green Delivers</th>
                                <th className="border border-gray-300 px-4 py-2 text-left">Others Promise</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.whatSetsGreenApart.items.map((item, index) => (
                                <tr key={index}>
                                    <td className="border border-gray-300 px-4 py-2">{item.greenDelivers}</td>
                                    <td className="border border-gray-300 px-4 py-2">{item.othersPromise}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Use Cases */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <h2 className="text-2xl font-bold mb-4">{data.useCases.title}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.useCases.items.map((item, index) => (
                        <div key={index} className="border rounded-lg p-4">
                            <img 
                                src={item.img.src} 
                                alt={item.img.alt}
                                className="w-full h-48 object-cover rounded-lg mb-4"
                            />
                            <h4 className="font-semibold mb-2">{item.title}</h4>
                            <p className="text-gray-700 text-sm">{item.reference}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Trusted By */}
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4">{data.trustedBy.title}</h2>
                <h3 className="text-xl text-gray-600 mb-4">{data.trustedBy.subHeadline}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {data.trustedBy.icons.map((icon, index) => (
                        <div key={index} className="flex justify-center items-center p-4 border rounded-lg">
                            <img 
                                src={icon.src} 
                                alt={icon.alt}
                                className="max-h-16 max-w-full object-contain"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}