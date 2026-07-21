'use client';

import { EcosystemSupplyPartners } from '@/db/schema';

interface EcosystemSupplyPartnersDisplayProps {
    data: EcosystemSupplyPartners;
    className?: string;
}

export default function EcosystemSupplyPartnersDisplay({ 
    data, 
    className = '' 
}: EcosystemSupplyPartnersDisplayProps) {
    return (
        <div className={`ecosystem-supply-partners ${className}`}>
            {/* Main Page Section */}
            <div className="main-page-section mb-16">
                <div className="header-section mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        {data.mainPage.title}
                    </h1>
                    <h2 className="text-2xl text-gray-700 mb-6">
                        {data.mainPage.subHeadline}
                    </h2>
                    
                    {/* Description */}
                    <div className="description mb-8">
                        <p className="text-lg text-gray-600 mb-2">
                            {data.mainPage.description.text}
                        </p>
                        {data.mainPage.description.highlighted && (
                            <p className="text-lg font-semibold text-blue-600">
                                {data.mainPage.description.highlighted}
                            </p>
                        )}
                    </div>

                    {/* Quote */}
                    {data.mainPage.quote && (data.mainPage.quote.text || data.mainPage.quote.highlighted) && (
                        <blockquote className="bg-gray-50 border-l-4 border-blue-500 p-6 rounded-r-lg mb-8">
                            {data.mainPage.quote.text && (
                                <p className="text-lg text-gray-800 mb-2">
                                    "{data.mainPage.quote.text}"
                                </p>
                            )}
                            {data.mainPage.quote.highlighted && (
                                <p className="text-blue-600 font-semibold">
                                    {data.mainPage.quote.highlighted}
                                </p>
                            )}
                        </blockquote>
                    )}
                </div>

                {/* Partner Spotlight */}
                {data.mainPage.partnerSpotlight && (
                    <div className="partner-spotlight mb-12">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">
                            Partner Spotlight
                        </h3>
                        
                        {data.mainPage.partnerSpotlight.text && (
                            <p className="text-lg text-gray-600 mb-6">
                                {data.mainPage.partnerSpotlight.text}
                            </p>
                        )}

                        {data.mainPage.partnerSpotlight.icons && data.mainPage.partnerSpotlight.icons.length > 0 && (
                            <div className="partner-icons grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                                {data.mainPage.partnerSpotlight.icons.map((icon, index) => (
                                    <div key={index} className="partner-icon flex justify-center items-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                                        <img 
                                            src={icon.src} 
                                            alt={icon.alt}
                                            className="max-h-16 max-w-full object-contain"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* CTAs */}
                {data.mainPage.cta && data.mainPage.cta.length > 0 && (
                    <div className="cta-section mb-12">
                        <div className="flex flex-wrap justify-center gap-4">
                            {data.mainPage.cta.map((cta, index) => (
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

            {/* Global Sourcing Strategy Section */}
            <div className="global-sourcing-section mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    {data.globalSourcingStrategy.title}
                </h2>
                <h3 className="text-xl font-semibold text-gray-700 mb-4">
                    {data.globalSourcingStrategy.headline}
                </h3>
                <p className="text-lg text-gray-600 mb-6">
                    {data.globalSourcingStrategy.description}
                </p>
                
                {data.globalSourcingStrategy.keyPoints && data.globalSourcingStrategy.keyPoints.length > 0 && (
                    <div className="key-points">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">Key Points:</h4>
                        <ul className="space-y-3">
                            {data.globalSourcingStrategy.keyPoints.map((point, index) => (
                                <li key={index} className="flex items-start">
                                    <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                    <span className="text-gray-700">{point}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* What We Procure Section */}
            <div className="what-we-procure-section mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">
                    {data.whatWeProcure.title}
                </h2>
                
                {data.whatWeProcure.item && data.whatWeProcure.item.length > 0 && (
                    <div className="procurement-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {data.whatWeProcure.item.map((item, index) => (
                            <div key={index} className="procurement-item bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                                <h4 className="text-xl font-semibold text-gray-800 mb-3">
                                    {item.category}
                                </h4>
                                <p className="text-gray-600">
                                    <span className="font-medium">Example: </span>
                                    {item.example}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* How to Become Green Supplier Section */}
            <div className="how-to-become-supplier-section">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    {data.howBecomeGreenSupplier.title}
                </h2>
                <h3 className="text-xl text-gray-700 mb-8">
                    {data.howBecomeGreenSupplier.subHeadline}
                </h3>
                
                {data.howBecomeGreenSupplier.item && data.howBecomeGreenSupplier.item.length > 0 && (
                    <div className="steps-container space-y-6">
                        {data.howBecomeGreenSupplier.item.map((step, index) => (
                            <div key={index} className="step-item bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600">
                                <div className="flex items-start">
                                    <div className="step-number bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm mr-4 flex-shrink-0 mt-1">
                                        {index + 1}
                                    </div>
                                    <div className="step-content">
                                        <h4 className="text-lg font-semibold text-gray-800 mb-2">
                                            {step.step}
                                        </h4>
                                        <p className="text-gray-600">
                                            {step.action}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// Loading component
export function EcosystemSupplyPartnersSkeleton() {
    return (
        <div className="ecosystem-supply-partners-skeleton animate-pulse">
            {/* Header skeleton */}
            <div className="header-section mb-12">
                <div className="h-10 bg-gray-300 rounded mb-4 w-3/4"></div>
                <div className="h-8 bg-gray-300 rounded mb-6 w-1/2"></div>
                <div className="h-6 bg-gray-300 rounded mb-2 w-full"></div>
                <div className="h-6 bg-gray-300 rounded mb-8 w-2/3"></div>
            </div>

            {/* Partner spotlight skeleton */}
            <div className="partner-spotlight mb-12">
                <div className="h-8 bg-gray-300 rounded mb-6 w-1/3"></div>
                <div className="h-6 bg-gray-300 rounded mb-6 w-full"></div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {[...Array(6)].map((_, index) => (
                        <div key={index} className="h-20 bg-gray-300 rounded"></div>
                    ))}
                </div>
            </div>

            {/* Sections skeleton */}
            {[...Array(3)].map((_, sectionIndex) => (
                <div key={sectionIndex} className="section-skeleton mb-16">
                    <div className="h-8 bg-gray-300 rounded mb-6 w-1/2"></div>
                    <div className="h-6 bg-gray-300 rounded mb-4 w-full"></div>
                    <div className="h-6 bg-gray-300 rounded mb-6 w-3/4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(3)].map((_, itemIndex) => (
                            <div key={itemIndex} className="bg-gray-300 rounded h-32"></div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}