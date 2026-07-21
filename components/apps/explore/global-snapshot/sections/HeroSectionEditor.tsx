import React from 'react';
import IconPlus from '@/components/icon/icon-plus';
import IconTrash from '@/components/icon/icon-trash';

interface HeroSectionEditorProps {
    section: any;
    isEditing: boolean;
    onUpdate: (field: string, value: any) => void;
    onOpenMediaPicker?: () => void;
}

export default function HeroSectionEditor({ section, isEditing, onUpdate, onOpenMediaPicker }: HeroSectionEditorProps) {
    const addDescription = () => {
        const updatedDescription = [...(section.description || []), ''];
        onUpdate('description', updatedDescription);
    };

    const removeDescription = (index: number) => {
        const updatedDescription = section.description.filter((_: any, i: number) => i !== index);
        onUpdate('description', updatedDescription);
    };

    const updateDescription = (index: number, value: string) => {
        const updatedDescription = [...section.description];
        updatedDescription[index] = value;
        onUpdate('description', updatedDescription);
    };

    return (
        <div className="space-y-4">
            {/* Title */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Main Title</label>
                    {isEditing ? (
                        <input
                            type="text"
                            className="form-input"
                            value={section.title?.main || ''}
                            onChange={(e) => onUpdate('title.main', e.target.value)}
                            placeholder="Main title..."
                        />
                    ) : (
                        <p className="text-lg font-bold">{section.title?.main}</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Highlight Text</label>
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

            {/* Subtitle */}
            <div>
                <label className="block text-sm font-medium mb-2">Subtitle</label>
                {isEditing ? (
                    <input
                        type="text"
                        className="form-input"
                        value={section.subtitle || ''}
                        onChange={(e) => onUpdate('subtitle', e.target.value)}
                        placeholder="Subtitle..."
                    />
                ) : (
                    <p className="text-gray-600">{section.subtitle}</p>
                )}
            </div>

            {/* Headline */}
            <div>
                <label className="block text-sm font-medium mb-2">Headline</label>
                {isEditing ? (
                    <textarea
                        className="form-textarea"
                        rows={2}
                        value={section.headline || ''}
                        onChange={(e) => onUpdate('headline', e.target.value)}
                        placeholder="Main headline..."
                    />
                ) : (
                    <p className="text-xl font-semibold">{section.headline}</p>
                )}
            </div>

            {/* Description */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium">Description Lines</label>
                    {isEditing && (
                        <button
                            onClick={addDescription}
                            className="btn btn-primary btn-xs"
                        >
                            <IconPlus className="w-3 h-3" />
                            Add Line
                        </button>
                    )}
                </div>
                
                {isEditing ? (
                    <div className="space-y-2">
                        {(section.description || []).map((line: string, index: number) => (
                            <div key={index} className="flex items-center gap-2">
                                <textarea
                                    className="form-textarea flex-1"
                                    rows={2}
                                    value={line}
                                    onChange={(e) => updateDescription(index, e.target.value)}
                                    placeholder={`Description line ${index + 1}...`}
                                />
                                <button
                                    onClick={() => removeDescription(index)}
                                    className="btn btn-danger btn-sm"
                                >
                                    <IconTrash className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {(section.description || []).map((line: string, index: number) => (
                            <p key={index} className="text-gray-700">{line}</p>
                        ))}
                    </div>
                )}
            </div>

            {/* Background Image */}
            <div>
                <label className="block text-sm font-medium mb-2">Background Image</label>
                {isEditing ? (
                    <div className="space-y-2">
                        {section.backgroundImage?.src && (
                            <div className="relative w-full h-40 border rounded overflow-hidden">
                                <img 
                                    src={section.backgroundImage.src} 
                                    alt="Background preview" 
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => onUpdate('backgroundImage.src', '')}
                                    className="absolute top-2 right-2 btn btn-danger btn-sm"
                                >
                                    Remove
                                </button>
                            </div>
                        )}
                        {onOpenMediaPicker && (
                            <button
                                type="button"
                                onClick={onOpenMediaPicker}
                                className="btn btn-outline-primary btn-sm"
                            >
                                Browse Media
                            </button>
                        )}
                        <input
                            type="text"
                            className="form-input"
                            value={section.backgroundImage?.src || ''}
                            onChange={(e) => onUpdate('backgroundImage.src', e.target.value)}
                            placeholder="Background image URL..."
                        />
                        <input
                            type="text"
                            className="form-input"
                            value={section.backgroundImage?.alt || ''}
                            onChange={(e) => onUpdate('backgroundImage.alt', e.target.value)}
                            placeholder="Alt text..."
                        />
                    </div>
                ) : (
                    section.backgroundImage?.src && (
                        <div className="w-full h-40 border rounded overflow-hidden">
                            <img 
                                src={section.backgroundImage.src} 
                                alt={section.backgroundImage.alt} 
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )
                )}
            </div>
        </div>
    );
}