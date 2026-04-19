import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { UserRole } from '../../types';
import { Upload, X, CheckCircle, Loader2, FileText, AlertCircle } from 'lucide-react';
import { propertiesApi, uploadApi } from '../../services/api';
import { MapPicker } from '../../components/map/MapPicker';
import { useToast } from '../../components/Toast';

const DOCUMENT_TYPES = [
    'Lalpurja (Land Ownership Certificate)',
    'Naapi Naksha (Land Survey Map)',
    'Char Killa Praman Patra (Four Boundary Certificate)',
    'Malpot Receipt (Land Tax Receipt)',
    'Naamsar (Transfer of Ownership)',
    'Building Permit',
    'Completion Certificate',
    'House Number Certificate',
    'NOC (No Objection Certificate)',
    'Naagarikta (Citizenship)',
    'Other'
];

interface UploadedDoc {
    document_type: string;
    document_name: string;
    document_url: string;
}

export const AddProperty: React.FC = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const [step, setStep] = useState(1);
    const [uploading, setUploading] = useState(false);
    const [docUploading, setDocUploading] = useState(false);
    const [selectedDocType, setSelectedDocType] = useState('');
    const [selectedDocFile, setSelectedDocFile] = useState<File | null>(null);
    const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        address: '',
        propertyType: 'House',
        listingType: 'For Sale',
        price: '',
        area: '',
        description: '',
        bedrooms: 3,
        bathrooms: 2,
        parking: 'Yes',
        yearBuilt: '',
        amenities: [] as string[],
        images: [] as string[],
        latitude: null as number | null,
        longitude: null as number | null
    });

    const totalSteps = 6;
    const progress = (step / totalSteps) * 100;

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        if (step < totalSteps) setStep(step + 1);
        else handleSubmit();
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
        else navigate(-1);
    };

    // Maps display labels to clean backend values
    const getListingTypeValue = (displayValue: string): string => {
        if (displayValue.includes('Rent')) return 'For Rent';
        if (displayValue.includes('Lease')) return 'Lease';
        return 'For Sale';
    };

    const handleSubmit = async () => {
        const documents = uploadedDocs.map(doc => ({
            documentType: doc.document_type,
            documentUrl: doc.document_url,
            documentName: doc.document_name,
            verified: false
        }));

        const images = (formData.images || []).map((img: string, idx: number) => ({
            imageUrl: img,
            displayOrder: idx + 1
        }));

        const newProperty = {
            title: formData.title || 'Untitled Property',
            description: formData.description || '',
            propertyType: formData.propertyType,
            listingType: getListingTypeValue(formData.listingType), // seller's intent: For Sale / For Rent / Lease
            price: Number(formData.price) || 0,
            location: formData.address || '',
            city: '',
            state: '',
            bedrooms: Number(formData.bedrooms) || 0,
            bathrooms: Number(formData.bathrooms) || 0,
            areaSqft: Number(formData.area) || 0,
            latitude: formData.latitude,
            longitude: formData.longitude,
            amenities: formData.amenities || [],
            documents: documents,
            images: images,
        };

        try {
            await propertiesApi.create(newProperty);
            toast.success('Property submitted for review! Admin approval required before listing.');
            navigate('/dashboard/listings');
        } catch (err) {
            console.error('Failed to save property', err);
            toast.error('Failed to save property. Please try again.');
        }
    };

    const handleDocFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedDocFile(e.target.files[0]);
        }
    };

    const handleDocUpload = async () => {
        if (!selectedDocType || !selectedDocFile) {
            toast.warning('Please select a document type and file');
            return;
        }
        try {
            setDocUploading(true);
            const result = await uploadApi.uploadDocument(selectedDocFile);
            const fileUrl = uploadApi.getFileUrl(result.url);
            setUploadedDocs(prev => [...prev, {
                document_type: selectedDocType,
                document_name: selectedDocFile.name,
                document_url: fileUrl
            }]);
            setSelectedDocType('');
            setSelectedDocFile(null);
        } catch (err) {
            console.error('Failed to upload document', err);
            toast.error('Failed to upload document. Please try again.');
        } finally {
            setDocUploading(false);
        }
    };

    const handleRemoveDoc = (idx: number) => {
        setUploadedDocs(prev => prev.filter((_, i) => i !== idx));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAmenityToggle = (amenity: string) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter(a => a !== amenity)
                : [...prev.amenities, amenity]
        }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const validFiles: File[] = [];

        Array.from(files).forEach((file: File) => {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error('Please select an image file');
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB');
                return;
            }

            validFiles.push(file);
        });

        if (validFiles.length === 0) return;

        try {
            setUploading(true);
            const results = await uploadApi.uploadImages(validFiles);
            const urls = results.map(r => uploadApi.getFileUrl(r.url));
            setFormData(prev => ({ ...prev, images: [...prev.images, ...urls] }));
        } catch (error) {
            console.error('Failed to upload images', error);
            toast.error('Failed to upload images. Please try again.');
        } finally {
            setUploading(false);
        }

        // Reset input so the same file can be selected again
        e.target.value = '';
    };

    const stepLabels = ['Basic Info', 'Details', 'Photos', 'Documents', 'Amenities', 'Review'];

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-6">
                        <h4 className="text-xl font-bold text-gray-800">Basic Information</h4>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Property Title</label>
                            <input name="title" value={formData.title} onChange={handleInputChange} type="text" className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none" placeholder="e.g., Spacious Family Home" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
                            <input name="address" value={formData.address} onChange={handleInputChange} type="text" className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Street, City, State, Zip" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Pin Location on Map</label>
                            <p className="text-xs text-gray-500 mb-2">Click on the map to accurately place your property.</p>
                            <MapPicker
                                initialLatitude={formData.latitude}
                                initialLongitude={formData.longitude}
                                onLocationSelect={(lat, lng) => setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }))}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                                <select name="propertyType" value={formData.propertyType} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none">
                                    <option>House / Ghar</option>
                                    <option>Apartment / Flat</option>
                                    <option>Land / Jagga</option>
                                    <option>Residential Plot</option>
                                    <option>Agricultural Land</option>
                                    <option>Commercial Space</option>
                                    <option>Office Space</option>
                                    <option>Villa / Bungalow</option>
                                    <option>Warehouse / Godam</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Listing Type</label>
                                <select name="listingType" value={formData.listingType} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none">
                                    <option>For Sale (Bechna)</option>
                                    <option>For Rent (Bhaada)</option>
                                    <option>Lease</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price (NPR)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-gray-500 text-sm font-medium">NPR</span>
                                    <input name="price" value={formData.price} onChange={handleInputChange} type="number" className="w-full border border-gray-300 rounded-md pl-14 pr-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none" placeholder="50,00,000" required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Area (Sq. Ft. / Ropani-Ana)</label>
                                <input name="area" value={formData.area} onChange={handleInputChange} type="number" className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none" placeholder="e.g. 1200" required />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea name="description" value={formData.description} onChange={handleInputChange} rows={4} className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Describe the unique features..." required></textarea>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6">
                        <h4 className="text-xl font-bold text-gray-800">Property Details</h4>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                                <div className="flex items-center border border-gray-300 rounded-md">
                                    <button type="button" className="px-3 py-2 bg-gray-50 hover:bg-gray-100 border-r" onClick={() => setFormData(p => ({ ...p, bedrooms: Math.max(0, p.bedrooms - 1) }))}>-</button>
                                    <input type="number" className="w-full text-center focus:outline-none" value={formData.bedrooms} readOnly />
                                    <button type="button" className="px-3 py-2 bg-gray-50 hover:bg-gray-100 border-l" onClick={() => setFormData(p => ({ ...p, bedrooms: p.bedrooms + 1 }))}>+</button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                                <div className="flex items-center border border-gray-300 rounded-md">
                                    <button type="button" className="px-3 py-2 bg-gray-50 hover:bg-gray-100 border-r" onClick={() => setFormData(p => ({ ...p, bathrooms: Math.max(0, p.bathrooms - 1) }))}>-</button>
                                    <input type="number" className="w-full text-center focus:outline-none" value={formData.bathrooms} readOnly />
                                    <button type="button" className="px-3 py-2 bg-gray-50 hover:bg-gray-100 border-l" onClick={() => setFormData(p => ({ ...p, bathrooms: p.bathrooms + 1 }))}>+</button>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Year Built</label>
                                <input name="yearBuilt" value={formData.yearBuilt} onChange={handleInputChange} type="number" className="w-full border border-gray-300 rounded-md px-4 py-2 outline-none" placeholder="e.g. 2020" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Parking Available</label>
                                <select name="parking" value={formData.parking} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md px-4 py-2 outline-none">
                                    <option>Yes</option>
                                    <option>No</option>
                                    <option>Garage</option>
                                </select>
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6">
                        <h4 className="text-xl font-bold text-gray-800">Media & Photos</h4>
                        <label className={`block border-2 border-dashed border-gray-300 rounded-xl p-8 text-center transition cursor-pointer ${uploading ? 'bg-gray-100' : 'hover:bg-gray-50'}`}>
                            {uploading ? (
                                <>
                                    <Loader2 className="h-10 w-10 text-primary-500 mx-auto mb-2 animate-spin" />
                                    <p className="text-sm text-primary-600 font-medium">Uploading photos...</p>
                                </>
                            ) : (
                                <>
                                    <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600 font-medium">Click to upload photos</p>
                                    <p className="text-xs text-gray-400 mt-1">PNG, JPG or GIF (max. 5MB)</p>
                                </>
                            )}
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                                disabled={uploading}
                            />
                        </label>

                        {formData.images.length > 0 && (
                            <div className="grid grid-cols-3 gap-4 mt-4">
                                {formData.images.map((img, idx) => (
                                    <div key={idx} className="relative group rounded-lg overflow-hidden h-24">
                                        <img src={img} alt="Preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                                            onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))}
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-6">
                        <h4 className="text-xl font-bold text-gray-800">Property Documents</h4>
                        <p className="text-sm text-gray-500">Upload legal documents for verification. At least one document is required (e.g., Title Deed).</p>

                        {/* Upload area */}
                        <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Document Type *</label>
                                <select
                                    value={selectedDocType}
                                    onChange={e => setSelectedDocType(e.target.value)}
                                    disabled={docUploading}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100"
                                >
                                    <option value="">Select document type...</option>
                                    {DOCUMENT_TYPES.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Upload File *</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="file"
                                        key={selectedDocFile ? 'has-file' : 'no-file'}
                                        onChange={handleDocFileSelect}
                                        disabled={docUploading}
                                        accept=".pdf,.doc,.docx,.jpg,.png"
                                        className="flex-1 text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleDocUpload}
                                        disabled={docUploading || !selectedDocFile || !selectedDocType}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2 text-sm transition"
                                    >
                                        {docUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                        {docUploading ? 'Uploading...' : 'Upload'}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Accepted: PDF, DOC, DOCX, JPG, PNG (Max 10MB)</p>
                                {selectedDocFile && (
                                    <p className="text-sm text-gray-600 mt-1">Selected: {selectedDocFile.name}</p>
                                )}
                            </div>
                        </div>

                        {/* Uploaded docs list */}
                        {uploadedDocs.length === 0 ? (
                            <div className="text-center py-6 bg-yellow-50 rounded-lg border border-yellow-200">
                                <AlertCircle className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                                <p className="text-sm text-yellow-700 font-medium">No documents uploaded yet</p>
                                <p className="text-xs text-yellow-600 mt-1">Please upload at least one property document for verification.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-700">Uploaded Documents ({uploadedDocs.length})</p>
                                {uploadedDocs.map((doc, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-blue-500" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{doc.document_type}</p>
                                                <p className="text-xs text-gray-500">{doc.document_name}</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveDoc(idx)}
                                            className="text-gray-400 hover:text-red-600 transition"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            case 5:
                return (
                    <div className="space-y-6">
                        <h4 className="text-xl font-bold text-gray-800">Amenities</h4>
                        <p className="text-sm text-gray-500 mb-4">Select all that apply to your property.</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {['Swimming Pool', 'Garden', 'Garage', 'Smart Home', 'Gym', 'Fireplace', 'Balcony', 'Elevator', 'Security System', 'WiFi', 'Air Conditioning', 'Central Heating'].map(amenity => (
                                <label key={amenity} className={`flex items-center p-3 rounded-lg border cursor-pointer transition ${formData.amenities.includes(amenity) ? 'bg-primary-50 border-primary-500 text-primary-700' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                                    <input
                                        type="checkbox"
                                        checked={formData.amenities.includes(amenity)}
                                        onChange={() => handleAmenityToggle(amenity)}
                                        className="h-4 w-4 text-primary-600 rounded mr-3 focus:ring-primary-500"
                                    />
                                    <span className="text-sm font-medium">{amenity}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                );
            case 6:
                return (
                    <div className="space-y-6">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center mb-6">
                            <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                            <div>
                                <h5 className="text-green-800 font-bold">Almost Done!</h5>
                                <p className="text-green-700 text-sm">Review your listing details before publishing.</p>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg space-y-3 text-sm">
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-500">Title</span>
                                <span className="font-medium">{formData.title}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-500">Price</span>
                                <span className="font-medium">${formData.price}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-500">Type</span>
                                <span className="font-medium">{formData.propertyType} - {formData.listingType}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-500">Location</span>
                                <span className="font-medium">{formData.address}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-500">Photos</span>
                                <span className="font-medium">{formData.images.length} uploaded</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Documents</span>
                                <span className={`font-medium ${uploadedDocs.length === 0 ? 'text-red-500' : 'text-green-600'}`}>
                                    {uploadedDocs.length} uploaded
                                </span>
                            </div>
                        </div>

                        {uploadedDocs.length === 0 && (
                            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                No property documents uploaded. The admin may request documents before approving your listing.
                            </div>
                        )}

                        <div className="flex items-center">
                            <input type="checkbox" className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500" required />
                            <span className="ml-2 text-sm text-gray-600">I agree to the Terms of Service and Privacy Policy.</span>
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <DashboardLayout role={UserRole.SELLER} title="Add New Property">
            <div className="bg-primary-600 text-white p-8 rounded-xl mb-8 text-center shadow-lg shadow-primary-200">
                <h2 className="text-2xl font-bold">List Your Property with Ghar Bazar</h2>
                <p className="opacity-90 mt-2 max-w-2xl mx-auto">Seamlessly add your property details and reach thousands of potential buyers.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-800">Step {step} of {totalSteps}: {stepLabels[step - 1]}</h3>
                        <span className="text-primary-600 text-sm font-bold bg-primary-50 px-3 py-1 rounded-full">{Math.round(progress)}% Complete</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full mb-8 overflow-hidden">
                        <div className="h-2 bg-primary-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                    </div>

                    <form className="space-y-6" onSubmit={handleNext}>
                        {renderStep()}

                        <div className="flex justify-end gap-4 pt-4 border-t border-gray-100 mt-8">
                            <button type="button" onClick={handleBack} className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition">
                                {step === 1 ? 'Cancel' : 'Back'}
                            </button>
                            <button type="submit" className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition shadow-md shadow-primary-100">
                                {step === totalSteps ? 'Publish Listing' : 'Save & Continue'}
                            </button>
                            {step === 4 && uploadedDocs.length === 0 && (
                                <p className="text-xs text-yellow-600 self-center">⚠ No docs uploaded — you can still continue</p>
                            )}
                        </div>
                    </form>
                </div>

                <div className="w-full lg:w-80">
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 sticky top-24">
                        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <div className="bg-white p-1 rounded-full shadow-sm"><CheckCircle className="h-4 w-4 text-primary-600" /></div>
                            Selling Tips
                        </h4>
                        <ul className="space-y-4 text-sm text-gray-600">
                            <li className="bg-white p-3 rounded-lg shadow-sm border border-blue-100">
                                <span className="font-bold block text-primary-700 mb-1">High-Quality Photos</span>
                                Properties with pro photos sell 32% faster.
                            </li>
                            <li className="bg-white p-3 rounded-lg shadow-sm border border-blue-100">
                                <span className="font-bold block text-primary-700 mb-1">Detailed Descriptions</span>
                                Mention recent upgrades and neighborhood perks.
                            </li>
                            <li className="bg-white p-3 rounded-lg shadow-sm border border-blue-100">
                                <span className="font-bold block text-primary-700 mb-1">Be Responsive</span>
                                Responding to inquiries within an hour increases chances of a sale.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
