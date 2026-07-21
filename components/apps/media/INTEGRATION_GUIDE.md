# Media Picker Integration Example

This example shows how to integrate the MediaPicker component into your forms for easy media selection from the Cloudinary library.

## Basic Integration Example

```tsx
'use client';
import React, { useState } from 'react';
import MediaPicker from '@/components/apps/media/MediaPicker';
import IconFolder from '@/components/icon/icon-folder';

const MyFormComponent = () => {
    const [imageUrl, setImageUrl] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [showImagePicker, setShowImagePicker] = useState(false);
    const [showVideoPicker, setShowVideoPicker] = useState(false);

    return (
        <div className="space-y-4">
            {/* Image Selection */}
            <div>
                <label className="block text-sm font-medium mb-2">
                    Spokesperson Photo
                </label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        className="form-input flex-1"
                        placeholder="Image URL or browse from library"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                    />
                    <button
                        type="button"
                        onClick={() => setShowImagePicker(true)}
                        className="btn btn-outline-primary"
                    >
                        <IconFolder className="w-4 h-4 mr-2" />
                        Browse Library
                    </button>
                </div>

                {/* Image Preview */}
                {imageUrl && (
                    <div className="mt-2">
                        <img
                            src={imageUrl}
                            alt="Preview"
                            className="h-32 w-32 object-cover rounded-lg"
                        />
                    </div>
                )}
            </div>

            {/* Video Selection */}
            <div>
                <label className="block text-sm font-medium mb-2">
                    Spokesperson Video
                </label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        className="form-input flex-1"
                        placeholder="Video URL or browse from library"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                    />
                    <button
                        type="button"
                        onClick={() => setShowVideoPicker(true)}
                        className="btn btn-outline-primary"
                    >
                        <IconFolder className="w-4 h-4 mr-2" />
                        Browse Library
                    </button>
                </div>

                {/* Video Preview */}
                {videoUrl && (
                    <div className="mt-2">
                        <video
                            src={videoUrl}
                            controls
                            className="h-48 rounded-lg"
                        />
                    </div>
                )}
            </div>

            {/* Image Picker Modal */}
            <MediaPicker
                isOpen={showImagePicker}
                onClose={() => setShowImagePicker(false)}
                onSelect={(url) => {
                    setImageUrl(url);
                    setShowImagePicker(false);
                }}
                allowedTypes={['image']}
                title="Select Spokesperson Photo"
                allowUrlInput={true}
            />

            {/* Video Picker Modal */}
            <MediaPicker
                isOpen={showVideoPicker}
                onClose={() => setShowVideoPicker(false)}
                onSelect={(url) => {
                    setVideoUrl(url);
                    setShowVideoPicker(false);
                }}
                allowedTypes={['video']}
                title="Select Spokesperson Video"
                allowUrlInput={true}
            />
        </div>
    );
};

export default MyFormComponent;
```

## Advanced Integration with Multiple Items

