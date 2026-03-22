import React, { useState, useRef, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { UserRole } from '../../types';
import { authApi, uploadApi } from '../../services/api';
import { Camera, Edit2, Save, Loader2 } from 'lucide-react';

export const Profile: React.FC = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [user, setUser] = useState({
        full_name: '',
        email: '',
        phone_number: '',
        address: ''
    });
    const [profileImage, setProfileImage] = useState("https://picsum.photos/id/64/200/200");
    const [uploading, setUploading] = useState(false);
    const [role, setRole] = useState<UserRole>(UserRole.BUYER);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            const stored = localStorage.getItem('currentUser');
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    if (parsed?.role) {
                        const mapped = (UserRole as any)[parsed.role] ?? UserRole.BUYER;
                        setRole(mapped as UserRole);
                    }
                } catch (e) { }
            }

            try {
                const profile = await authApi.getProfile();
                setUser({
                    full_name: profile.fullName || '',
                    email: profile.email || '',
                    phone_number: profile.phoneNumber || '',
                    address: profile.address || ''
                });
                if (profile.profilePictureUrl) {
                    setProfileImage(profile.profilePictureUrl);
                }
            } catch (err) {
                console.error('Failed to load profile', err);
            }
        }
        fetchProfile();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUser(prev => ({ ...prev, [name]: value }));
    };

    const handleImageClick = () => {
        if (isEditing && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size should be less than 5MB');
            return;
        }

        try {
            setUploading(true);
            const result = await uploadApi.uploadImage(file);
            setProfileImage(uploadApi.getFileUrl(result.url));
        } catch (error) {
            console.error('Failed to upload image', error);
            alert('Failed to upload image. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        try {
            const updateData = {
                fullName: user.full_name,
                email: user.email, // Email usually isn't updated here but can be passed
                phoneNumber: user.phone_number,
                address: user.address,
                profilePictureUrl: profileImage
            };

            await authApi.updateProfile(updateData);
            setIsEditing(false);
            alert("Profile updated successfully!");
        } catch (error) {
            console.error("Failed to update profile", error);
            alert("Failed to update profile. Please try again.");
        }
    };

    return (
        <DashboardLayout role={role} title="Profile Information">
            <div className="bg-white p-4 md:p-8 rounded-lg border border-gray-200 shadow-sm mb-6 md:mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <h2 className="text-xl font-bold text-gray-800">Personal Details</h2>
                    <button
                        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                        className={`px-4 py-2 border rounded-md text-sm transition flex items-center gap-2 ${isEditing ? 'bg-primary-600 text-white border-primary-600 hover:bg-primary-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                    >
                        {isEditing ? <><Save className="h-4 w-4" /> Save Changes</> : <><Edit2 className="h-4 w-4" /> Edit Profile</>}
                    </button>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Profile Image */}
                    <div className="flex flex-col items-center space-y-3">
                        <div className="relative group cursor-pointer" onClick={handleImageClick}>
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 shadow-sm">
                                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                            </div>
                            {uploading && (
                                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                                    <Loader2 className="text-white h-8 w-8 animate-spin" />
                                </div>
                            )}
                            {isEditing && !uploading && (
                                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                    <Camera className="text-white h-8 w-8" />
                                </div>
                            )}
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                        </div>
                        {isEditing && <span className="text-xs text-primary-600 font-medium">{uploading ? 'Uploading...' : 'Click to change'}</span>}
                    </div>

                    {/* Form Fields */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-6 md:gap-x-12">
                        <div>
                            <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Full Name</p>
                            {isEditing ?
                                <input name="full_name" value={user.full_name} onChange={handleInputChange} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500" />
                                : <p className="text-gray-900 font-medium py-2">{user.full_name}</p>
                            }
                        </div>
                        <div>
                            <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Email Address</p>
                            {isEditing ?
                                <input name="email" value={user.email} onChange={handleInputChange} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500" />
                                : <p className="text-gray-900 font-medium py-2">{user.email}</p>
                            }
                        </div>
                        <div>
                            <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Phone Number</p>
                            {isEditing ?
                                <input name="phone_number" value={user.phone_number} onChange={handleInputChange} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500" />
                                : <p className="text-gray-900 font-medium py-2">{user.phone_number}</p>
                            }
                        </div>
                        <div>
                            <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Address</p>
                            {isEditing ?
                                <input name="address" value={user.address} onChange={handleInputChange} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500" />
                                : <p className="text-gray-900 font-medium py-2">{user.address}</p>
                            }
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-4 md:p-8 rounded-lg border border-gray-200 shadow-sm mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4 md:mb-6">Contact Preferences</h2>
                <div className="space-y-3">
                    <label className="flex items-center"><input type="checkbox" defaultChecked className="text-primary-600 rounded mr-2" disabled={!isEditing} /> Email</label>
                    <label className="flex items-center"><input type="checkbox" defaultChecked className="text-primary-600 rounded mr-2" disabled={!isEditing} /> Phone</label>
                    <label className="flex items-center"><input type="checkbox" defaultChecked className="text-primary-600 rounded mr-2" disabled={!isEditing} /> In-App Chat</label>
                </div>
            </div>
        </DashboardLayout>
    );
};
