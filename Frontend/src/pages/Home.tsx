import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, DollarSign, PlusCircle, FileText } from 'lucide-react';
import { Navbar } from '../components/Layout/Navbar';
import { Footer } from '../components/Layout/Footer';
import { PropertyCard } from '../components/PropertyCard';
import { propertiesApi } from '../services/api';
import { useEffect, useState } from 'react';
import type { Property } from '../types';
import { PropertyStatus, PropertyType } from '../types';

export const Home: React.FC = () => {
   const navigate = useNavigate();
   const [properties, setProperties] = useState<Property[]>([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const fetchProperties = async () => {
         try {
            // Dummy properties data
            const dummyProperties: Property[] = [
               {
                  propertyId: 'p1',
                  ownerId: 'seller1',
                  title: 'Cozy Apartment in Downtown',
                  description: 'Beautiful apartment with modern amenities in the heart of the city.',
                  propertyType: PropertyType.APARTMENT,
                  price: 250000,
                  location: 'Downtown',
                  city: 'New York',
                  state: 'NY',
                  bedrooms: 2,
                  bathrooms: 1,
                  areaSqft: 900,
                  status: PropertyStatus.FOR_SALE,
                  listedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                  images: [{ imageId: '1', propertyId: 'p1', imageUrl: 'https://images.unsplash.com/photo-1560185127-6d4f1c0b98d0?auto=format&fit=crop&w=800&q=80', displayOrder: 1 }],
                  amenities: ['WiFi', 'AC', 'Gym', 'Pool'],
                  averageRating: 4.5,
                  reviewCount: 12
               },
               {
                  propertyId: 'p2',
                  ownerId: 'seller2',
                  title: 'Luxury Villa with Pool',
                  description: 'Stunning luxury villa with private pool and garden.',
                  propertyType: PropertyType.VILLA,
                  price: 1200000,
                  location: 'Beverly Hills',
                  city: 'Los Angeles',
                  state: 'CA',
                  bedrooms: 5,
                  bathrooms: 4,
                  areaSqft: 4500,
                  status: PropertyStatus.FOR_SALE,
                  listedDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
                  images: [{ imageId: '2', propertyId: 'p2', imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80', displayOrder: 1 }],
                  amenities: ['Pool', 'Garden', 'Gym', 'Home Theater'],
                  averageRating: 4.8,
                  reviewCount: 25
               },
               {
                  propertyId: 'p3',
                  ownerId: 'seller3',
                  title: 'Modern House with Garden',
                  description: 'Contemporary house with spacious garden perfect for families.',
                  propertyType: PropertyType.HOUSE,
                  price: 450000,
                  location: 'Suburbs',
                  city: 'Chicago',
                  state: 'IL',
                  bedrooms: 4,
                  bathrooms: 2,
                  areaSqft: 2200,
                  status: PropertyStatus.FOR_SALE,
                  listedDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
                  images: [{ imageId: '3', propertyId: 'p3', imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80', displayOrder: 1 }],
                  amenities: ['Garden', 'Garage', 'Patio', 'Fire Place'],
                  averageRating: 4.3,
                  reviewCount: 8
               }
            ];
            setProperties(dummyProperties);
         } catch (err) {
            console.error('Failed to fetch properties', err);
         } finally {
            setLoading(false);
         }
      };

      fetchProperties();
   }, []); return (
      <div className="min-h-screen bg-white">
         <Navbar />

         {/* Hero Section */}
         <div className="relative bg-gray-900 h-150 flex items-center justify-center">
            <img
               src="https://images.unsplash.com/photo-1600596542815-e32870110029?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
               alt="Modern Home"
               className="absolute inset-0 w-full h-full object-cover opacity-60"
            />
            <div className="relative z-10 max-w-4xl w-full px-4 text-center">
               <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Find Your Dream Home With Ghar Bazar
               </h1>
               <p className="text-lg text-gray-200 mb-8">
                  Seamlessly discover properties for sale, rent, or lease. Your perfect home is just a click away.
               </p>

               <div className="bg-white p-2 rounded-lg shadow-lg flex flex-col md:flex-row gap-2 max-w-3xl mx-auto">
                  <div className="flex-1 relative">
                     <input type="text" placeholder="Enter location" className="w-full px-4 py-3 rounded-md border-0 focus:ring-2 focus:ring-primary-500 bg-gray-50" />
                  </div>
                  <div className="flex-1 relative">
                     <select className="w-full px-4 py-3 rounded-md border-0 focus:ring-2 focus:ring-primary-500 bg-gray-50 text-gray-500">
                        <option>Price range</option>
                        <option>$100k - $500k</option>
                        <option>$500k - $1M</option>
                     </select>
                  </div>
                  <div className="flex-1 relative">
                     <select className="w-full px-4 py-3 rounded-md border-0 focus:ring-2 focus:ring-primary-500 bg-gray-50 text-gray-500">
                        <option>Property type</option>
                        <option>House</option>
                        <option>Apartment</option>
                     </select>
                  </div>
                  <button onClick={() => navigate('/properties')} className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-md font-semibold transition-colors flex items-center justify-center">
                     <Search className="h-5 w-5 mr-2" /> Search
                  </button>
               </div>
            </div>
         </div>

         {/* Categories */}
         <div className="max-w-7xl mx-auto px-4 py-20">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Explore Property Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-6">
                     <DollarSign className="text-primary-600 h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Buy Property</h3>
                  <p className="text-gray-500 mb-6">Explore a wide range of properties available for purchase. Find your dream home today!</p>
                  <button onClick={() => navigate('/properties')} className="w-full bg-primary-500 text-white py-2 rounded-lg hover:bg-primary-600 transition">Explore Properties</button>
               </div>

               <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-6">
                     <PlusCircle className="text-primary-600 h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Sell Property</h3>
                  <p className="text-gray-500 mb-6">List your property with us and connect with thousands of potential buyers effortlessly.</p>
                  <button onClick={() => navigate('/login')} className="w-full bg-primary-500 text-white py-2 rounded-lg hover:bg-primary-600 transition">List Your Property</button>
               </div>

               <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-6">
                     <FileText className="text-primary-600 h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Lease Property</h3>
                  <p className="text-gray-500 mb-6">Discover rental properties that fit your lifestyle and budget. Short-term and long-term options.</p>
                  <button onClick={() => navigate('/properties')} className="w-full bg-primary-500 text-white py-2 rounded-lg hover:bg-primary-600 transition">Find Rentals</button>
               </div>
            </div>
         </div>

         {/* Featured Properties */}
         <div className="bg-gray-50 py-20">
            <div className="max-w-7xl mx-auto px-4">
               <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Featured Properties</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {properties.slice(0, 3).map((prop) => (
                     <PropertyCard key={prop.propertyId} property={prop} />
                  ))}
               </div>
               <div className="text-center mt-12">
                  <button onClick={() => navigate('/properties')} className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200">
                     View All Properties
                  </button>
               </div>
            </div>
         </div>

         <Footer />
      </div>
   );
};
