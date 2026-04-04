'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LoginData } from '@/lib/api';

interface AuthContextType {
  session: LoginData | null;
  setSession: (s: LoginData | null) => void;
  pendingEmail: string;
  setPendingEmail: (e: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<LoginData | null>(null);
  const [pendingEmail, setPendingEmail] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('finance_session');
    if (stored) setSessionState(JSON.parse(stored));
    const email = localStorage.getItem('pending_email') || '';
    setPendingEmail(email);
  }, []);

  const setSession = (s: LoginData | null) => {
    setSessionState(s);
    if (s) localStorage.setItem('finance_session', JSON.stringify(s));
    else localStorage.removeItem('finance_session');
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem('finance_session');
  };

  const handleSetPendingEmail = (e: string) => {
    setPendingEmail(e);
    localStorage.setItem('pending_email', e);
  };

  return (
    <AuthContext.Provider value={{ session, setSession, pendingEmail, setPendingEmail: handleSetPendingEmail, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
