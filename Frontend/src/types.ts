// ERD Based Types

export enum UserRole {
  BUYER = 'BUYER',
  SELLER = 'SELLER',
  ADMIN = 'ADMIN'
}

export interface User {
  userId: string;
  userName: string;
  email: string;
  role: UserRole;
  fullName: string;
  phoneNumber?: string;
  profilePictureUrl?: string;
  bio?: string;
  address?: string;
  createdAt: string;
}

export enum PropertyStatus {
  FOR_SALE = 'For Sale',
  FOR_RENT = 'For Rent',
  SOLD = 'Sold',
  LEASED = 'Leased',
  PENDING = 'Pending'
}

export enum PropertyType {
  HOUSE = 'House',
  APARTMENT = 'Apartment',
  CONDO = 'Condo',
  VILLA = 'Villa',
  LAND = 'Land',
  COMMERCIAL = 'Commercial'
}

export interface PropertyImage {
  imageId: string;
  propertyId: string;
  imageUrl: string;
  displayOrder: number;
}

export interface PropertyDocument {
  documentId: string;
  propertyId: string;
  documentType: string;
  documentUrl: string;
  documentName: string;
  uploadedDate: string;
  verified: boolean;
  verificationNotes?: string;
}

export interface Notification {
  notificationId: string;
  ownerId: string;
  propertyId: string;
  type: 'approved' | 'rejected' | 'verification_required';
  title: string;
  message: string;
  propertyTitle: string;
  createdAt: string;
  read: boolean;
  actionNotes?: string;
}

export interface Review {
  reviewId: string;
  userId: string;
  propertyId: string;
  rating: number; // 1-5
  comment: string;
  userName: string; // Joined from User
  createdAt: string;
}

export interface Property {
  propertyId: string;
  ownerId: string;
  title: string;
  description: string;
  propertyType: PropertyType; // Note: DTO might return string, need to ensure enum match or change to string
  price: number;
  location: string;
  city: string;
  state: string;
  bedrooms: number;
  bathrooms: number;
  areaSqft: number;
  status: PropertyStatus; // DTO string
  listedDate: string;
  images: PropertyImage[];
  documents?: PropertyDocument[];
  amenities: string[];
  reviews?: Review[];
  verificationStatus?: 'pending' | 'verified' | 'rejected';
  verificationNotes?: string;
  averageRating?: number; // Added field
  reviewCount?: number; // Added field
}
export interface PropertyFilter {
  propertyType?: PropertyType;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  maxBathrooms?: number;
  city?: string;
  state?: string;
  status?: PropertyStatus;
} 