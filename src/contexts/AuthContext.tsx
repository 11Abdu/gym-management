import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { database } from '@/lib/database';
import { Admin } from '@/types';

interface AuthContextType {
  admin: Admin | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize database
    database.init();
    
    // Check if admin is already logged in
    const savedAdmin = localStorage.getItem('gym_current_admin');
    if (savedAdmin) {
      setAdmin(JSON.parse(savedAdmin));
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const authenticatedAdmin = database.admin.authenticate(email, password);
      if (authenticatedAdmin) {
        setAdmin(authenticatedAdmin);
        localStorage.setItem('gym_current_admin', JSON.stringify(authenticatedAdmin));
        return { success: true };
      } else {
        return { success: false, error: 'Invalid credentials' };
      }
    } catch (error) {
      return { success: false, error: 'Authentication failed' };
    }
  };

  const signOut = () => {
    setAdmin(null);
    localStorage.removeItem('gym_current_admin');
  };

  return (
    <AuthContext.Provider value={{ admin, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}