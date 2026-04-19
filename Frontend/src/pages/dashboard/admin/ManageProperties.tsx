import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../../components/layout';
import { UserRole } from '../../../types';
import { propertiesApi } from '../../../services/api';
import { Trash2, X, Eye, User as UserIcon } from 'lucide-react';
import { PropertyVerificationCard } from '../../../components/PropertyVerificationCard';
import { usersApi } from '../../../services/api';
import { useToast } from '../../../components/Toast';

export const AdminManageProperties: React.FC = () => {
    const toast = useToast();
    const [props, setProps] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    // Load all properties from API on mount
    useEffect(() => {
        loadProperties();
    }, []);

    const loadProperties = async () => {
        try {
            setLoading(true);
            const data = await propertiesApi.getAll();
            setProps(data);
        } catch (err) {
            console.error('Failed to load properties', err);
        } finally {
            setLoading(false);
        }
    };

    const [viewingOwnerId, setViewingOwnerId] = useState<string | null>(null);
    const [ownerData, setOwnerData] = useState<any>(null);
    const [loadingOwner, setLoadingOwner] = useState(false);
    
    // Add view property state
    const [viewingProperty, setViewingProperty] = useState<any>(null);

    const handleViewOwner = async (ownerId: string) => {
        setViewingOwnerId(ownerId);
        setLoadingOwner(true);
        try {
            const user = await usersApi.getById(ownerId);
            setOwnerData(user);
        } catch (err) {
            console.error('Failed to load owner profile', err);
            toast.error('Failed to load owner profile');
        } finally {
            setLoadingOwner(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirmDeleteId !== id) {
            setConfirmDeleteId(id);
            return;
        }
        setConfirmDeleteId(null);
        try {
            await propertiesApi.delete(id);
            setProps(props.filter(p => p.propertyId !== id));
            toast.success('Property deleted.');
        } catch (err) {
            console.error('Failed to delete property', err);
            toast.error('Failed to delete property');
        }
    };

    const handlePropertyVerification = async (propertyId: string, status: 'verified' | 'rejected', notes: string) => {
        try {
            await propertiesApi.verify(propertyId, { verificationStatus: status, verificationNotes: notes });
            toast.success(`Property ${status === 'verified' ? 'verified' : 'rejected'} successfully!`);
            
            // Refresh list with updated status
            setProps(props.map(p => p.propertyId === propertyId ? { ...p, verificationStatus: status } : p));
            setViewingProperty(null);
        } catch (err) {
            console.error('Failed to verify property', err);
            toast.error('Failed to verify property');
        }
    };

    return (
        <DashboardLayout role={UserRole.ADMIN} title="Manage Properties">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">Property Listings Database</h3>
                    <button onClick={loadProperties} className="text-sm text-blue-600 hover:underline">Refresh</button>
                </div>
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="px-6 py-3">Property</th>
                                <th className="px-6 py-3">Location</th>
                                <th className="px-6 py-3">Price</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {props.map(p => (
                                <tr key={p.propertyId} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-3 font-medium flex items-center gap-3 text-gray-900 min-w-[250px]">
                                        <img src={p.images && p.images.length > 0 ? p.images[0].imageUrl : 'https://placehold.co/100x100'} className="w-10 h-10 rounded object-cover" alt={p.title} />
                                        <div>
                                            <p className="font-semibold">{p.title}</p>
                                            <p className="text-xs text-gray-400">ID: {p.propertyId}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3 text-gray-500">{p.location}</td>
                                    <td className="px-6 py-3 font-medium text-gray-900">${p.price.toLocaleString()}</td>
                                    <td className="px-6 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.status === 'For Sale' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {p.status}
                                        </span>
                                        {p.verificationStatus === 'pending' && (
                                            <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                                                Pending Review
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-3 flex gap-2">
                                        <button onClick={() => setViewingProperty(p)} className="text-gray-400 hover:text-green-600 p-1" title="View Property & Verify"><Eye className="h-4 w-4" /></button>
                                        <button onClick={() => handleViewOwner(p.ownerId)} className="text-gray-400 hover:text-blue-600 p-1" title="View Owner Profile"><UserIcon className="h-4 w-4" /></button>
                                        {confirmDeleteId === p.propertyId ? (
                                            <span className="flex items-center gap-1">
                                                <button onClick={() => handleDelete(p.propertyId)} className="text-xs font-bold text-red-600 hover:underline">Yes</button>
                                                <button onClick={() => setConfirmDeleteId(null)} className="text-xs text-gray-500 hover:underline">No</button>
                                            </span>
                                        ) : (
                                            <button onClick={() => handleDelete(p.propertyId)} className="text-gray-400 hover:text-red-600 p-1" title="Delete"><Trash2 className="h-4 w-4" /></button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-gray-100">
                    {props.map(p => (
                        <div key={p.propertyId} className="p-4 space-y-3">
                            <div className="flex gap-3">
                                <img src={p.images && p.images.length > 0 ? p.images[0].imageUrl : 'https://placehold.co/100x100'} className="w-16 h-16 rounded object-cover shrink-0" alt={p.title} />
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-900 truncate">{p.title}</p>
                                    <p className="text-xs text-gray-500 truncate">{p.location}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.status === 'For Sale' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {p.status}
                                        </span>
                                        {p.verificationStatus === 'pending' && (
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-700">
                                                Pending
                                            </span>
                                        )}
                                        <p className="font-bold text-primary-600 text-sm">${p.price.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setViewingProperty(p)} className="flex-1 flex items-center justify-center gap-2 py-2 border border-green-200 rounded-lg text-sm font-medium text-green-700 hover:bg-green-50 transition">
                                    <Eye className="h-3.5 w-3.5" /> View
                                </button>
                                <button onClick={() => handleViewOwner(p.ownerId)} className="flex-1 flex items-center justify-center gap-2 py-2 border border-blue-200 rounded-lg text-sm font-medium text-blue-700 hover:bg-blue-50 transition">
                                    <UserIcon className="h-3.5 w-3.5" /> Profile
                                </button>
                                <button onClick={() => handleDelete(p.propertyId)} className="flex-1 flex items-center justify-center gap-2 py-2 border border-red-100 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition">
                                    <Trash2 className="h-3.5 w-3.5" /> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                    {loading && <p className="text-center py-4 text-gray-500">Loading properties...</p>}
                    {!loading && props.length === 0 && <p className="text-center py-4 text-gray-500">No properties found.</p>}
                </div>

            {/* Owner Profile Modal (ID Card Style) */}
            {viewingOwnerId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden relative">
                        <button onClick={() => { setViewingOwnerId(null); setOwnerData(null); }} className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full p-1.5 transition">
                            <X className="h-5 w-5" />
                        </button>
                        
                        {loadingOwner ? (
                            <div className="p-10 text-center text-gray-500">Loading profile...</div>
                        ) : ownerData ? (
                            <div className="flex flex-col">
                                {/* Top ID Section */}
                                <div className="bg-gradient-to-b from-blue-50 to-white px-6 pt-10 pb-6 flex flex-col items-center border-b border-gray-100">
                                    <div className="relative flex flex-col items-center">
                                        <div className="w-28 h-28 rounded-full p-1.5 bg-white shadow-sm border border-gray-100">
                                            <img 
                                                src={ownerData.profilePictureUrl || 'https://placehold.co/150'} 
                                                alt={ownerData.fullName || ownerData.userName} 
                                                className="w-full h-full rounded-full object-cover" 
                                            />
                                        </div>
                                        <div className="-mt-3">
                                           <span className="px-4 py-1 bg-blue-600 text-white text-[10px] font-bold tracking-widest rounded-full uppercase shadow-sm">
                                               {ownerData.role}
                                           </span>
                                        </div>
                                    </div>
                                    
                                    <h2 className="text-xl font-bold text-gray-900 mt-4 text-center">{ownerData.fullName || ownerData.userName}</h2>
                                    <p className="text-sm text-gray-500 font-medium mt-1">@{ownerData.userName}</p>
                                    
                                    {ownerData.createdAt && (
                                        <p className="text-xs text-gray-400 mt-2 font-medium bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                                            Member since {new Date(ownerData.createdAt).getFullYear()}
                                        </p>
                                    )}
                                </div>
                                
                                {/* Details Section */}
                                <div className="p-6 bg-white space-y-4">
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email Address</p>
                                        <p className="text-sm text-gray-800 font-medium truncate">{ownerData.email}</p>
                                    </div>
                                    
                                    {ownerData.phoneNumber && (
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Phone Number</p>
                                        <p className="text-sm text-gray-800 font-medium">{ownerData.phoneNumber}</p>
                                    </div>
                                    )}
                                    
                                    {ownerData.address && (
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Address</p>
                                        <p className="text-sm text-gray-800 font-medium">{ownerData.address}</p>
                                    </div>
                                    )}
                                    
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">About</p>
                                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{ownerData.bio || 'No bio provided by this user.'}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-10 text-center text-red-500">Could not load user data.</div>
                        )}
                    </div>
                </div>
            )}

            {/* View Property Modal */}
            {viewingProperty && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 max-w-4xl w-full shadow-xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">Property Details & Verification</h3>
                            <button onClick={() => setViewingProperty(null)} className="text-gray-400 hover:text-gray-600 p-1">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <PropertyVerificationCard
                            property={viewingProperty}
                            onVerify={handlePropertyVerification}
                        />

                        <div className="flex justify-end mt-6 pt-6 border-t border-gray-200">
                            <button
                                onClick={() => setViewingProperty(null)}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};