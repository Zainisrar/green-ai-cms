# Chatbot Training Interface

This interface allows you to upload and manage training documents for your chatbot. The system processes uploaded files and stores them for chatbot training purposes.

## Features

- **File Upload**: Drag & drop or click to upload training documents
- **Supported Formats**: PDF, TXT, DOC, DOCX files up to 10MB
- **File Management**: View, manage, and delete uploaded training files
- **Processing Status**: Track the processing status of uploaded files
- **Chunking**: Files are automatically processed and chunked for training

## How to Use

1. **Enter a Title**: Provide a descriptive title for your training session
2. **Upload File**: 
   - Drag and drop a file or click to select from your computer
   - OR download the sample PDF file first, then upload it manually
3. **Processing**: The file will be automatically processed by the external API
4. **Management**: View all uploaded files in the training files list below

## Sample File

A sample PDF file (`chatbot_pdf.pdf`) is included in the `public/` directory for testing purposes. You can:
- Click the "Download Sample PDF" button to download it to your computer
- Then upload it using the regular file upload process to test the training functionality

## API Integration

The system integrates with the external Infina API for file processing:

**External API**: `https://api.infina.greendigitall.com/upload`

### Processing Flow:
1. File is uploaded and saved locally
2. Database record created with "processing" status
3. File is sent to external API for processing
4. API returns chunks count and processing results
5. Database is updated with final status and chunk count

### Status Management:
- **processing**: File sent to external API, awaiting response
- **completed**: Successfully processed by external API
- **failed**: External API processing failed

### Features:
- Real-time status updates
- External API error handling
- Automatic retry capability
- Local file backup

## Database Schema

The `chatbot_training` table stores:
- `id`: Unique identifier
- `title`: Training session title
- `file_name`: Original filename
- `file_path`: Path to stored file
- `file_size`: File size in bytes
- `chunks`: Number of processed chunks
- `status`: Processing status
- `created_at`: Upload timestamp
- `updated_at`: Last update timestamp

## File Storage

Files are stored in the `public/uploads/` directory with timestamped filenames to prevent conflicts.

## Security Considerations

- File type validation (only allowed formats)
- File size limits (10MB maximum)
- Filename sanitization
- Secure file storage location