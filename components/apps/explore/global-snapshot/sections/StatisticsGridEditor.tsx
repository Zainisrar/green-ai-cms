import React from 'react';
import IconPlus from '@/components/icon/icon-plus';
import IconTrash from '@/components/icon/icon-trash';
import ImageUploading, { ImageListType } from 'react-images-uploading';

interface StatisticsGridEditorProps {
    section: any;
    isEditing: boolean;
    onUpdate: (field: string, value: any) => void;
    onAddItem: (item: any) => void;
    onRemoveItem: (index: number) => void;
    onImageUpload: (itemIndex: number, imageList: ImageListType) => void;
    isUploading: boolean;
    onOpenMediaPicker?: (itemIndex: number) => void;
}

export default function StatisticsGridEditor({ 
    section, 
    isEditing, 
    onUpdate, 
    onAddItem, 
    onRemoveItem, 
    onImageUpload,
    isUploading,
    onOpenMediaPicker
}: StatisticsGridEditorProps) {
    
    const addStatItem = () => {
        const newItem = {
            icon: {
                type: 'image',
                src: '',
                alt: ''
            },
            value: '',
            label: ''
        };
        onAddItem(newItem);
    };

    const updateItem = (itemIndex: number, field: string, value: any) => {
        const updatedItems = [...(section.items || [])];
        const item = updatedItems[itemIndex];
        
        if (field.includes('.')) {
            const fieldParts = field.split('.');
            let target = item;
            for (let i = 0; i < fieldParts.length - 1; i++) {
                if (!target[fieldParts[i]]) {
                    target[fieldParts[i]] = {};
                }
                target = target[fieldParts[i]];
            }
            target[fieldParts[fieldParts.length - 1]] = value;
        } else {
            item[field] = value;
        }
        
        onUpdate('items', updatedItems);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h6 className="text-lg font-semibold">Statistics Items</h6>
                {isEditing && (
                    <button
                        onClick={addStatItem}
                        className="btn btn-primary btn-sm"
                    >
                        <IconPlus className="w-4 h-4" />
                        Add Stat
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {(section.items || []).map((item: any, itemIndex: number) => (
                    <div key={itemIndex} className="panel border">
                        {isEditing && (
                            <div className="flex justify-end mb-2">
                                <button
                                    onClick={() => onRemoveItem(itemIndex)}
                                    className="btn btn-danger btn-xs"
                                >
                                    <IconTrash className="w-3 h-3" />
                                </button>
                            </div>
                        )}

                        {/* Icon */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Icon</label>
                            {isEditing ? (
                                <div className="space-y-2">
                                    {item.icon?.src && (
                                        <div className="flex items-center gap-2 mb-2">
                                            <img src={item.icon.src} alt="Icon preview" className="w-12 h-12 object-contain" />
                                            <button
                                                type="button"
                                                onClick={() => updateItem(itemIndex, 'icon.src', '')}
                                                className="btn btn-danger btn-xs"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    )}
                                    {onOpenMediaPicker && (
                                        <button
                                            type="button"
                                            onClick={() => onOpenMediaPicker(itemIndex)}
                                            className="btn btn-outline-primary btn-sm mb-2"
                                        >
                                            Browse Media
                                        </button>
                                    )}
                                    <ImageUploading 
                                        value={[]} 
                                        onChange={(imageList) => onImageUpload(itemIndex, imageList)}
                                        maxNumber={1} 
                                        dataURLKey="dataURL"
                                    >
                                        {({ onImageUpload, isDragging, dragProps }) => (
                                            <button
                                                type="button"
                                                className={`w-full h-20 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-colors ${
                                                    isDragging ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'
                                                } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                onClick={onImageUpload}
                                                disabled={isUploading}
                                                {...dragProps}
                                            >
                                                {isUploading ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mb-1"></div>
                                                        <span className="text-xs text-gray-500">Uploading...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <IconPlus className="w-4 h-4 text-gray-400 mb-1" />
                                                        <span className="text-xs text-gray-500">Upload Icon</span>
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </ImageUploading>
                                    
                                    <input
                                        type="text"
                                        className="form-input text-sm"
                                        value={item.icon?.src || ''}
                                        onChange={(e) => updateItem(itemIndex, 'icon.src', e.target.value)}
                                        placeholder="Or enter icon URL..."
                                    />
                                    
                                    <input
                                        type="text"
                                        className="form-input text-sm"
                                        value={item.icon?.alt || ''}
                                        onChange={(e) => updateItem(itemIndex, 'icon.alt', e.target.value)}
                                        placeholder="Alt text..."
                                    />
                                </div>
                            ) : (
                                item.icon?.src && (
                                    <img 
                                        src={item.icon.src} 
                                        alt={item.icon.alt} 
                                        className="w-12 h-12 object-contain"
                                    />
                                )
                            )}
                        </div>

                        {/* Value */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Value</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    className="form-input"
                                    value={item.value || ''}
                                    onChange={(e) => updateItem(itemIndex, 'value', e.target.value)}
                                    placeholder="3,913 MW+"
                                />
                            ) : (
                                <p className="text-2xl font-bold text-primary">{item.value}</p>
                            )}
                        </div>

                        {/* Label */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Label</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    className="form-input"
                                    value={item.label || ''}
                                    onChange={(e) => updateItem(itemIndex, 'label', e.target.value)}
                                    placeholder="Installed"
                                />
                            ) : (
                                <p className="text-sm text-gray-600">{item.label}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}