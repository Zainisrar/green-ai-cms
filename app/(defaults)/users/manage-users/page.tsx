'use client';
import React, { useState, useEffect } from 'react';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import IconPlus from '@/components/icon/icon-plus';
import IconEdit from '@/components/icon/icon-edit';
import IconTrash from '@/components/icon/icon-trash';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api-client';

interface User {
    id: number;
    name: string;
    email: string;
    image: string | null;
    isActive: boolean;
    createdAt: string;
    role: {
        id: number;
        name: string;
    } | null;
}

const ManageUsersPage = () => {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'createdAt',
        direction: 'desc',
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const result = await apiClient.get('/api/users');
            setUsers(result.data);
        } catch (error: any) {
            console.error('Fetch users error:', error);
            Swal.fire('Error', error.message || 'Failed to fetch users', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (user: User) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Delete user "${user.name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await apiClient.delete(`/api/users/${user.id}`);
                Swal.fire('Deleted!', 'User has been deleted.', 'success');
                fetchUsers(); // Refresh the list
            } catch (error: any) {
                console.error('Delete user error:', error);
                Swal.fire('Error', error.message || 'Failed to delete user', 'error');
            }
        }
    };

    const columns = [
        {
            accessor: 'name',
            title: 'Name',
            sortable: true,
        },
        {
            accessor: 'email',
            title: 'Email',
            sortable: true,
        },
        {
            accessor: 'role.name',
            title: 'Role',
            render: (user: User) => user.role?.name || 'No Role',
        },
        {
            accessor: 'isActive',
            title: 'Status',
            render: (user: User) => (
                <span className={`badge ${user.isActive ? 'badge-outline-success' : 'badge-outline-danger'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                </span>
            ),
        },
        {
            accessor: 'createdAt',
            title: 'Created At',
            sortable: true,
            render: (user: User) => new Date(user.createdAt).toLocaleDateString(),
        },
        {
            accessor: 'actions',
            title: 'Actions',
            render: (user: User) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => router.push(`/users/edit/${user.id}`)}
                        className="btn btn-sm btn-outline-primary border-green-600 text-green-600 hover:bg-green-600"
                    >
                        <IconEdit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleDelete(user)}
                        className="btn btn-sm btn-outline-danger"
                    >
                        <IconTrash className="w-4 h-4" />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <ProtectedRoute requiredPermission={{ resource: 'users', action: 'view' }}>
            <div className="panel">
                <div className="flex items-center justify-between mb-5">
                    <h5 className="font-semibold text-lg dark:text-white-light">Manage Users</h5>
                    <button
                        onClick={() => router.push('/users/add')}
                        className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600"
                    >
                        <IconPlus className="w-5 h-5 mr-2" />
                        Add User
                    </button>
                </div>

                <div className="datatables">
                    <DataTable
                        className="whitespace-nowrap table-hover"
                        records={users}
                        columns={columns}
                        sortStatus={sortStatus}
                        onSortStatusChange={setSortStatus}
                        minHeight={200}
                        fetching={loading}
                    />
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default ManageUsersPage;