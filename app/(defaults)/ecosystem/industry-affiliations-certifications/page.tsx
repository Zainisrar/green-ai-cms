'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ecosystemIndustryAffiliationsCertificationsApi } from '@/lib/api/ecosystemIndustryAffiliationsCertifications';
import { EcosystemIndustryAffiliationsCertifications } from '@/db/schema';
import { useAuth } from '@/contexts/AuthContext';

export default function IndustryAffiliationsCertificationsPage() {
    const [data, setData] = useState<EcosystemIndustryAffiliationsCertifications | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { user } = useAuth();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await ecosystemIndustryAffiliationsCertificationsApi.get();
            setData(result);
        } catch (err: any) {
            console.error('Error fetching data:', err);
            // If it's a 404 (no data found), don't show it as an error
            if (err?.message?.includes('404') || err?.status === 404) {
                setData(null);
            } else {
                setError(err?.message || 'Failed to fetch data');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (section: string) => {
        if (!data) return;

        const editRoutes: Record<string, string> = {
            'main-page': `/ecosystem/industry-affiliations-certifications/edit-main-page/${data.id}`,
            'why-certification-affiliation-matter': `/ecosystem/industry-affiliations-certifications/edit-why-certification-affiliation-matter/${data.id}`,
            'our-current-certifications': `/ecosystem/industry-affiliations-certifications/edit-our-current-certifications/${data.id}`,
            'industry-affiliations': `/ecosystem/industry-affiliations-certifications/edit-industry-affiliations/${data.id}`,
            'what-this-means-clients': `/ecosystem/industry-affiliations-certifications/edit-what-this-means-clients/${data.id}`,
        };

        router.push(editRoutes[section]);
    };

    const handleCreate = () => {
        router.push('/ecosystem/industry-affiliations-certifications/create');
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
                    <p>Error: {error}</p>
                    <button onClick={fetchData} className="mt-2 btn btn-outline-danger btn-sm">
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
                    <h1 className="text-3xl font-bold mb-4">Industry Affiliations & Certifications</h1>
                    <p className="text-gray-600 mb-8">No data found. Create the first entry.</p>
                    {user && (
                        <button onClick={handleCreate} className="btn btn-primary">
                            Create New Industry Affiliations & Certifications
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Industry Affiliations & Certifications</h1>
                {user && (
                    <div className="flex flex-wrap gap-3">
                        <button onClick={() => handleEdit('main-page')} className="btn btn-outline-primary btn-sm">
                            Edit Main Page
                        </button>
                        <button onClick={() => handleEdit('why-certification-affiliation-matter')} className="btn btn-outline-success btn-sm">
                            Edit Why Certification Matters
                        </button>
                        <button onClick={() => handleEdit('our-current-certifications')} className="btn btn-outline-info btn-sm">
                            Edit Certifications
                        </button>
                        <button onClick={() => handleEdit('industry-affiliations')} className="btn btn-outline-warning btn-sm">
                            Edit Affiliations
                        </button>
                        <button onClick={() => handleEdit('what-this-means-clients')} className="btn btn-outline-secondary btn-sm">
                            Edit Client Benefits
                        </button>
                    </div>
                )}
            </div>

            {/* Main Page Content */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">{data.mainPage.title}</h2>
                        <p className="text-lg text-gray-600 mb-4">{data.mainPage.subHeadline}</p>
                        <p className="text-gray-700 mb-4">
                            {typeof data.mainPage.description === 'string' ? data.mainPage.description : (data.mainPage.description as any)?.text || ''}
                            {typeof data.mainPage.description === 'object' && (data.mainPage.description as any)?.highlighted && (
                                <span className="font-semibold text-blue-600"> {(data.mainPage.description as any).highlighted}</span>
                            )}
                        </p>
                    </div>
                </div>

                {/* Quotes */}
                {data.mainPage.quote && data.mainPage.quote.length > 0 && (
                    <div className="mb-4">
                        {data.mainPage.quote.map((quote, index) => (
                            <blockquote key={index} className="border-l-4 border-blue-500 pl-4 italic text-gray-700 mb-2">
                                {quote.text} <span className="font-semibold text-blue-600">{quote.highlighted}</span>
                            </blockquote>
                        ))}
                    </div>
                )}

                {/* CTAs */}
                {data.mainPage.cta && data.mainPage.cta.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {data.mainPage.cta.map((cta, index) => (
                            <a key={index} href={cta.href} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                {cta.text}
                            </a>
                        ))}
                    </div>
                )}
            </div>

            {/* Why Certification & Affiliation Matter */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold">{data.whyCertificationAffiliationMatter.title}</h3>
                </div>
                <p className="text-gray-700 mb-4">{data.whyCertificationAffiliationMatter.description}</p>

                {data.whyCertificationAffiliationMatter.img && (
                    <img src={data.whyCertificationAffiliationMatter.img.src} alt={data.whyCertificationAffiliationMatter.img.alt} className="w-full max-w-md mx-auto mb-4 rounded" />
                )}

                {(data.whyCertificationAffiliationMatter.keys || (data.whyCertificationAffiliationMatter as any).points) && (
                    <div className="mb-4">
                        {(data.whyCertificationAffiliationMatter.keys || (data.whyCertificationAffiliationMatter as any).points || []).map((key: any, index: number) => (
                            <p key={index} className="mb-2">
                                {typeof key === 'string' ? key : key.text || String(key)}
                                {typeof key === 'object' && key.highlighted && <span className="font-semibold text-blue-600"> {key.highlighted}</span>}
                            </p>
                        ))}
                    </div>
                )}

                {data.whyCertificationAffiliationMatter.quote && (
                    <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-700">
                        {data.whyCertificationAffiliationMatter.quote.text}
                        <span className="font-semibold text-blue-600">{data.whyCertificationAffiliationMatter.quote.highlighted}</span>
                    </blockquote>
                )}
            </div>

            {/* Our Current Certifications */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold">{data.ourCurrentCertifications.title}</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-300">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="py-2 px-4 border-b text-left">Certification</th>
                                <th className="py-2 px-4 border-b text-left">Issuing Body</th>
                                <th className="py-2 px-4 border-b text-left">Scope</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(data.ourCurrentCertifications.items || (data.ourCurrentCertifications as any).certifications || []).map((item: any, index: number) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="py-2 px-4 border-b">{item.certification || item.name}</td>
                                    <td className="py-2 px-4 border-b">{item.issuingBody || item.year}</td>
                                    <td className="py-2 px-4 border-b">{item.scope || item.description}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Industry Affiliations */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold">{data.industryAffiliations.title}</h3>
                </div>

                {data.industryAffiliations.quote && (
                    <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-700 mb-4">
                        {data.industryAffiliations.quote.text}
                        <span className="font-semibold text-blue-600">{data.industryAffiliations.quote.highlighted}</span>
                    </blockquote>
                )}

                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-300">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="py-2 px-4 border-b text-left">Organization</th>
                                <th className="py-2 px-4 border-b text-left">Purpose/Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(data.industryAffiliations.keys || (data.industryAffiliations as any).affiliations || []).map((key: any, index: number) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="py-2 px-4 border-b">{key.organization || key.name}</td>
                                    <td className="py-2 px-4 border-b">{key.purpose || key.role || key.description}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* What This Means for Clients */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold">{data.whatThisMeansClients.title}</h3>
                </div>

                {data.whatThisMeansClients.img && <img src={data.whatThisMeansClients.img.src} alt={data.whatThisMeansClients.img.alt} className="w-full max-w-md mx-auto mb-4 rounded" />}

                {(data.whatThisMeansClients as any).description && <p className="text-gray-700 mb-4">{(data.whatThisMeansClients as any).description}</p>}

                {(data.whatThisMeansClients.keys || (data.whatThisMeansClients as any).benefits) && (
                    <div className="mb-4">
                        {data.whatThisMeansClients.keys && (
                            <div className="grid md:grid-cols-2 gap-4">
                                {data.whatThisMeansClients.keys.map((key, index) => (
                                    <div key={index} className="bg-gray-50 p-4 rounded">
                                        <h4 className="font-semibold mb-2">{key.title}</h4>
                                        <p className="text-gray-700">{key.description}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {(data.whatThisMeansClients as any).benefits && Array.isArray((data.whatThisMeansClients as any).benefits) && (
                            <div className="mt-4">
                                <ul className="list-disc list-inside space-y-2">
                                    {(data.whatThisMeansClients as any).benefits.map((benefit: string, index: number) => (
                                        <li key={index} className="text-gray-700">
                                            {benefit}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
