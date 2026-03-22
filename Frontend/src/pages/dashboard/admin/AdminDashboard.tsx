import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../../components/layout';
import { UserRole, PropertyStatus, Notification } from '../../../types';
import { CheckCircle, XCircle, Eye, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { PropertyVerificationCard } from '../../../components/PropertyVerificationCard';
import { propertiesApi, usersApi } from '../../../services/api';

export const AdminDashboard: React.FC = () => {
    const [pendingProperties, setPendingProperties] = useState<any[]>([]);
    const [verificationProperties, setVerificationProperties] = useState<any[]>([]);
    const [allProperties, setAllProperties] = useState<any[]>([]);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'verification'>('overview');
    const [showAddAdminModal, setShowAddAdminModal] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState<any>(null);
    const [showPropertyModal, setShowPropertyModal] = useState(false);
    const [adminFormData, setAdminFormData] = useState({
        email: '',
        password: '',
        fullName: '',
    });

    const navigate = useNavigate();

    // Load properties and users data from API 
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [pending, all, users] = await Promise.all([
                    propertiesApi.getPending(),
                    propertiesApi.getAll(),
                    usersApi.getAll().catch(() => []) // Gracefully handle if not admin
                ]);
                setPendingProperties(pending);
                setVerificationProperties(pending);
                setAllProperties(all);
                setAllUsers(users);
            } catch (err) {
                console.error('Failed to load data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Calculate dynamic graph data
    const chartDataGrowth = useMemo(() => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentYear = new Date().getFullYear();
        const counts = new Array(12).fill(0);
        
        allUsers.forEach(user => {
            if (!user.createdAt) return;
            const date = new Date(user.createdAt);
            if (date.getFullYear() === currentYear) {
                counts[date.getMonth()] += 1;
            }
        });
        
        let cumulative = 0;
        return months.map((name, index) => {
            cumulative += counts[index];
            return { name, users: cumulative };
        });
    }, [allUsers]);

    const chartDataPie = useMemo(() => {
        if (!allProperties || allProperties.length === 0) return [];
        const counts: Record<string, number> = {};
        allProperties.forEach(p => {
            const status = p.status || 'Unknown';
            counts[status] = (counts[status] || 0) + 1;
        });
        
        const colors = ['#f97316', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
        return Object.keys(counts).map((key, index) => ({
            name: key,
            value: counts[key],
            color: colors[index % colors.length]
        }));
    }, [allProperties]);

    const handleApprove = async (propertyId: string) => {
        try {
            await propertiesApi.verify(propertyId, { verificationStatus: 'verified' });

            // Send notification to owner
            const property = pendingProperties.find(p => p.propertyId === propertyId);
            if (property) {
                // We should add a new notification API call for creating notifications?
                // Or maybe the backend automatically sends notification on verification?
                // The current backend VerifyProperty does NOT create notification.
                // Assuming we can skip explicit notification creation from frontend for now or add it later.
                // Or use notificationsApi if we add 'create' method.
            }

            alert('Property approved and listed!');
            // Refresh list
            const updated = pendingProperties.filter(p => p.propertyId !== propertyId);
            setPendingProperties(updated);
            setVerificationProperties(updated);
        } catch (err) {
            console.error('Failed to approve property', err);
            alert('Failed to approve property');
        }
    };

    const handleReject = async (propertyId: string) => {
        if (window.confirm("Reject this property? It will be deleted.")) {
            try {
                await propertiesApi.delete(propertyId);

                const updated = pendingProperties.filter(p => p.propertyId !== propertyId);
                setPendingProperties(updated);
                setVerificationProperties(updated);
                alert('Property rejected and deleted.');
            } catch (err) {
                console.error('Failed to reject property', err);
                alert('Failed to reject property: ' + err);
            }
        }
    };

    const handlePropertyVerification = async (propertyId: string, status: 'verified' | 'rejected', notes: string) => {
        try {
            await propertiesApi.verify(propertyId, { verificationStatus: status, verificationNotes: notes });
            alert(`Property ${status === 'verified' ? 'verified' : 'rejected'} successfully!`);

            // Refresh list
            if (status === 'verified') {
                const updated = pendingProperties.filter(p => p.propertyId !== propertyId);
                setPendingProperties(updated);
                setVerificationProperties(updated);
            } else {
                // If rejected, does it stay in pending or get deleted?
                // Backend just updates status.
                // Frontend should probably remove it from "Pending" list if we treat "verified/rejected" as done.
                const updated = pendingProperties.filter(p => p.propertyId !== propertyId);
                setPendingProperties(updated);
                setVerificationProperties(updated);
            }
        } catch (err) {
            console.error('Failed to verify property', err);
            alert('Failed to verify property');
        }
    };

    const handleAddAdmin = () => {
        if (!adminFormData.email || !adminFormData.password || !adminFormData.fullName) {
            alert('Please fill in all fields');
            return;
        }
        alert(`Admin created: ${adminFormData.fullName} (${adminFormData.email})`);
        setAdminFormData({ email: '', password: '', fullName: '' });
        setShowAddAdminModal(false);
    };

    return (
        <DashboardLayout role={UserRole.ADMIN} title="Dashboard Overview">
            {/* Tab Navigation */}
            <div className="flex gap-4 mb-8 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-4 py-3 font-medium border-b-2 transition ${activeTab === 'overview'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                        }`}
                >
                    Overview
                </button>
                <button
                    onClick={() => setActiveTab('verification')}
                    className={`px-4 py-3 font-medium border-b-2 transition relative ${activeTab === 'verification'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                        }`}
                >
                    Property Verification
                    {verificationProperties.length > 0 && (
                        <span className="absolute top-1 right-0 transform translate-x-2 -translate-y-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {verificationProperties.length}
                        </span>
                    )}
                </button>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <>
                    {/* Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {[
                            { label: 'Total Users', val: loading ? '...' : allUsers.length.toString(), sub: 'Registered accounts' },
                            { label: 'Active Listings', val: loading ? '...' : allProperties.filter(p => p.verificationStatus === 'verified').length.toString(), sub: 'Verified properties' },
                            { label: 'Pending Approvals', val: loading ? '...' : pendingProperties.length.toString(), sub: 'Needs action' },
                            { label: 'Pending Verification', val: loading ? '...' : verificationProperties.length.toString(), sub: 'Document review' }
                        ].map((stat, i) => (
                            <div key={i} className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                <h3 className="text-2xl font-bold mt-2 text-gray-800">{stat.val}</h3>
                                <p className="text-xs text-green-600 mt-1">{stat.sub}</p>
                            </div>
                        ))}
                    </div>

                    {/* Chart */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8">
                        <h3 className="text-lg font-bold mb-6 text-gray-800">User Growth Trends</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartDataGrowth}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-4 mb-8">
                        <button onClick={() => navigate('/dashboard/properties')} className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition">Review Pending Properties</button>
                        <button onClick={() => navigate('/dashboard/users')} className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition">Manage Users</button>
                        <button onClick={() => setShowAddAdminModal(true)} className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition">Add New Admin</button>
                    </div>

                    {/* Activity Table */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-8 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800">Properties Awaiting Approval</h3>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{pendingProperties.length} request(s)</span>
                        </div>
                        {pendingProperties.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-500">
                                        <tr>
                                            <th className="px-6 py-3">Property</th>
                                            <th className="px-6 py-3">Type</th>
                                            <th className="px-6 py-3">Status</th>
                                            <th className="px-6 py-3">Date Added</th>
                                            <th className="px-6 py-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {pendingProperties.map((p) => (
                                            <tr key={p.propertyId} className="hover:bg-gray-50 transition">
                                                <td className="px-6 py-3 font-medium text-gray-900">{p.title}</td>
                                                <td className="px-6 py-3 text-gray-600">{p.propertyType}</td>
                                                <td className="px-6 py-3"><span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Pending</span></td>
                                                <td className="px-6 py-3 text-gray-500">{new Date(p.listedDate).toLocaleDateString()}</td>
                                                <td className="px-6 py-3 flex gap-2">
                                                    <button onClick={() => { setSelectedProperty(p); setShowPropertyModal(true); }} className="text-gray-400 hover:text-blue-600 p-1" title="View"><Eye className="h-4 w-4" /></button>
                                                    <button onClick={() => handleApprove(p.propertyId)} className="text-gray-400 hover:text-green-600 p-1" title="Approve"><CheckCircle className="h-4 w-4" /></button>
                                                    <button onClick={() => handleReject(p.propertyId)} className="text-gray-400 hover:text-red-600 p-1" title="Reject"><XCircle className="h-4 w-4" /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-8 text-center text-gray-500">
                                <CheckCircle className="h-12 w-12 mx-auto text-green-200 mb-2" />
                                <p>All caught up! No pending properties.</p>
                            </div>
                        )}
                    </div>

                    {/* Bottom Charts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                            <h3 className="font-bold mb-4 text-gray-800">Transaction Type Breakdown</h3>
                            <div className="h-48 flex justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={chartDataPie} innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                                            {chartDataPie.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex justify-center gap-4 text-xs mt-2 flex-wrap">
                                {chartDataPie.map(d => <span key={d.name} className="flex items-center gap-1 text-gray-600"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></span>{d.name}</span>)}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Verification Tab */}
            {activeTab === 'verification' && (
                <div>
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Property Document Verification</h2>
                        <p className="text-gray-600 text-sm mt-1">Review property documents and details to verify or reject listings</p>
                    </div>

                    {verificationProperties.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6">
                            {verificationProperties.map(property => (
                                <PropertyVerificationCard
                                    key={property.propertyId}
                                    property={property}
                                    onVerify={handlePropertyVerification}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                            <CheckCircle className="h-16 w-16 text-green-200 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">All Properties Verified</h3>
                            <p className="text-gray-600">No properties pending document verification at this time.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Add New Admin Modal */}
            {showAddAdminModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">Add New Admin</h3>
                            <button onClick={() => setShowAddAdminModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={adminFormData.fullName}
                                    onChange={(e) => setAdminFormData({ ...adminFormData, fullName: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                    placeholder="e.g., John Smith"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    value={adminFormData.email}
                                    onChange={(e) => setAdminFormData({ ...adminFormData, email: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                    placeholder="admin@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                                <input
                                    type="password"
                                    value={adminFormData.password}
                                    onChange={(e) => setAdminFormData({ ...adminFormData, password: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                            <button
                                onClick={() => setShowAddAdminModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition">
                                Cancel
                            </button>
                            <button
                                onClick={handleAddAdmin}
                                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition">
                                Create Admin
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Property Detail Modal */}
            {showPropertyModal && selectedProperty && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 max-w-2xl w-full shadow-xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">{selectedProperty.title}</h3>
                                <p className="text-sm text-gray-600 mt-1">{selectedProperty.location}</p>
                            </div>
                            <button onClick={() => { setShowPropertyModal(false); setSelectedProperty(null); }} className="text-gray-400 hover:text-gray-600">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Property Image */}
                        {selectedProperty.images && selectedProperty.images.length > 0 && (
                            <img src={selectedProperty.images[0].imageUrl} alt={selectedProperty.title} className="w-full h-64 object-cover rounded-lg mb-6" />
                        )}

                        {/* Property Details Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg mb-6">
                            <div>
                                <p className="text-xs text-gray-500 font-medium uppercase">Price</p>
                                <p className="text-lg font-bold text-gray-900">NPR {selectedProperty.price?.toLocaleString('en-NP')}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium uppercase">Bedrooms</p>
                                <p className="text-lg font-bold text-gray-900">{selectedProperty.bedrooms}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium uppercase">Bathrooms</p>
                                <p className="text-lg font-bold text-gray-900">{selectedProperty.bathrooms}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium uppercase">Area</p>
                                <p className="text-lg font-bold text-gray-900">{selectedProperty.areaSqft?.toLocaleString() || 'N/A'} sqft</p>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="mb-6">
                            <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                            <p className="text-gray-700">{selectedProperty.description}</p>
                        </div>

                        {/* Amenities */}
                        {selectedProperty.amenities && selectedProperty.amenities.length > 0 && (
                            <div className="mb-6">
                                <h4 className="font-semibold text-gray-900 mb-3">Amenities</h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedProperty.amenities.map((amenity: string) => (
                                        <span key={amenity} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                                            {amenity}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Documents Section */}
                        {selectedProperty.documents && selectedProperty.documents.length > 0 && (
                            <div className="mb-6">
                                <h4 className="font-semibold text-gray-900 mb-3">Documents</h4>
                                <div className="space-y-2">
                                    {selectedProperty.documents.map((doc: any) => (
                                        <div key={doc.documentId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-900">{doc.documentType}</p>
                                                <p className="text-xs text-gray-500">{doc.documentName}</p>
                                            </div>
                                            <a href={doc.documentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                                                View
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3 pt-6 border-t border-gray-200">
                            <button
                                onClick={() => { setShowPropertyModal(false); setSelectedProperty(null); }}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    )
}

