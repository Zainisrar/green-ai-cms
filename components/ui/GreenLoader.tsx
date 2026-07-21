'use client';

interface GreenLoaderProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

export default function GreenLoader({ size = 'md', className = '' }: GreenLoaderProps) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
        xl: 'w-12 h-12'
    };

    return (
        <div className={`inline-block ${sizeClasses[size]} ${className}`}>
            <div className="animate-spin rounded-full border-2 border-green-200 border-t-green-600"></div>
        </div>
    );
}

// Full page loader
export function GreenPageLoader() {
    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-900 dark:to-gray-800">
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
                    <img 
                        src="/g-logo.png" 
                        alt="Green Future CMS Logo" 
                        className="w-full h-full object-contain animate-pulse"
                    />
                </div>
                <div className="animate-spin rounded-full w-8 h-8 border-2 border-green-200 border-t-green-600 mx-auto mb-4"></div>
                <p className="text-green-700 dark:text-green-300 font-medium">Loading Green Future CMS...</p>
            </div>
        </div>
    );
}

// Button loader
export function GreenButtonLoader({ text = 'Loading...' }: { text?: string }) {
    return (
        <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full w-4 h-4 border-2 border-white/30 border-t-white mr-2"></div>
            {text}
        </div>
    );
}