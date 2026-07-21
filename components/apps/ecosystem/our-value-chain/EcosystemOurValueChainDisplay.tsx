'use client';

import { EcosystemOurValueChain } from '@/db/schema';

interface EcosystemOurValueChainDisplayProps {
    data: EcosystemOurValueChain;
    className?: string;
}

export default function EcosystemOurValueChainDisplay({ 
    data, 
    className = '' 
}: EcosystemOurValueChainDisplayProps) {
    return (
        <div className={`ecosystem-value-chain ${className}`}>
            {/* Header Section */}
            <div className="header-section mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    {data.title}
                </h1>
                <h2 className="text-2xl text-gray-700 mb-6">
                    {data.subHeadline}
                </h2>
                
                {/* Description */}
                <div className="description mb-8">
                    <p className="text-lg text-gray-600 mb-2">
                        {data.description.text}
                    </p>
                    {data.description.highlighted && (
                        <p className="text-lg font-semibold text-blue-600">
                            {data.description.highlighted}
                        </p>
                    )}
                </div>
            </div>

            {/* Quotes Section */}
            {data.quote && data.quote.length > 0 && (
                <div className="quotes-section mb-12">
                    <div className="space-y-6">
                        {data.quote.map((quote, index) => (
                            <blockquote 
                                key={index} 
                                className="bg-gray-50 border-l-4 border-blue-500 p-6 rounded-r-lg"
                            >
                                <p className="text-lg text-gray-800 mb-2">
                                    "{quote.text}"
                                </p>
                                {quote.highlighted && (
                                    <p className="text-blue-600 font-semibold">
                                        {quote.highlighted}
                                    </p>
                                )}
                            </blockquote>
                        ))}
                    </div>
                </div>
            )}

            {/* Value Chain Strip */}
            {data.valueChainStrip && data.valueChainStrip.length > 0 && (
                <div className="value-chain-strip mb-12">
                    <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                        Our Value Chain
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {data.valueChainStrip.map((item, index) => (
                            <div 
                                key={index} 
                                className="value-chain-item bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                            >
                                {item.img && item.img.src && (
                                    <div className="image-container h-48 overflow-hidden">
                                        <img 
                                            src={item.img.src} 
                                            alt={item.img.alt}
                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                )}
                                <div className="content p-6">
                                    <h4 className="text-xl font-semibold text-gray-900 mb-3">
                                        {item.title}
                                    </h4>
                                    <p className="text-gray-600 leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Call to Actions */}
            {data.cta && data.cta.length > 0 && (
                <div className="cta-section">
                    <div className="flex flex-wrap justify-center gap-4">
                        {data.cta.map((cta, index) => (
                            <a
                                key={index}
                                href={cta.href}
                                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {cta.text}
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// Loading component
export function EcosystemOurValueChainSkeleton() {
    return (
        <div className="ecosystem-value-chain-skeleton animate-pulse">
            {/* Header skeleton */}
            <div className="header-section mb-12">
                <div className="h-10 bg-gray-300 rounded mb-4 w-3/4"></div>
                <div className="h-8 bg-gray-300 rounded mb-6 w-1/2"></div>
                <div className="h-6 bg-gray-300 rounded mb-2 w-full"></div>
                <div className="h-6 bg-gray-300 rounded mb-8 w-2/3"></div>
            </div>

            {/* Value chain strip skeleton */}
            <div className="value-chain-strip mb-12">
                <div className="h-8 bg-gray-300 rounded mb-8 w-1/3 mx-auto"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
                            <div className="h-48 bg-gray-300"></div>
                            <div className="p-6">
                                <div className="h-6 bg-gray-300 rounded mb-3 w-3/4"></div>
                                <div className="h-4 bg-gray-300 rounded mb-2 w-full"></div>
                                <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA skeleton */}
            <div className="cta-section">
                <div className="flex justify-center gap-4">
                    <div className="h-12 bg-gray-300 rounded w-32"></div>
                    <div className="h-12 bg-gray-300 rounded w-32"></div>
                </div>
            </div>
        </div>
    );
}