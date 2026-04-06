import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DashboardLayout } from '../../../components/layout';
import { UserRole } from '../../../types';
import { propertiesApi } from '../../../services/api';
import { CheckCircle, Clock, MessageSquare, Eye, TrendingUp, Heart, Trash2, Edit2, X } from 'lucide-react';
import Overview from './Overview';
import Listings from './Listings';
import SellerTourBookings from './SellerTourBookings';
import { Messages } from '../Messages';
import EditPropertyModal from './EditPropertyModal';

export const SellerDashboard: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('Overview');
    const [listings, setListings] = useState<any[]>([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingProperty, setEditingProperty] = useState<any>(null);
    const [editFormData, setEditFormData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const handleTabClick = (tab: string) => {
        // Navigate to route when user clicks tab so URL + sidebar stay in sync
        if (tab === 'Add New Property') {
            navigate('/dashboard/add-property');
            setActiveTab(tab);
        } else if (tab === 'My Listings') {
            navigate('/dashboard/listings');
            setActiveTab(tab);
        } else if (tab === 'Tour Bookings') {
            navigate('/dashboard/seller/bookings');
            setActiveTab(tab);
        } else if (tab === 'Messages') {
            navigate('/dashboard/messages');
            setActiveTab(tab);
        } else {
            navigate('/dashboard/seller');
            setActiveTab(tab);
        }
    };

    // Sync activeTab with current route so sidebar links work
    useEffect(() => {
        const path = location.pathname;
        if (path.includes('/dashboard/messages')) setActiveTab('Messages');
        else if (path.includes('/dashboard/seller/bookings')) setActiveTab('Tour Bookings');
        else if (path.includes('/dashboard/listings')) setActiveTab('My Listings');
        else if (path.includes('/dashboard/add-property')) setActiveTab('Add New Property');
        else setActiveTab('Overview');
    }, [location.pathname]);

    const handleEditProperty = (property: any) => {
        setEditingProperty(property);
        setEditFormData({
            title: property.title,
            price: property.price,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            area_sqft: property.areaSqft, // Note: API uses CamelCase in DTO but check response
            description: property.description,
            amenities: property.amenities
        });
        setShowEditModal(true);
    };

    const handleSaveEdit = async () => {
        if (!editFormData.title || !editFormData.price) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            const updated = await propertiesApi.update(editingProperty.propertyId, editFormData);
            setListings(prev => prev.map(p => p.propertyId === editingProperty.propertyId ? updated : p));
            alert('Property updated successfully!');
            setShowEditModal(false);
            setEditingProperty(null);
            setEditFormData(null);
        } catch (err) {
            console.error('Failed to update property', err);
            alert('Failed to update property');
        }
    };

    const handleDeleteListing = async (id: string) => {
        if (window.confirm('Are you sure you want to remove this listing?')) {
            try {
                await propertiesApi.delete(id);
                setListings(prev => prev.filter(p => p.propertyId !== id));
            } catch (err) {
                console.error('Failed to delete property', err);
                alert('Failed to delete property');
            }
        }
    }

    const handleStatusChange = async (propertyId: string, newStatus: string) => {
        try {
            await propertiesApi.update(propertyId, { status: newStatus });
            setListings(prev => prev.map(p =>
                p.propertyId === propertyId ? { ...p, status: newStatus } : p
            ));
            alert(`Property status updated to "${newStatus}" successfully!`);
        } catch (err) {
            console.error('Failed to update status', err);
            alert('Failed to update property status. Please try again.');
            throw err; // re-throw so Listings component knows it failed
        }
    };

    // Load seller listings from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                const myListings = await propertiesApi.getMyListings();
                setListings(myListings);
            } catch (err) {
                console.error('Failed to load listings', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const renderContent = () => {
        switch (activeTab) {
            case 'Overview':
                const activeListings = listings.filter(l => l.verificationStatus === 'verified');
                const pendingListings = listings.filter(l => l.verificationStatus === 'pending');
                return <Overview
                    listingsCount={listings.length}
                    activeListingsCount={activeListings.length}
                    pendingCount={pendingListings.length}
                    inquiriesCount={listings.length}
                    loading={loading}
                />;
            case 'My Listings':
                return <Listings listings={listings} onEdit={handleEditProperty} onDelete={handleDeleteListing} onView={(id: string) => navigate(`/properties/${id}`)} onStatusChange={handleStatusChange} />;
            case 'Tour Bookings':
                return <SellerTourBookings />;
            case 'Messages':
                return <Messages />;
            default: return null;
        }
    }

    return (
        <DashboardLayout role={UserRole.SELLER} title="Seller Dashboard">
            <div className="bg-white p-2 rounded-lg shadow-sm mb-6 inline-flex space-x-2 overflow-x-auto max-w-full">
                {['Overview', 'Add New Property', 'My Listings', 'Tour Bookings', 'Messages'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => handleTabClick(tab)}
                        className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${activeTab === tab ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-200' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {renderContent()}

            <EditPropertyModal show={showEditModal} onClose={() => setShowEditModal(false)} editFormData={editFormData} setEditFormData={setEditFormData} onSave={handleSaveEdit} />
        </DashboardLayout>
    )
}

export default SellerDashboard;
