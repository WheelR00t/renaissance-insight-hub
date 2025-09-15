// Types TypeScript pour l'application

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  birthDate?: string;
  isAdmin: boolean;
  isGuest: boolean;
  isVerified: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface Service {
  _id: string;
  name: string;
  description: string;
  shortDescription: string;
  price: number;
  duration: number;
  category: 'tirage-cartes' | 'reiki' | 'pendule' | 'guerison';
  isOnline: boolean;
  isInPerson: boolean;
  features: string[];
  availableSlots: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }[];
  order: number;
  isActive: boolean;
  createdAt: string;
}

export interface Appointment {
  _id: string;
  user: User | string;
  service: Service | string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'online' | 'in-person';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  price: number;
  notes?: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentIntentId?: string;
  createdAt: string;
}

export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  author: User | string;
  image?: string;
  isPublished: boolean;
  publishedAt?: string;
  views: number;
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  user: User | string;
  content: string;
  isApproved: boolean;
  createdAt: string;
}

export interface Payment {
  _id: string;
  user: User | string;
  appointment: Appointment | string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed';
  paymentIntentId: string;
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  loginAsGuest: (guestData: GuestData) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  birthDate?: string;
}

export interface GuestData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface BookingData {
  serviceId: string;
  date: string;
  startTime: string;
  type: 'online' | 'in-person';
  notes?: string;
}