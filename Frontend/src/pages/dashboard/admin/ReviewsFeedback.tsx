import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../../components/layout';
import { UserRole } from '../../../types';
import { reviewsApi } from '../../../services/api';
import { Star, Trash2 } from 'lucide-react';
import { useToast } from '../../../components/Toast';

export const ReviewsFeedback: React.FC = () => {
    const toast = useToast();
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                // Assuming backend now has getAll endpoint for admins
                // If not, we might need to change this logic or wait for backend update
                const data = await reviewsApi.getAll();
                setReviews(data);
            } catch (err) {
                console.error('Failed to load reviews', err);
                // Fallback or empty state
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, []);

    const handleDelete = async (id: string) => {
        if (confirmDeleteId !== id) {
            setConfirmDeleteId(id);
            return;
        }
        setConfirmDeleteId(null);
        try {
            await reviewsApi.delete(id);
            setReviews(reviews.filter(r => r.reviewId !== id));
            toast.success('Review deleted.');
        } catch (err) {
            console.error('Failed to delete review', err);
            toast.error('Failed to delete review');
        }
    };

    return (
        <DashboardLayout role={UserRole.ADMIN} title="Reviews & Feedback">
            {loading ? (
                <div className="text-center py-12">Loading reviews...</div>
            ) : reviews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reviews.map(r => (
                        <div key={r.reviewId} className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm relative group hover:shadow-md transition">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">{(r.userName || 'U').charAt(0).toUpperCase()}</div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm">{r.userName || 'Unknown User'}</h4>
                                        <div className="flex text-yellow-400 text-xs mt-0.5">
                                            {[...Array(5)].map((_, i) => <Star key={i} className={`h-3 w-3 ${i < r.rating ? 'fill-current' : 'text-gray-200'}`} />)}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(r.reviewId)}
                                    className="text-gray-300 hover:text-red-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition duration-200">
                                    {confirmDeleteId === r.reviewId ? (
                                        <span className="text-xs font-semibold text-red-600">Confirm?</span>
                                    ) : (
                                        <Trash2 className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            <p className="text-gray-600 text-sm mb-4 italic">"{r.comment}"</p>
                            <div className="text-xs text-gray-400 pt-3 border-t border-gray-50 flex justify-between">
                                <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                                <span>Property ID: #{r.propertyId.substring(0, 8)}...</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 text-gray-500 bg-white rounded-lg border border-dashed border-gray-200">
                    No reviews found.
                </div>
            )}
        </DashboardLayout>
    );
}

export default ReviewsFeedback;