```tsx
'use client';
import React, { useState } from 'react';
import MediaPicker from '@/components/apps/media/MediaPicker';
import IconPlus from '@/components/icon/icon-plus';
import IconTrash from '@/components/icon/icon-trash';
import IconFolder from '@/components/icon/icon-folder';

interface TeamMember {
    name: string;
    photo: string;
    video: string;
}

const TeamManagementForm = () => {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [showPicker, setShowPicker] = useState(false);
    const [pickerConfig, setPickerConfig] = useState<{
        index: number;
        field: 'photo' | 'video';
        type: 'image' | 'video';
    } | null>(null);

    const addMember = () => {
        setMembers([...members, { name: '', photo: '', video: '' }]);
    };

    const updateMember = (index: number, field: keyof TeamMember, value: string) => {
        const updated = [...members];
        updated[index][field] = value;
        setMembers(updated);
    };

    const removeMember = (index: number) => {
        setMembers(members.filter((_, i) => i !== index));
    };

    const openMediaPicker = (index: number, field: 'photo' | 'video', type: 'image' | 'video') => {
        setPickerConfig({ index, field, type });
        setShowPicker(true);
    };

    const handleMediaSelect = (url: string) => {
        if (pickerConfig) {
            updateMember(pickerConfig.index, pickerConfig.field, url);
        }
        setShowPicker(false);
        setPickerConfig(null);
    };

    return (
        <div className="space-y-4">
            <button
                type="button"
                onClick={addMember}
                className="btn btn-primary"
            >
                <IconPlus className="w-4 h-4 mr-2" />
                Add Team Member
            </button>

            {members.map((member, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                        <h6 className="font-medium">Member {index + 1}</h6>
                        <button
                            type="button"
                            onClick={() => removeMember(index)}
                            className="btn btn-outline-danger btn-sm"
                        >
                            <IconTrash className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Name */}
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Member name"
                        value={member.name}
                        onChange={(e) => updateMember(index, 'name', e.target.value)}
                    />

                    {/* Photo */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Photo</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                className="form-input flex-1"
                                placeholder="Photo URL"
                                value={member.photo}
                                onChange={(e) => updateMember(index, 'photo', e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => openMediaPicker(index, 'photo', 'image')}
                                className="btn btn-outline-primary btn-sm"
                            >
                                <IconFolder className="w-4 h-4" />
                            </button>
                        </div>
                        {member.photo && (
                            <img src={member.photo} alt="Preview" className="mt-2 h-20 rounded" />
                        )}
                    </div>

                    {/* Video */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Video</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                className="form-input flex-1"
                                placeholder="Video URL"
                                value={member.video}
                                onChange={(e) => updateMember(index, 'video', e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => openMediaPicker(index, 'video', 'video')}
                                className="btn btn-outline-primary btn-sm"
                            >
                                <IconFolder className="w-4 h-4" />
                            </button>
                        </div>
                        {member.video && (
                            <video src={member.video} controls className="mt-2 h-32 rounded" />
                        )}
                    </div>
                </div>
            ))}

            {/* Single Media Picker for all fields */}
            {pickerConfig && (
                <MediaPicker
                    isOpen={showPicker}
                    onClose={() => {
                        setShowPicker(false);
                        setPickerConfig(null);
                    }}
                    onSelect={handleMediaSelect}
                    allowedTypes={[pickerConfig.type]}
                    title={`Select ${pickerConfig.field === 'photo' ? 'Photo' : 'Video'}`}
                    allowUrlInput={true}
                />
            )}
        </div>
    );
};

export default TeamManagementForm;
```

## MediaPicker Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | required | Controls modal visibility |
| `onClose` | `() => void` | required | Called when modal is closed |
| `onSelect` | `(url: string, file?: MediaFile) => void` | required | Called when media is selected |
| `allowedTypes` | `('image' \| 'video' \| 'raw')[]` | `['image', 'video', 'raw']` | Media types to show |
| `title` | `string` | `'Select Media'` | Modal title |
| `allowUrlInput` | `boolean` | `true` | Show URL input option |

## Benefits of Using MediaPicker

1. **Centralized Media Management**: All media files in one place
2. **Reusability**: No need to upload same file multiple times
3. **Quick Upload**: Upload new files directly from the picker
4. **URL Flexibility**: Support for both uploaded files and external URLs
5. **Better UX**: Visual browsing instead of manual URL input
6. **Consistency**: Same media picker across all forms
7. **Performance**: Leverage Cloudinary's CDN and optimizations

## Best Practices

1. **Always provide allowedTypes**: Filter to relevant media types for better UX
2. **Clear labeling**: Use descriptive titles for the picker modal
3. **Show previews**: Display selected media for visual confirmation
4. **Allow both methods**: Keep URL input option for external links
5. **Handle loading states**: Show loading indicators during upload
6. **Error handling**: Provide clear error messages for failed operations
