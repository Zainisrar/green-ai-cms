'use client';

import React, { useState, useEffect } from 'react';
import IconX from '@/components/icon/icon-x';
import IconSearch from '@/components/icon/icon-search';
import IconCamera from '@/components/icon/icon-camera';
import IconVideo from '@/components/icon/icon-video';
import IconFile from '@/components/icon/icon-file';
import IconLink from '@/components/icon/icon-link';
import IconCloudDownload from '@/components/icon/icon-cloud-download';
import Swal from 'sweetalert2';
import { apiClient } from '@/lib/api-client';

interface MediaFile {
    public_id: string;
    secure_url: string;
    resource_type: string;
    format: string;
    bytes: number;
    width?: number;
    height?: number;
    created_at: string;
    // Database file properties
    id?: number;
    originalFilename?: string;
    serverPath?: string;
    isDbFile?: boolean;
}

interface MediaPickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (url: string, file?: MediaFile) => void;
    allowedTypes?: ('image' | 'video' | 'raw')[];
    title?: string;
    allowUrlInput?: boolean;
}

const MediaPicker: React.FC<MediaPickerProps> = ({
    isOpen,
    onClose,
    onSelect,
    allowedTypes = ['image', 'video', 'raw'],
    title = 'Select Media',
    allowUrlInput = true,
}) => {
    const [activeTab, setActiveTab] = useState(0);
    const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
    const [filteredFiles, setFilteredFiles] = useState<MediaFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [urlInput, setUrlInput] = useState('');
    const [showUrlInput, setShowUrlInput] = useState(false);
    const [uploadFolder, setUploadFolder] = useState('media-library');
    const [hasMore, setHasMore] = useState(true);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    const tabs = [
        { name: 'Images', icon: IconCamera, type: 'image' },
        { name: 'Videos', icon: IconVideo, type: 'video' },
        { name: 'Files', icon: IconFile, type: 'raw' },
    ].filter(tab => allowedTypes.includes(tab.type as any));

    // Define functions BEFORE they're used in useEffect hooks
    const fetchMediaFiles = async (isInitial = false) => {
        if (isInitial) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }

        try {
            const resourceType = tabs[activeTab]?.type || 'image';
            
            if (resourceType === 'raw') {
                // For files tab, fetch both Cloudinary and database files
                const params = new URLSearchParams({
                    type: 'raw',
                    max_results: '50',
                });
                
                if (nextCursor && !isInitial) {
                    params.append('next_cursor', nextCursor);
                }

                const [cloudinaryResult, dbFilesResult] = await Promise.all([
                    apiClient.get(`/api/media/list?${params.toString()}`),
                    isInitial ? apiClient.get(`/api/media/documents?limit=100`) : Promise.resolve({ success: true, files: [] })
                ]);

                const cloudinaryFiles = cloudinaryResult.success ? cloudinaryResult.data.resources : [];
                
                // Only fetch DB files on initial load
                const dbFiles = isInitial && dbFilesResult.success ? dbFilesResult.files.map((file: any) => ({
                    public_id: file.cloudinaryPublicId || `db-${file.id}`,
                    secure_url: file.serverPath || file.cloudinaryUrl || '',
                    resource_type: 'raw',
                    format: file.fileExtension,
                    bytes: file.fileSize,
                    created_at: file.createdAt,
                    id: file.id,
                    originalFilename: file.originalFilename,
                    serverPath: file.serverPath,
                    isDbFile: true,
                })) : [];

                const newFiles = [...cloudinaryFiles, ...dbFiles];
                
                if (isInitial) {
                    newFiles.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                    setMediaFiles(newFiles);
                } else {
                    setMediaFiles(prev => [...prev, ...newFiles]);
                }

                setNextCursor(cloudinaryResult.data?.next_cursor || null);
                setHasMore(!!cloudinaryResult.data?.next_cursor);
            } else {
                // For images/videos, fetch from Cloudinary with pagination
                const params = new URLSearchParams({
                    type: resourceType,
                    max_results: '50',
                });

                if (nextCursor && !isInitial) {
                    params.append('next_cursor', nextCursor);
                }

                const result = await apiClient.get(`/api/media/list?${params.toString()}`);
                
                if (result.success) {
                    const newFiles = result.data.resources || [];
                    
                    if (isInitial) {
                        setMediaFiles(newFiles);
                    } else {
                        setMediaFiles(prev => [...prev, ...newFiles]);
                    }

                    setNextCursor(result.data.next_cursor || null);
                    setHasMore(!!result.data.next_cursor);
                }
            }
        } catch (error) {
            console.error('Failed to fetch media files:', error);
        } finally {
            if (isInitial) {
                setLoading(false);
            } else {
                setLoadingMore(false);
            }
        }
    };

    const handleLoadMore = () => {
        if (!loadingMore && hasMore && !isSearching) {
            fetchMediaFiles(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            setFilteredFiles(mediaFiles);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        setLoading(true);

        try {
            const resourceType = tabs[activeTab]?.type || 'image';
            
            // Search with a higher limit to get comprehensive results
            const params = new URLSearchParams({
                type: resourceType,
                max_results: '500',
                search: searchQuery,
            });

            const result = await apiClient.get(`/api/media/list?${params.toString()}`);
            
            if (result.success) {
                const searchResults = result.data.resources || [];
                
                // Also search in database files if on raw tab
                if (resourceType === 'raw') {
                    const dbResult = await apiClient.get(`/api/media/documents?search=${searchQuery}&limit=500`);
                    if (dbResult.success) {
                        const dbFiles = dbResult.files.map((file: any) => ({
                            public_id: file.cloudinaryPublicId || `db-${file.id}`,
                            secure_url: file.serverPath || file.cloudinaryUrl || '',
                            resource_type: 'raw',
                            format: file.fileExtension,
                            bytes: file.fileSize,
                            created_at: file.createdAt,
                            id: file.id,
                            originalFilename: file.originalFilename,
                            serverPath: file.serverPath,
                            isDbFile: true,
                        }));
                        searchResults.push(...dbFiles);
                    }
                }

                setFilteredFiles(searchResults);
            }
        } catch (error) {
            console.error('Search failed:', error);
            // Fallback to client-side search
            const filtered = mediaFiles.filter(file =>
                file.public_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                file.format?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                file.originalFilename?.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredFiles(filtered);
        } finally {
            setLoading(false);
        }
    };

    // Now define the useEffect hooks that use the functions above
    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            setMediaFiles([]);
            setFilteredFiles([]);
            setSearchQuery('');
            setNextCursor(null);
            setHasMore(true);
            setIsSearching(false);
            fetchMediaFiles(true); // true = initial load
        }
    }, [isOpen, activeTab]);

    useEffect(() => {
        if (searchQuery) {
            handleSearch();
        } else {
            setFilteredFiles(mediaFiles);
            setIsSearching(false);
        }
    }, [searchQuery, mediaFiles]);

    const handleFileUpload = async (files: FileList) => {
        setUploading(true);
        try {
            const resourceType = tabs[activeTab]?.type || 'image';
            const filesArray = Array.from(files);

            // Check if it's a document file (raw/files tab)
            const isDocumentUpload = resourceType === 'raw';

            if (isDocumentUpload) {
                // Upload documents to SERVER (not Cloudinary)
                const formData = new FormData();
                filesArray.forEach(file => {
                    formData.append('files', file);
                });
                formData.append('folder', uploadFolder);

                const response = await fetch('/api/media/upload-document', {
                    method: 'POST',
                    body: formData,
                });

                const result = await response.json();

                if (result.success && result.uploaded.length > 0) {
                    const firstFile = result.uploaded[0];
                    // Return server path, not Cloudinary URL
                    onSelect(firstFile.serverPath || firstFile.publicUrl);
                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 2000,
                        icon: 'success',
                        title: 'File uploaded to server!',
                    });
                    fetchMediaFiles(); // Refresh the list
                } else {
                    throw new Error(result.message || 'Upload failed');
                }
            } else {
                // Upload images/videos to CLOUDINARY
                const formData = new FormData();
                filesArray.forEach(file => {
                    formData.append('files', file);
                });
                formData.append('folder', uploadFolder);
                formData.append('resourceType', 'auto');

                const response = await fetch('/api/media/upload', {
                    method: 'POST',
                    body: formData,
                });

                const result = await response.json();

                if (result.success && result.data.files.length > 0) {
                    const firstFile = result.data.files[0];
                    onSelect(firstFile.url, firstFile);
                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 2000,
                        icon: 'success',
                        title: 'File uploaded!',
                    });
                    fetchMediaFiles(); // Refresh the list
                } else {
                    throw new Error(result.error || 'Upload failed');
                }
            }
        } catch (error: any) {
            console.error('Upload error:', error);
            Swal.fire('Error', error.message || 'Failed to upload file', 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleUrlSubmit = () => {
        if (!urlInput) {
            Swal.fire('Error', 'Please enter a valid URL', 'error');
            return;
        }

        onSelect(urlInput);
        setUrlInput('');
        setShowUrlInput(false);
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
            <div
                className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div>
                        <h3 className="text-xl font-semibold dark:text-white">{title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Click on any item to select it
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <IconX className="w-6 h-6" />
                    </button>
                </div>

                {/* Tabs and Actions */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
                        <div className="flex gap-2">
                            {tabs.map((tab, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveTab(index)}
                                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                                        activeTab === index
                                            ? 'bg-green-600 text-white'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                                    }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.name}
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            {allowUrlInput && (
                                <button
                                    onClick={() => setShowUrlInput(!showUrlInput)}
                                    className="btn btn-outline-primary btn-sm"
                                >
                                    <IconLink className="w-4 h-4 mr-2" />
                                    {showUrlInput ? 'Hide URL' : 'Add URL'}
                                </button>
                            )}
                            <label className="btn btn-primary btn-sm bg-green-600 hover:bg-green-700 border-green-600 cursor-pointer">
                                <IconCloudDownload className="w-4 h-4 mr-2" />
                                Upload
                                <input
                                    type="file"
                                    multiple
                                    accept={
                                        tabs[activeTab]?.type === 'image'
                                            ? 'image/*'
                                            : tabs[activeTab]?.type === 'video'
                                            ? 'video/*'
                                            : '*'
                                    }
                                    onChange={(e) => {
                                        if (e.target.files) {
                                            handleFileUpload(e.target.files);
                                        }
                                    }}
                                    className="hidden"
                                    disabled={uploading}
                                />
                            </label>
                        </div>
                    </div>

                    {/* URL Input */}
                    {showUrlInput && (
                        <div className="flex gap-2 mb-4">
                            <input
                                type="url"
                                className="form-input flex-1"
                                placeholder="Enter media URL..."
                                value={urlInput}
                                onChange={(e) => setUrlInput(e.target.value)}
                            />
                            <button onClick={handleUrlSubmit} className="btn btn-primary">
                                Use URL
                            </button>
                        </div>
                    )}

                    {/* Search */}
                    <div className="relative">
                        <input
                            type="text"
                            className="form-input pr-10"
                            placeholder="Search files... (searches across all files)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSearch();
                                }
                            }}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <IconSearch className="w-5 h-5 text-gray-400" />
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {uploading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto"></div>
                                <p className="text-gray-600 dark:text-gray-400 mt-4">Uploading...</p>
                            </div>
                        </div>
                    ) : loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600"></div>
                        </div>
                    ) : (filteredFiles.length === 0 && !isSearching) || (isSearching && filteredFiles.length === 0) ? (
                        <div className="text-center py-20">
                            <p className="text-gray-500 dark:text-gray-400">
                                {isSearching ? 'No files found matching your search' : 'No files found'}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {filteredFiles.map((file) => (
                                    <div
                                        key={file.public_id}
                                        onClick={() => onSelect(file.secure_url, file)}
                                        className="relative group border rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:ring-2 hover:ring-green-600"
                                    >
                                        <div className="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                            {file.resource_type === 'image' ? (
                                                <img
                                                    src={file.secure_url}
                                                    alt={file.public_id}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : file.resource_type === 'video' ? (
                                                <video src={file.secure_url} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="flex flex-col items-center justify-center p-4">
                                                    <IconFile className="w-8 h-8 text-gray-500" />
                                                    <span className="text-xs mt-2 text-gray-600 dark:text-gray-400 uppercase">
                                                        {file.format}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-2 bg-white dark:bg-gray-900">
                                            <p className="text-xs text-gray-600 dark:text-gray-400 truncate" title={file.originalFilename || file.public_id}>
                                                {file.originalFilename || file.public_id.split('/').pop()}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {formatFileSize(file.bytes)}
                                                {file.isDbFile && <span className="ml-1 text-blue-500">📄</span>}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Load More Button */}
                            {!isSearching && hasMore && (
                                <div className="flex justify-center mt-6">
                                    <button
                                        onClick={handleLoadMore}
                                        disabled={loadingMore}
                                        className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600"
                                    >
                                        {loadingMore ? (
                                            <>
                                                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                                                Loading...
                                            </>
                                        ) : (
                                            'Load More'
                                        )}
                                    </button>
                                </div>
                            )}

                            {isSearching && (
                                <div className="mt-4 text-center">
                                    <p className="text-sm text-gray-500">
                                        Showing {filteredFiles.length} search result(s)
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-end">
                        <button onClick={onClose} className="btn btn-outline-secondary">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MediaPicker;
