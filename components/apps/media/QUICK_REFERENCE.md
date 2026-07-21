# Media Library - Quick Reference

## 🚀 Quick Start

### Access Media Library
Navigate to: `/apps/media`

### Using MediaPicker in Forms

```tsx
// 1. Import
import MediaPicker from '@/components/apps/media/MediaPicker';
import { useState } from 'react';

// 2. Add state
const [imageUrl, setImageUrl] = useState('');
const [showPicker, setShowPicker] = useState(false);

// 3. Add button
<button onClick={() => setShowPicker(true)}>
    Browse Media
</button>

// 4. Add picker
<MediaPicker
    isOpen={showPicker}
    onClose={() => setShowPicker(false)}
    onSelect={(url) => {
        setImageUrl(url);
        setShowPicker(false);
    }}
    allowedTypes={['image']}
/>
```

## 📝 Common Patterns

### Image Field
```tsx
<MediaPicker
    allowedTypes={['image']}
    title="Select Image"
/>
```

### Video Field
```tsx
<MediaPicker
    allowedTypes={['video']}
    title="Select Video"
/>
```

### Any File
```tsx
<MediaPicker
    allowedTypes={['image', 'video', 'raw']}
    title="Select File"
/>
```

### With URL Input
```tsx
<MediaPicker
    allowUrlInput={true}  // Allow external URLs
/>
```

## 🎯 API Quick Reference

### Upload Files
```typescript
POST /api/media/upload
FormData: {
    files: File[],
    folder: string,
    resourceType: 'auto' | 'image' | 'video' | 'raw'
}
```

### List Files
```typescript
GET /api/media/list?type=image&folder=my-folder&max_results=30
```

### Delete File
```typescript
DELETE /api/media/delete
Body: {
    publicId: string,
    resourceType: string
}
```

## 🔑 Props Reference

```typescript
interface MediaPickerProps {
    isOpen: boolean;              // Required: Show/hide modal
    onClose: () => void;          // Required: Close handler
    onSelect: (url: string, file?: MediaFile) => void;  // Required: Selection handler
    allowedTypes?: ('image' | 'video' | 'raw')[];      // Optional: Filter types
    title?: string;               // Optional: Modal title
    allowUrlInput?: boolean;      // Optional: Show URL input
}
```

## 💡 Tips

1. **Always filter types**: Use `allowedTypes` to show only relevant media
2. **Provide clear titles**: Help users understand what they're selecting
3. **Show previews**: Display selected media for confirmation
4. **Keep URL option**: `allowUrlInput={true}` for external links
5. **Handle loading**: Show spinner while uploading

## 🐛 Troubleshooting

### Picker not showing?
- Check `isOpen` state is true
- Verify z-index (picker uses z-[9999])

### Upload failing?
- Check Cloudinary credentials in `.env.local`
- Verify file size limits
- Check browser console for errors

### Files not listing?
- Verify authentication token
- Check API endpoint logs
- Ensure Cloudinary credentials are correct

## 📚 Full Documentation

- **README.md** - Complete feature documentation
- **INTEGRATION_GUIDE.md** - Detailed examples and patterns
- **IMPLEMENTATION_SUMMARY.md** - Technical implementation details

## 🔗 Navigation

Access: **Apps > Media** in the sidebar

Or directly: `http://localhost:3000/apps/media`
