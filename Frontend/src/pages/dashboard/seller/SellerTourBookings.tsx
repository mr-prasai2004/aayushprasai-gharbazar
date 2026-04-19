import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, MapPin, CheckCircle, X, AlertCircle } from 'lucide-react';
import { tourBookingsApi } from '../../../services/api';
import { useToast } from '../../../components/Toast';

interface TourBooking {
  bookingId: string;
  propertyId: string;
  propertyTitle?: string;
  propertyLocation?: string;
  propertyImage?: string;
  buyerId: string;
  buyerName?: string;
  buyerEmail?: string;
  tourDate: string;
  tourTime: string;
  status: string;
  notes?: string;
  createdAt?: string;
}

export const SellerTourBookings: React.FC = () => {
  const toast = useToast();
  const [bookings, setBookings] = useState<TourBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');
  const [updating, setUpdating] = useState<string | null>(null);
  const [confirmDecline, setConfirmDecline] = useState<string | null>(null);

  // Format date to readable format
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-NP', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  // Fetch seller's bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await tourBookingsApi.getSellerBookings();
        setBookings(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load bookings');
        console.error('Error fetching bookings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleConfirm = async (bookingId: string) => {
    setUpdating(bookingId);
    try {
      await tourBookingsApi.confirm(bookingId);
      setBookings(prev => prev.map(b => b.bookingId === bookingId ? { ...b, status: 'Confirmed' } : b));
      toast.success('Booking confirmed!');
    } catch (err) {
      toast.error('Failed to confirm booking. Please try again.');
    } finally {
      setUpdating(null);
    }
  };

  const handleDecline = async (bookingId: string) => {
    if (confirmDecline !== bookingId) {
      setConfirmDecline(bookingId);
      return;
    }
    setConfirmDecline(null);
    setUpdating(bookingId);
    try {
      await tourBookingsApi.decline(bookingId);
      setBookings(prev => prev.map(b => b.bookingId === bookingId ? { ...b, status: 'Cancelled' } : b));
      toast.success('Booking declined.');
    } catch (err) {
      toast.error('Failed to decline booking. Please try again.');
    } finally {
      setUpdating(null);
    }
  };

  // Filter bookings by status
  const filteredBookings = filterStatus === 'all' 
    ? bookings 
    : bookings.filter(b => b.status?.toLowerCase() === filterStatus);

  // Get status badge styles
  const getStatusStyle = (status: string) => {
    const statusLower = status?.toLowerCase() || 'pending';
    switch (statusLower) {
      case 'confirmed':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Tour Booking Requests</h2>
        <p className="text-gray-500">Manage and track all incoming tour booking requests for your properties</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'pending', 'confirmed', 'cancelled'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filterStatus === status
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            {status === 'all' && ` (${bookings.length})`}
            {status === 'pending' && ` (${bookings.filter(b => b.status?.toLowerCase() === 'pending').length})`}
            {status === 'confirmed' && ` (${bookings.filter(b => b.status?.toLowerCase() === 'confirmed').length})`}
            {status === 'cancelled' && ` (${bookings.filter(b => b.status?.toLowerCase() === 'cancelled').length})`}
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-800">Error</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredBookings.length === 0 && !error && (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
          <Calendar className="h-14 w-14 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            {filterStatus === 'all' ? 'No booking requests yet' : `No ${filterStatus} bookings`}
          </h3>
          <p className="text-gray-400 text-sm">
            {filterStatus === 'all' 
              ? 'Buyers will start requesting tours once your properties are live.'
              : `There are no ${filterStatus} booking requests at the moment.`}
          </p>
        </div>
      )}

      {/* Bookings List */}
      <div className="grid gap-4">
        {filteredBookings.map((booking) => (
          <div key={booking.bookingId} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              {/* Header with Property Info */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  {booking.propertyImage ? (
                    <img src={booking.propertyImage} alt={booking.propertyTitle} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg">{booking.propertyTitle}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {booking.propertyLocation}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(booking.status)}`}>
                  {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1) || 'Pending'}
                </span>
              </div>

              <div className="border-t border-gray-100 pt-4 mb-4">
                {/* Buyer Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">BUYER</p>
                      <p className="font-semibold text-gray-800">{booking.buyerName}</p>
                      <p className="text-xs text-gray-500">{booking.buyerEmail}</p>
                    </div>
                  </div>

                  {/* Tour Date & Time */}
                  <div className="flex gap-3">
                    <div className="flex-1 flex items-center gap-3">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <Calendar className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">DATE</p>
                        <p className="font-semibold text-gray-800">{formatDate(booking.tourDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-50 rounded-lg">
                        <Clock className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">TIME</p>
                        <p className="font-semibold text-gray-800">{booking.tourTime}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {booking.notes && (
                  <div className="bg-gray-50 p-3 rounded-lg mb-4">
                    <p className="text-xs text-gray-500 font-medium uppercase mb-1">Notes</p>
                    <p className="text-sm text-gray-700">{booking.notes}</p>
                  </div>
                )}

                {/* Booking ID & Date */}
                <div className="flex gap-4 text-xs text-gray-500">
                  <span>Booking ID: <span className="font-mono text-gray-700">{booking.bookingId?.substring(0, 8)}</span></span>
                  {booking.createdAt && (
                    <span>Requested: {formatDate(booking.createdAt)}</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              {booking.status?.toLowerCase() === 'pending' && (
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleConfirm(booking.bookingId)}
                    disabled={updating === booking.bookingId}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {updating === booking.bookingId ? 'Updating...' : 'Confirm Booking'}
                  </button>

                  {confirmDecline === booking.bookingId ? (
                    <div className="flex-1 flex items-center justify-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3">
                      <span className="text-sm text-red-700 font-medium">Decline?</span>
                      <button onClick={() => handleDecline(booking.bookingId)} className="text-sm font-semibold text-red-700 hover:underline">Yes</button>
                      <button onClick={() => setConfirmDecline(null)} className="text-sm text-gray-500 hover:underline">No</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleDecline(booking.bookingId)}
                      disabled={updating === booking.bookingId}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <X className="h-4 w-4" />
                      Decline
                    </button>
                  )}
                </div>
              )}

              {booking.status?.toLowerCase() === 'confirmed' && (
                <div className="flex items-center gap-2 pt-4 border-t border-gray-100 text-sm text-green-700 font-medium">
                  <CheckCircle className="h-4 w-4" />
                  Tour booking confirmed
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SellerTourBookings;
