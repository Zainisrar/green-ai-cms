'use client';
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { IconUpload, IconFile, IconTrash, IconCheck, IconX, IconLoader, IconDownload } from '@tabler/icons-react';

interface TrainingFile {
    id: number;
    title: string;
    fileName: string;
    fileSize: number;
    chunks: number;
    status: 'processing' | 'completed' | 'failed';
    createdAt: string;
}

const ChatbotTrainingPage = () => {
    const [files, setFiles] = useState<TrainingFile[]>([]);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState('');

    // Fetch existing files
    const fetchFiles = async () => {
        try {
            const response = await fetch('/api/chatbot/training');
            if (response.ok) {
                const data = await response.json();
                setFiles(data);
            }
        } catch (error) {
            console.error('Failed to fetch files:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch existing files on component mount
    React.useEffect(() => {
        fetchFiles();
    }, []);

    const onDrop = useCallback(
        async (acceptedFiles: File[]) => {
            if (!title.trim()) {
                alert('Please enter a title for the chatbot training');
                return;
            }

            const file = acceptedFiles[0];
            if (!file) return;

            setUploading(true);

            try {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('title', title);

                const response = await fetch('/api/chatbot/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error('Upload failed');
                }

                const result = await response.json();

                // Add the new file to the list
                const newFile: TrainingFile = {
                    id: result.id,
                    title: title,
                    fileName: file.name,
                    fileSize: file.size,
                    chunks: result.chunks || 0,
                    status: result.status || 'completed',
                    createdAt: new Date().toISOString(),
                };

                setFiles((prev) => [newFile, ...prev]);
                setTitle('');

                // If status is processing, we could poll for updates
                if (result.status === 'processing') {
                    // Optional: Add polling logic here to check status updates
                    console.log('File is being processed by external API...');
                }
            } catch (error) {
                console.error('Upload error:', error);
                alert('Failed to upload file. Please try again.');
            } finally {
                setUploading(false);
            }
        },
        [title],
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'text/plain': ['.txt'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        },
        maxFiles: 1,
        disabled: uploading || !title.trim(),
    });

    const downloadSampleFile = () => {
        // Create a download link for the sample PDF
        const link = document.createElement('a');
        link.href = '/chatbot_pdf.pdf';
        link.download = 'chatbot_pdf.pdf';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const deleteFile = async (id: number) => {
        try {
            const response = await fetch(`/api/chatbot/training/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setFiles((prev) => prev.filter((file) => file.id !== id));
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete file');
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <IconCheck className="w-5 h-5 text-green-500" />;
            case 'failed':
                return <IconX className="w-5 h-5 text-red-500" />;
            case 'processing':
                return <IconLoader className="w-5 h-5 text-blue-500 animate-spin" />;
            default:
                return <IconFile className="w-5 h-5 text-gray-500" />;
        }
    };

    const getStatusMessage = (status: string, chunks: number) => {
        switch (status) {
            case 'completed':
                return `Processed successfully (${chunks} chunks)`;
            case 'failed':
                return 'Processing failed';
            case 'processing':
                return 'Processing by external API...';
            default:
                return 'Unknown status';
        }
    };

    return (
        <div className="space-y-8 p-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Chatbot Training</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Upload documents to train your chatbot. Supported formats: PDF</p>
            </div>

            {/* Upload Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Upload Training Document</h2>

                {/* Title Input */}
                <div className="mb-4">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Training Title
                    </label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter a descriptive title for this training"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        disabled={uploading}
                    />
                </div>

                {/* File Upload Area */}
                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                        isDragActive ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    } ${uploading || !title.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <input {...getInputProps()} />
                    <IconUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    {uploading ? (
                        <div className="space-y-2">
                            <IconLoader className="mx-auto h-8 w-8 text-blue-500 animate-spin" />
                            <p className="text-lg font-medium text-gray-900 dark:text-white">Uploading and processing...</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <p className="text-lg font-medium text-gray-900 dark:text-white">{isDragActive ? 'Drop the file here' : 'Drag & drop a file here, or click to select'}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{!title.trim() ? 'Please enter a title first' : 'PDF, TXT, DOC, DOCX up to 10MB'}</p>
                        </div>
                    )}
                </div>

                {/* Sample File Section */}
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <IconDownload className="w-5 h-5 text-blue-500" />
                            <div>
                                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Sample Training Document</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Download our sample PDF file to test the chatbot training process</p>
                            </div>
                        </div>
                        <button onClick={downloadSampleFile} className="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors flex items-center space-x-2">
                            <IconDownload className="w-4 h-4" />
                            <span>Download Sample PDF</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Training Files List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Training Files ({files.length})</h2>
                    <button
                        onClick={() => {
                            setLoading(true);
                            fetchFiles();
                        }}
                        className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
                        disabled={loading}
                    >
                        {loading ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>

                {loading ? (
                    <div className="p-8 text-center">
                        <IconLoader className="mx-auto h-12 w-12 text-blue-500 animate-spin mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">Loading training files...</p>
                    </div>
                ) : files.length === 0 ? (
                    <div className="p-8 text-center">
                        <IconFile className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">No training files uploaded yet</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {files.map((file) => (
                            <div key={file.id} className="p-6 flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    {getStatusIcon(file.status)}
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{file.title}</h3>
                                        <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                                            <p>File: {file.fileName}</p>
                                            <p>Size: {formatFileSize(file.fileSize)}</p>
                                            <p>
                                                Status:{' '}
                                                <span
                                                    className={`font-medium ${
                                                        file.status === 'completed'
                                                            ? 'text-green-600 dark:text-green-400'
                                                            : file.status === 'failed'
                                                              ? 'text-red-600 dark:text-red-400'
                                                              : 'text-blue-600 dark:text-blue-400'
                                                    }`}
                                                >
                                                    {getStatusMessage(file.status, file.chunks)}
                                                </span>
                                            </p>
                                            <p>Uploaded: {new Date(file.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => deleteFile(file.id)}
                                    className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                    title="Delete file"
                                >
                                    <IconTrash className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatbotTrainingPage;
