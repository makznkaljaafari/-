
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { supabase } from '../services/supabaseClient';
import { dataService } from '../services/dataService';

interface AuthContextType {
  isLoggedIn: boolean;
  isCheckingSession: boolean;
  user: any;
  loginAction: (email: string, pass: string) => Promise<any>;
  registerAction: (userData: any) => Promise<any>;
  logoutAction: () => Promise<void>;
  updateUser: (updates: any) => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<any>>;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  setIsCheckingSession: React.Dispatch<React.SetStateAction<boolean>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [user, setUser] = useState<any>(null);

  const loginAction = useCallback(async (email: string, pass: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) throw new Error(error.message);
    return data;
  }, []);

  const registerAction = useCallback(async (userData: any) => {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: { data: { full_name: userData.fullName, agency_name: userData.agencyName } }
    });
    if (error) throw new Error(error.message);
    return data;
  }, []);

  const logoutAction = useCallback(async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setUser(null);
  }, []);

  const updateUser = useCallback(async (updates: any) => {
    const userId = await dataService.getUserId();
    if (userId) {
      await dataService.updateProfile(userId, updates);
      const profile = await dataService.getFullProfile(userId);
      setUser(profile);
    }
  }, []);

  const value = useMemo(() => ({
    isLoggedIn,
    isCheckingSession,
    user,
    loginAction,
    registerAction,
    logoutAction,
    updateUser,
    setUser,
    setIsLoggedIn,
    setIsCheckingSession
  }), [isLoggedIn, isCheckingSession, user, loginAction, registerAction, logoutAction, updateUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
