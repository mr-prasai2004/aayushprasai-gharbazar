import React from 'react';
import { CheckCircle, Clock, MessageSquare, Eye, Heart, TrendingUp } from 'lucide-react';

interface OverviewProps {
  savedCount: number;
  inquiriesCount: number;
  loading: boolean;
}

export const Overview: React.FC<OverviewProps> = ({ savedCount, inquiriesCount, loading }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <p className="text-sm font-medium text-gray-500">Total Saved Properties</p>
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Heart className="h-4 w-4" /></div>
        </div>
        <h3 className="text-2xl font-bold mt-1">{loading ? '...' : savedCount}</h3>
        <p className="text-xs text-gray-400">You have {savedCount} properties saved.</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <p className="text-sm font-medium text-gray-500">Active Conversations</p>
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><MessageSquare className="h-4 w-4" /></div>
        </div>
        <h3 className="text-2xl font-bold mt-1">{loading ? '...' : inquiriesCount}</h3>
        <p className="text-xs text-gray-400">Ongoing conversations with sellers.</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <p className="text-sm font-medium text-gray-500">Explore Properties</p>
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Eye className="h-4 w-4" /></div>
        </div>
        <h3 className="text-2xl font-bold mt-1">Browse</h3>
        <p className="text-xs text-gray-400">Keep exploring to find the best match.</p>
      </div>
    </div>
  );
};
