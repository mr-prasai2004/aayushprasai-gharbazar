import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Bed, Bath, Move, Heart } from 'lucide-react';
import { Property } from '../types';
import { wishlistApi } from '../services/api';

interface PropertyCardProps {
  property: Property;
  layout?: 'grid' | 'list';
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const navigate = useNavigate();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  // Load wishlist state from API
  useEffect(() => {
    let mounted = true;
    const checkWishlistState = async () => {
      try {
        const status = await wishlistApi.isInWishlist(property.propertyId);
        if (mounted) {
          setIsWishlisted(status);
        }
      } catch (err) {
        console.error('Failed to check wishlist status', err);
      }
    };

    const token = localStorage.getItem('authToken');
    if (token) {
      checkWishlistState();
    }

    return () => { mounted = false; };
  }, [property.propertyId]);

  // Toggle wishlist and persist to API
  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click navigation
    if (isWishlistLoading) return;

    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('Please login to save properties to your wishlist.');
      return;
    }

    setIsWishlistLoading(true);
    try {
      if (isWishlisted) {
        await wishlistApi.remove(property.propertyId);
        setIsWishlisted(false);
      } else {
        await wishlistApi.add(property.propertyId);
        setIsWishlisted(true);
      }
    } catch (err) {
      console.error('Failed to update wishlist', err);
      alert('Failed to update wishlist. Please try again later.');
    } finally {
      setIsWishlistLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer hover:scale-105 animate-slideInUp" onClick={() => navigate(`/properties/${property.propertyId}`)}>
      <div className="relative h-48 overflow-hidden bg-gray-200">
        <img
          src={property.images && property.images.length > 0 ? property.images[0].imageUrl : 'https://placehold.co/600x400?text=No+Image'}
          alt={property.title}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-2 right-2 animate-slideInRight">
          <button onClick={handleWishlistToggle} className="p-1.5 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-300 hover:scale-110">
            <Heart className={`h-4 w-4 transition-colors duration-300 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600 hover:text-red-500'}`} />
          </button>
        </div>
        <div className="absolute top-2 left-2 animate-slideInLeft">
          <span className={`px-2 py-1 rounded text-xs font-semibold transition-all duration-300 ${property.status === 'For Sale' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
            {property.status}
          </span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-bold text-gray-900 line-clamp-1 hover:text-primary-600 transition-colors duration-300">{property.title}</h3>
            <p className="text-primary-600 font-bold text-lg animate-pulse">NPR {property.price?.toLocaleString('en-NP')}</p>
          </div>
        </div>

        <div className="flex items-center text-gray-500 text-sm mb-4 group-hover:text-primary-600 transition-colors duration-300">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="truncate">{property.location}</span>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-100">
          <div className="flex items-center transition-all duration-300 hover:text-primary-600">
            <Bed className="h-4 w-4 mr-1" />
            <span>{property.bedrooms} Beds</span>
          </div>
          <div className="flex items-center transition-all duration-300 hover:text-primary-600">
            <Bath className="h-4 w-4 mr-1" />
            <span>{property.bathrooms} Baths</span>
          </div>
          <div className="flex items-center transition-all duration-300 hover:text-primary-600">
            <Move className="h-4 w-4 mr-1" />
            <span>{property.areaSqft} sqft</span>
          </div>
        </div>

        <button className="mt-4 w-full py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-primary-50 hover:border-primary-600 hover:text-primary-600 transition-all duration-300 hover:shadow-md active:scale-95">
          View Details
        </button>
      </div>
    </div>
  );
};
