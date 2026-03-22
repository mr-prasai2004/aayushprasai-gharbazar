import React, { useState } from 'react';
import { CheckCircle, XCircle, FileText, MapPin, DollarSign, Home, X, AlertCircle } from 'lucide-react';
import { Property } from '../types';

interface PropertyVerificationCardProps {
  property: Property;
  onVerify: (propertyId: string, status: 'verified' | 'rejected', notes: string) => void;
}

export const PropertyVerificationCard: React.FC<PropertyVerificationCardProps> = ({
  property,
  onVerify
}) => {
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [decision, setDecision] = useState<'verified' | 'rejected' | null>(null);
  const [notes, setNotes] = useState('');

  const handleSubmitDecision = () => {
    if (!decision) {
      alert('Please select a decision');
      return;
    }
    if (decision === 'rejected' && !notes.trim()) {
      alert('Please provide rejection reason');
      return;
    }
    onVerify(property.propertyId, decision, notes);
    setShowDecisionModal(false);
    setDecision(null);
    setNotes('');
  };

  const allDocsVerified = property.documents && property.documents.length > 0 && property.documents.every(d => d.verified);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition">
      {/* Header with Status Badge */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-1">{property.title}</h3>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {property.location}
              </div>
              <div className="flex items-center gap-1">
                <Home className="h-4 w-4" />
                {property.propertyType}
              </div>
            </div>
          </div>
          <div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${property.verificationStatus === 'verified' ? 'bg-green-100 text-green-700' :
              property.verificationStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
              {property.verificationStatus === 'verified' ? <CheckCircle className="h-4 w-4" /> :
                property.verificationStatus === 'rejected' ? <XCircle className="h-4 w-4" /> :
                  <AlertCircle className="h-4 w-4" />}
              {property.verificationStatus?.charAt(0).toUpperCase() + property.verificationStatus?.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Property Details Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border-b border-gray-200 bg-gray-50">
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase">Price</p>
          <p className="text-lg font-bold text-gray-900">NPR {property.price?.toLocaleString('en-NP')}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase">Bedrooms</p>
          <p className="text-lg font-bold text-gray-900">{property.bedrooms}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase">Bathrooms</p>
          <p className="text-lg font-bold text-gray-900">{property.bathrooms}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase">Area</p>
          <p className="text-lg font-bold text-gray-900">{property.areaSqft?.toLocaleString() || 0} sqft</p>
        </div>
      </div>

      {/* Description */}
      <div className="p-4 border-b border-gray-200">
        <p className="text-sm text-gray-700">{property.description}</p>
      </div>

      {/* Documents Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="h-5 w-5 text-blue-600" />
          <h4 className="font-semibold text-gray-900">Documents ({property.documents?.length || 0})</h4>
        </div>

        {property.documents && property.documents.length > 0 ? (
          <div className="space-y-2">
            {property.documents.map((doc: any) => (
              <div
                key={doc.documentId}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-gray-900 text-sm">{doc.documentType}</span>
                    {doc.verified && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                        <CheckCircle className="h-3 w-3" />
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{doc.documentName}</p>
                </div>
                <a
                  href={doc.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium px-3 py-1 hover:bg-blue-50 rounded transition"
                  onClick={(e) => {
                    // For mock documents with example URLs, show alert
                    if (doc.documentUrl.includes('example.com')) {
                      e.preventDefault();
                      alert(`Document: ${doc.documentName}\n\nIn production, this would open the ${doc.documentType} from cloud storage.`);
                    }
                  }}
                >
                  View
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 bg-gray-50 rounded-lg">
            <FileText className="h-8 w-8 text-gray-300 mx-auto mb-1" />
            <p className="text-sm text-gray-500">No documents uploaded</p>
          </div>
        )}
      </div>

      {/* Amenities */}
      {property.amenities && property.amenities.length > 0 && (
        <div className="p-4 border-b border-gray-200">
          <p className="text-sm font-semibold text-gray-900 mb-2">Amenities</p>
          <div className="flex flex-wrap gap-2">
            {property.amenities.map(amenity => (
              <span
                key={amenity}
                className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Verification Notes */}
      {property.verificationNotes && (
        <div className="p-4 border-b border-gray-200 bg-yellow-50 border-t-2 border-t-yellow-200">
          <p className="text-sm font-semibold text-yellow-900 mb-1">Verification Notes</p>
          <p className="text-sm text-yellow-800">{property.verificationNotes}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="p-4 bg-gray-50 border-t border-gray-200 flex gap-3">
        {property.verificationStatus === 'pending' ? (
          <>
            <button
              onClick={() => {
                setDecision('verified');
                setShowDecisionModal(true);
              }}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center justify-center gap-2 transition"
            >
              <CheckCircle className="h-4 w-4" />
              Verify
            </button>
            <button
              onClick={() => {
                setDecision('rejected');
                setShowDecisionModal(true);
              }}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center justify-center gap-2 transition"
            >
              <XCircle className="h-4 w-4" />
              Reject
            </button>
          </>
        ) : (
          <button
            className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-medium cursor-not-allowed"
          >
            {property.verificationStatus === 'verified' ? 'Verified' : 'Rejected'}
          </button>
        )}
      </div>

      {/* Decision Modal */}
      {showDecisionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {decision === 'verified' ? 'Verify Property' : 'Reject Property'}
              </h3>
              <button
                onClick={() => {
                  setShowDecisionModal(false);
                  setDecision(null);
                  setNotes('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {decision === 'rejected' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason *
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Please provide detailed reason for rejection..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                  rows={4}
                />
              </div>
            )}

            {decision === 'verified' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional notes..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  rows={3}
                />
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowDecisionModal(false);
                  setDecision(null);
                  setNotes('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitDecision}
                className={`flex-1 px-4 py-2 text-white rounded-lg font-medium transition ${decision === 'verified'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
                  }`}
              >
                {decision === 'verified' ? 'Confirm Verification' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
