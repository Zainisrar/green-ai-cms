# Media Library

A comprehensive media management system integrated with Cloudinary for managing images, videos, and files.

## Features

### Media Library (`/apps/media`)
- **Browse & Manage**: View all media files from Cloudinary organized by type (Images, Videos, Files)
- **Upload**: Multi-file upload support with automatic type detection
- **Search & Filter**: Search by filename, filter by folder and type
- **Bulk Actions**: Select multiple files for bulk deletion
- **File Details**: View detailed information including dimensions, size, format, and creation date
- **Quick Actions**: 
  - Copy URL to clipboard
  - Download files
  - Delete files
  - Preview files

### Media Picker Component
Reusable modal component for selecting media in forms:

```tsx
import MediaPicker from '@/components/apps/media/MediaPicker';

const [showMediaPicker, setShowMediaPicker] = useState(false);

<MediaPicker
    isOpen={showMediaPicker}
    onClose={() => setShowMediaPicker(false)}
    onSelect={(url, file) => {
        // Use the selected URL
        console.log('Selected:', url);
        setShowMediaPicker(false);
    }}
    allowedTypes={['image']} // Optional: ['image', 'video', 'raw']
    title="Select Image" // Optional
    allowUrlInput={true} // Optional: Allow manual URL input
/>
```

## API Endpoints

### GET `/api/media/list`
Fetch media files from Cloudinary
- **Query Params**:
  - `type`: 'image' | 'video' | 'raw'
  - `folder`: folder path (optional)
  - `max_results`: number (default: 30)
  - `next_cursor`: pagination cursor (optional)

### POST `/api/media/upload`
Upload multiple files
- **Form Data**:
  - `files`: File[] (multiple files)
  - `folder`: string (upload folder)
  - `resourceType`: 'auto' | 'image' | 'video' | 'raw'

### DELETE `/api/media/delete`
Delete a file from Cloudinary
- **Body**:
  - `publicId`: string (file public ID)
  - `resourceType`: string (resource type)

### GET `/api/media/folders`
Get root folders from Cloudinary

### GET `/api/media/subfolders`
Get subfolders for a specific folder
- **Query Params**:
  - `folder`: string (parent folder path)

## Usage in Forms

### Example: Image Upload with Media Picker

```tsx
'use client';
import { useState } from 'react';
import MediaPicker from '@/components/apps/media/MediaPicker';

const MyForm = () => {
    const [imageUrl, setImageUrl] = useState('');
    const [showPicker, setShowPicker] = useState(false);

    return (
        <div>
            <label>Image</label>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="form-input"
                    placeholder="Image URL"
                />
                <button
                    type="button"
                    onClick={() => setShowPicker(true)}
                    className="btn btn-primary"
                >
                    Browse Media
                </button>
            </div>

            {imageUrl && (
                <img src={imageUrl} alt="Preview" className="mt-2 h-32" />
            )}

            <MediaPicker
                isOpen={showPicker}
                onClose={() => setShowPicker(false)}
                onSelect={(url) => {
                    setImageUrl(url);
                    setShowPicker(false);
                }}
                allowedTypes={['image']}
            />
        </div>
    );
};
```

## File Organization

```
app/
  (defaults)/
    apps/
      media/
        page.tsx          # Main media library page
  (apis)/
    api/
      media/
        list/
          route.ts        # List media files
        upload/
          route.ts        # Upload files
        delete/
          route.ts        # Delete files
        folders/
          route.ts        # Get folders
        subfolders/
          route.ts        # Get subfolders

components/
  apps/
    media/
      MediaLibrary.tsx    # Main media library component
      MediaPicker.tsx     # Reusable media picker modal
```

## Cloudinary Configuration

Ensure your `.env.local` has:
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

## Permissions

The media library is protected by the authentication middleware. Users need:
- Resource: `media`
- Action: `view`

## Features Roadmap

- [x] Browse all media types
- [x] Multi-file upload
- [x] Search and filter
- [x] Bulk delete
- [x] Copy URL to clipboard
- [x] File details modal
- [x] Media picker component
- [x] URL input option
- [ ] Folder creation
- [ ] File renaming
- [ ] Image editing (crop, resize)
- [ ] Tags and metadata
- [ ] Advanced search
- [ ] Favorites/Collections
