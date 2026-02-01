import React, { useState, useEffect } from 'react';
import { PropertyCard } from '../../../components/PropertyCard';
import { propertiesApi } from '../../../services/api';

export const Recommended: React.FC = () => {
  const [properties, setProperties] = useState<any[]>([]);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const data = await propertiesApi.getAll();
        setProperties(data.slice(0, 3));
      } catch (err) {
        console.error('Failed to laod the recommend data', err);
      }
    };
    fetchProperties();
  }, []);

  if (properties.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-800">Recommended Properties</h2>
        <button className="text-sm text-primary-600 font-medium hover:underline">View All</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((p: any) => <PropertyCard key={p.propertyId} property={p} />)}
      </div>
    </div>
  );
};
