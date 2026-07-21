export const uploadProjectImage = async (file: File): Promise<{
    url: string;
    publicId: string;
    originalName: string;
    size: number;
}> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload/project-image', {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
    }

    return response.json();
};