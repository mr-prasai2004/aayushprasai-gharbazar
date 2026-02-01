import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../../components/Layout';
import { UserRole } from '../../../types';
import { propertiesApi } from '../../../services/api';
import { Trash2, Edit2, X } from 'lucide-react';

export const AdminManageProperties: React.FC = () => {
    const [props, setProps] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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

    const [showEditModal, setShowEditModal] = useState(false);
    const [editingProperty, setEditingProperty] = useState<any>(null);
    const [editFormData, setEditFormData] = useState<any>(null);

    const handleEditProperty = (property: any) => {
        setEditingProperty(property);
        setEditFormData({
            title: property.title,
            location: property.location,
            price: property.price,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            areaSqft: property.areaSqft,
            propertyType: property.propertyType,
            status: property.status,
            description: property.description,
        });
        setShowEditModal(true);
    };

    const handleSaveEdit = async () => {
        if (!editFormData.title || !editFormData.price || !editFormData.location) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            const updated = await propertiesApi.update(editingProperty.propertyId, editFormData);
            setProps(props.map(p => p.propertyId === editingProperty.propertyId ? updated : p));
            alert('Property updated successfully!');
            setShowEditModal(false);
            setEditingProperty(null);
            setEditFormData(null);
        } catch (err) {
            console.error('Failed to update property', err);
            alert('Failed to update property');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Delete property?')) {
            try {
                await propertiesApi.delete(id);
                setProps(props.filter(p => p.propertyId !== id));
            } catch (err) {
                console.error('Failed to delete property', err);
                alert('Failed to delete property');
            }
        }
    };

    return (
        <DashboardLayout role={UserRole.ADMIN} title="Manage Properties">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">Property Listings Database</h3>
                    <button onClick={loadProperties} className="text-sm text-blue-600 hover:underline">Refresh</button>
                </div>
                <div className="overflow-x-auto">
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
                                    <td className="px-6 py-3 font-medium flex items-center gap-3 text-gray-900 min-w-64">
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
                                    </td>
                                    <td className="px-6 py-3 flex gap-2">
                                        <button onClick={() => handleEditProperty(p)} className="text-gray-400 hover:text-blue-600 p-1"><Edit2 className="h-4 w-4" /></button>
                                        <button onClick={() => handleDelete(p.propertyId)} className="text-gray-400 hover:text-red-600 p-1"><Trash2 className="h-4 w-4" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {loading && <p className="text-center py-4 text-gray-500">Loading properties...</p>}
                    {!loading && props.length === 0 && <p className="text-center py-4 text-gray-500">No properties found.</p>}
                </div>
            </div>

            {/* Edit Property Modal */}
            {showEditModal && editingProperty && editFormData && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 max-w-2xl w-full shadow-xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">Edit Property</h3>
                            <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Property Title *</label>
                                    <input
                                        type="text"
                                        value={editFormData.title}
                                        onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                        placeholder="e.g., Luxury Hillside Villa"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                                    <input
                                        type="text"
                                        value={editFormData.location}
                                        onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                        placeholder="City, State"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Price (USD) *</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-3 text-gray-500">$</span>
                                        <input
                                            type="number"
                                            value={editFormData.price}
                                            onChange={(e) => setEditFormData({ ...editFormData, price: parseFloat(e.target.value) })}
                                            className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                            placeholder="500000"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                                    <select
                                        value={editFormData.propertyType}
                                        onChange={(e) => setEditFormData({ ...editFormData, propertyType: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                    >
                                        <option>House</option>
                                        <option>Apartment</option>
                                        <option>Condo</option>
                                        <option>Villa</option>
                                        <option>Land</option>
                                        <option>Commercial</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
                                    <input
                                        type="number"
                                        value={editFormData.bedrooms}
                                        onChange={(e) => setEditFormData({ ...editFormData, bedrooms: parseInt(e.target.value) })}
                                        className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                        placeholder="3"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Bathrooms</label>
                                    <input
                                        type="number"
                                        value={editFormData.bathrooms}
                                        onChange={(e) => setEditFormData({ ...editFormData, bathrooms: parseInt(e.target.value) })}
                                        className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                        placeholder="2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Area (Sq Ft)</label>
                                    <input
                                        type="number"
                                        value={editFormData.areaSqft}
                                        onChange={(e) => setEditFormData({ ...editFormData, areaSqft: parseInt(e.target.value) })}
                                        className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                        placeholder="2000"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                    <select
                                        value={editFormData.status}
                                        onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                    >
                                        <option>For Sale</option>
                                        <option>For Rent</option>
                                        <option>Sold</option>
                                        <option>Pending</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <textarea
                                    value={editFormData.description}
                                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                    placeholder="Describe the property..."
                                    rows={4}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition">
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};