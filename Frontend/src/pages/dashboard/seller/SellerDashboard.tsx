import React, { useState } from 'react';
import { CheckCircle, Heart, MessageSquare, TrendingUp } from 'lucide-react';
import DashboardLayout from '../../../components/Layout/DashboardLayout';
import Listings from './Listings';

// Dummy property data
const DUMMY_PROPERTIES = [
  {
    property_id: 'p1',
    title: 'Cozy Apartment in Downtown',
    location: 'New York, NY',
    price: 250000,
    bedrooms: 2,
    bathrooms: 1,
    property_type: 'Apartment',
    status: 'For Sale',
    images: [{ image_url: 'https://images.unsplash.com/photo-1560185127-6d4f1c0b98d0?auto=format&fit=crop&w=800&q=80' }]
  },
  {
    property_id: 'p2',
    title: 'Luxury Villa with Pool',
    location: 'Los Angeles, CA',
    price: 1200000,
    bedrooms: 5,
    bathrooms: 4,
    property_type: 'Villa',
    status: 'For Sale',
    images: [{ image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80' }]
  },
  {
    property_id: 'p3',
    title: 'Modern Condo Near Beach',
    location: 'Miami, FL',
    price: 450000,
    bedrooms: 3,
    bathrooms: 2,
    property_type: 'Condo',
    status: 'Sold',
    images: [{ image_url: 'https://images.unsplash.com/photo-1599423300746-b62533397364?auto=format&fit=crop&w=800&q=80' }]
  },
];

export const SellerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Overview');

  const handleEdit = (property: any) => alert(`Edit ${property.title}`);
  const handleDelete = (id: string) => alert(`Delete property with ID: ${id}`);
  const handleView = (id: string) => alert(`View property with ID: ${id}`);

  const renderContent = () => {
    switch (activeTab) {
      case 'Overview':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg border shadow-sm flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Total Listings</p>
                <h3 className="text-2xl font-bold mt-1">{DUMMY_PROPERTIES.length}</h3>
              </div>
              <TrendingUp className="h-8 w-8 text-gray-300" />
            </div>
            <div className="bg-white p-6 rounded-lg border shadow-sm flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Saved Properties</p>
                <h3 className="text-2xl font-bold mt-1">12</h3>
              </div>
              <Heart className="h-8 w-8 text-gray-300" />
            </div>
            <div className="bg-white p-6 rounded-lg border shadow-sm flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Messages</p>
                <h3 className="text-2xl font-bold mt-1">5</h3>
              </div>
              <MessageSquare className="h-8 w-8 text-gray-300" />
            </div>
          </div>
        );
      case 'My Listings':
        return (
          <Listings 
            listings={DUMMY_PROPERTIES} 
            onEdit={handleEdit} 
            onDelete={handleDelete} 
            onView={handleView} 
          />
        );
      case 'Messages':
        return (
          <div className="text-gray-500 text-center py-20">
            <CheckCircle className="mx-auto h-12 w-12 text-green-200 mb-2" />
            <p>No messages yet</p>
          </div>
        );
      case 'Add New Property':
        return (
          <div className="text-gray-500 text-center py-20">
            <p>Form to add new property goes here (dummy)</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <DashboardLayout role="seller" title="Seller Dashboard">
      <div className="p-4">
        {/* Tabs */}
      <div className="bg-white p-2 rounded-lg shadow-sm mb-6 inline-flex space-x-2 overflow-x-auto max-w-full">
        {['Overview', 'Add New Property', 'My Listings', 'Messages'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === tab
                ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-200'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

        {/* Tab Content */}
        {renderContent()}
      </div>
    </DashboardLayout>
  );
};

export default SellerDashboard;
