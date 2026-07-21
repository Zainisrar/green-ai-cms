import React from 'react';
import IconPlus from '@/components/icon/icon-plus';
import IconTrash from '@/components/icon/icon-trash';

interface HighlightBoxEditorProps {
    section: any;
    isEditing: boolean;
    onUpdate: (field: string, value: any) => void;
    onAddLine: (line: string) => void;
    onRemoveLine: (index: number) => void;
}

export default function HighlightBoxEditor({ 
    section, 
    isEditing, 
    onUpdate, 
    onAddLine, 
    onRemoveLine 
}: HighlightBoxEditorProps) {
    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-2">Style</label>
                {isEditing ? (
                    <input
                        type="text"
                        className="form-input"
                        value={section.content?.style || ''}
                        onChange={(e) => onUpdate('content.style', e.target.value)}
                        placeholder="italic-green-highlight"
                    />
                ) : (
                    <p className="text-sm text-gray-600">{section.content?.style}</p>
                )}
            </div>
            
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium">Content Lines</label>
                    {isEditing && (
                        <button onClick={() => onAddLine('')} className="btn btn-primary btn-xs">
                            <IconPlus className="w-3 h-3" />
                            Add Line
                        </button>
                    )}
                </div>
                
                {isEditing ? (
                    <div className="space-y-2">
                        {(section.content?.lines || []).map((line: string, index: number) => (
                            <div key={index} className="flex items-center gap-2">
                                <input
                                    type="text"
                                    className="form-input flex-1"
                                    value={line}
                                    onChange={(e) => {
                                        const updatedLines = [...section.content.lines];
                                        updatedLines[index] = e.target.value;
                                        onUpdate('content.lines', updatedLines);
                                    }}
                                    placeholder={`Line ${index + 1}...`}
                                />
                                <button
                                    onClick={() => onRemoveLine(index)}
                                    className="btn btn-danger btn-sm"
                                >
                                    <IconTrash className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                        {(section.content?.lines || []).map((line: string, index: number) => (
                            <p key={index} className="italic text-green-800 font-medium">{line}</p>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}