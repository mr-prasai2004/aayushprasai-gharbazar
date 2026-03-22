import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { PropertyCard } from '../../components/PropertyCard';
import { UserRole } from '../../types';

export const Wishlist: React.FC = () => {
    const [wishlistProperties, setWishlistProperties] = useState<any[]>([]);
    const [role, setRole] = useState<UserRole>(UserRole.BUYER);

    useEffect(() => {
        // Load user role from localStorage
        const stored = localStorage.getItem('currentUser');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (parsed?.role) {
                    const mapped = (UserRole as any)[parsed.role] ?? UserRole.BUYER;
                    setRole(mapped as UserRole);
                }
            } catch (e) {
                // ignore parse errors
            }
        }

        const fetchWishlist = async () => {
            try {
                // Fetch wishlist from API
                // Assuming wishlistApi.getAll() returns list of properties
                // references api.ts implementation
                const { wishlistApi } = await import('../../services/api');
                const data = await wishlistApi.getAll();
                setWishlistProperties(data);
            } catch (err) {
                console.error('Failed to load wishlist', err);
                setWishlistProperties([]);
            }
        };
        fetchWishlist();
    }, []);

    return (
        <DashboardLayout role={role} title="My Wishlist">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlistProperties.length > 0 ? (
                    wishlistProperties.map(p => <PropertyCard key={p.propertyId} property={p} />)
                ) : (
                    <div className="col-span-full text-center py-12">
                        <p className="text-gray-500 text-lg">No properties in your wishlist yet.</p>
                        <p className="text-gray-400 text-sm mt-2">Click the heart icon on properties to add them to your wishlist.</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
};
