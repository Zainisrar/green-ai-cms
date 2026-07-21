import React from 'react';
import IconPlus from '@/components/icon/icon-plus';
import IconTrash from '@/components/icon/icon-trash';

interface LocationsSectionEditorProps {
    section: any;
    isEditing: boolean;
    onUpdate: (field: string, value: any) => void;
    onAddLocation: (location: string) => void;
    onRemoveLocation: (index: number) => void;
}

export default function LocationsSectionEditor({ 
    section, 
    isEditing, 
    onUpdate, 
    onAddLocation, 
    onRemoveLocation 
}: LocationsSectionEditorProps) {
    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                {isEditing ? (
                    <input
                        type="text"
                        className="form-input"
                        value={section.title || ''}
                        onChange={(e) => onUpdate('title', e.target.value)}
                        placeholder="Section title..."
                    />
                ) : (
                    <p className="text-lg font-bold">{section.title}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Highlight</label>
                {isEditing ? (
                    <input
                        type="text"
                        className="form-input"
                        value={section.highlight || ''}
                        onChange={(e) => onUpdate('highlight', e.target.value)}
                        placeholder="Highlighted text..."
                    />
                ) : (
                    <p className="text-primary font-semibold">{section.highlight}</p>
                )}
            </div>

            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium">Locations</label>
                    {isEditing && (
                        <button onClick={() => onAddLocation('')} className="btn btn-primary btn-xs">
                            <IconPlus className="w-3 h-3" />
                            Add Location
                        </button>
                    )}
                </div>
                
                {isEditing ? (
                    <div className="space-y-2">
                        {(section.locations || []).map((location: string, index: number) => (
                            <div key={index} className="flex items-center gap-2">
                                <input
                                    type="text"
                                    className="form-input flex-1"
                                    value={location}
                                    onChange={(e) => {
                                        const updatedLocations = [...section.locations];
                                        updatedLocations[index] = e.target.value;
                                        onUpdate('locations', updatedLocations);
                                    }}
                                    placeholder="Location name..."
                                />
                                <button
                                    onClick={() => onRemoveLocation(index)}
                                    className="btn btn-danger btn-sm"
                                >
                                    <IconTrash className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {(section.locations || []).map((location: string, index: number) => (
                            <span key={index} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                                {location}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                {isEditing ? (
                    <textarea
                        className="form-textarea"
                        rows={4}
                        value={section.description || ''}
                        onChange={(e) => onUpdate('description', e.target.value)}
                        placeholder="Section description..."
                    />
                ) : (
                    <p className="text-gray-700">{section.description}</p>
                )}
            </div>
        </div>
    );
}