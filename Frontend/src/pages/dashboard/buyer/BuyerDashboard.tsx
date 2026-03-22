import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../../components/layout';
import { UserRole } from '../../../types';
import { Overview } from './Overview';
import { SavedListings } from './SavedListings';
import { Recommended } from './Recommended';
import { wishlistApi, messagesApi } from '../../../services/api';

export const BuyerDashboard: React.FC = () => {
  const [savedCount, setSavedCount] = useState(0);
  const [inquiriesCount, setInquiriesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [wishlist, conversations] = await Promise.all([
          wishlistApi.getAll(),
          messagesApi.getConversations()
        ]);
        setSavedCount(wishlist.length);
        setInquiriesCount(conversations.length);
      } catch (error) {
        console.error('Failed to load dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <DashboardLayout role={UserRole.BUYER} title={`Welcome, Buyer`}>
      <div className="mb-6">
        <p className="text-gray-500">Here's an overview of your real estate activities.</p>
      </div>

      <Overview savedCount={savedCount} inquiriesCount={inquiriesCount} loading={loading} />

      <SavedListings />

      <Recommended />
    </DashboardLayout>
  );
};

export default BuyerDashboard;
