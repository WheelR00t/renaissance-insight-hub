// Configuration de l'API et utilitaires pour les appels backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Configuration des headers avec token
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Utilitaire pour les requêtes API
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: getAuthHeaders(),
    ...options,
  };

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Erreur API');
  }

  return data;
};

// Services d'authentification
export const authAPI = {
  register: (userData: any) => 
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  login: (credentials: any) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  guest: (guestData: any) =>
    apiRequest('/auth/guest', {
      method: 'POST',
      body: JSON.stringify(guestData),
    }),

  me: () => apiRequest('/auth/me'),

  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
};

// Services des prestations
export const servicesAPI = {
  getAll: () => apiRequest('/services'),
  getById: (id: string) => apiRequest(`/services/${id}`),
  getByCategory: (category: string) => apiRequest(`/services/category/${category}`),
};

// Services des rendez-vous
export const appointmentsAPI = {
  getAvailability: (serviceId: string, date?: string) => 
    apiRequest(`/appointments/availability/${serviceId}${date ? `?date=${date}` : ''}`),
  
  book: (appointmentData: any) =>
    apiRequest('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    }),

  getMy: () => apiRequest('/appointments/my'),
  
  getById: (id: string) => apiRequest(`/appointments/${id}`),
  
  cancel: (id: string) =>
    apiRequest(`/appointments/${id}/cancel`, { method: 'PUT' }),
};

// Services de paiement
export const paymentsAPI = {
  createPaymentIntent: (amount: number, appointmentId: string) =>
    apiRequest('/payments/create-payment-intent', {
      method: 'POST',
      body: JSON.stringify({ amount, appointmentId }),
    }),

  confirmPayment: (paymentIntentId: string) =>
    apiRequest('/payments/confirm-payment', {
      method: 'POST',
      body: JSON.stringify({ paymentIntentId }),
    }),

  getHistory: () => apiRequest('/payments/history'),
};

// Services du blog
export const blogAPI = {
  getAll: (params?: any) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return apiRequest(`/blog${query}`);
  },
  
  getBySlug: (slug: string) => apiRequest(`/blog/${slug}`),
  
  getCategories: () => apiRequest('/blog/categories'),
  
  getTags: () => apiRequest('/blog/tags'),
  
  addComment: (postId: string, comment: any) =>
    apiRequest(`/blog/${postId}/comment`, {
      method: 'POST',
      body: JSON.stringify(comment),
    }),
};

// Services admin
export const adminAPI = {
  getDashboard: () => apiRequest('/admin/dashboard'),
  
  getUsers: () => apiRequest('/admin/users'),
  
  getAppointments: () => apiRequest('/admin/appointments'),
  
  updateAppointment: (id: string, data: any) =>
    apiRequest(`/admin/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getBlog: () => apiRequest('/admin/blog'),
  
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return apiRequest('/admin/upload', {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    });
  },
};