// API Service for Ghar Bazar


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://aayushprasai-gharbazar-production.up.railway.app/api';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Helper function for API requests
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getAuthToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  if (response.status === 204) {
    return null as unknown as T;
  }

  const text = await response.text();
  try {
    return text ? JSON.parse(text) : (null as unknown as T);
  } catch (error) {
    // If it's not valid JSON but the response was ok, just return the text or null
    return (text as unknown as T) || (null as unknown as T);
  }
};

// Properties API
export const propertiesApi = {
  // Get all properties (with optional filters)
  getAll: async (filters?: {
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.city) params.append('city', filters.city);
    if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString());
    if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
    if (filters?.search) params.append('search', filters.search);

    const queryString = params.toString();
    return apiRequest<any[]>(`/properties${queryString ? `?${queryString}` : ''}`);
  },

  // Get single property by ID
  getById: async (id: string) => {
    return apiRequest<any>(`/properties/${id}`);
  },

  // Get owner's listings (requires auth)
  getMyListings: async () => {
    return apiRequest<any[]>('/properties/owner/listings');
  },

  // Get pending properties (admin only)
  getPending: async () => {
    return apiRequest<any[]>('/properties/pending');
  },

  // Create property (requires auth)
  create: async (data: any) => {
    return apiRequest<any>('/properties', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update property (requires auth)
  update: async (id: string, data: any) => {
    return apiRequest<any>(`/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete property (requires auth)
  delete: async (id: string) => {
    return apiRequest<void>(`/properties/${id}`, {
      method: 'DELETE',
    });
  },

  // Verify property (admin only)
  verify: async (id: string, data: { verificationStatus: string; verificationNotes?: string }) => {
    return apiRequest<any>(`/properties/${id}/verify`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    return apiRequest<{ userId: string; email: string; role: string; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (data: { userName: string; email: string; password: string; fullName: string; role: string }) => {
    return apiRequest<{ userId: string; email: string; role: string; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getProfile: async () => {
    return apiRequest<any>('/auth/profile');
  },

  updateProfile: async (data: any) => {
    return apiRequest<any>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// Users API
export const usersApi = {
  getAll: async () => {
    return apiRequest<any[]>('/users');
  },

  getById: async (id: string) => {
    return apiRequest<any>(`/users/${id}`);
  },

  updateProfile: async (id: string, data: any) => {
    return apiRequest<any>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return apiRequest<void>(`/users/${id}`, {
      method: 'DELETE',
    });
  },

  updateRole: async (id: string, role: string) => {
    return apiRequest<any>(`/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  },
};

// Reviews API
export const reviewsApi = {
  getByProperty: async (propertyId: string) => {
    return apiRequest<any[]>(`/reviews/property/${propertyId}`);
  },

  getAll: async () => {
    return apiRequest<any[]>('/reviews');
  },

  create: async (data: { propertyId: string; rating: number; comment: string }) => {
    return apiRequest<any>('/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return apiRequest<void>(`/reviews/${id}`, {
      method: 'DELETE',
    });
  },
};

// Wishlist API
export const wishlistApi = {
  getAll: async () => {
    return apiRequest<any[]>('/wishlist');
  },

  add: async (propertyId: string) => {
    return apiRequest<any>(`/wishlist/${propertyId}`, {
      method: 'POST',
    });
  },

  remove: async (propertyId: string) => {
    return apiRequest<void>(`/wishlist/${propertyId}`, {
      method: 'DELETE',
    });
  },

  isInWishlist: async (propertyId: string): Promise<boolean> => {
    try {
      const all = await apiRequest<any[]>('/wishlist');
      if (!Array.isArray(all)) return false;
      return all.some((p: any) => p.propertyId === propertyId || p.PropertyId === propertyId);
    } catch {
      return false;
    }
  },
};

// Tour Bookings API
export const tourBookingsApi = {
  getMyBookings: async () => {
    return apiRequest<any[]>('/tourbookings');
  },

  getSellerBookings: async () => {
    return apiRequest<any[]>('/tourbookings/seller');
  },

  schedule: async (data: { propertyId: string; tourDate: string; tourTime: string; notes?: string }) => {
    return apiRequest<any>('/tourbookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  cancel: async (bookingId: string) => {
    return apiRequest<any>(`/tourbookings/${bookingId}/cancel`, {
      method: 'PUT',
    });
  },

  confirm: async (bookingId: string) => {
    return apiRequest<any>(`/tourbookings/${bookingId}/confirm`, {
      method: 'PUT',
    });
  },

  decline: async (bookingId: string) => {
    return apiRequest<any>(`/tourbookings/${bookingId}/cancel`, {
      method: 'PUT',
    });
  },
};

// Documents API
export const documentsApi = {
  getByProperty: async (propertyId: string) => {
    return apiRequest<any[]>(`/documents/property/${propertyId}`);
  },

  upload: async (propertyId: string, data: { documentType: string; documentName: string; documentUrl: string }) => {
    return apiRequest<any>(`/documents/${propertyId}/upload`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  delete: async (documentId: string) => {
    return apiRequest<void>(`/documents/${documentId}`, {
      method: 'DELETE',
    });
  },

  verify: async (documentId: string, data: { verified: boolean; verificationNotes?: string }) => {
    return apiRequest<any>(`/documents/${documentId}/verify`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// Notifications API
export const notificationsApi = {
  getAll: async () => {
    return apiRequest<any[]>('/notifications');
  },

  getUnread: async () => {
    return apiRequest<any[]>('/notifications/unread');
  },

  markAsRead: async (id: string) => {
    return apiRequest<any>(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  },

  markAllAsRead: async () => {
    return apiRequest<any>('/notifications/read-all', {
      method: 'PUT',
    });
  },
};

// Messages API
export const messagesApi = {
  getConversations: async () => {
    return apiRequest<any[]>('/messages');
  },

  getChatHistory: async (otherUserId: string) => {
    return apiRequest<any[]>(`/messages/${otherUserId}`);
  },

  send: async (data: { receiverId: string; propertyId?: string; content: string }) => {
    return apiRequest<any>('/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getUnreadCount: async () => {
    return apiRequest<number>('/messages/unread');
  }
};

// Upload API
export const uploadApi = {
  // Upload single image (for profile)
  uploadImage: async (file: File): Promise<{ url: string; fileName: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(errorData.message || 'Failed to upload image');
    }

    const data = await response.json();
    // Normalize PascalCase from C# backend: { Url, FileName } → { url, fileName }
    return { url: data.Url || data.url || '', fileName: data.FileName || data.fileName || '' };
  },

  // Upload multiple images (for properties)
  uploadImages: async (files: File[]): Promise<{ url: string; fileName: string }[]> => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/upload/images`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(errorData.message || 'Failed to upload images');
    }

    const data = await response.json();
    // Normalize PascalCase from C# backend
    return data.map((item: any) => ({ url: item.Url || item.url || '', fileName: item.FileName || item.fileName || '' }));
  },

  // Upload document
  uploadDocument: async (file: File): Promise<{ url: string; fileName: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/upload/document`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(errorData.message || 'Failed to upload document');
    }

    const data = await response.json();
    // Normalize PascalCase from C# backend: { Url, FileName } → { url, fileName }
    return { url: data.Url || data.url || '', fileName: data.FileName || data.fileName || '' };
  },

  // Get full URL for uploaded file
  getFileUrl: (path: string): string => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://aayushprasai-gharbazar-production.up.railway.app';
    // Remove /api from the baseUrl to get the root domain
    const rootUrl = baseUrl.replace('/api', '');
    return `${rootUrl}${path}`;
  }
};

export default {
  properties: propertiesApi,
  auth: authApi,
  users: usersApi,
  reviews: reviewsApi,
  wishlist: wishlistApi,
  notifications: notificationsApi,
  messages: messagesApi,
  upload: uploadApi,
};
