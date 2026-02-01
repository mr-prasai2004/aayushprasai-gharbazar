import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../../components/layout';
import { UserRole } from '../../../types';
import { Search, Trash2, User, Loader2 } from 'lucide-react';
import { usersApi } from '../../../services/api';

interface UserData {
    userId: string;
    userName: string;
    email: string;
    role: string;
    fullName?: string;
    phoneNumber?: string;
    profilePictureUrl?: string;
    createdAt: string;
}

export const ManageUsers: React.FC = () => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await usersApi.getAll();
            setUsers(data);
            setError(null);
        } catch (err) {
            console.error('Failed to load users', err);
            setError('Failed to load users. Make sure you are logged in as an admin.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (userId: string) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await usersApi.delete(userId);
                setUsers(prev => prev.filter(u => u.userId !== userId));
            } catch (err) {
                console.error('Failed to delete user', err);
                alert('Failed to delete user');
            }
        }
    };

    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.fullName && u.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const getRoleBadgeColor = (role: string) => {
        switch (role.toUpperCase()) {
            case 'ADMIN': return 'bg-purple-100 text-purple-700';
            case 'SELLER': return 'bg-blue-100 text-blue-700';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <DashboardLayout role={UserRole.ADMIN} title="Manage Users">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <h3 className="font-bold text-gray-800">All Users</h3>
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {loading ? '...' : users.length} users
                        </span>
                    </div>
                    <div className="relative w-full sm:w-64">
                        <Search className="h-4 w-4 absolute left-3 top-2.5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="p-12 text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
                        <p className="text-gray-500">Loading users...</p>
                    </div>
                ) : error ? (
                    <div className="p-12 text-center">
                        <p className="text-red-500 mb-4">{error}</p>
                        <button
                            onClick={fetchUsers}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Retry
                        </button>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="p-12 text-center">
                        <User className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-500">
                            {searchQuery ? 'No users found matching your search.' : 'No users found.'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500">
                                <tr>
                                    <th className="px-6 py-3">User</th>
                                    <th className="px-6 py-3">Email</th>
                                    <th className="px-6 py-3">Role</th>
                                    <th className="px-6 py-3">Joined</th>
                                    <th className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredUsers.map(u => (
                                    <tr key={u.userId} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-3 font-medium">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                                    {u.profilePictureUrl ? (
                                                        <img src={u.profilePictureUrl} alt={u.userName} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-xs font-bold text-gray-600">
                                                            {(u.fullName || u.userName).charAt(0).toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-gray-900">{u.fullName || u.userName}</p>
                                                    <p className="text-xs text-gray-400">@{u.userName}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-gray-500">{u.email}</td>
                                        <td className="px-6 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${getRoleBadgeColor(u.role)}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-gray-500">
                                            {new Date(u.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-3">
                                            <button
                                                onClick={() => handleDelete(u.userId)}
                                                className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition"
                                                title="Delete user"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
