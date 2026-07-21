'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Loading from '@/components/layouts/loading';

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

export default function GridIntelMainPage() {
    const [activeModal, setActiveModal] = useState<string | null>(null);

    const {
        data: gridIntelData,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['engineering-grid-intel'],
        queryFn: fetchGridIntel,
    });

    const openModal = (modalType: string) => {
        setActiveModal(modalType);
    };

    const closeModal = () => {
        setActiveModal(null);
    };

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

    if (!gridIntelData) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-lg text-gray-600">No Grid Intel data found</div>
            </div>
        );
    }

    const { mainPage } = gridIntelData;

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                                {mainPage?.title}
                            </h1>
                            <p className="text-xl text-green-600 mb-8 leading-relaxed italic">
                                {mainPage?.subtitle}
                            </p>
                            {mainPage?.description && (
                                <p className="text-lg text-gray-700 mb-8">
                                    {mainPage.description}
                                </p>
                            )}
                        </div>
                        
                        <div className="relative">
                            {mainPage?.heroImage?.src && (
                                <img
                                    src={mainPage.heroImage.src}
                                    alt={mainPage.heroImage.alt || 'Grid Intel Hero'}
                                    className="w-full h-auto rounded-lg shadow-2xl"
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Energy Intelligence Platform Section */}
            {mainPage?.energyIntelligencePlatform && (
                <div className="bg-gray-50 py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-8">
                                    {mainPage.energyIntelligencePlatform.title}
                                </h2>
                                {mainPage.energyIntelligencePlatform.features && (
                                    <div className="space-y-4">
                                        {mainPage.energyIntelligencePlatform.features.map((feature: string, index: number) => (
                                            <div key={index} className="flex items-center space-x-3">
                                                <span className="text-green-600 text-xl">⚡</span>
                                                <span className="text-lg text-gray-700">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="relative">
                                {/* Placeholder for platform image */}
                                <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-lg p-8 text-center">
                                    <span className="text-6xl">🔋</span>
                                    <p className="text-gray-600 mt-4">Energy Intelligence Platform Visualization</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Energy You Can Count On Section */}
            {mainPage?.energyYouCanCountOn && (
                <div className="bg-white py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-4xl mx-auto">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                {mainPage.energyYouCanCountOn.title}
                            </h2>
                            <p className="text-xl text-green-600 mb-6 italic">
                                {mainPage.energyYouCanCountOn.subtitle}
                            </p>
                            <p className="text-lg text-gray-700 leading-relaxed">
                                {mainPage.energyYouCanCountOn.description}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Built for Intelligence Section */}
            {mainPage?.builtForIntelligence && (
                <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold mb-4">
                                {mainPage.builtForIntelligence.title}
                            </h2>
                            <p className="text-2xl opacity-90">
                                {mainPage.builtForIntelligence.subtitle}
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                            <div className="bg-white bg-opacity-10 rounded-lg p-6">
                                <h3 className="text-2xl font-semibold mb-2 text-green-300">
                                    {mainPage.builtForIntelligence.runSmarter}
                                </h3>
                            </div>
                            <div className="bg-white bg-opacity-10 rounded-lg p-6">
                                <h3 className="text-2xl font-semibold mb-2 text-green-300">
                                    {mainPage.builtForIntelligence.operateWithConfidence}
                                </h3>
                            </div>
                            <div className="bg-white bg-opacity-10 rounded-lg p-6">
                                <h3 className="text-2xl font-semibold mb-2 text-green-300">
                                    {mainPage.builtForIntelligence.scaleWithoutUncertainty}
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tagline Section */}
            {mainPage?.tagline && (
                <div className="bg-green-600 text-white py-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <p className="text-2xl font-semibold italic">
                            {mainPage.tagline}
                        </p>
                    </div>
                </div>
            )}

            {/* CTA Buttons Section */}
            {mainPage?.ctaButtons && mainPage.ctaButtons.length > 0 && (
                <div className="bg-gray-50 py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col space-y-4 max-w-2xl ml-auto">
                            {mainPage.ctaButtons.map((cta: any, index: number) => (
                                <a
                                    key={index}
                                    href={cta.href}
                                    className="group relative bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                                    style={{
                                        clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 100%, 0 100%)'
                                    }}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-lg font-semibold">{cta.text}</span>
                                        {cta.icon && (
                                            <span className="text-2xl ml-4 group-hover:translate-x-1 transition-transform duration-300">
                                                {cta.icon}
                                            </span>
                                        )}
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Buttons Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Explore Grid Intel Features
                    </h2>
                    <p className="text-xl text-gray-600">
                        Click on any section below to learn more about Grid Intel capabilities
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <button
                        onClick={() => openModal('productIntegration')}
                        className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 text-left border-2 border-transparent hover:border-green-500"
                    >
                        <div className="text-green-600 text-3xl mb-4">🔗</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Product Integration</h3>
                        <p className="text-gray-600">Discover how GRID-INTEL™ integrates with various energy systems</p>
                    </button>

                    <button
                        onClick={() => openModal('technologyStack')}
                        className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 text-left border-2 border-transparent hover:border-green-500"
                    >
                        <div className="text-green-600 text-3xl mb-4">⚡</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Technology Stack Overview</h3>
                        <p className="text-gray-600">Explore the advanced technology powering our intelligent systems</p>
                    </button>

                    <button
                        onClick={() => openModal('scenarios')}
                        className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 text-left border-2 border-transparent hover:border-green-500"
                    >
                        <div className="text-green-600 text-3xl mb-4">🏗️</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Built for These Scenarios</h3>
                        <p className="text-gray-600">See where GRID-INTEL™ is already making a difference</p>
                    </button>

                    <button
                        onClick={() => openModal('whyDifferent')}
                        className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 text-left border-2 border-transparent hover:border-green-500"
                    >
                        <div className="text-green-600 text-3xl mb-4">🎯</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Why GRID-INTEL™ is Different</h3>
                        <p className="text-gray-600">Compare our solution with conventional controllers</p>
                    </button>

                    <button
                        onClick={() => openModal('whatSolves')}
                        className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 text-left border-2 border-transparent hover:border-green-500"
                    >
                        <div className="text-green-600 text-3xl mb-4">💡</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">What GRID-INTEL™ Solves</h3>
                        <p className="text-gray-600">Learn about the problems we solve with embedded intelligence</p>
                    </button>

                    <button
                        onClick={() => openModal('challenge')}
                        className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 text-left border-2 border-transparent hover:border-green-500"
                    >
                        <div className="text-green-600 text-3xl mb-4">⚠️</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">The Challenge</h3>
                        <p className="text-gray-600">Understand the energy challenges we're addressing</p>
                    </button>
                </div>
            </div>

            {/* Modal Overlay */}
            {activeModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-bold text-gray-900">
                                    {activeModal === 'productIntegration' && 'Product Integration'}
                                    {activeModal === 'technologyStack' && 'Technology Stack Overview'}
                                    {activeModal === 'scenarios' && 'Built for These Scenarios'}
                                    {activeModal === 'whyDifferent' && 'Why GRID-INTEL™ is Different'}
                                    {activeModal === 'whatSolves' && 'What GRID-INTEL™ Solves'}
                                    {activeModal === 'challenge' && 'The Challenge'}
                                </h3>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                                >
                                    ×
                                </button>
                            </div>
                            
                            {/* Modal Content */}
                            <div className="space-y-6">
                                {activeModal === 'productIntegration' && gridIntelData.productIntegration && (
                                    <div>
                                        <h4 className="text-xl font-semibold mb-4">{gridIntelData.productIntegration.subtitle}</h4>
                                        <p className="text-gray-700 mb-6">{gridIntelData.productIntegration.description}</p>
                                        
                                        {gridIntelData.productIntegration.image?.src && (
                                            <div className="mb-6">
                                                <img
                                                    src={gridIntelData.productIntegration.image.src}
                                                    alt={gridIntelData.productIntegration.image.alt || 'Product Integration'}
                                                    className="w-full h-auto rounded-lg shadow-lg"
                                                />
                                            </div>
                                        )}

                                        {gridIntelData.productIntegration.items && gridIntelData.productIntegration.items.length > 0 && (
                                            <div className="space-y-4">
                                                {gridIntelData.productIntegration.items.map((item: any, index: number) => (
                                                    <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                                                        <span className="text-2xl">{item.icon}</span>
                                                        <div>
                                                            <h5 className="font-semibold text-gray-900 mb-2">{item.title}</h5>
                                                            <p className="text-gray-700">{item.description}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {gridIntelData.productIntegration.tagline && (
                                            <div className="mt-6 p-4 bg-green-50 rounded-lg">
                                                <p className="text-green-800 font-semibold italic text-center">
                                                    {gridIntelData.productIntegration.tagline}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Technology Stack Modal */}
                                {activeModal === 'technologyStack' && gridIntelData.technologyStack && (
                                    <div>
                                        <h4 className="text-xl font-semibold mb-4">{gridIntelData.technologyStack.subtitle}</h4>
                                        <p className="text-gray-700 mb-6">{gridIntelData.technologyStack.description}</p>
                                        
                                        {gridIntelData.technologyStack.image?.src && (
                                            <div className="mb-6">
                                                <img
                                                    src={gridIntelData.technologyStack.image.src}
                                                    alt={gridIntelData.technologyStack.image.alt || 'Technology Stack'}
                                                    className="w-full h-auto rounded-lg shadow-lg"
                                                />
                                            </div>
                                        )}

                                        {gridIntelData.technologyStack.features && gridIntelData.technologyStack.features.length > 0 && (
                                            <div className="space-y-3">
                                                {gridIntelData.technologyStack.features.map((feature: any, index: number) => (
                                                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                                        {feature.icon?.src ? (
                                                            <img 
                                                                src={feature.icon.src} 
                                                                alt={feature.icon.alt || 'Feature icon'} 
                                                                className="w-6 h-6 object-contain"
                                                            />
                                                        ) : (
                                                            <span className="text-green-600 text-xl">⚡</span>
                                                        )}
                                                        <span className="text-gray-700">{feature.text}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Scenarios Modal */}
                                {activeModal === 'scenarios' && gridIntelData.scenarios && (
                                    <div>
                                        <h4 className="text-xl font-semibold mb-4">{gridIntelData.scenarios.subtitle}</h4>
                                        <p className="text-gray-700 mb-6">{gridIntelData.scenarios.description}</p>
                                        
                                        {gridIntelData.scenarios.image?.src && (
                                            <div className="mb-6">
                                                <img
                                                    src={gridIntelData.scenarios.image.src}
                                                    alt={gridIntelData.scenarios.image.alt || 'Scenarios'}
                                                    className="w-full h-auto rounded-lg shadow-lg"
                                                />
                                            </div>
                                        )}

                                        {gridIntelData.scenarios.scenarios && gridIntelData.scenarios.scenarios.length > 0 && (
                                            <div className="space-y-3">
                                                {gridIntelData.scenarios.scenarios.map((scenario: any, index: number) => (
                                                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                                        {scenario.icon?.src ? (
                                                            <img 
                                                                src={scenario.icon.src} 
                                                                alt={scenario.icon.alt || 'Scenario icon'} 
                                                                className="w-6 h-6 object-contain"
                                                            />
                                                        ) : (
                                                            <span className="text-green-600 text-xl">⚡</span>
                                                        )}
                                                        <span className="text-gray-700">{scenario.text}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {gridIntelData.scenarios.tagline && (
                                            <div className="mt-6 p-4 bg-green-50 rounded-lg">
                                                <p className="text-green-800 font-semibold italic text-center">
                                                    {gridIntelData.scenarios.tagline}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Why Different Modal */}
                                {activeModal === 'whyDifferent' && gridIntelData.whyDifferent && (
                                    <div>
                                        <h4 className="text-xl font-semibold mb-4">{gridIntelData.whyDifferent.subtitle}</h4>
                                        <p className="text-gray-700 mb-6">{gridIntelData.whyDifferent.description}</p>
                                        
                                        {gridIntelData.whyDifferent.comparisonTable && gridIntelData.whyDifferent.comparisonTable.length > 0 && (
                                            <div className="overflow-x-auto">
                                                <table className="w-full border-collapse border border-gray-300 rounded-lg">
                                                    <thead>
                                                        <tr className="bg-gray-50">
                                                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Feature</th>
                                                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-green-600">GRID-INTEL™</th>
                                                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-600">Conventional Controllers</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {gridIntelData.whyDifferent.comparisonTable.map((comparison: any, index: number) => (
                                                            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                                <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">{comparison.feature}</td>
                                                                <td className="border border-gray-300 px-4 py-3 text-green-700">{comparison.gridIntel}</td>
                                                                <td className="border border-gray-300 px-4 py-3 text-gray-600">{comparison.conventional}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* What Solves Modal */}
                                {activeModal === 'whatSolves' && gridIntelData.whatSolves && (
                                    <div>
                                        <h4 className="text-xl font-semibold mb-4">{gridIntelData.whatSolves.subtitle}</h4>
                                        <p className="text-gray-700 mb-6">{gridIntelData.whatSolves.description}</p>
                                        
                                        {gridIntelData.whatSolves.solutions && gridIntelData.whatSolves.solutions.length > 0 && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                                {gridIntelData.whatSolves.solutions.map((solution: any, index: number) => (
                                                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                                                        <div className="flex items-start space-x-3">
                                                            {solution.icon?.src ? (
                                                                <img 
                                                                    src={solution.icon.src} 
                                                                    alt={solution.icon.alt || 'Solution icon'} 
                                                                    className="w-8 h-8 object-contain mt-1"
                                                                />
                                                            ) : (
                                                                <span className="text-green-600 text-2xl">⚡</span>
                                                            )}
                                                            <div>
                                                                <h5 className="font-semibold text-gray-900 mb-2">{solution.title}</h5>
                                                                <p className="text-gray-700 text-sm">{solution.description}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {gridIntelData.whatSolves.tagline && (
                                            <div className="mt-6 p-4 bg-green-50 rounded-lg">
                                                <p className="text-green-800 font-semibold italic text-center">
                                                    {gridIntelData.whatSolves.tagline}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Challenge Modal */}
                                {activeModal === 'challenge' && gridIntelData.challenge && (
                                    <div>
                                        <h4 className="text-xl font-semibold mb-4">{gridIntelData.challenge.subtitle}</h4>
                                        <p className="text-gray-700 mb-6">{gridIntelData.challenge.description}</p>
                                        
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
                                            {gridIntelData.challenge.image?.src && (
                                                <div>
                                                    <img
                                                        src={gridIntelData.challenge.image.src}
                                                        alt={gridIntelData.challenge.image.alt || 'Challenge'}
                                                        className="w-full h-auto rounded-lg shadow-lg"
                                                    />
                                                </div>
                                            )}
                                            
                                            {gridIntelData.challenge.challenges && gridIntelData.challenge.challenges.length > 0 && (
                                                <div className="space-y-3">
                                                    {gridIntelData.challenge.challenges.map((challenge: any, index: number) => (
                                                        <div key={index} className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                                                            {challenge.icon?.src ? (
                                                                <img 
                                                                    src={challenge.icon.src} 
                                                                    alt={challenge.icon.alt || 'Challenge icon'} 
                                                                    className="w-6 h-6 object-contain"
                                                                />
                                                            ) : (
                                                                <span className="text-red-600 text-xl">⚡</span>
                                                            )}
                                                            <span className="text-gray-700">{challenge.text}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {gridIntelData.challenge.resultText && (
                                            <div className="p-4 bg-red-100 border-l-4 border-red-500 rounded-lg">
                                                <p className="text-red-800 font-semibold">
                                                    {gridIntelData.challenge.resultText}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}