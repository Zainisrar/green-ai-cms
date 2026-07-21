'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Loading from '@/components/layouts/loading';
import IconEdit from '@/components/icon/icon-edit';
import IconCheck from '@/components/icon/icon-checks';
import IconX from '@/components/icon/icon-x';
import IconArrowBackward from '@/components/icon/icon-arrow-backward';
import IconPlus from '@/components/icon/icon-plus';
import IconTrash from '@/components/icon/icon-trash';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import ImageUploading, { ImageListType } from 'react-images-uploading';
import { useImageUpload } from '../../explore/about-us/hooks/useImageUpload';
import { useUpdateCertificationsAccreditations } from './hooks/useUpdateCertificationsAccreditations';
import MediaPicker from '@/components/apps/media/MediaPicker';
import { navigationApi, navigationKeys } from '@/lib/api/navigation';

async function fetchCertificationsAccreditations(): Promise<any | null> {
    try {
        const response = await fetch('/api/evolution/certifications-accreditations');
        if (response.ok) {
            const data = await response.json();
            return data;
        }
        return null;
    } catch (error) {
        console.error('Error fetching certifications accreditations:', error);
        throw error;
    }
}

export default function CertificationsAccreditationsBase() {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<any>(null);
    const [logoImages, setLogoImages] = useState<any[]>([]);
    const [cert1Images, setCert1Images] = useState<any[]>([]);
    const [cert2Images, setCert2Images] = useState<any[]>([]);
    const [cert3Images, setCert3Images] = useState<any[]>([]);
    const { uploadImage, isUploading } = useImageUpload();
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [mediaPickerTarget, setMediaPickerTarget] = useState<'logo' | 'cert1' | 'cert2' | 'cert3' | null>(null);
    const [ctaLinkType, setCtaLinkType] = useState<'navigation' | 'manual'>('manual');

    // Fetch navigation items for CTA links
    const { data: navigationItems } = useQuery({
        queryKey: navigationKeys.lists(),
        queryFn: () => navigationApi.getAll(),
    });

    // Flatten navigation items to include all sub-navigation items
    const flattenNavItems = (items: any[]): any[] => {
        if (!items) return [];
        const flattened: any[] = [];
        
        const traverse = (navItems: any[], parentName?: string) => {
            navItems.forEach((item) => {
                const displayName = parentName ? `${parentName} > ${item.name}` : item.name;
                flattened.push({
                    ...item,
                    displayName,
                });
                if (item.children && item.children.length > 0) {
                    traverse(item.children, displayName);
                }
            });
        };
        
        traverse(items);
        return flattened;
    };

    const allNavItems = flattenNavItems(navigationItems || []);

    const {
        data: certificationsData,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['evolution-certifications-accreditations'],
        queryFn: fetchCertificationsAccreditations,
    });

    const updateMutation = useUpdateCertificationsAccreditations();

    useEffect(() => {
        if (certificationsData) {
            setEditData({
                title: certificationsData.title,
                tagline: certificationsData.tagline,
                certificate1: certificationsData.certificate1 || '',
                certificate2: certificationsData.certificate2 || '',
                certificate3: certificationsData.certificate3 || '',
                esgSection: certificationsData.esgSection,
                isoSection: certificationsData.isoSection,
                cleanEnergySection: certificationsData.cleanEnergySection,
                cta: certificationsData.cta || { text: '', link: '' },
            });
        }
    }, [certificationsData]);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        if (certificationsData) {
            setEditData({
                title: certificationsData.title,
                tagline: certificationsData.tagline,
                certificate1: certificationsData.certificate1 || '',
                certificate2: certificationsData.certificate2 || '',
                certificate3: certificationsData.certificate3 || '',
                esgSection: certificationsData.esgSection,
                isoSection: certificationsData.isoSection,
                cleanEnergySection: certificationsData.cleanEnergySection,
                cta: certificationsData.cta || { text: '', link: '' },
            });
        }
        setLogoImages([]);
        setCert1Images([]);
        setCert2Images([]);
        setCert3Images([]);
    };

    const handleSave = async () => {
        if (!editData) return;

        try {
            const payload = certificationsData?.id 
                ? { id: certificationsData.id, data: editData }
                : { data: editData };
            
            await updateMutation.mutateAsync(payload);
            setIsEditing(false);
            setLogoImages([]);
            setCert1Images([]);
            setCert2Images([]);
            setCert3Images([]);

            Swal.fire({
                title: 'Success!',
                text: 'Certifications & Accreditations updated successfully',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
            });
        } catch (error) {
            console.error('Error updating certifications:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to update certifications & accreditations',
                icon: 'error',
            });
        }
    };

    const handleBack = () => {
        router.back();
    };

    // Handle logo image upload
    const handleLogoImageChange = async (imageList: ImageListType) => {
        setLogoImages(imageList);

        if (imageList.length > 0 && imageList[0].file) {
            try {
                const result = await uploadImage(imageList[0].file, 'evolution/certifications/clean-energy-logo');
                setEditData({
                    ...editData,
                    cleanEnergySection: {
                        ...editData.cleanEnergySection,
                        logo: {
                            ...editData.cleanEnergySection.logo,
                            src: result.url,
                        },
                    },
                });

                Swal.fire({
                    title: 'Success!',
                    text: 'Logo uploaded successfully',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                });
            } catch (error) {
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to upload logo',
                    icon: 'error',
                });
                setLogoImages([]);
            }
        }
    };

    // Handle certificate 1 image upload
    const handleCert1ImageChange = async (imageList: ImageListType) => {
        setCert1Images(imageList);

        if (imageList.length > 0 && imageList[0].file) {
            try {
                const result = await uploadImage(imageList[0].file, 'evolution/certifications/certificate1');
                setEditData({
                    ...editData,
                    certificate1: result.url,
                });

                Swal.fire({
                    title: 'Success!',
                    text: 'Certificate 1 image uploaded successfully',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                });
            } catch (error) {
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to upload certificate 1 image',
                    icon: 'error',
                });
                setCert1Images([]);
            }
        }
    };

    // Handle certificate 2 image upload
    const handleCert2ImageChange = async (imageList: ImageListType) => {
        setCert2Images(imageList);

        if (imageList.length > 0 && imageList[0].file) {
            try {
                const result = await uploadImage(imageList[0].file, 'evolution/certifications/certificate2');
                setEditData({
                    ...editData,
                    certificate2: result.url,
                });

                Swal.fire({
                    title: 'Success!',
                    text: 'Certificate 2 image uploaded successfully',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                });
            } catch (error) {
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to upload certificate 2 image',
                    icon: 'error',
                });
                setCert2Images([]);
            }
        }
    };

    // Handle certificate 3 image upload
    const handleCert3ImageChange = async (imageList: ImageListType) => {
        setCert3Images(imageList);

        if (imageList.length > 0 && imageList[0].file) {
            try {
                const result = await uploadImage(imageList[0].file, 'evolution/certifications/certificate3');
                setEditData({
                    ...editData,
                    certificate3: result.url,
                });

                Swal.fire({
                    title: 'Success!',
                    text: 'Certificate 3 image uploaded successfully',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                });
            } catch (error) {
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to upload certificate 3 image',
                    icon: 'error',
                });
                setCert3Images([]);
            }
        }
    };

    // Open media picker
    const openMediaPicker = (target: 'logo' | 'cert1' | 'cert2' | 'cert3') => {
        setMediaPickerTarget(target);
        setShowMediaPicker(true);
    };

    // Handle media selection from picker
    const handleMediaSelect = (url: string, file?: any) => {
        if (!mediaPickerTarget) return;

        switch (mediaPickerTarget) {
            case 'logo':
                setEditData({
                    ...editData,
                    cleanEnergySection: {
                        ...editData.cleanEnergySection,
                        logo: { ...editData.cleanEnergySection.logo, src: url },
                    },
                });
                break;
            case 'cert1':
                setEditData({ ...editData, certificate1: url });
                break;
            case 'cert2':
                setEditData({ ...editData, certificate2: url });
                break;
            case 'cert3':
                setEditData({ ...editData, certificate3: url });
                break;
        }

        setShowMediaPicker(false);
        setMediaPickerTarget(null);
    };

    // Handle ESG points
    const addESGPoint = () => {
        setEditData({
            ...editData,
            esgSection: {
                ...editData.esgSection,
                points: [...editData.esgSection.points, ''],
            },
        });
    };

    const removeESGPoint = (index: number) => {
        const newPoints = editData.esgSection.points.filter((_: any, i: number) => i !== index);
        setEditData({
            ...editData,
            esgSection: {
                ...editData.esgSection,
                points: newPoints,
            },
        });
    };

    const updateESGPoint = (index: number, value: string) => {
        const newPoints = [...editData.esgSection.points];
        newPoints[index] = value;
        setEditData({
            ...editData,
            esgSection: {
                ...editData.esgSection,
                points: newPoints,
            },
        });
    };

    // Handle certificates
    const addCertificate = () => {
        setEditData({
            ...editData,
            isoSection: {
                ...editData.isoSection,
                certificates: [
                    ...editData.isoSection.certificates,
                    { name: '', year: '', title: '', description: '' },
                ],
            },
        });
    };

    const removeCertificate = (index: number) => {
        const newCertificates = editData.isoSection.certificates.filter((_: any, i: number) => i !== index);
        setEditData({
            ...editData,
            isoSection: {
                ...editData.isoSection,
                certificates: newCertificates,
            },
        });
    };

    const updateCertificate = (index: number, field: string, value: string) => {
        const newCertificates = [...editData.isoSection.certificates];
        newCertificates[index] = { ...newCertificates[index], [field]: value };
        setEditData({
            ...editData,
            isoSection: {
                ...editData.isoSection,
                certificates: newCertificates,
            },
        });
    };

    if (isLoading) {
        return <Loading />;
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-lg text-red-600">Error loading certifications & accreditations</div>
            </div>
        );
    }

    if (!certificationsData && !isEditing) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="text-lg mb-4">No certifications & accreditations found</div>
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            setEditData({
                                title: 'CERTIFICATIONS & ACCREDITATIONS',
                                tagline: 'Setting the Benchmark for Excellence.',
                                certificate1: '',
                                certificate2: '',
                                certificate3: '',
                                esgSection: {
                                    heading: 'Environmental, Social, and Governance (ESG)',
                                    description: '',
                                    points: [],
                                },
                                isoSection: {
                                    heading: 'ISO Standards',
                                    description: '',
                                    certificate1: { src: '', alt: '' },
                                    certificate2: { src: '', alt: '' },
                                    certificate3: { src: '', alt: '' },
                                    certificate4: { src: '', alt: '' },
                                    certificates: [],
                                },
                                cleanEnergySection: {
                                    heading: 'Clean Energy Council',
                                    description: '',
                                    logo: { src: '', alt: '' },
                                },
                                cta: { text: '', link: '' },
                            });
                            setIsEditing(true);
                        }}
                    >
                        Create Certifications & Accreditations
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="panel">
            <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button type="button" className="btn btn-outline-primary btn-sm" onClick={handleBack}>
                        <IconArrowBackward className="h-4 w-4 mr-1" />
                        Back
                    </button>
                    <h5 className="text-lg font-semibold dark:text-white-light">Certifications & Accreditations</h5>
                </div>
                <div className="flex items-center gap-2">
                    {!isEditing ? (
                        <button type="button" className="btn btn-primary btn-sm" onClick={handleEdit}>
                            <IconEdit className="h-4 w-4 mr-1" />
                            Edit
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button type="button" className="btn btn-success btn-sm" onClick={handleSave} disabled={updateMutation.isPending}>
                                <IconCheck className="h-4 w-4 mr-1" />
                                {updateMutation.isPending ? 'Saving...' : 'Save'}
                            </button>
                            <button type="button" className="btn btn-outline-danger btn-sm" onClick={handleCancel}>
                                <IconX className="h-4 w-4 mr-1" />
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-6">
                {/* Header Information */}
                <div className="panel">
                    <h6 className="text-lg font-semibold mb-4">Header Information</h6>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="form-label">Title</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    className="form-input"
                                    value={editData?.title || ''}
                                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                                    placeholder="Main title"
                                />
                            ) : (
                                <div className="form-input bg-gray-100">{certificationsData?.title}</div>
                            )}
                        </div>
                        <div>
                            <label className="form-label">Tagline</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    className="form-input"
                                    value={editData?.tagline || ''}
                                    onChange={(e) => setEditData({ ...editData, tagline: e.target.value })}
                                    placeholder="Tagline"
                                />
                            ) : (
                                <div className="form-input bg-gray-100">{certificationsData?.tagline}</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ESG Section */}
                <div className="panel">
                    <h6 className="text-lg font-semibold mb-4">ESG Section</h6>
                    <div className="space-y-4">
                        <div>
                            <label className="form-label">Heading</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    className="form-input"
                                    value={editData?.esgSection?.heading || ''}
                                    onChange={(e) =>
                                        setEditData({
                                            ...editData,
                                            esgSection: { ...editData.esgSection, heading: e.target.value },
                                        })
                                    }
                                />
                            ) : (
                                <div className="form-input bg-gray-100">{certificationsData?.esgSection?.heading}</div>
                            )}
                        </div>
                        <div>
                            <label className="form-label">Description</label>
                            {isEditing ? (
                                <textarea
                                    className="form-textarea"
                                    rows={4}
                                    value={editData?.esgSection?.description || ''}
                                    onChange={(e) =>
                                        setEditData({
                                            ...editData,
                                            esgSection: { ...editData.esgSection, description: e.target.value },
                                        })
                                    }
                                />
                            ) : (
                                <div className="form-textarea bg-gray-100 min-h-[100px] p-3">{certificationsData?.esgSection?.description}</div>
                            )}
                        </div>
                        
                        {/* ESG Points */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="form-label">ESG Points</label>
                                {isEditing && (
                                    <button type="button" className="btn btn-outline-primary btn-sm" onClick={addESGPoint}>
                                        <IconPlus className="h-4 w-4 mr-1" />
                                        Add Point
                                    </button>
                                )}
                            </div>
                            <div className="space-y-2">
                                {(isEditing ? editData?.esgSection?.points : certificationsData?.esgSection?.points)?.map((point: string, index: number) => (
                                    <div key={index} className="flex items-center gap-2">
                                        {isEditing ? (
                                            <>
                                                <input
                                                    type="text"
                                                    className="form-input flex-1"
                                                    value={point}
                                                    onChange={(e) => updateESGPoint(index, e.target.value)}
                                                    placeholder={`ESG Point ${index + 1}`}
                                                />
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-danger btn-sm"
                                                    onClick={() => removeESGPoint(index)}
                                                >
                                                    <IconTrash className="h-4 w-4" />
                                                </button>
                                            </>
                                        ) : (
                                            <div className="form-input bg-gray-100 flex-1">{point}</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ISO Section */}
                <div className="panel">
                    <h6 className="text-lg font-semibold mb-4">ISO Standards Section</h6>
                    <div className="space-y-4">
                        <div>
                            <label className="form-label">Heading</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    className="form-input"
                                    value={editData?.isoSection?.heading || ''}
                                    onChange={(e) =>
                                        setEditData({
                                            ...editData,
                                            isoSection: { ...editData.isoSection, heading: e.target.value },
                                        })
                                    }
                                />
                            ) : (
                                <div className="form-input bg-gray-100">{certificationsData?.isoSection?.heading}</div>
                            )}
                        </div>
                        <div>
                            <label className="form-label">Description</label>
                            {isEditing ? (
                                <textarea
                                    className="form-textarea"
                                    rows={4}
                                    value={editData?.isoSection?.description || ''}
                                    onChange={(e) =>
                                        setEditData({
                                            ...editData,
                                            isoSection: { ...editData.isoSection, description: e.target.value },
                                        })
                                    }
                                />
                            ) : (
                                <div className="form-textarea bg-gray-100 min-h-[100px] p-3">{certificationsData?.isoSection?.description}</div>
                            )}
                        </div>

                        {/* Certificate Images */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Certificate 1 */}
                            <div>
                                <label className="form-label">Certificate 1 Image</label>
                                {isEditing ? (
                                    <div className="space-y-3">
                                        {editData?.certificate1 && (
                                            <div className="border rounded p-2">
                                                <img src={editData.certificate1} alt="Certificate 1" className="w-full h-32 object-contain rounded mb-2" />
                                                <div className="flex items-center justify-between">
                                                    <p className="text-xs text-gray-600 truncate flex-1">{editData.certificate1}</p>
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditData({ ...editData, certificate1: '' })}
                                                        className="btn btn-danger btn-xs ml-2"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => openMediaPicker('cert1')}
                                            className="btn btn-outline-primary btn-sm w-full"
                                        >
                                            Browse Media
                                        </button>
                                        <ImageUploading value={cert1Images} onChange={handleCert1ImageChange} maxNumber={1} dataURLKey="dataURL">
                                            {({ onImageUpload, isDragging, dragProps }) => (
                                                <button
                                                    type="button"
                                                    className={`btn btn-outline-primary btn-sm w-full ${isDragging ? 'bg-blue-100' : ''}`}
                                                    onClick={onImageUpload}
                                                    {...dragProps}
                                                    disabled={isUploading}
                                                >
                                                    {isUploading ? 'Uploading...' : 'Upload Certificate 1'}
                                                </button>
                                            )}
                                        </ImageUploading>

                                        <div>
                                            <label className="form-label text-sm">Or enter URL manually</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={editData?.certificate1 || ''}
                                                onChange={(e) =>
                                                    setEditData({
                                                        ...editData,
                                                        certificate1: e.target.value,
                                                    })
                                                }
                                                placeholder="Certificate 1 image URL"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="border rounded p-2">
                                        {certificationsData?.certificate1 ? (
                                            <>
                                                <img src={certificationsData.certificate1} alt="Certificate 1" className="w-full h-32 object-contain rounded mb-2" />
                                                <p className="text-xs text-gray-600 truncate">{certificationsData.certificate1}</p>
                                            </>
                                        ) : (
                                            <div className="text-gray-500 text-center py-8">No image</div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Certificate 2 */}
                            <div>
                                <label className="form-label">Certificate 2 Image</label>
                                {isEditing ? (
                                    <div className="space-y-3">
                                        {editData?.certificate2 && (
                                            <div className="border rounded p-2">
                                                <img src={editData.certificate2} alt="Certificate 2" className="w-full h-32 object-contain rounded mb-2" />
                                                <div className="flex items-center justify-between">
                                                    <p className="text-xs text-gray-600 truncate flex-1">{editData.certificate2}</p>
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditData({ ...editData, certificate2: '' })}
                                                        className="btn btn-danger btn-xs ml-2"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => openMediaPicker('cert2')}
                                            className="btn btn-outline-primary btn-sm w-full"
                                        >
                                            Browse Media
                                        </button>
                                        <ImageUploading value={cert2Images} onChange={handleCert2ImageChange} maxNumber={1} dataURLKey="dataURL">
                                            {({ onImageUpload, isDragging, dragProps }) => (
                                                <button
                                                    type="button"
                                                    className={`btn btn-outline-primary btn-sm w-full ${isDragging ? 'bg-blue-100' : ''}`}
                                                    onClick={onImageUpload}
                                                    {...dragProps}
                                                    disabled={isUploading}
                                                >
                                                    {isUploading ? 'Uploading...' : 'Upload Certificate 2'}
                                                </button>
                                            )}
                                        </ImageUploading>

                                        <div>
                                            <label className="form-label text-sm">Or enter URL manually</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={editData?.certificate2 || ''}
                                                onChange={(e) =>
                                                    setEditData({
                                                        ...editData,
                                                        certificate2: e.target.value,
                                                    })
                                                }
                                                placeholder="Certificate 2 image URL"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="border rounded p-2">
                                        {certificationsData?.certificate2 ? (
                                            <>
                                                <img src={certificationsData.certificate2} alt="Certificate 2" className="w-full h-32 object-contain rounded mb-2" />
                                                <p className="text-xs text-gray-600 truncate">{certificationsData.certificate2}</p>
                                            </>
                                        ) : (
                                            <div className="text-gray-500 text-center py-8">No image</div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Certificate 3 */}
                            <div>
                                <label className="form-label">Certificate 3 Image</label>
                                {isEditing ? (
                                    <div className="space-y-3">
                                        {editData?.certificate3 && (
                                            <div className="border rounded p-2">
                                                <img src={editData.certificate3} alt="Certificate 3" className="w-full h-32 object-contain rounded mb-2" />
                                                <div className="flex items-center justify-between">
                                                    <p className="text-xs text-gray-600 truncate flex-1">{editData.certificate3}</p>
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditData({ ...editData, certificate3: '' })}
                                                        className="btn btn-danger btn-xs ml-2"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => openMediaPicker('cert3')}
                                            className="btn btn-outline-primary btn-sm w-full"
                                        >
                                            Browse Media
                                        </button>
                                        <ImageUploading value={cert3Images} onChange={handleCert3ImageChange} maxNumber={1} dataURLKey="dataURL">
                                            {({ onImageUpload, isDragging, dragProps }) => (
                                                <button
                                                    type="button"
                                                    className={`btn btn-outline-primary btn-sm w-full ${isDragging ? 'bg-blue-100' : ''}`}
                                                    onClick={onImageUpload}
                                                    {...dragProps}
                                                    disabled={isUploading}
                                                >
                                                    {isUploading ? 'Uploading...' : 'Upload Certificate 3'}
                                                </button>
                                            )}
                                        </ImageUploading>

                                        <div>
                                            <label className="form-label text-sm">Or enter URL manually</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={editData?.certificate3 || ''}
                                                onChange={(e) =>
                                                    setEditData({
                                                        ...editData,
                                                        certificate3: e.target.value,
                                                    })
                                                }
                                                placeholder="Certificate 3 image URL"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="border rounded p-2">
                                        {certificationsData?.certificate3 ? (
                                            <>
                                                <img src={certificationsData.certificate3} alt="Certificate 3" className="w-full h-32 object-contain rounded mb-2" />
                                                <p className="text-xs text-gray-600 truncate">{certificationsData.certificate3}</p>
                                            </>
                                        ) : (
                                            <div className="text-gray-500 text-center py-8">No image</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Certificates */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="form-label">Certificates</label>
                                {isEditing && (
                                    <button type="button" className="btn btn-outline-primary btn-sm" onClick={addCertificate}>
                                        <IconPlus className="h-4 w-4 mr-1" />
                                        Add Certificate
                                    </button>
                                )}
                            </div>
                            <div className="space-y-4">
                                {(isEditing ? editData?.isoSection?.certificates : certificationsData?.isoSection?.certificates)?.map((cert: any, index: number) => (
                                    <div key={index} className="border rounded p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <h6 className="font-semibold">Certificate {index + 1}</h6>
                                            {isEditing && (
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-danger btn-sm"
                                                    onClick={() => removeCertificate(index)}
                                                >
                                                    <IconTrash className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <label className="form-label text-sm">Name</label>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        className="form-input"
                                                        value={cert.name}
                                                        onChange={(e) => updateCertificate(index, 'name', e.target.value)}
                                                    />
                                                ) : (
                                                    <div className="form-input bg-gray-100">{cert.name}</div>
                                                )}
                                            </div>
                                            <div>
                                                <label className="form-label text-sm">Year</label>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        className="form-input"
                                                        value={cert.year}
                                                        onChange={(e) => updateCertificate(index, 'year', e.target.value)}
                                                    />
                                                ) : (
                                                    <div className="form-input bg-gray-100">{cert.year}</div>
                                                )}
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="form-label text-sm">Title</label>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        className="form-input"
                                                        value={cert.title}
                                                        onChange={(e) => updateCertificate(index, 'title', e.target.value)}
                                                    />
                                                ) : (
                                                    <div className="form-input bg-gray-100">{cert.title}</div>
                                                )}
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="form-label text-sm">Description</label>
                                                {isEditing ? (
                                                    <textarea
                                                        className="form-textarea"
                                                        rows={3}
                                                        value={cert.description}
                                                        onChange={(e) => updateCertificate(index, 'description', e.target.value)}
                                                    />
                                                ) : (
                                                    <div className="form-textarea bg-gray-100 min-h-[80px] p-3">{cert.description}</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Clean Energy Section */}
                <div className="panel">
                    <h6 className="text-lg font-semibold mb-4">Clean Energy Council Section</h6>
                    <div className="space-y-4">
                        <div>
                            <label className="form-label">Heading</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    className="form-input"
                                    value={editData?.cleanEnergySection?.heading || ''}
                                    onChange={(e) =>
                                        setEditData({
                                            ...editData,
                                            cleanEnergySection: { ...editData.cleanEnergySection, heading: e.target.value },
                                        })
                                    }
                                />
                            ) : (
                                <div className="form-input bg-gray-100">{certificationsData?.cleanEnergySection?.heading}</div>
                            )}
                        </div>
                        <div>
                            <label className="form-label">Description</label>
                            {isEditing ? (
                                <textarea
                                    className="form-textarea"
                                    rows={3}
                                    value={editData?.cleanEnergySection?.description || ''}
                                    onChange={(e) =>
                                        setEditData({
                                            ...editData,
                                            cleanEnergySection: { ...editData.cleanEnergySection, description: e.target.value },
                                        })
                                    }
                                />
                            ) : (
                                <div className="form-textarea bg-gray-100 min-h-[80px] p-3">{certificationsData?.cleanEnergySection?.description}</div>
                            )}
                        </div>

                        {/* Logo */}
                        <div>
                            <label className="form-label">Logo</label>
                            {isEditing ? (
                                <div className="space-y-3">
                                    {editData?.cleanEnergySection?.logo?.src && (
                                        <div className="border rounded p-2">
                                            <img src={editData.cleanEnergySection.logo.src} alt="Logo" className="w-full h-32 object-contain rounded mb-2" />
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs text-gray-600 truncate flex-1">{editData.cleanEnergySection.logo.src}</p>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setEditData({
                                                            ...editData,
                                                            cleanEnergySection: {
                                                                ...editData.cleanEnergySection,
                                                                logo: { ...editData.cleanEnergySection.logo, src: '' },
                                                            },
                                                        })
                                                    }
                                                    className="btn btn-danger btn-xs ml-2"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => openMediaPicker('logo')}
                                        className="btn btn-outline-primary btn-sm w-full"
                                    >
                                        Browse Media
                                    </button>
                                    <ImageUploading value={logoImages} onChange={handleLogoImageChange} maxNumber={1} dataURLKey="dataURL">
                                        {({ onImageUpload, isDragging, dragProps }) => (
                                            <button
                                                type="button"
                                                className={`btn btn-outline-primary btn-sm w-full ${isDragging ? 'bg-blue-100' : ''}`}
                                                onClick={onImageUpload}
                                                {...dragProps}
                                                disabled={isUploading}
                                            >
                                                {isUploading ? 'Uploading...' : 'Upload Logo'}
                                            </button>
                                        )}
                                    </ImageUploading>

                                    <div className="grid grid-cols-1 gap-2">
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={editData?.cleanEnergySection?.logo?.src || ''}
                                            onChange={(e) =>
                                                setEditData({
                                                    ...editData,
                                                    cleanEnergySection: {
                                                        ...editData.cleanEnergySection,
                                                        logo: { ...editData.cleanEnergySection.logo, src: e.target.value },
                                                    },
                                                })
                                            }
                                            placeholder="Logo URL"
                                        />
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={editData?.cleanEnergySection?.logo?.alt || ''}
                                            onChange={(e) =>
                                                setEditData({
                                                    ...editData,
                                                    cleanEnergySection: {
                                                        ...editData.cleanEnergySection,
                                                        logo: { ...editData.cleanEnergySection.logo, alt: e.target.value },
                                                    },
                                                })
                                            }
                                            placeholder="Alt text"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="border rounded p-2">
                                    {certificationsData?.cleanEnergySection?.logo?.src ? (
                                        <>
                                            <img src={certificationsData.cleanEnergySection.logo.src} alt={certificationsData.cleanEnergySection.logo.alt} className="w-full h-32 object-contain rounded mb-2" />
                                            <p className="text-xs text-gray-600 truncate">{certificationsData.cleanEnergySection.logo.src}</p>
                                        </>
                                    ) : (
                                        <div className="text-gray-500 text-center py-8">No logo</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="panel">
                    <h6 className="text-lg font-semibold mb-4">Call to Action</h6>
                    <div className="space-y-4">
                        <div>
                            <label className="form-label">CTA Text</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    className="form-input"
                                    value={editData?.cta?.text || ''}
                                    onChange={(e) =>
                                        setEditData({
                                            ...editData,
                                            cta: { ...editData.cta, text: e.target.value },
                                        })
                                    }
                                    placeholder="Enter CTA button text"
                                />
                            ) : (
                                <div className="form-input bg-gray-100">{certificationsData?.cta?.text || 'No CTA text set'}</div>
                            )}
                        </div>
                        <div>
                            <label className="form-label">CTA Link</label>
                            {isEditing ? (
                                <div className="space-y-3">
                                    <div className="flex gap-4">
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="radio"
                                                name="ctaLinkType"
                                                value="navigation"
                                                checked={ctaLinkType === 'navigation'}
                                                onChange={(e) => setCtaLinkType(e.target.value as 'navigation' | 'manual')}
                                                className="form-radio mr-2"
                                            />
                                            <span>Navigation Item</span>
                                        </label>
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="radio"
                                                name="ctaLinkType"
                                                value="manual"
                                                checked={ctaLinkType === 'manual'}
                                                onChange={(e) => setCtaLinkType(e.target.value as 'navigation' | 'manual')}
                                                className="form-radio mr-2"
                                            />
                                            <span>Manual URL</span>
                                        </label>
                                    </div>

                                    {ctaLinkType === 'navigation' ? (
                                        <select
                                            className="form-select"
                                            value={editData?.cta?.link || ''}
                                            onChange={(e) =>
                                                setEditData({
                                                    ...editData,
                                                    cta: { ...editData.cta, link: e.target.value },
                                                })
                                            }
                                        >
                                            <option value="">Select navigation item</option>
                                            {allNavItems.map((item) => (
                                                <option key={item.path} value={item.path}>
                                                    {item.displayName}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type="url"
                                            className="form-input"
                                            value={editData?.cta?.link || ''}
                                            onChange={(e) =>
                                                setEditData({
                                                    ...editData,
                                                    cta: { ...editData.cta, link: e.target.value },
                                                })
                                            }
                                            placeholder="Enter CTA link URL"
                                        />
                                    )}
                                </div>
                            ) : (
                                <div className="form-input bg-gray-100">{certificationsData?.cta?.link || 'No CTA link set'}</div>
                            )}
                        </div>
                        {!isEditing && certificationsData?.cta?.text && certificationsData?.cta?.link && (
                            <div className="mt-4">
                                <a
                                    href={certificationsData.cta.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-primary"
                                >
                                    {certificationsData.cta.text}
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Media Picker Modal */}
            {showMediaPicker && (
                <MediaPicker
                    isOpen={showMediaPicker}
                    onSelect={handleMediaSelect}
                    onClose={() => setShowMediaPicker(false)}
                    title={
                        mediaPickerTarget === 'logo'
                            ? 'Select Logo'
                            : mediaPickerTarget === 'cert1'
                            ? 'Select Certificate 1 Image'
                            : mediaPickerTarget === 'cert2'
                            ? 'Select Certificate 2 Image'
                            : mediaPickerTarget === 'cert3'
                            ? 'Select Certificate 3 Image'
                            : 'Select Media'
                    }
                />
            )}
        </div>
    );
}