'use client';
import React, { useState, useEffect } from 'react';
import { DataTable } from 'mantine-datatable';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import IconPlus from '@/components/icon/icon-plus';
import { apiClient } from '@/lib/api-client';

interface Role {
    id: number;
    name: string;
    permissions: Record<string, Record<string, boolean>>;
}

const RolesPermissionsPage = () => {
    const router = useRouter();
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [newRole, setNewRole] = useState<{
        name: string;
        permissions: Record<string, Record<string, boolean>>;
    }>({
        name: '',
        permissions: {
            users: { view: false, edit: false, delete: false },
            roles: { view: false, edit: false, delete: false },
            content: { view: false, edit: false, delete: false },
            system: { view: false, edit: false, delete: false },
            endeavors: { view: false, edit: false, delete: false },
            energy: { view: false, edit: false, delete: false },
            engineering: { view: false, edit: false, delete: false },
            enlighten: { view: false, edit: false, delete: false },
            evolution: { view: false, edit: false, delete: false },
            expertise: { view: false, edit: false, delete: false },
            explore: { view: false, edit: false, delete: false }
        }
    });

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            const result = await apiClient.get('/api/roles');
            if (result.success) {
                setRoles(result.data);
            }
        } catch (error: any) {
            console.error('Fetch roles error:', error);
            if (error.message?.includes('401')) {
                router.push('/auth/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRole = async () => {
        if (!newRole.name.trim()) {
            Swal.fire('Error', 'Role name is required', 'error');
            return;
        }

        try {
            const result = editingRole 
                ? await apiClient.put(`/api/roles/${editingRole.id}`, newRole)
                : await apiClient.post('/api/roles', newRole);

            if (result.success) {
                Swal.fire('Success', `Role ${editingRole ? 'updated' : 'created'} successfully`, 'success');
                handleCloseModal();
                fetchRoles();
            } else {
                Swal.fire('Error', result.error || `Failed to ${editingRole ? 'update' : 'create'} role`, 'error');
            }
        } catch (error: any) {
            console.error(`${editingRole ? 'Update' : 'Create'} role error:`, error);
            Swal.fire('Error', error.message || `Failed to ${editingRole ? 'update' : 'create'} role`, 'error');
        }
    };

    const handleCloseModal = () => {
        setShowAddModal(false);
        setEditingRole(null);
        setNewRole({
            name: '',
            permissions: {
                users: { view: false, edit: false, delete: false },
                roles: { view: false, edit: false, delete: false },
                content: { view: false, edit: false, delete: false },
                system: { view: false, edit: false, delete: false },
                endeavors: { view: false, edit: false, delete: false },
                energy: { view: false, edit: false, delete: false },
                engineering: { view: false, edit: false, delete: false },
                enlighten: { view: false, edit: false, delete: false },
                evolution: { view: false, edit: false, delete: false },
                expertise: { view: false, edit: false, delete: false },
                explore: { view: false, edit: false, delete: false }
            }
        });
    };

    const handlePermissionChange = (resource: string, action: string, value: boolean) => {
        setNewRole(prev => ({
            ...prev,
            permissions: {
                ...prev.permissions,
                [resource]: {
                    ...prev.permissions[resource],
                    [action]: value
                }
            }
        }));
    };

    const handleEditRole = (role: Role) => {
        // Prevent editing admin role
        if (role.name === 'admin') {
            Swal.fire('Error', 'Admin role cannot be edited', 'error');
            return;
        }

        setNewRole({
            name: role.name,
            permissions: role.permissions || {
                users: { view: false, edit: false, delete: false },
                roles: { view: false, edit: false, delete: false },
                content: { view: false, edit: false, delete: false },
                system: { view: false, edit: false, delete: false },
                endeavors: { view: false, edit: false, delete: false },
                energy: { view: false, edit: false, delete: false },
                engineering: { view: false, edit: false, delete: false },
                enlighten: { view: false, edit: false, delete: false },
                evolution: { view: false, edit: false, delete: false },
                expertise: { view: false, edit: false, delete: false },
                explore: { view: false, edit: false, delete: false }
            }
        });
        setEditingRole(role);
        setShowAddModal(true);
    };

    const handleDeleteRole = async (role: Role) => {
        if (role.name === 'admin') {
            Swal.fire('Error', 'Cannot delete admin role', 'error');
            return;
        }

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Delete role "${role.name}"? This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                const deleteResult = await apiClient.delete(`/api/roles/${role.id}`);
                if (deleteResult.success) {
                    Swal.fire('Deleted!', 'Role has been deleted.', 'success');
                    fetchRoles();
                } else {
                    Swal.fire('Error', deleteResult.error || 'Failed to delete role', 'error');
                }
            } catch (error: any) {
                console.error('Delete role error:', error);
                Swal.fire('Error', error.message || 'Failed to delete role', 'error');
            }
        }
    };

    const columns = [
        {
            accessor: 'name',
            title: 'Role Name',
        },
        {
            accessor: 'permissions',
            title: 'Permissions',
            render: (role: Role) => {
                const permissionCount = Object.values(role.permissions || {}).reduce((count, resource: any) => {
                    return count + Object.values(resource).filter(Boolean).length;
                }, 0);
                return `${permissionCount} permissions`;
            },
        },
        {
            accessor: 'users',
            title: 'Users Permission',
            render: (role: Role) => {
                const userPerms = role.permissions?.users || {};
                return (
                    <div className="flex gap-1">
                        {userPerms.view && <span className="badge badge-outline-success">View</span>}
                        {userPerms.edit && <span className="badge badge-outline-warning">Edit</span>}
                        {userPerms.delete && <span className="badge badge-outline-danger">Delete</span>}
                    </div>
                );
            },
        },
        {
            accessor: 'content',
            title: 'Content Permission',
            render: (role: Role) => {
                const contentPerms = role.permissions?.content || {};
                return (
                    <div className="flex gap-1">
                        {contentPerms.view && <span className="badge badge-outline-success">View</span>}
                        {contentPerms.edit && <span className="badge badge-outline-warning">Edit</span>}
                        {contentPerms.delete && <span className="badge badge-outline-danger">Delete</span>}
                    </div>
                );
            },
        },
        {
            accessor: 'actions',
            title: 'Actions',
            render: (role: Role) => (
                <div className="flex gap-2">
                    {role.name === 'admin' ? (
                        <span className="text-sm text-gray-500 italic">Protected Role</span>
                    ) : (
                        <>
                            <button
                                onClick={() => handleEditRole(role)}
                                className="btn btn-sm btn-outline-primary border-green-600 text-green-600 hover:bg-green-600"
                                title="Edit Role"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDeleteRole(role)}
                                className="btn btn-sm btn-outline-danger"
                                title="Delete Role"
                            >
                                Delete
                            </button>
                        </>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="panel">
            <div className="flex items-center justify-between mb-5">
                <h5 className="font-semibold text-lg dark:text-white-light">Roles & Permissions</h5>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="btn btn-primary"
                >
                    <IconPlus className="w-5 h-5 mr-2" />
                    Add Role
                </button>
            </div>

            <div className="datatables">
                <DataTable
                    className="whitespace-nowrap table-hover"
                    records={roles}
                    columns={columns}
                    minHeight={200}
                    fetching={loading}
                />
            </div>

            {/* Add Role Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold mb-4">
                            {editingRole ? 'Edit Role' : 'Add New Role'}
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Role Name</label>
                                <input
                                    type="text"
                                    className="form-input w-full"
                                    placeholder="Enter role name"
                                    value={newRole.name}
                                    onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Permissions</label>
                                <div className="space-y-4">
                                    {Object.keys(newRole.permissions).map((resource) => (
                                        <div key={resource} className="border rounded-lg p-4">
                                            <h4 className="font-medium capitalize mb-3">{resource}</h4>
                                            <div className="grid grid-cols-3 gap-4">
                                                {['view', 'edit', 'delete'].map((action) => (
                                                    <label key={action} className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            className="form-checkbox"
                                                            checked={newRole.permissions[resource][action]}
                                                            onChange={(e) => handlePermissionChange(resource, action, e.target.checked)}
                                                        />
                                                        <span className="ml-2 capitalize">{action}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-6">
                            <button
                                onClick={handleCreateRole}
                                className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600"
                            >
                                Create Role
                            </button>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="btn btn-outline-secondary"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RolesPermissionsPage;