import React, { useState } from 'react';
import { CheckCircle, Heart, MessageSquare, TrendingUp } from 'lucide-react';

// Dummy property data
const DUMMY_PROPERTIES = [
  {
    property_id: 'p1',
    title: 'Cozy Apartment in Downtown',
    location: 'New York, NY',
    price: 250000,
    bedrooms: 2,
    bathrooms: 1,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
  },
  {
    property_id: 'p2',
    title: 'Luxury Villa with Pool',
    location: 'Los Angeles, CA',
    price: 1200000,
    bedrooms: 5,
    bathrooms: 4,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
  },
  {
    property_id: 'p3',
    title: 'Modern Villa Near Mountains',
    location: 'Miami, FL',
    price: 450000,
    bedrooms: 3,
    bathrooms: 2,
    image: 'https://images.unsplash.com/photo-1599423300746-b62533397364?auto=format&fit=crop&w=800&q=80',
  },
];

// Simple PropertyCard
const PropertyCard: React.FC<{ property: typeof DUMMY_PROPERTIES[0] }> = ({ property }) => (
  <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
    <img src={property.image} alt={property.title} className="w-full h-40 object-cover" />
    <div className="p-4">
      <h3 className="font-bold text-gray-800">{property.title}</h3>
      <p className="text-gray-500 text-sm">{property.location}</p>
      <p className="text-gray-700 font-semibold mt-2">${property.price.toLocaleString()}</p>
      <p className="text-gray-500 text-sm mt-1">{property.bedrooms} Beds • {property.bathrooms} Baths</p>
    </div>
  </div>
);

export const SellerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Overview');

  const renderContent = () => {
    switch (activeTab) {
      case 'Overview':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg border shadow-sm flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Total Listings</p>
                <h3 className="text-2xl font-bold mt-1">3</h3>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {DUMMY_PROPERTIES.map(p => (
              <PropertyCard key={p.property_id} property={p} />
            ))}
          </div>
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

      {renderContent()}
    </div>
  );
};

