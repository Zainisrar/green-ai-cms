import React from 'react';
import IconPlus from '@/components/icon/icon-plus';
import IconTrash from '@/components/icon/icon-trash';
import { ImageListType } from 'react-images-uploading';

interface ActionButtonsEditorProps {
    section: any;
    isEditing: boolean;
    onUpdate: (field: string, value: any) => void;
    onAddButton: (button: any) => void;
    onRemoveButton: (index: number) => void;
    onImageUpload: (buttonIndex: number, imageList: ImageListType) => void;
    isUploading: boolean;
    navigationItems?: any[];
    onOpenMediaPicker?: (buttonIndex: number) => void;
}

export default function ActionButtonsEditor({ 
    section, 
    isEditing, 
    onUpdate, 
    onAddButton, 
    onRemoveButton, 
    onImageUpload, 
    isUploading,
    navigationItems = [],
    onOpenMediaPicker
}: ActionButtonsEditorProps) {
    const [linkTypes, setLinkTypes] = React.useState<{ [key: number]: 'navigation' | 'manual' }>({});

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-medium">Action Buttons</label>
                {isEditing && (
                    <button
                        onClick={() => onAddButton({
                            text: '',
                            type: 'primary',
                            link: '',
                            style: '',
                            icon: { type: 'image', src: '', alt: '', position: 'right' }
                        })}
                        className="btn btn-primary btn-sm"
                    >
                        <IconPlus className="w-4 h-4" />
                        Add Button
                    </button>
                )}
            </div>

            <div className="space-y-3">
                {(section.buttons || []).map((button: any, index: number) => (
                    <div key={index} className="p-4 border rounded">
                        {isEditing && (
                            <div className="flex justify-end mb-2">
                                <button
                                    onClick={() => onRemoveButton(index)}
                                    className="btn btn-danger btn-xs"
                                >
                                    <IconTrash className="w-3 h-3" />
                                    Remove
                                </button>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Button Text</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={button.text || ''}
                                        onChange={(e) => {
                                            const updatedButtons = [...section.buttons];
                                            updatedButtons[index].text = e.target.value;
                                            onUpdate('buttons', updatedButtons);
                                        }}
                                        placeholder="Button text..."
                                    />
                                ) : (
                                    <p className="font-semibold">{button.text}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Link</label>
                                {isEditing ? (
                                    <div className="space-y-2">
                                        <div className="flex gap-2">
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name={`linkType-${index}`}
                                                    checked={linkTypes[index] === 'navigation'}
                                                    onChange={() => setLinkTypes({ ...linkTypes, [index]: 'navigation' })}
                                                    className="form-radio"
                                                />
                                                <span className="ml-1 text-xs">Navigation</span>
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name={`linkType-${index}`}
                                                    checked={linkTypes[index] === 'manual' || !linkTypes[index]}
                                                    onChange={() => setLinkTypes({ ...linkTypes, [index]: 'manual' })}
                                                    className="form-radio"
                                                />
                                                <span className="ml-1 text-xs">Manual</span>
                                            </label>
                                        </div>
                                        {linkTypes[index] === 'navigation' ? (
                                            <select
                                                className="form-select"
                                                value={button.link || ''}
                                                onChange={(e) => {
                                                    const updatedButtons = [...section.buttons];
                                                    updatedButtons[index].link = e.target.value;
                                                    onUpdate('buttons', updatedButtons);
                                                }}
                                            >
                                                <option value="">Select navigation...</option>
                                                {navigationItems.map((item: any) => (
                                                    <option key={item.id} value={item.slug}>
                                                        {item.displayName} - {item.slug}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={button.link || ''}
                                                onChange={(e) => {
                                                    const updatedButtons = [...section.buttons];
                                                    updatedButtons[index].link = e.target.value;
                                                    onUpdate('buttons', updatedButtons);
                                                }}
                                                placeholder="Button link..."
                                            />
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-600">{button.link}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Type</label>
                                {isEditing ? (
                                    <select
                                        className="form-select"
                                        value={button.type || 'primary'}
                                        onChange={(e) => {
                                            const updatedButtons = [...section.buttons];
                                            updatedButtons[index].type = e.target.value;
                                            onUpdate('buttons', updatedButtons);
                                        }}
                                    >
                                        <option value="primary">Primary</option>
                                        <option value="secondary">Secondary</option>
                                    </select>
                                ) : (
                                    <p className="text-sm text-gray-600">{button.type}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Style</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={button.style || ''}
                                        onChange={(e) => {
                                            const updatedButtons = [...section.buttons];
                                            updatedButtons[index].style = e.target.value;
                                            onUpdate('buttons', updatedButtons);
                                        }}
                                        placeholder="green-gradient"
                                    />
                                ) : (
                                    <p className="text-sm text-gray-600">{button.style}</p>
                                )}
                            </div>
                        </div>

                        {/* Icon */}
                        {isEditing && (
                            <div className="mt-4">
                                <label className="block text-sm font-medium mb-2">Icon</label>
                                <div className="space-y-2">
                                    {button.icon?.src && (
                                        <div className="flex items-center gap-2">
                                            <img src={button.icon.src} alt="Icon" className="w-8 h-8 object-contain" />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const updatedButtons = [...section.buttons];
                                                    updatedButtons[index].icon.src = '';
                                                    onUpdate('buttons', updatedButtons);
                                                }}
                                                className="btn btn-danger btn-xs"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    )}
                                    {onOpenMediaPicker && (
                                        <button
                                            type="button"
                                            onClick={() => onOpenMediaPicker(index)}
                                            className="btn btn-outline-primary btn-sm"
                                        >
                                            Browse Media
                                        </button>
                                    )}
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="text"
                                            className="form-input text-sm"
                                            value={button.icon?.src || ''}
                                            onChange={(e) => {
                                                const updatedButtons = [...section.buttons];
                                                if (!updatedButtons[index].icon) updatedButtons[index].icon = {};
                                                updatedButtons[index].icon.src = e.target.value;
                                                onUpdate('buttons', updatedButtons);
                                            }}
                                            placeholder="Icon URL..."
                                        />
                                        <select
                                            className="form-select text-sm"
                                            value={button.icon?.position || 'right'}
                                            onChange={(e) => {
                                                const updatedButtons = [...section.buttons];
                                                if (!updatedButtons[index].icon) updatedButtons[index].icon = {};
                                                updatedButtons[index].icon.position = e.target.value;
                                                onUpdate('buttons', updatedButtons);
                                            }}
                                        >
                                            <option value="left">Left</option>
                                            <option value="right">Right</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
