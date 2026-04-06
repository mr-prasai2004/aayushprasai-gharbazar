import React, { useState, useEffect } from 'react';
import { Upload, X, FileText, Check, AlertCircle, ExternalLink, Loader2 } from 'lucide-react';
import { documentsApi, uploadApi } from '../services/api';

interface Document {
  documentId: string;
  propertyId: string;
  documentType: string;
  documentName: string;
  documentUrl: string;
  uploadedDate: string;
  verified: boolean;
  verificationNotes?: string;
}

interface PropertyDocumentUploadProps {
  propertyId: string;
  documents?: any[];
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

/** Normalize both snake_case (old local) and camelCase (API) shapes */
const normalize = (doc: any): Document => ({
  documentId: doc.documentId || doc.document_id || '',
  propertyId: doc.propertyId || doc.property_id || '',
  documentType: doc.documentType || doc.document_type || '',
  documentName: doc.documentName || doc.document_name || '',
  documentUrl: doc.documentUrl || doc.document_url || '',
  uploadedDate: doc.uploadedDate || doc.uploaded_date || '',
  verified: doc.verified ?? false,
  verificationNotes: doc.verificationNotes || doc.verification_notes,
});

/** Turn relative backend paths into full URLs */
const resolveDocUrl = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('blob:')) return url;
  const base = (import.meta.env.VITE_API_BASE_URL || 'https://aayushprasai-gharbazar-production.up.railway.app/api').replace('/api', '');
  return `${base}${url}`;
};

export const PropertyDocumentUpload: React.FC<PropertyDocumentUploadProps> = ({
  propertyId,
  documents: propDocuments,
  onDocumentsChange,
  readOnly = false,
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedType, setSelectedType] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch fresh docs from backend on mount / propertyId change
  useEffect(() => {
    if (!propertyId) return;
    setLoadingDocs(true);
    documentsApi.getByProperty(propertyId)
      .then(data => {
        const normalized = (Array.isArray(data) ? data : []).map(normalize);
        setDocuments(normalized);
        onDocumentsChange?.(normalized);
      })
      .catch(() => {
        // Fallback: use prop documents if API fails (e.g. while offline)
        if (propDocuments?.length) {
          setDocuments(propDocuments.map(normalize));
        }
      })
      .finally(() => setLoadingDocs(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setUploadedFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedType || !uploadedFile) {
      setError('Please select a document type and file.');
      return;
    }
    setIsUploading(true);
    setError(null);
    try {
      // 1. Upload file to server storage
      const { url, fileName } = await uploadApi.uploadDocument(uploadedFile);

      // 2. Register document record in backend
      const saved = await documentsApi.upload(propertyId, {
        documentType: selectedType,
        documentName: fileName || uploadedFile.name,
        documentUrl: url,
      });

      const newDoc = normalize(saved);
      const updated = [...documents, newDoc];
      setDocuments(updated);
      onDocumentsChange?.(updated);
      setSelectedType('');
      setUploadedFile(null);
    } catch (err: any) {
      setError(err?.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveDocument = async (docId: string) => {
    if (!window.confirm('Are you sure you want to remove this document?')) return;
    setDeletingId(docId);
    try {
      await documentsApi.delete(docId);
      const updated = documents.filter(d => d.documentId !== docId);
      setDocuments(updated);
      onDocumentsChange?.(updated);
    } catch {
      alert('Failed to delete document. Please try again.');
    } finally {
      setDeletingId(null);
    }
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
                onChange={e => setSelectedType(e.target.value)}
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
              <div className="flex items-center gap-3 flex-wrap">
                <input
                  type="file"
                  onChange={handleFileSelect}
                  disabled={isUploading}
                  className="flex-1 min-w-0 text-sm"
                  accept=".pdf,.doc,.docx,.jpg,.png"
                />
                <button
                  onClick={handleUpload}
                  disabled={isUploading || !uploadedFile || !selectedType}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2 transition whitespace-nowrap"
                >
                  {isUploading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</>
                  ) : (
                    <><Upload className="h-4 w-4" /> Upload</>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Accepted formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)</p>
              {uploadedFile && (
                <p className="text-sm text-blue-600 mt-2 flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" /> {uploadedFile.name}
                </p>
              )}
            </div>

            {error && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />{error}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Documents List */}
      {loadingDocs ? (
        <div className="flex items-center justify-center py-10 text-gray-400 gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Loading documents...</span>
        </div>
      ) : documents.length > 0 ? (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 mb-3">
            Uploaded Documents ({documents.length})
          </p>
          {documents.map(doc => (
            <div
              key={doc.documentId}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  <p className="font-medium text-gray-900 text-sm truncate">{doc.documentType}</p>
                  {doc.verified && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium flex-shrink-0">
                      <Check className="h-3 w-3" /> Verified
                    </span>
                  )}
                  {!doc.verified && (
                    <span className="px-2 py-0.5 bg-yellow-50 text-yellow-600 border border-yellow-200 rounded text-xs flex-shrink-0">
                      Pending verification
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate">
                  {doc.documentName}
                  {doc.uploadedDate && ` · ${new Date(doc.uploadedDate).toLocaleDateString('en-NP')}`}
                </p>
                {doc.verificationNotes && (
                  <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 flex-shrink-0" />
                    {doc.verificationNotes}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {doc.documentUrl && (
                  <a
                    href={resolveDocUrl(doc.documentUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium px-2 py-1 rounded hover:bg-blue-50 transition"
                    title="View document"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    View
                  </a>
                )}
                {!readOnly && (
                  <button
                    onClick={() => handleRemoveDocument(doc.documentId)}
                    disabled={deletingId === doc.documentId}
                    className="text-gray-400 hover:text-red-600 transition disabled:opacity-40 p-1"
                    title="Delete document"
                  >
                    {deletingId === doc.documentId
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <X className="h-4 w-4" />
                    }
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
            {readOnly ? 'No documents uploaded' : 'No documents uploaded yet. Use the form above to add documents.'}
          </p>
        </div>
      )}
    </div>
  );
};
