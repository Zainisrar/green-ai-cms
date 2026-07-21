// Centralized API client with authentication
class ApiClient {
    private baseURL: string;

    constructor(baseURL: string = '') {
        this.baseURL = baseURL;
    }

    private getAuthHeaders(): HeadersInit {
        const token = localStorage.getItem('token');
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    }

    private async handleResponse(response: Response) {
        if (response.status === 401) {
            // Unauthorized - redirect to login
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            window.location.href = '/auth/login';
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Handle both wrapped and direct responses
        if (data.hasOwnProperty('success')) {
            if (!data.success) {
                throw new Error(data.error || 'API request failed');
            }
            return data;
        }
        
        // Direct response (like ecosystem APIs)
        return { success: true, data };
    }

    async get(endpoint: string) {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'GET',
            headers: this.getAuthHeaders(),
        });

        return this.handleResponse(response);
    }

    async post(endpoint: string, data?: any) {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: data ? JSON.stringify(data) : undefined,
        });

        return this.handleResponse(response);
    }

    async put(endpoint: string, data?: any) {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: data ? JSON.stringify(data) : undefined,
        });

        return this.handleResponse(response);
    }

    async delete(endpoint: string, data?: any) {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders(),
            body: data ? JSON.stringify(data) : undefined,
        });

        return this.handleResponse(response);
    }

    async patch(endpoint: string, data?: any) {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'PATCH',
            headers: this.getAuthHeaders(),
            body: data ? JSON.stringify(data) : undefined,
        });

        return this.handleResponse(response);
    }

    // Special method for login (no auth required)
    async login(email: string, password: string) {
        const response = await fetch(`${this.baseURL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Login failed');
        }

        return data;
    }
}

export const apiClient = new ApiClient();