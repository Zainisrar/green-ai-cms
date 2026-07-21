'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthRedirect = () => {
    const router = useRouter();

    useEffect(() => {
        router.replace('/auth/login');
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
        </div>
    );
};

export default AuthRedirect;