import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
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
                const data = await propertiesApi.getAll();
                setProperties(data);
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
            <div className="bg-white py-8 md:py-12 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">Find Your Next Dream Property</h1>
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

            <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
                {/* Filters */}
                <div className="flex flex-col md:flex-row flex-wrap gap-4 mb-6 md:mb-8 items-start md:items-center justify-between">
                    <div className="flex flex-nowrap overflow-x-auto pb-2 md:pb-0 md:flex-wrap w-full md:w-auto gap-3 items-center snap-x hide-scrollbar">
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

                    {/* View Toggle - Hidden on mobile for simplicity */}
                    <div className="hidden md:flex items-center gap-2">
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
