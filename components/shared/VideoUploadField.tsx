'use client';

import React, { useState, useRef } from 'react';
import { useVideoUpload } from '../../hooks/useVideoUpload';
import IconTrash from '@/components/icon/icon-trash';
import IconPlayCircle from '@/components/icon/icon-play-circle';

interface VideoUploadFieldProps {
    value: string;
    onChange: (value: string) => void;
    folder?: string;
    label?: string;
    required?: boolean;
    error?: string;
}

export default function VideoUploadField({
    value,
    onChange,
    folder = 'uploads',
    label = 'Video Upload',
    required = false,
    error
}: VideoUploadFieldProps) {
    const { uploadVideo, isUploading } = useVideoUpload();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);

        try {
            const result = await uploadVideo(file, folder);
            onChange(result.url);
        } catch (error) {
            console.error('Error uploading video:', error);
            setSelectedFile(null);
        }
    };

    const handleRemove = () => {
        onChange('');
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const getFileName = (url: string) => {
        return url.split('/').pop() || 'video';
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {label} {required && '*'}
                </label>
                
                {value ? (
                    <div className="space-y-2">
                        <div className="relative inline-block border rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                            <div className="flex items-center space-x-3">
                                <IconPlayCircle className="w-8 h-8 text-blue-500" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {getFileName(value)}
                                    </p>
                                    <p className="text-xs text-gray-500">Video file uploaded</p>
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        type="button"
                                        onClick={handleClick}
                                        className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 transition-colors"
                                        disabled={isUploading}
                                    >
                                        Update
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleRemove}
                                        className="bg-red-500 text-white p-1 rounded text-xs hover:bg-red-600 transition-colors"
                                        disabled={isUploading}
                                    >
                                        <IconTrash className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                            
                            {/* Video preview */}
                            <div className="mt-3">
                                <video 
                                    src={value} 
                                    controls 
                                    className="w-full max-w-md h-32 object-cover rounded border"
                                    preload="metadata"
                                >
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div
                        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                            isUploading ? 'opacity-50 pointer-events-none border-gray-300' : 'border-gray-300 hover:border-blue-500'
                        } ${error ? 'border-red-500' : ''}`}
                        onClick={handleClick}
                    >
                        <div className="space-y-2">
                            <IconPlayCircle className="w-12 h-12 text-gray-400 mx-auto" />
                            <div className="text-gray-500 dark:text-gray-400">
                                {isUploading ? 'Uploading...' : 'Click to upload video'}
                            </div>
                            <div className="text-sm text-gray-400">
                                Supports: MP4, MOV, AVI, WebM (Max: 100MB)
                            </div>
                        </div>
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    accept="video/*"
                    className="hidden"
                    disabled={isUploading}
                />
                
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
        </div>
    );
}