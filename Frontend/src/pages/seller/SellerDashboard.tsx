import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DashboardLayout } from '../../../components/layout';
import { UserRole } from '../../../types';
import { PROPERTIES } from '../../services/mockData';
import { CheckCircle, Clock, MessageSquare, Eye, TrendingUp, Heart, Trash2, Edit2, X } from 'lucide-react';
import Overview from '../dashboard/seller/Overview';
import Listings from '../dashboard/seller/Listings';
import Messages from '../dashboard/seller/Messages';
import SellerTourBookings from '../dashboard/seller/SellerTourBookings';
import EditPropertyModal from '../dashboard/seller/EditPropertyModal';

export const SellerDashboard: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('Overview');
    const [listings, setListings] = useState<any[]>([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingProperty, setEditingProperty] = useState<any>(null);
    const [editFormData, setEditFormData] = useState<any>(null);
    const [conversations] = useState(() => [
        { id: 'c1', user: 'Jane Doe', snippet: 'Hi, is this property still available?', time: '2 hrs ago', messages: [
            { from: 'Jane Doe', text: 'Hi, is this property still available for viewing this weekend?', time: '2 hrs ago' }
        ]},
        { id: 'c2', user: 'Mark Lee', snippet: 'Interested in a tour', time: '1 day ago', messages: [
            { from: 'Mark Lee', text: 'Can we schedule a tour next Monday?', time: '1 day ago' }
        ]},
        { id: 'c3', user: 'Sara Khan', snippet: 'Question about price', time: '3 days ago', messages: [
            { from: 'Sara Khan', text: 'Is the price negotiable?', time: '3 days ago' }
        ]},
    ]);
    const [selectedConv, setSelectedConv] = useState<number>(0);
    const [replyText, setReplyText] = useState('');

    const handleTabClick = (tab: string) => {
        // Navigate to route when user clicks tab so URL + sidebar stay in sync
        if (tab === 'Add New Property') {
            navigate('/dashboard/add-property');
            setActiveTab(tab);
        } else if (tab === 'My Listings') {
            navigate('/dashboard/listings');
            setActiveTab(tab);
        } else if (tab === 'Tour Bookings') {
            navigate('/dashboard/bookings');
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
        else if (path.includes('/dashboard/bookings')) setActiveTab('Tour Bookings');
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
            area_sqft: property.area_sqft,
            description: property.description,
        });
        setShowEditModal(true);
    };

    const handleSaveEdit = () => {
        if (!editFormData.title || !editFormData.price) {
            alert('Please fill in all required fields');
            return;
        }

        const updated = listings.map(p => p.property_id === editingProperty.property_id ? { ...p, ...editFormData } : p);
        setListings(updated);
        // persist
        try {
            const raw = localStorage.getItem('properties');
            const all = raw ? JSON.parse(raw) : [];
            const merged = Array.isArray(all) ? all.map((p: any) => p.property_id === editingProperty.property_id ? { ...p, ...editFormData } : p) : updated;
            localStorage.setItem('properties', JSON.stringify(merged));
        } catch (err) {
            console.error('Failed to persist edited property', err);
        }
        alert('Property updated successfully!');
        setShowEditModal(false);
        setEditingProperty(null);
        setEditFormData(null);
    };

    const handleDeleteListing = (id: string) => {
        if(window.confirm('Are you sure you want to remove this listing?')) {
            const updated = listings.filter(p => p.property_id !== id);
            setListings(updated);
            try {
                const raw = localStorage.getItem('properties');
                const all = raw ? JSON.parse(raw) : [];
                if (Array.isArray(all)) {
                    const filtered = all.filter((p: any) => p.property_id !== id);
                    localStorage.setItem('properties', JSON.stringify(filtered));
                }
            } catch (err) {
                console.error('Failed to persist deletion', err);
            }
        }
    }

    // Load seller listings from localStorage (both pending and approved)
    useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');
        const ownerId = storedUser ? JSON.parse(storedUser).email : null;
        try {
            // Load pending properties (seller's submitted properties awaiting approval)
            const rawPending = localStorage.getItem('pending_properties');
            let pending = rawPending ? JSON.parse(rawPending) : [];
            if (!Array.isArray(pending)) pending = [];

            // Load approved properties (seller's approved and listed properties)
            const rawApproved = localStorage.getItem('properties');
            let approved = rawApproved ? JSON.parse(rawApproved) : [];
            if (!Array.isArray(approved)) approved = [];

            // Combine and filter by owner
            const all = [...pending, ...approved];
            const my = ownerId ? all.filter((p: any) => p.owner_id === ownerId) : [];
            setListings(my);
        } catch (err) {
            console.error('Failed to load properties', err);
            setListings([]);
        }
    }, []);

    const renderContent = () => {
        switch(activeTab) {
            case 'Overview':
                return <Overview listingsCount={listings.length} />;
            case 'My Listings':
                return <Listings listings={listings} onEdit={handleEditProperty} onDelete={handleDeleteListing} onView={(id:string) => navigate(`/properties/${id}`)} />;
            case 'Tour Bookings':
                return <SellerTourBookings />;
            case 'Messages':
                return (
                    <Messages
                        conversations={conversations}
                        selectedConv={selectedConv}
                        setSelectedConv={setSelectedConv}
                        replyText={replyText}
                        setReplyText={setReplyText}
                        onSend={() => {
                            if (!replyText.trim()) { alert('Please enter a message'); return; }
                            conversations[selectedConv].messages.push({ from: 'You', text: replyText.trim(), time: 'Just now' });
                            setReplyText('');
                            alert('Message sent');
                        }}
                    />
                );
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
