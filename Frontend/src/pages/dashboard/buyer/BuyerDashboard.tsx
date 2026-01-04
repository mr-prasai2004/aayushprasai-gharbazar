import React from 'react';
import { Heart, MessageSquare, Search } from 'lucide-react';

export const BuyerDashboard: React.FC = () => {
  return (
    
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-2">Buyer Dashboard</h1>
        <p className="text-gray-500 mb-6">
          Here's an overview of your real estate activities.
        </p>

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
            {/* PropertyCard components will go here */}
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
            {/* Recommended PropertyCard components will go here */}
          </div>
        </section>
      </div>
    
  );
};
