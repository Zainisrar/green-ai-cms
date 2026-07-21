'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import IconArrowBackward from '@/components/icon/icon-arrow-backward';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api-client';
import ImageUploadField from '@/components/shared/ImageUploadField';

interface Role {
    id: number;
    name: string;
}

const AddUserPage = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        roleId: '',
        image: '',
    });
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            const result = await apiClient.get('/api/roles');
            setRoles(result.data);
        } catch (error: any) {
            console.error('Fetch roles error:', error);
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

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.password.trim()) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
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
            const result = await apiClient.post('/api/users', {
                ...formData,
                roleId: formData.roleId ? parseInt(formData.roleId) : null,
            });

            if (result.success) {
                Swal.fire({
                    title: 'Success!',
                    text: 'User created successfully',
                    icon: 'success',
                    confirmButtonText: 'OK',
                }).then(() => {
                    router.push('/users/manage-users');
                });
            } else {
                Swal.fire({
                    title: 'Error!',
                    text: result.error || 'Failed to create user',
                    icon: 'error',
                    confirmButtonText: 'OK',
                });
            }
        } catch (error) {
            console.error('Create user error:', error);
            Swal.fire({
                title: 'Error!',
                text: 'An error occurred while creating user',
                icon: 'error',
                confirmButtonText: 'OK',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute requiredPermission={{ resource: 'users', action: 'edit' }}>
            <div className="panel">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <button onClick={() => router.back()} className="btn btn-outline-primary btn-sm border-green-600 text-green-600 hover:bg-green-600">
                            <IconArrowBackward className="w-4 h-4" />
                        </button>
                        <h5 className="font-semibold text-lg dark:text-white-light">Add New User</h5>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Name *</label>
                        <input type="text" className="form-input" placeholder="Enter user name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Email *</label>
                        <input type="email" className="form-input" placeholder="Enter email address" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Password *</label>
                        <input type="password" className="form-input" placeholder="Enter password" value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)} />
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                    </div>

                    {/* Role */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Role</label>
                        <select className="form-select" value={formData.roleId} onChange={(e) => handleInputChange('roleId', e.target.value)}>
                            <option value="">Select a role</option>
                            {roles.map((role) => (
                                <option key={role.id} value={role.id}>
                                    {role.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Profile Image */}
                    <div>
                        <ImageUploadField
                            value={{ src: formData.image, alt: 'Profile image' }}
                            onChange={(img) => handleInputChange('image', img.src)}
                            folder="users/profiles"
                            label="Profile Image (Optional)"
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-2 pt-4">
                        <button type="submit" disabled={loading} className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600">
                            {loading ? 'Creating...' : 'Create User'}
                        </button>
                        <button type="button" onClick={() => router.back()} className="btn btn-outline-secondary">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </ProtectedRoute>
    );
};

export default AddUserPage;
