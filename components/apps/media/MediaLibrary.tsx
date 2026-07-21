'use client';

import React, { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import IconPlus from '@/components/icon/icon-plus';
import IconX from '@/components/icon/icon-x';
import IconTrash from '@/components/icon/icon-trash';
import IconDownload from '@/components/icon/icon-download';
import IconSearch from '@/components/icon/icon-search';
import IconFolder from '@/components/icon/icon-folder';
import IconCamera from '@/components/icon/icon-camera';
import IconVideo from '@/components/icon/icon-video';
import IconFile from '@/components/icon/icon-file';
import IconLink from '@/components/icon/icon-link';
import IconCloudDownload from '@/components/icon/icon-cloud-download';
import Swal from 'sweetalert2';
import { apiClient } from '@/lib/api-client';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

interface MediaFile {
    public_id: string;
    secure_url: string;
    resource_type: string;
    format: string;
    bytes: number;
    width?: number;
    height?: number;
    created_at: string;
    folder?: string;
    // Database file properties
    id?: number;
    originalFilename?: string;
    fileExtension?: string;
    mimeType?: string;
    category?: string;
    description?: string;
    isDbFile?: boolean; // Flag to distinguish database files from Cloudinary files
    serverPath?: string; // Path for server-stored files
}

interface Folder {
    name: string;
    path: string;
}

const MediaLibrary = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [allMediaFiles, setAllMediaFiles] = useState<MediaFile[]>([]); // Store all files
    const [displayedFiles, setDisplayedFiles] = useState<MediaFile[]>([]); // Paginated files to display
    const [filteredFiles, setFilteredFiles] = useState<MediaFile[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [selectedFolder, setSelectedFolder] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [uploadFolder, setUploadFolder] = useState('media-library');
    const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const itemsPerPage = 24; // Better for grid layout (4x6 or 6x4)

    const tabs = [
        { name: 'All', icon: IconFile, type: '' },
        { name: 'Images', icon: IconCamera, type: 'image' },
        { name: 'Videos', icon: IconVideo, type: 'video' },
        { name: 'Files', icon: IconFile, type: 'raw' },
    ];

    useEffect(() => {
        fetchFolders();
    }, []);

    useEffect(() => {
        // Reset to page 1 when tab or folder changes
        setCurrentPage(1);
        setAllMediaFiles([]);
        fetchMediaFiles();
    }, [activeTab, selectedFolder]);

    useEffect(() => {
        filterAndPaginateFiles();
        // Scroll to top when page changes
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [searchQuery, allMediaFiles, currentPage]);

    const fetchFolders = async () => {
        try {
            const result = await apiClient.get('/api/media/folders');
            if (result.success) {
                setFolders(result.data.folders.map((f: any) => ({
                    name: f.name,
                    path: f.path
                })));
            }
        } catch (error) {
            console.error('Failed to fetch folders:', error);
        }
    };

    const fetchMediaFiles = async () => {
        setLoading(true);
        try {
            const tabType = tabs[activeTab].type;
            
            // If "All" tab (empty type), fetch all resource types
            if (!tabType) {
                // Fetch all types in parallel with larger limit
                const [imageResult, videoResult, rawResult, dbFilesResult] = await Promise.all([
                    apiClient.get(`/api/media/list?type=image&max_results=500${selectedFolder ? `&folder=${selectedFolder}` : ''}`),
                    apiClient.get(`/api/media/list?type=video&max_results=500${selectedFolder ? `&folder=${selectedFolder}` : ''}`),
                    apiClient.get(`/api/media/list?type=raw&max_results=500${selectedFolder ? `&folder=${selectedFolder}` : ''}`),
                    apiClient.get(`/api/media/documents${selectedFolder ? `?folder=${selectedFolder}` : ''}`)
                ]);

                const cloudinaryFiles = [
                    ...(imageResult.success ? imageResult.data.resources : []),
                    ...(videoResult.success ? videoResult.data.resources : []),
                    ...(rawResult.success ? rawResult.data.resources : [])
                ];

                // Convert database files to MediaFile format
                const dbFiles = (dbFilesResult.success ? dbFilesResult.files : []).map((file: any) => ({
                    public_id: file.cloudinaryPublicId || `db-${file.id}`,
                    secure_url: `/api/media/download/${file.id}`,
                    resource_type: 'raw',
                    format: file.fileExtension,
                    bytes: file.fileSize,
                    created_at: file.createdAt,
                    folder: file.folder,
                    id: file.id,
                    originalFilename: file.originalFilename,
                    fileExtension: file.fileExtension,
                    mimeType: file.mimeType,
                    category: file.category,
                    description: file.description,
                    isDbFile: true,
                    serverPath: `/api/media/download/${file.id}`,
                }));

                const allResources = [...cloudinaryFiles, ...dbFiles];

                // Sort by creation date (newest first)
                allResources.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

                setAllMediaFiles(allResources);
                setTotalPages(Math.ceil(allResources.length / itemsPerPage));
            } else if (tabType === 'raw') {
                // For "Files" tab, fetch both Cloudinary raw files and database files
                const params = new URLSearchParams({
                    type: tabType,
                    max_results: '500',
                });

                if (selectedFolder) {
                    params.append('folder', selectedFolder);
                }

                const [cloudinaryResult, dbFilesResult] = await Promise.all([
                    apiClient.get(`/api/media/list?${params.toString()}`),
                    apiClient.get(`/api/media/documents${selectedFolder ? `?folder=${selectedFolder}` : ''}`)
                ]);

                const cloudinaryFiles = cloudinaryResult.success ? cloudinaryResult.data.resources : [];
                
                // Convert database files to MediaFile format
                const dbFiles = (dbFilesResult.success ? dbFilesResult.files : []).map((file: any) => ({
                    public_id: file.cloudinaryPublicId || `db-${file.id}`,
                    secure_url: `/api/media/download/${file.id}`,
                    resource_type: 'raw',
                    format: file.fileExtension,
                    bytes: file.fileSize,
                    created_at: file.createdAt,
                    folder: file.folder,
                    id: file.id,
                    originalFilename: file.originalFilename,
                    fileExtension: file.fileExtension,
                    mimeType: file.mimeType,
                    category: file.category,
                    description: file.description,
                    isDbFile: true,
                    serverPath: `/api/media/download/${file.id}`,
                }));

                const allResources = [...cloudinaryFiles, ...dbFiles];
                allResources.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

                setAllMediaFiles(allResources);
                setTotalPages(Math.ceil(allResources.length / itemsPerPage));
            } else {
                // For image/video tabs, only fetch from Cloudinary
                const params = new URLSearchParams({
                    type: tabType,
                    max_results: '500',
                });

                if (selectedFolder) {
                    params.append('folder', selectedFolder);
                }

                const result = await apiClient.get(`/api/media/list?${params.toString()}`);
                
                if (result.success) {
                    const resources = result.data.resources || [];
                    setAllMediaFiles(resources);
                    setTotalPages(Math.ceil(resources.length / itemsPerPage));
                }
            }
        } catch (error) {
            console.error('Failed to fetch media files:', error);
            Swal.fire('Error', 'Failed to load media files', 'error');
        } finally {
            setLoading(false);
        }
    };

    const filterAndPaginateFiles = () => {
        let filtered = [...allMediaFiles];

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(file =>
                file.public_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                file.format?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                file.secure_url?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                file.originalFilename?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                file.description?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Update total pages based on filtered results
        setTotalPages(Math.ceil(filtered.length / itemsPerPage));

        // Paginate
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginated = filtered.slice(startIndex, endIndex);

        setFilteredFiles(filtered);
        setDisplayedFiles(paginated);
    };

    const isDocumentFile = (file: File): boolean => {
        const documentFormats = [
            'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
            'txt', 'csv', 'json', 'xml', 'zip', 'rar', '7z',
            'tar', 'gz', 'md', 'rtf', 'odt', 'ods', 'odp'
        ];
        const extension = file.name.split('.').pop()?.toLowerCase() || '';
        return documentFormats.includes(extension);
    };

    const handleFileUpload = async (files: FileList) => {
        setUploading(true);
        try {
            const filesArray = Array.from(files);
            
            // Separate files into documents and media (images/videos)
            const documentFiles = filesArray.filter(isDocumentFile);
            const mediaFiles = filesArray.filter(f => !isDocumentFile(f));

            let uploadResults = [];
            let uploadErrors = [];

            // Upload document files to server with database storage
            if (documentFiles.length > 0) {
                const docFormData = new FormData();
                documentFiles.forEach(file => {
                    docFormData.append('files', file);
                });
                docFormData.append('folder', uploadFolder);

                const docResponse = await fetch('/api/media/upload-document', {
                    method: 'POST',
                    body: docFormData,
                });

                const docResult = await docResponse.json();
                if (docResult.success) {
                    uploadResults.push(...docResult.uploaded);
                }
                if (docResult.errors && docResult.errors.length > 0) {
                    uploadErrors.push(...docResult.errors);
                }
            }

            // Upload media files (images/videos) to Cloudinary directly
            if (mediaFiles.length > 0) {
                const mediaFormData = new FormData();
                mediaFiles.forEach(file => {
                    mediaFormData.append('files', file);
                });
                mediaFormData.append('folder', uploadFolder);
                mediaFormData.append('resourceType', 'auto');

                const mediaResponse = await fetch('/api/media/upload', {
                    method: 'POST',
                    body: mediaFormData,
                });

                const mediaResult = await mediaResponse.json();
                if (mediaResult.success) {
                    uploadResults.push(...(mediaResult.uploaded || []));
                }
            }

            if (uploadResults.length > 0) {
                Swal.fire({
                    title: 'Success!',
                    text: `${uploadResults.length} file(s) uploaded successfully${uploadErrors.length > 0 ? `, ${uploadErrors.length} failed` : ''}`,
                    icon: 'success',
                    timer: 2000,
                });
                
                setShowUploadModal(false);
                fetchMediaFiles();
            } else {
                Swal.fire({
                    title: 'Upload Failed',
                    text: uploadErrors.length > 0 ? uploadErrors[0].error : 'No files were uploaded',
                    icon: 'error',
                });
            }
        } catch (error: any) {
            console.error('Upload error:', error);
            Swal.fire('Error', error.message || 'Failed to upload files', 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (publicId: string, resourceType: string, file?: MediaFile) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it!',
        });

        if (result.isConfirmed) {
            try {
                // If it's a database file, delete from database
                if (file?.isDbFile && file.id) {
                    const deleteResult = await apiClient.delete(`/api/media/documents/${file.id}`);
                    if (!deleteResult.success) {
                        throw new Error(deleteResult.error || 'Delete failed');
                    }
                } else {
                    // Otherwise delete from Cloudinary
                    const deleteResult = await apiClient.delete('/api/media/delete', {
                        publicId,
                        resourceType,
                    });
                    if (!deleteResult.success) {
                        throw new Error(deleteResult.error || 'Delete failed');
                    }
                }

                Swal.fire('Deleted!', 'File has been deleted.', 'success');
                setAllMediaFiles(prev => prev.filter(f => f.public_id !== publicId));
            } catch (error: any) {
                console.error('Delete error:', error);
                Swal.fire('Error', error.message || 'Failed to delete file', 'error');
            }
        }
    };

    const handleBulkDelete = async () => {
        if (selectedFiles.size === 0) {
            Swal.fire('Info', 'Please select files to delete', 'info');
            return;
        }

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Delete ${selectedFiles.size} selected file(s)?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete them!',
        });

        if (result.isConfirmed) {
            try {
                const deletePromises = Array.from(selectedFiles).map(publicId => {
                    const file = allMediaFiles.find((f: MediaFile) => f.public_id === publicId);
                    
                    // Delete database files differently
                    if (file?.isDbFile && file.id) {
                        return apiClient.delete(`/api/media/documents/${file.id}`);
                    } else {
                        return apiClient.delete('/api/media/delete', {
                            publicId,
                            resourceType: file?.resource_type || 'image',
                        });
                    }
                });

                await Promise.all(deletePromises);
                Swal.fire('Deleted!', 'Files have been deleted.', 'success');
                setSelectedFiles(new Set());
                fetchMediaFiles();
            } catch (error: any) {
                console.error('Bulk delete error:', error);
                Swal.fire('Error', 'Failed to delete some files', 'error');
            }
        }
    };

    const toggleFileSelection = (publicId: string) => {
        const newSelection = new Set(selectedFiles);
        if (newSelection.has(publicId)) {
            newSelection.delete(publicId);
        } else {
            newSelection.add(publicId);
        }
        setSelectedFiles(newSelection);
    };

    const copyToClipboard = (url: string) => {
        navigator.clipboard.writeText(url);
        Swal.fire({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000,
            icon: 'success',
            title: 'URL copied to clipboard!',
        });
    };

    const addLinkToLibrary = () => {
        if (!linkUrl) {
            Swal.fire('Error', 'Please enter a valid URL', 'error');
            return;
        }

        // In a real implementation, you might want to store this link in your database
        copyToClipboard(linkUrl);
        setShowLinkModal(false);
        setLinkUrl('');
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const handleDownload = async (file: MediaFile) => {
        try {
            // Get the filename from public_id or create one with format
            let filename = file.public_id.split('/').pop() || 'download';
            
            // Map of common file formats to their proper extensions
            const formatExtensionMap: Record<string, string> = {
                // Documents
                'pdf': 'pdf',
                'doc': 'doc',
                'docx': 'docx',
                'xls': 'xls',
                'xlsx': 'xlsx',
                'ppt': 'ppt',
                'pptx': 'pptx',
                'txt': 'txt',
                'rtf': 'rtf',
                'odt': 'odt',
                // Archives
                'zip': 'zip',
                'rar': 'rar',
                '7z': '7z',
                'tar': 'tar',
                'gz': 'gz',
                // Data
                'csv': 'csv',
                'json': 'json',
                'xml': 'xml',
                // Others
                'sql': 'sql',
                'exe': 'exe',
                'dmg': 'dmg',
                'iso': 'iso',
            };

            // MIME types for proper file handling
            const mimeTypeMap: Record<string, string> = {
                'pdf': 'application/pdf',
                'doc': 'application/msword',
                'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'xls': 'application/vnd.ms-excel',
                'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'ppt': 'application/vnd.ms-powerpoint',
                'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'txt': 'text/plain',
                'csv': 'text/csv',
                'json': 'application/json',
                'xml': 'application/xml',
                'zip': 'application/zip',
                'rar': 'application/x-rar-compressed',
                '7z': 'application/x-7z-compressed',
                'tar': 'application/x-tar',
                'gz': 'application/gzip',
            };

            // Add file extension if not present
            const format = file.format?.toLowerCase() || '';
            const extension = formatExtensionMap[format] || format;
            
            if (extension && !filename.toLowerCase().endsWith(`.${extension}`)) {
                filename = `${filename}.${extension}`;
            }

            // Fetch the file with proper headers
            const response = await fetch(file.secure_url, {
                method: 'GET',
                headers: {
                    'Accept': '*/*',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch file');
            }

            // Get blob with proper MIME type
            const blob = await response.blob();
            const mimeType = mimeTypeMap[extension] || blob.type || 'application/octet-stream';
            const properBlob = new Blob([blob], { type: mimeType });
            
            // Create download link
            const url = window.URL.createObjectURL(properBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.style.display = 'none';
            
            // Append to body, click, and remove
            document.body.appendChild(link);
            link.click();
            
            // Cleanup after a short delay
            setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }, 100);

            // Show success message
            Swal.fire({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 2000,
                icon: 'success',
                title: `Downloading ${filename}`,
            });
        } catch (error) {
            console.error('Download error:', error);
            Swal.fire('Error', 'Failed to download file. The file might be too large or unavailable.', 'error');
        }
    };

    const getFileIcon = (resourceType: string, format: string) => {
        if (resourceType === 'image') {
            return <IconCamera className="w-6 h-6 text-blue-500" />;
        } else if (resourceType === 'video') {
            return <IconVideo className="w-6 h-6 text-purple-500" />;
        } else {
            return <IconFile className="w-6 h-6 text-gray-500" />;
        }
    };

    return (
        <ProtectedRoute requiredPermission={{ resource: 'media', action: 'view' }}>
            <div className="space-y-6">
                {/* Header */}
                <div className="panel">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold dark:text-white">Media Library</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Manage all your images, videos, and files from Cloudinary
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowLinkModal(true)}
                                className="btn btn-outline-primary btn-sm border-blue-600 text-blue-600 hover:bg-blue-600"
                            >
                                <IconLink className="w-4 h-4 mr-2" />
                                Add Link
                            </button>
                            <button
                                onClick={() => setShowUploadModal(true)}
                                className="btn btn-primary btn-sm bg-green-600 hover:bg-green-700 border-green-600"
                            >
                                <IconCloudDownload className="w-4 h-4 mr-2" />
                                Upload Files
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="panel">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <input
                                    type="text"
                                    className="form-input pr-10"
                                    placeholder="Search files..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                    <IconSearch className="w-5 h-5 text-gray-400" />
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <select
                                className="form-select w-auto"
                                value={selectedFolder}
                                onChange={(e) => {
                                    setSelectedFolder(e.target.value);
                                    fetchMediaFiles();
                                }}
                            >
                                <option value="">All Folders</option>
                                {folders.map((folder) => (
                                    <option key={folder.path} value={folder.path}>
                                        {folder.name}
                                    </option>
                                ))}
                            </select>
                            {selectedFiles.size > 0 && (
                                <button
                                    onClick={handleBulkDelete}
                                    className="btn btn-danger btn-sm"
                                >
                                    <IconTrash className="w-4 h-4 mr-2" />
                                    Delete ({selectedFiles.size})
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="panel">
                    <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
                        <Tab.List className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 mb-4">
                            {tabs.map((tab, index) => (
                                <Tab
                                    key={index}
                                    className={({ selected }) =>
                                        `flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-300 ${
                                            selected
                                                ? 'border-b-2 border-green-600 text-green-600 dark:text-green-500'
                                                : 'text-gray-600 dark:text-gray-400 hover:text-green-600'
                                        }`
                                    }
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.name}
                                </Tab>
                            ))}
                        </Tab.List>

                        <Tab.Panels>
                            {tabs.map((tab, index) => (
                                <Tab.Panel key={index}>
                                    {loading && allMediaFiles.length === 0 ? (
                                        <div className="flex items-center justify-center py-20">
                                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600"></div>
                                        </div>
                                    ) : filteredFiles.length === 0 ? (
                                        <div className="text-center py-20">
                                            <div className="text-gray-400 mb-4">
                                                {tab.icon && <tab.icon className="w-16 h-16 mx-auto" />}
                                            </div>
                                            <p className="text-gray-500 dark:text-gray-400">
                                                No {tab.name.toLowerCase()} found
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                                                {displayedFiles.map((file) => (
                                                <div
                                                    key={file.public_id}
                                                    className={`relative group border rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
                                                        selectedFiles.has(file.public_id)
                                                            ? 'ring-2 ring-green-600'
                                                            : ''
                                                    }`}
                                                    onClick={() => setSelectedFile(file)}
                                                >
                                                    {/* Selection Checkbox */}
                                                    <div className="absolute top-2 left-2 z-10">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedFiles.has(file.public_id)}
                                                            onChange={(e) => {
                                                                e.stopPropagation();
                                                                toggleFileSelection(file.public_id);
                                                            }}
                                                            className="form-checkbox h-5 w-5 text-green-600 rounded"
                                                        />
                                                    </div>

                                                    {/* Preview */}
                                                    <div className="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                                        {file.resource_type === 'image' ? (
                                                            <img
                                                                src={file.secure_url}
                                                                alt={file.public_id}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : file.resource_type === 'video' ? (
                                                            <video
                                                                src={file.secure_url}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex flex-col items-center justify-center p-4">
                                                                {getFileIcon(file.resource_type, file.format || '')}
                                                                <span className="text-xs mt-2 text-gray-600 dark:text-gray-400 uppercase">
                                                                    {file.format || 'file'}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Actions Overlay */}
                                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                copyToClipboard(file.secure_url);
                                                            }}
                                                            className="btn btn-sm bg-white text-gray-800 hover:bg-gray-100"
                                                            title="Copy URL"
                                                        >
                                                            <IconLink className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDownload(file);
                                                            }}
                                                            className="btn btn-sm bg-white text-gray-800 hover:bg-gray-100"
                                                            title="Download"
                                                        >
                                                            <IconDownload className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDelete(file.public_id, file.resource_type, file);
                                                            }}
                                                            className="btn btn-sm bg-red-500 text-white hover:bg-red-600"
                                                            title="Delete"
                                                        >
                                                            <IconTrash className="w-4 h-4" />
                                                        </button>
                                                    </div>

                                                    {/* File Info */}
                                                    <div className="p-2 bg-white dark:bg-gray-900">
                                                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate" title={file.originalFilename || file.public_id}>
                                                            {file.originalFilename || file.public_id.split('/').pop()}
                                                        </p>
                                                        <p className="text-xs text-gray-400">
                                                            {formatFileSize(file.bytes)}
                                                            {file.isDbFile && <span className="ml-2 text-blue-500">📄</span>}
                                                        </p>
                                                        {file.category && (
                                                            <p className="text-xs text-gray-400 capitalize">
                                                                {file.category}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Pagination Controls */}
                                        {totalPages > 1 && (
                                            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
                                                    {Math.min(currentPage * itemsPerPage, filteredFiles.length)} of{' '}
                                                    {filteredFiles.length} files
                                                </div>
                                                
                                                <div className="flex items-center gap-2">
                                                    {/* Previous Button */}
                                                    <button
                                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                        disabled={currentPage === 1}
                                                        className="btn btn-sm btn-outline-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        Previous
                                                    </button>

                                                    {/* Page Numbers */}
                                                    <div className="flex gap-1">
                                                        {/* First Page */}
                                                        {currentPage > 3 && (
                                                            <>
                                                                <button
                                                                    onClick={() => setCurrentPage(1)}
                                                                    className="btn btn-sm btn-outline-primary"
                                                                >
                                                                    1
                                                                </button>
                                                                {currentPage > 4 && (
                                                                    <span className="px-2 flex items-center">...</span>
                                                                )}
                                                            </>
                                                        )}

                                                        {/* Page range around current page */}
                                                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                                                            .filter(page => {
                                                                return page === currentPage || 
                                                                       page === currentPage - 1 || 
                                                                       page === currentPage + 1 ||
                                                                       page === currentPage - 2 ||
                                                                       page === currentPage + 2;
                                                            })
                                                            .filter(page => page > 0 && page <= totalPages)
                                                            .map(page => (
                                                                <button
                                                                    key={page}
                                                                    onClick={() => setCurrentPage(page)}
                                                                    className={`btn btn-sm ${
                                                                        currentPage === page
                                                                            ? 'bg-green-600 text-white hover:bg-green-700 border-green-600'
                                                                            : 'btn-outline-primary'
                                                                    }`}
                                                                >
                                                                    {page}
                                                                </button>
                                                            ))}

                                                        {/* Last Page */}
                                                        {currentPage < totalPages - 2 && (
                                                            <>
                                                                {currentPage < totalPages - 3 && (
                                                                    <span className="px-2 flex items-center">...</span>
                                                                )}
                                                                <button
                                                                    onClick={() => setCurrentPage(totalPages)}
                                                                    className="btn btn-sm btn-outline-primary"
                                                                >
                                                                    {totalPages}
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>

                                                    {/* Next Button */}
                                                    <button
                                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                                        disabled={currentPage === totalPages}
                                                        className="btn btn-sm btn-outline-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        Next
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                    )}
                                </Tab.Panel>
                            ))}
                        </Tab.Panels>
                    </Tab.Group>
                </div>

                {/* Upload Modal */}
                {showUploadModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-semibold dark:text-white">Upload Files</h3>
                                <button
                                    onClick={() => setShowUploadModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <IconX className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Upload Folder</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g., media-library/images"
                                        value={uploadFolder}
                                        onChange={(e) => setUploadFolder(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Select Files</label>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*,video/*,application/*"
                                        onChange={(e) => {
                                            if (e.target.files) {
                                                handleFileUpload(e.target.files);
                                            }
                                        }}
                                        className="form-input"
                                        disabled={uploading}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        You can select multiple files. Supported: images, videos, documents
                                    </p>
                                </div>

                                {uploading && (
                                    <div className="text-center py-4">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                                        <p className="text-sm text-gray-600 mt-2">Uploading files...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Add Link Modal */}
                {showLinkModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-semibold dark:text-white">Add Link</h3>
                                <button
                                    onClick={() => setShowLinkModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <IconX className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">URL</label>
                                    <input
                                        type="url"
                                        className="form-input"
                                        placeholder="https://example.com/file.jpg"
                                        value={linkUrl}
                                        onChange={(e) => setLinkUrl(e.target.value)}
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={addLinkToLibrary}
                                        className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600"
                                    >
                                        Copy Link
                                    </button>
                                    <button
                                        onClick={() => setShowLinkModal(false)}
                                        className="btn btn-outline-secondary"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* File Detail Modal */}
                {selectedFile && (
                    <div 
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                        onClick={() => setSelectedFile(null)}
                    >
                        <div 
                            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-semibold dark:text-white">File Details</h3>
                                <button
                                    onClick={() => setSelectedFile(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <IconX className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Preview */}
                                <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 flex items-center justify-center">
                                    {selectedFile.resource_type === 'image' ? (
                                        <img
                                            src={selectedFile.secure_url}
                                            alt={selectedFile.public_id}
                                            className="max-w-full max-h-96 object-contain"
                                        />
                                    ) : selectedFile.resource_type === 'video' ? (
                                        <video
                                            src={selectedFile.secure_url}
                                            controls
                                            className="max-w-full max-h-96"
                                        />
                                    ) : (
                                        <div className="text-center">
                                            {getFileIcon(selectedFile.resource_type, selectedFile.format || '')}
                                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                                {selectedFile.format?.toUpperCase() || 'Unknown'} File
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Details */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            File Name
                                        </label>
                                        <p className="text-sm text-gray-900 dark:text-white break-all">
                                            {selectedFile.public_id.split('/').pop()}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            URL
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={selectedFile.secure_url}
                                                readOnly
                                                className="form-input flex-1 text-xs"
                                            />
                                            <button
                                                onClick={() => copyToClipboard(selectedFile.secure_url)}
                                                className="btn btn-sm btn-outline-primary"
                                            >
                                                Copy
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Type
                                            </label>
                                            <p className="text-sm text-gray-900 dark:text-white">
                                                {selectedFile.resource_type}
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Format
                                            </label>
                                            <p className="text-sm text-gray-900 dark:text-white uppercase">
                                                {selectedFile.format || 'Unknown'}
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Size
                                            </label>
                                            <p className="text-sm text-gray-900 dark:text-white">
                                                {formatFileSize(selectedFile.bytes)}
                                            </p>
                                        </div>

                                        {selectedFile.width && selectedFile.height && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Dimensions
                                                </label>
                                                <p className="text-sm text-gray-900 dark:text-white">
                                                    {selectedFile.width} × {selectedFile.height}
                                                </p>
                                            </div>
                                        )}

                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Created
                                            </label>
                                            <p className="text-sm text-gray-900 dark:text-white">
                                                {new Date(selectedFile.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-4">
                                        <button
                                            onClick={() => handleDownload(selectedFile)}
                                            className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600"
                                        >
                                            <IconDownload className="w-4 h-4 mr-2" />
                                            Download
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleDelete(selectedFile.public_id, selectedFile.resource_type, selectedFile);
                                                setSelectedFile(null);
                                            }}
                                            className="btn btn-danger"
                                        >
                                            <IconTrash className="w-4 h-4 mr-2" />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
};

export default MediaLibrary;
