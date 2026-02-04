import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Navbar } from '../../components/Layout/Navbar';
import { Footer } from '../../components/Layout/Footer';
import { PropertyCard } from '../../components/PropertyCard';
import { propertiesApi } from '../../services/api';
import { Search, Grid, List as ListIcon } from 'lucide-react';
import { PropertyType } from '../../types';

export const PropertySearch: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState('');
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter States
    const [selectedType, setSelectedType] = useState('All');
    const [priceRange, setPriceRange] = useState('All');
    const [bedrooms, setBedrooms] = useState('All');

    // Load properties from API on mount
    useEffect(() => {
        const fetchProperties = async () => {
            try {
                setLoading(true);
                // Dummy properties data
                const dummyProperties = [
                    {
                        propertyId: 'p1',
                        ownerId: 'seller1',
                        title: 'Cozy Apartment in Downtown',
                        description: 'Beautiful apartment with modern amenities in the heart of the city.',
                        propertyType: 'Apartment',
                        price: 250000,
                        location: 'Downtown',
                        city: 'New York',
                        state: 'NY',
                        bedrooms: 2,
                        bathrooms: 1,
                        areaSqft: 900,
                        status: 'For Sale',
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
                        propertyType: 'Villa',
                        price: 1200000,
                        location: 'Beverly Hills',
                        city: 'Los Angeles',
                        state: 'CA',
                        bedrooms: 5,
                        bathrooms: 4,
                        areaSqft: 4500,
                        status: 'For Sale',
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
                        propertyType: 'House',
                        price: 450000,
                        location: 'Suburbs',
                        city: 'Chicago',
                        state: 'IL',
                        bedrooms: 4,
                        bathrooms: 2,
                        areaSqft: 2200,
                        status: 'For Sale',
                        listedDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
                        images: [{ imageId: '3', propertyId: 'p3', imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80', displayOrder: 1 }],
                        amenities: ['Garden', 'Garage', 'Patio', 'Fire Place'],
                        averageRating: 4.3,
                        reviewCount: 8
                    },
                    {
                        propertyId: 'p4',
                        ownerId: 'seller4',
                        title: 'Spacious Office Space',
                        description: 'Prime office space in business district with modern facilities.',
                        propertyType: 'Commercial',
                        price: 800000,
                        location: 'Business District',
                        city: 'San Francisco',
                        state: 'CA',
                        bedrooms: 0,
                        bathrooms: 3,
                        areaSqft: 3000,
                        status: 'For Rent',
                        listedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
                        images: [{ imageId: '4', propertyId: 'p4', imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80', displayOrder: 1 }],
                        amenities: ['Parking', 'WiFi', 'Meeting Rooms', 'Break Room'],
                        averageRating: 4.6,
                        reviewCount: 18
                    },
                    {
                        propertyId: 'p5',
                        ownerId: 'seller1',
                        title: 'Elegant Condo with City View',
                        description: 'Premium condo with breathtaking city skyline views.',
                        propertyType: 'Condo',
                        price: 650000,
                        location: 'Downtown',
                        city: 'Boston',
                        state: 'MA',
                        bedrooms: 3,
                        bathrooms: 2,
                        areaSqft: 1800,
                        status: 'For Sale',
                        listedDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
                        images: [{ imageId: '5', propertyId: 'p5', imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80', displayOrder: 1 }],
                        amenities: ['Balcony', 'Gym', 'Concierge', 'Valet Parking'],
                        averageRating: 4.7,
                        reviewCount: 15
                    }
                ];
                setProperties(dummyProperties);
            } catch (err) {
                console.error('Failed to load properties', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProperties();
    }, []);

    useEffect(() => {
        const query = searchParams.get('search');
        if (query) {
            setSearchTerm(query);
        }
    }, [searchParams]);

    // Filtering Logic
    const filteredProperties = properties.filter(property => {
        // 1. Text Search
        const matchesSearch =
            property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
            property.city.toLowerCase().includes(searchTerm.toLowerCase());

        // 2. Type Filter
        const matchesType = selectedType === 'All' || property.propertyType === selectedType;

        // 3. Price Filter
        let matchesPrice = true;
        if (priceRange !== 'All') {
            const price = property.price;
            if (priceRange === 'under-500k') matchesPrice = price < 500000;
            else if (priceRange === '500k-1m') matchesPrice = price >= 500000 && price <= 1000000;
            else if (priceRange === 'over-1m') matchesPrice = price > 1000000;
        }

        // 4. Bedrooms Filter
        let matchesBedrooms = true;
        if (bedrooms !== 'All') {
            const beds = property.bedrooms;
            if (bedrooms === '4+') matchesBedrooms = beds >= 4;
            else matchesBedrooms = beds === parseInt(bedrooms);
        }

        return matchesSearch && matchesType && matchesPrice && matchesBedrooms;
    });

    const resetFilters = () => {
        setSearchTerm('');
        setSelectedType('All');
        setPriceRange('All');
        setBedrooms('All');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="bg-white py-12 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">Find Your Next Dream Property</h1>
                    <div className="max-w-3xl mx-auto flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3.5 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="Search by location, city, or zip..."
                                className="w-full pl-10 pr-4 py-3 rounded-md border border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="bg-primary-500 text-white px-8 py-3 rounded-md font-semibold hover:bg-primary-600">Search</button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-8 items-center justify-between">
                    <div className="flex flex-wrap gap-3 items-center">
                        {/* Property Type */}
                        <div className="relative">
                            <select
                                className="appearance-none bg-white border border-gray-300 rounded-full py-2 pl-4 pr-8 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer hover:bg-gray-50"
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                            >
                                <option value="All">All Types</option>
                                {Object.values(PropertyType).map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        {/* Price Range */}
                        <div className="relative">
                            <select
                                className="appearance-none bg-white border border-gray-300 rounded-full py-2 pl-4 pr-8 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer hover:bg-gray-50"
                                value={priceRange}
                                onChange={(e) => setPriceRange(e.target.value)}
                            >
                                <option value="All">Any Price</option>
                                <option value="under-500k">Under $500k</option>
                                <option value="500k-1m">$500k - $1M</option>
                                <option value="over-1m">Over $1M</option>
                            </select>
                        </div>

                        {/* Bedrooms */}
                        <div className="relative">
                            <select
                                className="appearance-none bg-white border border-gray-300 rounded-full py-2 pl-4 pr-8 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer hover:bg-gray-50"
                                value={bedrooms}
                                onChange={(e) => setBedrooms(e.target.value)}
                            >
                                <option value="All">Any Beds</option>
                                <option value="1">1 Bed</option>
                                <option value="2">2 Beds</option>
                                <option value="3">3 Beds</option>
                                <option value="4+">4+ Beds</option>
                            </select>
                        </div>

                        <button
                            className="px-4 py-2 text-primary-600 text-sm font-medium hover:underline ml-2"
                            onClick={resetFilters}
                        >
                            Reset Filters
                        </button>
                    </div>

                    {/* View Toggle */}
                    <div className="flex items-center gap-2">
                        <button className="p-2 bg-primary-500 text-white rounded shadow-sm"><Grid className="h-5 w-5" /></button>
                        <button className="p-2 bg-white text-gray-500 border border-gray-300 rounded hover:bg-gray-50"><ListIcon className="h-5 w-5" /></button>
                    </div>
                </div>

                <h2 className="text-xl font-bold text-gray-800 mb-6">Available Properties ({filteredProperties.length} results)</h2>
                {filteredProperties.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProperties.map(p => <PropertyCard key={p.propertyId} property={p} />)}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-lg border border-dashed border-gray-300">
                        <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No properties found</h3>
                        <p className="text-gray-500 text-sm mt-1">Try adjusting your filters or search term.</p>
                        <button
                            className="mt-4 text-primary-600 font-medium hover:underline"
                            onClick={resetFilters}
                        >
                            Clear all filters
                        </button>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};
