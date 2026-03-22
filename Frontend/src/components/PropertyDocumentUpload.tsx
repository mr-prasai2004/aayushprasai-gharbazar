import React, { useState } from 'react';
import { Upload, X, FileText, Check, AlertCircle } from 'lucide-react';

interface Document {
  document_id: string;
  property_id: string;
  document_type: string;
  document_name: string;
  document_url: string;
  uploaded_date: string;
  verified: boolean;
  verification_notes?: string;
}

interface PropertyDocumentUploadProps {
  propertyId: string;
  documents?: Document[];
  onDocumentsChange?: (documents: Document[]) => void;
  readOnly?: boolean;
}

const DOCUMENT_TYPES = [
  'Title Deed',
  'Property Survey',
  'Tax Certificate',
  'NOC (No Objection Certificate)',
  'Building Plan',
  'Environmental Clearance',
  'Other'
];

export const PropertyDocumentUpload: React.FC<PropertyDocumentUploadProps> = ({
  propertyId,
  documents = [],
  onDocumentsChange,
  readOnly = false
}) => {
  const [selectedType, setSelectedType] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!selectedType || !uploadedFile) {
      alert('Please select document type and file');
      return;
    }

    setIsUploading(true);
    
    // Simulate file upload - in real app, would upload to server/cloud storage
    setTimeout(() => {
      // For now, create a blob URL that can be opened/previewed
      const fileUrl = URL.createObjectURL(uploadedFile);
      
      const newDocument: Document = {
        document_id: `d_${Date.now()}`,
        property_id: propertyId,
        document_type: selectedType,
        document_name: uploadedFile.name,
        document_url: fileUrl,
        uploaded_date: new Date().toISOString().split('T')[0],
        verified: false
      };

      const updatedDocs = [...documents, newDocument];
      onDocumentsChange?.(updatedDocs);

      setSelectedType('');
      setUploadedFile(null);
      setIsUploading(false);
      alert('Document uploaded successfully!');
    }, 500);
  };

  const handleRemoveDocument = (docId: string) => {
    const updatedDocs = documents.filter(doc => doc.document_id !== docId);
    onDocumentsChange?.(updatedDocs);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <FileText className="h-5 w-5 text-blue-600" />
        Property Documents
      </h3>

      {/* Upload Section */}
      {!readOnly && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Type *
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                disabled={isUploading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="">Select document type...</option>
                {DOCUMENT_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Document *
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  onChange={handleFileSelect}
                  disabled={isUploading}
                  className="flex-1"
                  accept=".pdf,.doc,.docx,.jpg,.png"
                />
                <button
                  onClick={handleUpload}
                  disabled={isUploading || !uploadedFile || !selectedType}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2 transition"
                >
                  <Upload className="h-4 w-4" />
                  {isUploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Accepted formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
              </p>
              {uploadedFile && (
                <p className="text-sm text-gray-600 mt-2">
                  Selected: {uploadedFile.name}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Documents List */}
      {documents.length > 0 ? (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 mb-3">
            Uploaded Documents ({documents.length})
          </p>
          {documents.map(doc => (
            <div
              key={doc.document_id}
              className="flex items-start justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <p className="font-medium text-gray-900 text-sm">{doc.document_type}</p>
                  {doc.verified && (
                    <span className="flex items-center gap-1 ml-2 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                      <Check className="h-3 w-3" />
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {doc.document_name} · Uploaded: {doc.uploaded_date}
                </p>
                {doc.verification_notes && (
                  <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {doc.verification_notes}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 ml-4">
                {doc.document_url && (
                  <a
                    href={doc.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    onClick={(e) => {
                      if (!doc.document_url.startsWith('http')) {
                        e.preventDefault();
                        alert('Document preview not available. In production, this would open the document from cloud storage.');
                      }
                    }}
                  >
                    View
                  </a>
                )}
                {!readOnly && (
                  <button
                    onClick={() => handleRemoveDocument(doc.document_id)}
                    className="text-gray-400 hover:text-red-600 transition"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">
            {readOnly ? 'No documents uploaded' : 'No documents uploaded yet'}
          </p>
        </div>
      )}
    </div>
  );
};
