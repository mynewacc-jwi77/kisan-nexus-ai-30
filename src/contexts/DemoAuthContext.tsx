import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  location?: string;
}

interface Profile {
  id: string;
  name: string;
  phone: string | null;
  location: string;
  farm_size: number | null;
  soil_type: string | null;
  languages: string[];
  avatar_url: string | null;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: { user: User } | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo accounts
const DEMO_ACCOUNTS = [
  {
    id: 'demo-farmer-1',
    email: 'farmer@demo.com',
    password: 'farmer123',
    name: 'Demo Farmer',
    phone: '+91-9876543210',
    location: 'Punjab, India'
  },
  {
    id: 'demo-admin-1',
    email: 'admin@demo.com',
    password: 'admin123',
    name: 'Demo Admin',
    phone: '+91-9876543211',
    location: 'Delhi, India'
  }
];

// Storage keys
const STORAGE_KEYS = {
  USER: 'demo_auth_user',
  ACCOUNTS: 'demo_auth_accounts',
  PROFILES: 'demo_auth_profiles'
};

export function DemoAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<{ user: User } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize demo accounts in localStorage if not present
    const existingAccounts = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    if (!existingAccounts) {
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(DEMO_ACCOUNTS));
    }

    // Check for existing session
    const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setSession({ user: userData });
        fetchProfile(userData.id);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem(STORAGE_KEYS.USER);
      }
    }
    setLoading(false);
  }, []);

  const fetchProfile = (userId: string) => {
    try {
      const savedProfiles = localStorage.getItem(STORAGE_KEYS.PROFILES);
      const profiles = savedProfiles ? JSON.parse(savedProfiles) : {};
      
      if (profiles[userId]) {
        setProfile(profiles[userId]);
      } else {
        // Create default profile
        const accounts = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCOUNTS) || '[]');
        const account = accounts.find((acc: any) => acc.id === userId);
        
        if (account) {
          const defaultProfile: Profile = {
            id: userId,
            name: account.name,
            phone: account.phone || null,
            location: account.location || 'India',
            farm_size: null,
            soil_type: null,
            languages: ['English', 'Hindi'],
            avatar_url: null,
            verified: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          profiles[userId] = defaultProfile;
          localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
          setProfile(defaultProfile);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const signUp = async (email: string, password: string, metadata = {}) => {
    try {
      // Get existing accounts
      const accounts = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCOUNTS) || '[]');
      
      // Check if user already exists
      const existingUser = accounts.find((acc: any) => acc.email === email);
      if (existingUser) {
        return { 
          error: { 
            message: 'Account already exists. Please try logging in instead.' 
          } 
        };
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return {
          error: {
            message: 'Please enter a valid email address.'
          }
        };
      }

      // Create new user
      const newUser = {
        id: `demo-user-${Date.now()}`,
        email,
        password,
        name: (metadata as any)?.name || 'New User',
        phone: (metadata as any)?.phone || null,
        location: (metadata as any)?.location || 'India'
      };

      // Add to accounts
      accounts.push(newUser);
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));

      // Auto login after signup
      const userData = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        phone: newUser.phone,
        location: newUser.location
      };

      setUser(userData);
      setSession({ user: userData });
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
      fetchProfile(userData.id);

      return { error: null };
    } catch (error) {
      return {
        error: {
          message: 'Registration failed. Please try again.'
        }
      };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Get accounts
      const accounts = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCOUNTS) || '[]');
      
      // Find user
      const account = accounts.find((acc: any) => acc.email === email && acc.password === password);
      
      if (!account) {
        return {
          error: {
            message: 'Invalid email or password.'
          }
        };
      }

      // Login user
      const userData = {
        id: account.id,
        email: account.email,
        name: account.name,
        phone: account.phone,
        location: account.location
      };

      setUser(userData);
      setSession({ user: userData });
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
      fetchProfile(userData.id);

      return { error: null };
    } catch (error) {
      return {
        error: {
          message: 'Login failed. Please try again.'
        }
      };
    }
  };

  const signOut = async () => {
    try {
      setUser(null);
      setSession(null);
      setProfile(null);
      localStorage.removeItem(STORAGE_KEYS.USER);
      return { error: null };
    } catch (error) {
      return {
        error: {
          message: 'Sign out failed.'
        }
      };
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const savedProfiles = localStorage.getItem(STORAGE_KEYS.PROFILES);
      const profiles = savedProfiles ? JSON.parse(savedProfiles) : {};
      
      const updatedProfile = {
        ...profiles[user.id],
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      profiles[user.id] = updatedProfile;
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
      setProfile(updatedProfile);

      return { error: null };
    } catch (error) {
      return {
        error: new Error('Profile update failed')
      };
    }
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useDemoAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useDemoAuth must be used within a DemoAuthProvider');
  }
  return context;
}