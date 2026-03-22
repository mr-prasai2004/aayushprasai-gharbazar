import React, { useState } from 'react';
import { Eye, Edit2, Trash2, FileText, CheckCircle2 } from 'lucide-react';
import { PropertyDocumentUpload } from "../../../components/PropertyDocumentUpload";

interface Props {
  listings: any[];
  onEdit: (p: any) => void;
  onDelete: (id: string) => void;
  onView?: (id: string) => void;
  onDocumentsChange?: (propertyId: string, documents: any[]) => void;
  onStatusChange?: (propertyId: string, newStatus: string) => Promise<void>;
}

const PROPERTY_STATUSES = [
  { value: 'For Sale', label: 'For Sale', color: 'bg-green-100 text-green-700' },
  { value: 'For Rent', label: 'For Rent', color: 'bg-blue-100 text-blue-700' },
  { value: 'Sold', label: 'Sold', color: 'bg-gray-100 text-gray-600' },
  { value: 'Rented', label: 'Rented', color: 'bg-purple-100 text-purple-700' },
  { value: 'Leased', label: 'Leased', color: 'bg-orange-100 text-orange-700' },
  { value: 'Withdrawn', label: 'Withdrawn', color: 'bg-red-100 text-red-700' },
  { value: 'Pending', label: 'Pending (Admin Review)', color: 'bg-yellow-100 text-yellow-700' },
];

export const Listings: React.FC<Props> = ({ listings, onEdit, onDelete, onView, onDocumentsChange, onStatusChange }) => {
  const [expandedProperty, setExpandedProperty] = useState<string | null>(null);
  const [propertyDocuments, setPropertyDocuments] = useState<{ [key: string]: any[] }>({});
  const [statusEditing, setStatusEditing] = useState<{ [key: string]: string }>({});
  const [savingStatus, setSavingStatus] = useState<string | null>(null);

  // Initialize documents from listings
  React.useEffect(() => {
    const docs: { [key: string]: any[] } = {};
    listings.forEach(listing => {
      docs[listing.propertyId] = listing.documents || [];
    });
    setPropertyDocuments(docs);
  }, [listings]);

  const handleDocumentsChange = (propertyId: string, documents: any[]) => {
    setPropertyDocuments(prev => ({
      ...prev,
      [propertyId]: documents
    }));
    onDocumentsChange?.(propertyId, documents);
  };

  const getStatusStyle = (status: string) => {
    return PROPERTY_STATUSES.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-600';
  };

  const handleStatusSave = async (propertyId: string) => {
    const newStatus = statusEditing[propertyId];
    if (!newStatus || !onStatusChange) return;
    setSavingStatus(propertyId);
    try {
      await onStatusChange(propertyId, newStatus);
      // Clear the editing state for this property
      setStatusEditing(prev => {
        const copy = { ...prev };
        delete copy[propertyId];
        return copy;
      });
    } finally {
      setSavingStatus(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-800">Your Property Listings</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-6 py-3">Property</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Price</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Documents</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {listings.map((item) => (
                <React.Fragment key={item.propertyId}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium flex items-center gap-3 min-w-[200px]">
                      <img src={item.images?.[0]?.imageUrl || 'https://placehold.co/100x100'} alt="" className="w-10 h-10 rounded object-cover" />
                      <div>
                        <p className="font-medium text-gray-900">{item.title}</p>
                        <p className="text-xs text-gray-500">{item.location}</p>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-gray-600">{item.propertyType}</td>
                    <td className="px-6 py-3 font-medium">NPR {item.price?.toLocaleString('en-NP') ?? item.price}</td>
                    <td className="px-6 py-3">
                      {/* Only allow status change for verified properties */}
                      {item.verificationStatus === 'verified' ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={statusEditing[item.propertyId] ?? item.status}
                            onChange={e => setStatusEditing(prev => ({ ...prev, [item.propertyId]: e.target.value }))}
                            className="text-xs border border-gray-200 rounded-md px-2 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                          >
                            {PROPERTY_STATUSES.map(s => (
                              <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                          </select>
                          {statusEditing[item.propertyId] && statusEditing[item.propertyId] !== item.status && (
                            <button
                              onClick={() => handleStatusSave(item.propertyId)}
                              disabled={savingStatus === item.propertyId}
                              className="p-1 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50"
                              title="Save status"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(item.status)}`}>
                          {item.status}
                          {item.verificationStatus === 'pending' && (
                            <span className="ml-1 text-gray-400">(Awaiting admin)</span>
                          )}
                          {item.verificationStatus === 'rejected' && (
                            <span className="ml-1 text-red-400">(Rejected)</span>
                          )}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <button
                        onClick={() => setExpandedProperty(expandedProperty === item.propertyId ? null : item.propertyId)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        <FileText className="h-4 w-4" />
                        {(propertyDocuments[item.propertyId] || []).length} docs
                      </button>
                    </td>
                    <td className="px-6 py-3 flex gap-2">
                      <button className="text-gray-400 hover:text-blue-600 p-1" onClick={() => onView?.(item.propertyId)} title="View"><Eye className="h-4 w-4" /></button>
                      <button className="text-gray-400 hover:text-green-600 p-1" onClick={() => onEdit(item)} title="Edit"><Edit2 className="h-4 w-4" /></button>
                      <button className="text-gray-400 hover:text-red-600 p-1" onClick={() => onDelete(item.propertyId)} title="Delete"><Trash2 className="h-4 w-4" /></button>
                    </td>
                  </tr>
                  {expandedProperty === item.propertyId && (
                    <tr className="bg-gray-50">
                      <td colSpan={6} className="px-6 py-4">
                        <PropertyDocumentUpload
                          propertyId={item.propertyId}
                          documents={propertyDocuments[item.propertyId] || []}
                          onDocumentsChange={(docs) => handleDocumentsChange(item.propertyId, docs)}
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          {listings.length === 0 && (
            <div className="py-12 text-center text-gray-500">
              <p className="font-medium">No listings yet</p>
              <p className="text-sm mt-1">Add your first property to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Listings;
