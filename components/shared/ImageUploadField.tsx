'use client';

import React, { useState, useRef } from 'react';
import { useImageUpload } from '../../hooks/useImageUpload';
import IconTrash from '@/components/icon/icon-trash';

interface ImageUploadFieldProps {
    value: { src: string; alt: string };
    onChange: (value: { src: string; alt: string }) => void;
    folder?: string;
    label?: string;
    required?: boolean;
    error?: string;
}

export default function ImageUploadField({
    value,
    onChange,
    folder = 'uploads',
    label = 'Image Upload',
    required = false,
    error
}: ImageUploadFieldProps) {
    const { uploadImage, isUploading } = useImageUpload();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);

        try {
            const result = await uploadImage(file, folder);
            onChange({ ...value, src: result.url });
        } catch (error) {
            console.error('Error uploading image:', error);
            setSelectedFile(null);
        }
    };

    const handleRemove = () => {
        onChange({ src: '', alt: '' });
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {label} {required && '*'}
                </label>
                
                {value.src ? (
                    <div className="space-y-2">
                        <div className="relative inline-block">
                            <img 
                                src={value.src} 
                                alt={value.alt || "Upload preview"} 
                                className="w-32 h-32 object-cover rounded-lg border" 
                            />
                            <div className="absolute top-2 right-2 flex gap-1">
                                <button
                                    type="button"
                                    onClick={handleClick}
                                    className="bg-blue-500 text-white p-1 rounded text-xs hover:bg-blue-600 transition-colors"
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
                    </div>
                ) : (
                    <div
                        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                            isUploading ? 'opacity-50 pointer-events-none border-gray-300' : 'border-gray-300 hover:border-blue-500'
                        } ${error ? 'border-red-500' : ''}`}
                        onClick={handleClick}
                    >
                        <div className="space-y-2">
                            <div className="text-gray-500 dark:text-gray-400">
                                {isUploading ? 'Uploading...' : 'Click to upload image'}
                            </div>
                            <div className="text-sm text-gray-400">
                                Supports: JPG, PNG, GIF (Max: 10MB)
                            </div>
                        </div>
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                    disabled={isUploading}
                />
                
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>

            {value.src && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Image Alt Text
                    </label>
                    <input
                        type="text"
                        value={value.alt}
                        onChange={(e) => onChange({ ...value, alt: e.target.value })}
                        className="form-input"
                        placeholder="Image description for accessibility"
                    />
                </div>
            )}
        </div>
    );
}