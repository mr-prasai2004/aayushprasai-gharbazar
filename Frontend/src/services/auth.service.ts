import { UserRole } from '../types';

interface LoginRequest {
  email: string;
  password: string;
  role: UserRole;
}

interface LoginResponse {
  token: string;
  userId: string;
  email: string;
  role: UserRole;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    let data;
    try {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text || 'An error occurred' };
      }
    } catch {
      data = { message: 'An error occurred' };
    }

    if (!response.ok) {
      throw new Error(data?.message || 'Login failed. Please try again.');
    }

    return data;
  },

  async signup(credentials: {
    userName: string;
    full_name: string;
    email: string;
    password: string;
    role: UserRole;
  }): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        UserName: credentials.userName,
        FullName: credentials.full_name,
        Email: credentials.email,
        Password: credentials.password,
        Role: credentials.role,
      }),
    });

    let data;
    try {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text || 'An error occurred' };
      }
    } catch {
      data = { message: 'An error occurred' };
    }

    if (!response.ok) {
      throw new Error(data?.message || 'Signup failed. Please try again.');
    }

    return data;
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    let data;
    try {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text || 'An error occurred' };
      }
    } catch {
      data = { message: 'An error occurred' };
    }

    if (!response.ok) {
      throw new Error(data?.message || 'Request failed. Please try again.');
    }

    return data;
  },

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
  },

  getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  },

  getCurrentUser(): { userId: string; email: string; role: UserRole } | null {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  },

  setAuthData(token: string, user: { userId: string; email: string; role: UserRole }): void {
    localStorage.setItem('authToken', token);
    localStorage.setItem('currentUser', JSON.stringify(user));
  },

  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  },
};
