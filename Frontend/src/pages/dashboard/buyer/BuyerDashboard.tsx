import React from 'react';
import { Heart, MessageSquare, Search } from 'lucide-react';

// Dummy property data with images
const DUMMY_PROPERTIES = [
  {
    property_id: 'p1',
    title: 'Cozy Apartment in Downtown',
    location: 'New York, NY',
    price: 250000,
    bedrooms: 2,
    bathrooms: 1,
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
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
    title: 'Modern Villa Near Beach',
    location: 'Miami, FL',
    price: 450000,
    bedrooms: 3,
    bathrooms: 2,
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80',
  },
  {
    property_id: 'p4',
    title: 'Charming Cottage',
    location: 'Portland, OR',
    price: 320000,
    bedrooms: 2,
    bathrooms: 2,
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
  },
];

type Property = typeof DUMMY_PROPERTIES[0];

// PropertyCard with image
const PropertyCard: React.FC<{ property: Property }> = ({ property }) => (
  <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
    <img
      src={property.image}
      alt={property.title}
      className="w-full h-40 object-cover"
    />
    <div className="p-4">
      <h3 className="font-bold text-gray-800">{property.title}</h3>
      <p className="text-gray-500 text-sm">{property.location}</p>
      <p className="text-gray-700 font-semibold mt-2">${property.price.toLocaleString()}</p>
      <p className="text-gray-500 text-sm mt-1">
        {property.bedrooms} Beds • {property.bathrooms} Baths
      </p>
    </div>
  </div>
);

export const BuyerDashboard: React.FC = () => {
  return (


      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border shadow-sm flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Saved Properties</p>
            <h3 className="text-2xl font-bold mt-1">12</h3>
          </div>
          <Heart className="h-8 w-8 text-gray-300" />
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Inquiries Made</p>
            <h3 className="text-2xl font-bold mt-1">5</h3>
          </div>
          <MessageSquare className="h-8 w-8 text-gray-300" />
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Viewed Today</p>
            <h3 className="text-2xl font-bold mt-1">8</h3>
          </div>
          <Search className="h-8 w-8 text-gray-300" />
        </div>
      </div>

      {/* Saved Listings */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">Saved Listings</h2>
          <button className="text-sm text-blue-600 hover:underline">
            View All
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DUMMY_PROPERTIES.slice(0, 3).map(p => (
            <PropertyCard key={p.property_id} property={p} />
          ))}
        </div>
      </section>

      {/* Recommended */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">Recommended Properties</h2>
          <button className="text-sm text-blue-600 hover:underline">
            View All
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DUMMY_PROPERTIES.slice(1, 4).map(p => (
            <PropertyCard key={p.property_id} property={p} />
          ))}
        </div>
      </section>
    </div>
  );
};
