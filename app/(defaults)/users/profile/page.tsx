'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api-client';
import ImageUploadField from '@/components/shared/ImageUploadField';

interface User {
    id: number;
    name: string;
    email: string;
    image: string | null;
    role: {
        id: number;
        name: string;
    } | null;
}

const ProfilePage = () => {
    const router = useRouter();
    const { user: authUser, logout } = useAuth();
    const [user, setUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        password: '',
        image: '',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const result = await apiClient.get('/api/profile');
            setUser(result.data);
            setFormData({
                name: result.data.name,
                password: '',
                image: result.data.image || '',
            });
        } catch (error: any) {
            console.error('Fetch profile error:', error);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (formData.password && formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const updateData: any = {
                name: formData.name,
                image: formData.image,
            };

            // Only include password if it's provided
            if (formData.password) {
                updateData.password = formData.password;
            }

            const result = await apiClient.put('/api/profile', updateData);

            if (result.success) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Profile updated successfully',
                    icon: 'success',
                    confirmButtonText: 'OK',
                });

                // Update local user data
                const userData = JSON.parse(localStorage.getItem('user') || '{}');
                userData.name = result.data.name;
                localStorage.setItem('user', JSON.stringify(userData));

                // Clear password field
                setFormData((prev) => ({ ...prev, password: '' }));

                // Refresh profile data
                fetchProfile();
            } else {
                Swal.fire({
                    title: 'Error!',
                    text: result.error || 'Failed to update profile',
                    icon: 'error',
                    confirmButtonText: 'OK',
                });
            }
        } catch (error) {
            console.error('Update profile error:', error);
            Swal.fire({
                title: 'Error!',
                text: 'An error occurred while updating profile',
                icon: 'error',
                confirmButtonText: 'OK',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
    };

    if (!user) {
        return <div className="panel">Loading...</div>;
    }

    return (
        <ProtectedRoute>
            <div className="panel">
                <div className="flex items-center justify-between mb-5">
                    <h5 className="font-semibold text-lg dark:text-white-light">My Profile</h5>
                    <button onClick={handleLogout} className="btn btn-outline-danger">
                        Logout
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Profile Info */}
                    <div className="panel">
                        <h6 className="text-lg font-semibold mb-4">Profile Information</h6>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-600">Email</label>
                                <p className="text-gray-900">{user.email}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Role</label>
                                <p className="text-gray-900">{user.role?.name || 'No Role'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">User ID</label>
                                <p className="text-gray-900">#{user.id}</p>
                            </div>
                        </div>
                    </div>

                    {/* Edit Profile */}
                    <div className="panel">
                        <h6 className="text-lg font-semibold mb-4">Edit Profile</h6>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Name *</label>
                                <input type="text" className="form-input" placeholder="Enter your name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} />
                                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium mb-2">New Password (Leave blank to keep current)</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    placeholder="Enter new password"
                                    value={formData.password}
                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                />
                                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                            </div>

                         
                            {/* Submit Button */}
                            <div className="pt-4">
                                <button type="submit" disabled={loading} className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600">
                                    {loading ? 'Updating...' : 'Update Profile'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default ProfilePage;
