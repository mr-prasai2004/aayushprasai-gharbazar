import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/Layout/Navbar';
import { Footer } from '../../components/Layout/Footer';
import { propertiesApi, reviewsApi, authApi, messagesApi } from '../../services/api';
import { MapPin, Bed, Bath, Move, Star, X, Check, AlertCircle, Trash2 } from 'lucide-react';
import { UserRole } from '../../types';

interface Notification {
    id: number;
    type: 'success' | 'error' | 'info';
    message: string;
}

interface Review {
    reviewId: string;
    userId: string;
    userName: string;
    propertyId: string;
    rating: number;
    comment: string;
    createdAt: string;
}

export const PropertyDetails: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [property, setProperty] = useState<any>(null);
    const [showContactModal, setShowContactModal] = useState(false);
    const [showTourModal, setShowTourModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [contactMessage, setContactMessage] = useState('');
    const [tourDate, setTourDate] = useState('');
    const [tourTime, setTourTime] = useState('');
    const [reviewText, setReviewText] = useState('');
    const [reviewRating, setReviewRating] = useState(5);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [notificationId, setNotificationId] = useState(0);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    // Load property and reviews from API on mount
    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const [propData, reviewsData] = await Promise.all([
                    propertiesApi.getById(id),
                    reviewsApi.getByProperty(id).catch(() => []) // Fallback to empty reviews if fails
                ]);
                setProperty(propData);
                setReviews(reviewsData);
            } catch (err) {
                console.error('Failed to load property', err);
                addNotification('Failed to load property details', 'error');
            } finally {
                setLoading(false);
            }
        };

        const validateAuth = async () => {
            if (localStorage.getItem('authToken')) {
                try {
                    await authApi.getProfile();
                } catch (e) {
                    // Token invalid
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('currentUser');
                }
            }
        };

        fetchData();
        validateAuth();
    }, [id]);

    const addNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        const id = notificationId + 1;
        setNotificationId(id);
        setNotifications(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 4000);
    };

    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('authToken'));

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('authToken');
            if (token) {
                try {
                    await authApi.getProfile();
                    setIsAuthenticated(true);
                } catch {
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('currentUser');
                    setIsAuthenticated(false);
                }
            } else {
                setIsAuthenticated(false);
            }
        };
        checkAuth();
    }, []);

    const getCurrentUser = () => {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    };

    const isAdmin = () => {
        const user = getCurrentUser();
        return user?.role === UserRole.ADMIN;
    };

    const isSeller = () => {
        const user = getCurrentUser();
        return user?.role === UserRole.SELLER;
    };

    const isPropertyOwner = () => {
        if (!property || !isSeller()) return false;
        const user = getCurrentUser();
        // Check if ownerId matches user's ID
        // Note: API returns ownerId (camelCase), user object might have userId
        return property.ownerId === user?.userId;
    };

    const handleEditProperty = () => {
        navigate(`/dashboard/listings/${property.propertyId}`);
    };

    const handleDeleteProperty = async () => {
        if (window.confirm('Are you sure you want to delete this property?')) {
            try {
                await propertiesApi.delete(property.propertyId);
                addNotification('Property deleted successfully', 'success');
                setTimeout(() => navigate('/'), 1500);
            } catch (err) {
                console.error(err);
                addNotification('Failed to delete property', 'error');
            }
        }
    };

    const handleAddReview = async () => {
        if (!isAuthenticated) {
            addNotification('Please log in to leave a review', 'error');
            setTimeout(() => navigate('/login'), 500);
            return;
        }

        if (!reviewText.trim()) {
            addNotification('Please enter a review', 'error');
            return;
        }

        if (!property) return;

        try {
            const newReview = await reviewsApi.create({
                propertyId: property.propertyId,
                rating: reviewRating,
                comment: reviewText
            });

            setReviews(prev => [newReview, ...prev]);
            addNotification('Review submitted successfully!', 'success');
            setReviewText('');
            setReviewRating(5);
            setShowReviewModal(false);
        } catch (err) {
            console.error(err);
            addNotification('Failed to submit review', 'error');
        }
    };

    const handleDeleteReview = async (reviewId: string) => {
        if (!isAdmin()) {
            addNotification('Only admins can delete reviews', 'error');
            return;
        }

        try {
            await reviewsApi.delete(reviewId);
            setReviews(prev => prev.filter(r => r.reviewId !== reviewId));
            addNotification('Review deleted successfully!', 'success');
        } catch (err) {
            console.error(err);
            addNotification('Failed to delete review', 'error');
        }
    };

    const handleContactSeller = async () => {
        if (!isAuthenticated) {
            addNotification('Please log in to contact the seller', 'error');
            setTimeout(() => navigate('/login'), 500);
            return;
        }
        if (contactMessage.trim()) {
            try {
                await messagesApi.send({
                    receiverId: property.ownerId,
                    propertyId: property.propertyId,
                    content: contactMessage
                });
                addNotification(`Message sent to ${property.ownerName || 'Seller'} successfully!`, 'success');
                setContactMessage('');
                setShowContactModal(false);
            } catch (error) {
                console.error('Failed to send message', error);
                addNotification('Failed to send message. Please try again.', 'error');
            }
        } else {
            addNotification('Please enter a message', 'error');
        }
    };

    const handleScheduleTour = () => {
        if (!isAuthenticated) {
            addNotification('Please log in to schedule a tour', 'error');
            setTimeout(() => navigate('/login'), 500);
            return;
        }
        if (tourDate && tourTime) {
            addNotification(`Tour scheduled for ${tourDate} at ${tourTime}`, 'success');
            setTourDate('');
            setTourTime('');
            setShowTourModal(false);
        } else {
            addNotification('Please select both date and time', 'error');
        }
    };

    const handleContactButtonClick = () => {
        if (!isAuthenticated) {
            alert('Please log in to contact the seller');
            navigate('/login');
        } else {
            setShowContactModal(true);
        }
    };

    const handleTourButtonClick = () => {
        if (!isAuthenticated) {
            alert('Please log in to schedule a tour');
            navigate('/login');
        } else {
            setShowTourModal(true);
        }
    };

    if (!property) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 py-16 text-center">
                    <p className="text-gray-600 text-lg">Loading property details...</p>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="bg-white">
                {/* Image Gallery Mock */}
                <div className="h-[500px] relative bg-gray-200 group">
                    <img src={property.images && property.images.length > 0 ? property.images[0].imageUrl : 'https://placehold.co/1200x500?text=No+Image'} className="w-full h-full object-cover" alt="Hero" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end">
                        <div className="max-w-7xl mx-auto w-full px-4 pb-8 text-white">
                            <div className="flex gap-2 mb-4">
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${property.status === 'For Sale' ? 'bg-green-500' : 'bg-blue-500'}`}>{property.status}</span>
                                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-white/20 backdrop-blur-sm">{property.propertyType}</span>
                            </div>
                            <h1 className="text-4xl font-bold mb-2">{property.title}</h1>
                            <p className="text-3xl font-bold text-primary-300 mb-4">${property.price.toLocaleString()}</p>
                            <div className="flex items-center text-gray-200">
                                <MapPin className="h-5 w-5 mr-2" /> {property.location}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-12">
                        {/* Description */}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Property Details</h2>
                            <p className="text-gray-600 leading-relaxed">{property.description}</p>
                        </div>

                        {/* Amenities */}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Amenities</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="flex items-center text-gray-600 bg-gray-50 p-3 rounded-lg"><Bed className="mr-2 h-5 w-5 text-primary-500" /> {property.bedrooms} Bedrooms</div>
                                <div className="flex items-center text-gray-600 bg-gray-50 p-3 rounded-lg"><Bath className="mr-2 h-5 w-5 text-primary-500" /> {property.bathrooms} Bathrooms</div>
                                <div className="flex items-center text-gray-600 bg-gray-50 p-3 rounded-lg"><Move className="mr-2 h-5 w-5 text-primary-500" /> {property.areaSqft} Sqft</div>
                                {property.amenities.map((a: string) => <div key={a} className="flex items-center text-gray-600 bg-gray-50 p-3 rounded-lg">✓ {a}</div>)}
                            </div>
                        </div>

                        {/* Location Mock */}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Location</h2>
                            <div className="h-80 bg-gray-200 rounded-xl overflow-hidden relative flex items-center justify-center border border-gray-300">
                                <div className="text-center">
                                    <MapPin className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                                    <p className="text-gray-500 font-medium">Map Integration Placeholder</p>
                                    <p className="text-sm text-gray-400 mt-1">{property.location}</p>
                                </div>
                            </div>
                        </div>

                        {/* Reviews */}
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Customer Reviews ({reviews.length})</h2>
                                {isAuthenticated ? (
                                    <button
                                        onClick={() => setShowReviewModal(true)}
                                        className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition text-sm"
                                    >
                                        Leave a Review
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition text-sm"
                                    >
                                        Log in to Review
                                    </button>
                                )}
                            </div>
                            <div className="space-y-6">
                                {reviews.map(r => (
                                    <div key={r.reviewId} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm relative">
                                        {isAdmin() && (
                                            <button
                                                onClick={() => handleDeleteReview(r.reviewId)}
                                                className="absolute top-4 right-4 text-red-500 hover:text-red-700 transition"
                                                title="Delete review"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        )}
                                        <div className="flex items-center mb-4">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center mr-3 shadow-md">
                                                <span className="text-white font-bold">{(r.userName || "U").charAt(0).toUpperCase()}</span>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-gray-900">{r.userName || "User"}</h4>
                                                <div className="flex text-yellow-400 mt-0.5">
                                                    {[...Array(5)].map((_, i) => <Star key={i} className={`h-3 w-3 ${i < r.rating ? 'fill-current' : 'text-gray-200'}`} />)}
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-gray-600 text-sm leading-relaxed">{r.comment}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - Role-based UI */}
                    <div className="lg:col-span-1">
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg sticky top-24">
                            {/* ADMIN VIEW */}
                            {isAdmin() && (
                                <>
                                    <h3 className="text-xl font-bold mb-4">Admin Controls</h3>
                                    <div className="space-y-3">
                                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                            <p className="text-sm font-medium text-blue-900">Property ID: {property.propertyId}</p>
                                            <p className="text-sm text-blue-800 mt-1">Status: <span className="font-bold">{property.status}</span></p>
                                            <p className="text-sm text-blue-800 mt-1">Owner: {property.ownerId}</p>
                                        </div>
                                        <button
                                            onClick={handleDeleteProperty}
                                            className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition shadow-md shadow-red-200">
                                            Delete Property
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* SELLER/OWNER VIEW */}
                            {isPropertyOwner() && (
                                <>
                                    <h3 className="text-xl font-bold mb-4">Manage Property</h3>
                                    <div className="space-y-3">
                                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                            <p className="text-sm font-medium text-amber-900">Status: <span className="font-bold">{property.status}</span></p>
                                            {property.status === 'Pending' && <p className="text-xs text-amber-700 mt-2">⏳ Awaiting admin approval...</p>}
                                            {property.status === 'For Sale' && <p className="text-xs text-green-700 mt-2">✓ Live and visible to buyers</p>}
                                        </div>
                                        <button
                                            onClick={handleEditProperty}
                                            className="w-full bg-primary-600 text-white py-3 rounded-lg font-bold hover:bg-primary-700 transition shadow-md shadow-primary-200">
                                            Edit Property
                                        </button>
                                        <button
                                            onClick={handleDeleteProperty}
                                            className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition shadow-md shadow-red-200">
                                            Delete Property
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* BUYER VIEW (Default) */}
                            {!isAdmin() && !isPropertyOwner() && (
                                <>
                                    <h3 className="text-xl font-bold mb-2">Interested in this property?</h3>
                                    <p className="text-sm text-gray-500 mb-6">Contact the seller for more details or to schedule a viewing.</p>

                                    <div className="flex items-center gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
                                        <div className="h-12 w-12 rounded-full bg-gray-300 overflow-hidden">
                                            <img src={property.ownerProfilePicture || "https://i.pravatar.cc/150?img=11"} alt="Seller" className="h-full w-full object-cover" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{property.ownerName || 'Property Owner'}</p>
                                            <p className="text-xs text-gray-500">Property Seller</p>
                                        </div>
                                    </div>

                                    {isAuthenticated ? (
                                        <>
                                            <button
                                                onClick={handleContactButtonClick}
                                                className="w-full bg-primary-600 text-white py-3 rounded-lg font-bold hover:bg-primary-700 transition mb-3 shadow-md shadow-primary-200">
                                                Contact Seller
                                            </button>
                                            <button
                                                onClick={handleTourButtonClick}
                                                className="w-full bg-white border border-primary-600 text-primary-600 py-3 rounded-lg font-bold hover:bg-primary-50 transition">
                                                Schedule Tour
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => navigate('/login')}
                                            className="w-full bg-primary-600 text-white py-3 rounded-lg font-bold hover:bg-primary-700 transition mb-3 shadow-md shadow-primary-200">
                                            Log in to Contact Seller
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />

            {/* Review Modal */}
            {showReviewModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Leave a Review</h3>
                            <button onClick={() => setShowReviewModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">Share your experience with this property</p>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button
                                        key={star}
                                        onClick={() => setReviewRating(star)}
                                        className="focus:outline-none"
                                    >
                                        <Star
                                            className={`h-6 w-6 transition ${star <= reviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <textarea
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            placeholder="Write your review here..."
                            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none mb-4"
                            rows={4}
                            maxLength={500}
                        />
                        <div className="text-xs text-gray-500 mb-4">{reviewText.length}/500 characters</div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowReviewModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition">
                                Cancel
                            </button>
                            <button
                                onClick={handleAddReview}
                                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition">
                                Submit Review
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Contact Seller Modal */}
            {showContactModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Contact Seller</h3>
                            <button onClick={() => setShowContactModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="flex items-center gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
                            <div className="h-10 w-10 rounded-full bg-gray-300 overflow-hidden">
                                <img src={property.ownerProfilePicture || "https://i.pravatar.cc/150?img=11"} alt="Seller" className="h-full w-full object-cover" />
                            </div>
                            <div>
                                <p className="font-bold text-gray-900">{property.ownerName || 'Property Owner'}</p>
                                <p className="text-xs text-gray-500">Property Seller</p>
                            </div>
                        </div>
                        <textarea
                            value={contactMessage}
                            onChange={(e) => setContactMessage(e.target.value)}
                            placeholder="Write your message here..."
                            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none mb-4"
                            rows={4}
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowContactModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition">
                                Cancel
                            </button>
                            <button
                                onClick={handleContactSeller}
                                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition">
                                Send Message
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Schedule Tour Modal */}
            {showTourModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Schedule a Tour</h3>
                            <button onClick={() => setShowTourModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">Property: <span className="font-bold">{property.title}</span></p>
                        <div className="space-y-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                                <input
                                    type="date"
                                    value={tourDate}
                                    onChange={(e) => setTourDate(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Select Time</label>
                                <select
                                    value={tourTime}
                                    onChange={(e) => setTourTime(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none">
                                    <option value="">Choose a time</option>
                                    <option value="09:00 AM">09:00 AM</option>
                                    <option value="10:00 AM">10:00 AM</option>
                                    <option value="11:00 AM">11:00 AM</option>
                                    <option value="12:00 PM">12:00 PM</option>
                                    <option value="01:00 PM">01:00 PM</option>
                                    <option value="02:00 PM">02:00 PM</option>
                                    <option value="03:00 PM">03:00 PM</option>
                                    <option value="04:00 PM">04:00 PM</option>
                                    <option value="05:00 PM">05:00 PM</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowTourModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition">
                                Cancel
                            </button>
                            <button
                                onClick={handleScheduleTour}
                                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition">
                                Schedule
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification Toasts */}
            <div className="fixed top-4 right-4 z-[60] space-y-3">
                {notifications.map((notification) => (
                    <div
                        key={notification.id}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white animate-in fade-in slide-in-from-top-2 duration-300 ${notification.type === 'success'
                            ? 'bg-green-500'
                            : notification.type === 'error'
                                ? 'bg-red-500'
                                : 'bg-blue-500'
                            }`}
                    >
                        {notification.type === 'success' && <Check className="h-5 w-5" />}
                        {notification.type === 'error' && <AlertCircle className="h-5 w-5" />}
                        {notification.type === 'info' && <AlertCircle className="h-5 w-5" />}
                        <span className="text-sm font-medium">{notification.message}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
