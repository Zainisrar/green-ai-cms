import React from 'react';
import IconPlus from '@/components/icon/icon-plus';
import IconTrash from '@/components/icon/icon-trash';
import { ImageListType } from 'react-images-uploading';

interface ContentBlockEditorProps {
    section: any;
    isEditing: boolean;
    onUpdate: (field: string, value: any) => void;
    onAddFeature: (feature: any) => void;
    onRemoveFeature: (index: number) => void;
    onImageUpload: (featureIndex: number, imageList: ImageListType) => void;
    isUploading: boolean;
    onOpenMediaPicker?: (featureIndex: number) => void;
}

export default function ContentBlockEditor({ 
    section, 
    isEditing, 
    onUpdate, 
    onAddFeature, 
    onRemoveFeature, 
    onImageUpload, 
    isUploading,
    onOpenMediaPicker
}: ContentBlockEditorProps) {
    return (
        <div className="space-y-4">
            {/* Title */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Title Text</label>
                    {isEditing ? (
                        <input
                            type="text"
                            className="form-input"
                            value={section.title?.text || ''}
                            onChange={(e) => onUpdate('title.text', e.target.value)}
                            placeholder="Title text..."
                        />
                    ) : (
                        <p className="text-lg font-bold">{section.title?.text}</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Highlight</label>
                    {isEditing ? (
                        <input
                            type="text"
                            className="form-input"
                            value={section.title?.highlight || ''}
                            onChange={(e) => onUpdate('title.highlight', e.target.value)}
                            placeholder="Highlighted part..."
                        />
                    ) : (
                        <p className="text-lg font-bold text-primary">{section.title?.highlight}</p>
                    )}
                </div>
            </div>

            {/* Features */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium">Features</label>
                    {isEditing && (
                        <button
                            onClick={() => onAddFeature({
                                icon: { type: 'image', src: '', alt: '' },
                                text: ''
                            })}
                            className="btn btn-primary btn-sm"
                        >
                            <IconPlus className="w-4 h-4" />
                            Add Feature
                        </button>
                    )}
                </div>
                
                <div className="space-y-3">
                    {(section.features || []).map((feature: any, index: number) => (
                        <div key={index} className="flex items-start gap-3 p-3 border rounded">
                            {isEditing && (
                                <button
                                    onClick={() => onRemoveFeature(index)}
                                    className="btn btn-danger btn-xs mt-1"
                                >
                                    <IconTrash className="w-3 h-3" />
                                </button>
                            )}
                            
                            {/* Icon */}
                            <div className="w-16">
                                {isEditing ? (
                                    <div className="space-y-1">
                                        {feature.icon?.src && (
                                            <div className="flex items-center gap-1 mb-1">
                                                <img src={feature.icon.src} alt="Icon preview" className="w-8 h-8 object-contain" />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const updatedFeatures = [...section.features];
                                                        updatedFeatures[index].icon.src = '';
                                                        onUpdate('features', updatedFeatures);
                                                    }}
                                                    className="btn btn-danger btn-xs"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        )}
                                        {onOpenMediaPicker && (
                                            <button
                                                type="button"
                                                onClick={() => onOpenMediaPicker(index)}
                                                className="btn btn-outline-primary btn-xs mb-1 text-xs"
                                            >
                                                Browse
                                            </button>
                                        )}
                                        <button
                                            onClick={() => {
                                                const input = document.createElement('input');
                                                input.type = 'file';
                                                input.accept = 'image/*';
                                                input.onchange = (e: any) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const imageList = [{ file, dataURL: URL.createObjectURL(file) }];
                                                        onImageUpload(index, imageList);
                                                    }
                                                };
                                                input.click();
                                            }}
                                            className="w-12 h-12 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-xs"
                                            disabled={isUploading}
                                        >
                                            {isUploading ? '...' : <IconPlus className="w-4 h-4" />}
                                        </button>
                                        <input
                                            type="text"
                                            className="form-input text-xs"
                                            value={feature.icon?.src || ''}
                                            onChange={(e) => {
                                                const updatedFeatures = [...section.features];
                                                updatedFeatures[index].icon.src = e.target.value;
                                                onUpdate('features', updatedFeatures);
                                            }}
                                            placeholder="URL"
                                        />
                                    </div>
                                ) : (
                                    feature.icon?.src && (
                                        <img 
                                            src={feature.icon.src} 
                                            alt={feature.icon.alt} 
                                            className="w-8 h-8 object-contain"
                                        />
                                    )
                                )}
                            </div>
                            
                            {/* Text */}
                            <div className="flex-1">
                                {isEditing ? (
                                    <textarea
                                        className="form-textarea"
                                        rows={2}
                                        value={feature.text || ''}
                                        onChange={(e) => {
                                            const updatedFeatures = [...section.features];
                                            updatedFeatures[index].text = e.target.value;
                                            onUpdate('features', updatedFeatures);
                                        }}
                                        placeholder="Feature description..."
                                    />
                                ) : (
                                    <p className="text-sm">{feature.text}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}