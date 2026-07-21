import React from 'react';
import CertificationsAccreditationsBase from './CertificationsAccreditationsBase';
import { getCertificationsAccreditations } from '@/lib/api/evolutionCertificationsAccreditations';

const CertificationsAccreditationsPage: React.FC = async () => {
    try {
        const data = await getCertificationsAccreditations();

        if (!data) {
            return (
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-600 mb-4">No Data Available</h2>
                        <p className="text-gray-600">Certifications and accreditations information is not available.</p>
                    </div>
                </div>
            );
        }

        return <CertificationsAccreditationsBase />;
    } catch (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Data</h2>
                    <p className="text-gray-600">Failed to load certifications and accreditations information.</p>
                </div>
            </div>
        );
    }
};

export default CertificationsAccreditationsPage;
