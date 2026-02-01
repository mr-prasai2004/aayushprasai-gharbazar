import React from 'react';
import { List, CheckCircle, MessageSquare, Clock } from 'lucide-react';

interface OverviewProps {
  listingsCount: number;
  activeListingsCount: number;
  pendingCount: number;
  inquiriesCount: number;
  loading: boolean;
}

export const Overview: React.FC<OverviewProps> = ({
  listingsCount,
  activeListingsCount,
  pendingCount,
  inquiriesCount,
  loading
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <p className="text-sm font-medium text-gray-500">Total Listings</p>
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><List className="h-4 w-4" /></div>
        </div>
        <h3 className="text-3xl font-bold mb-1 text-gray-800">{loading ? '...' : listingsCount}</h3>
        <p className="text-xs text-gray-400">You have {listingsCount} properties listed.</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <p className="text-sm font-medium text-gray-500">Active Listings</p>
          <div className="p-2 bg-green-50 rounded-lg text-green-600"><CheckCircle className="h-4 w-4" /></div>
        </div>
        <h3 className="text-3xl font-bold mb-1 text-gray-800">{loading ? '...' : activeListingsCount}</h3>
        <p className="text-xs text-gray-400">Verified and visible to buyers.</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <p className="text-sm font-medium text-gray-500">Pending Approval</p>
          <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600"><Clock className="h-4 w-4" /></div>
        </div>
        <h3 className="text-3xl font-bold mb-1 text-gray-800">{loading ? '...' : pendingCount}</h3>
        <p className="text-xs text-gray-400">Awaiting admin verification.</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <p className="text-sm font-medium text-gray-500">Buyer Inquiries</p>
          <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><MessageSquare className="h-4 w-4" /></div>
        </div>
        <h3 className="text-3xl font-bold mb-1 text-gray-800">{loading ? '...' : inquiriesCount}</h3>
        <p className="text-xs text-gray-400">Messages from interested buyers.</p>
      </div>
    </div>
  );
};

export default Overview;
