import React, { useState, useEffect } from 'react';
import { PropertyCard } from '../../../components/PropertyCard';
import { propertiesApi, wishlistApi } from '../../../services/api';

export const SavedListings: React.FC = () => {
  const [properties, setProperties] = useState<any[]>([]);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
       
        const data = await wishlistApi.getAll().catch(() => []);
        if (data.length > 0) {
          setProperties(data);
        } else {
          // Fallback to showing nothing or some placeholder
          setProperties([]);
        }
      } catch (err) {
        console.error('Failed to load wishlist', err);
      }
    };
    fetchWishlist();
  }, []);

  if (properties.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Your Saved Listings</h2>
        <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-gray-500">No saved properties yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-800">Your Saved Listings</h2>
        <button className="text-sm text-primary-600 font-medium hover:underline">View All</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((p: any) => <PropertyCard key={p.propertyId} property={p} />)}
      </div>
    </div>
  );
};
