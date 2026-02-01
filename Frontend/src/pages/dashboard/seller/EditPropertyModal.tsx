import React from 'react';
import { X } from 'lucide-react';

interface Props {
  show: boolean;
  onClose: () => void;
  editFormData: any;
  setEditFormData: (d: any) => void;
  onSave: () => void;
}

export const EditPropertyModal: React.FC<Props> = ({ show, onClose, editFormData, setEditFormData, onSave }) => {
  if (!show || !editFormData) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Edit Property</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Property Title</label>
              <input
                type="text"
                value={editFormData.title}
                onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="e.g., Luxury Hillside Villa"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">$</span>
                <input
                  type="number"
                  value={editFormData.price}
                  onChange={(e) => setEditFormData({ ...editFormData, price: parseFloat(e.target.value) })}
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="500000"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
              <input
                type="number"
                value={editFormData.bedrooms}
                onChange={(e) => setEditFormData({ ...editFormData, bedrooms: parseInt(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bathrooms</label>
              <input
                type="number"
                value={editFormData.bathrooms}
                onChange={(e) => setEditFormData({ ...editFormData, bathrooms: parseInt(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Area (Sq Ft)</label>
              <input
                type="number"
                value={editFormData.areaSqft}
                onChange={(e) => setEditFormData({ ...editFormData, areaSqft: parseInt(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="2000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={editFormData.description}
              onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder="Describe your property..."
              rows={4}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition">
            Cancel
          </button>
          <button
            onClick={onSave}
            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPropertyModal;
