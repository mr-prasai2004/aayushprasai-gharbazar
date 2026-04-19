import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { UserRole } from '../../types';
import { Calendar, MapPin, User, Clock, X, CheckCircle, AlertCircle } from 'lucide-react';
import { tourBookingsApi } from '../../services/api';
import { useToast } from '../../components/Toast';

export const Bookings: React.FC = () => {
    const toast = useToast();
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState<string | null>(null);
    const [confirmCancel, setConfirmCancel] = useState<string | null>(null);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const data = await tourBookingsApi.getMyBookings();
                setBookings(data);
            } catch (err) {
                console.error('Failed to load bookings', err);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    const handleCancel = async (bookingId: string) => {
        if (confirmCancel !== bookingId) {
            setConfirmCancel(bookingId);
            return;
        }
        setConfirmCancel(null);
        setCancelling(bookingId);
        try {
            await tourBookingsApi.cancel(bookingId);
            setBookings(prev => prev.map(b => b.bookingId === bookingId ? { ...b, status: 'Cancelled' } : b));
            toast.success('Tour booking cancelled.');
        } catch (err) {
            toast.error('Failed to cancel booking. Please try again.');
        } finally {
            setCancelling(null);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Confirmed': return 'bg-green-100 text-green-700';
            case 'Pending': return 'bg-yellow-100 text-yellow-700';
            case 'Cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Confirmed': return <CheckCircle className="h-3.5 w-3.5 mr-1" />;
            case 'Pending': return <Clock className="h-3.5 w-3.5 mr-1" />;
            case 'Cancelled': return <X className="h-3.5 w-3.5 mr-1" />;
            default: return <AlertCircle className="h-3.5 w-3.5 mr-1" />;
        }
    };

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString('en-NP', {
                year: 'numeric', month: 'long', day: 'numeric'
            });
        } catch { return dateStr; }
    };

    return (
        <DashboardLayout role={UserRole.BUYER} title="My Tour Bookings">
            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : bookings.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
                    <Calendar className="h-14 w-14 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No tours scheduled yet</h3>
                    <p className="text-gray-400 text-sm">Visit a property and click "Schedule Tour" to book a visit.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h3 className="font-bold text-gray-800">Your Scheduled Tours</h3>
                        <p className="text-sm text-gray-500 mt-0.5">{bookings.length} tour{bookings.length !== 1 ? 's' : ''} total</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                                <tr>
                                    <th className="px-6 py-3">Property</th>
                                    <th className="px-6 py-3">Seller</th>
                                    <th className="px-6 py-3">Date & Time</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {bookings.map((booking) => (
                                    <tr key={booking.bookingId} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {booking.propertyImage ? (
                                                    <img src={booking.propertyImage} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                                                        <MapPin className="h-4 w-4 text-gray-400" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium text-gray-900">{booking.propertyTitle}</p>
                                                    <p className="text-xs text-gray-500 flex items-center gap-0.5">
                                                        <MapPin className="h-3 w-3" />{booking.propertyLocation}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <User className="h-4 w-4 text-gray-400" />
                                                {booking.sellerName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-gray-700">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4 text-gray-400" />
                                                    {formatDate(booking.tourDate)}
                                                </div>
                                                <div className="flex items-center gap-1 mt-0.5 text-gray-500">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {booking.tourTime}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`flex items-center w-fit px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusStyle(booking.status)}`}>
                                                {getStatusIcon(booking.status)}
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {booking.status === 'Pending' ? (
                                                <div className="flex flex-col gap-1">
                                                    {confirmCancel === booking.bookingId ? (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-gray-600">Confirm cancel?</span>
                                                            <button onClick={() => handleCancel(booking.bookingId)} className="text-xs text-red-600 font-semibold hover:underline">Yes</button>
                                                            <button onClick={() => setConfirmCancel(null)} className="text-xs text-gray-500 hover:underline">No</button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleCancel(booking.bookingId)}
                                                            disabled={cancelling === booking.bookingId}
                                                            className="text-red-600 hover:text-red-700 font-medium text-sm disabled:opacity-50"
                                                        >
                                                            {cancelling === booking.bookingId ? 'Cancelling...' : 'Cancel Tour'}
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-xs">—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};
