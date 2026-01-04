import React from 'react';
import { Eye, Edit2, Trash2 } from 'lucide-react';

interface Props {
  listings: any[];
  onEdit: (p: any) => void;
  onDelete: (id: string) => void;
  onView?: (id: string) => void;
}

export const Listings: React.FC<Props> = ({ listings, onEdit, onDelete, onView }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-bold text-gray-800">Your Property Listings</h3>
        <button onClick={() => alert('Add New')} className="text-sm text-blue-600 font-medium hover:underline">+ Add New</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-6 py-3">Property</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Price</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {listings.map((item) => (
              <tr key={item.property_id} className="hover:bg-gray-50">
                <td className="px-6 py-3 font-medium flex items-center gap-3 min-w-50">
                  <img src={item.images?.[0]?.image_url || ''} alt="" className="w-10 h-10 rounded object-cover" />
                  {item.title}
                </td>
                <td className="px-6 py-3">{item.property_type}</td>
                <td className="px-6 py-3">${item.price?.toLocaleString?.() ?? item.price}</td>
                <td className="px-6 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${item.status === 'For Sale' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-3 flex gap-2">
                  <button className="text-gray-400 hover:text-blue-600" onClick={() => onView?.(item.property_id)} title="View"><Eye className="h-4 w-4"/></button>
                  <button className="text-gray-400 hover:text-green-600" onClick={() => onEdit(item)} title="Edit"><Edit2 className="h-4 w-4"/></button>
                  <button className="text-gray-400 hover:text-red-600" onClick={() => onDelete(item.property_id)} title="Delete"><Trash2 className="h-4 w-4"/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Listings;
