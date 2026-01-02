
import React, { useEffect, useRef } from 'react';
import { UIProvider, useUI } from './UIContext';
import { AuthProvider, useAuth } from './AuthContext';
import { DataProvider, useData } from './DataContext';
import { supabase } from '../services/supabaseClient';

const SyncManager: React.FC = () => {
  const { setIsLoggedIn, setUser, setIsCheckingSession } = useAuth();
  const { loadAllData } = useData();
  const { navigate, currentPage } = useUI();
  const hasInitialLoggedRef = useRef(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setIsLoggedIn(true);
          await loadAllData(session.user.id);
          if (currentPage === 'login' && !hasInitialLoggedRef.current) {
            navigate('dashboard');
            hasInitialLoggedRef.current = true;
          }
        } else {
          setIsLoggedIn(false);
          // لا نوجه لصفحة الدخول هنا لأننا سننتظر انتهاء التحميل في App.tsx
        }
      } catch (err) {
        console.error("Auth Session Error:", err);
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setIsLoggedIn(true);
        loadAllData(session.user.id);
        if (currentPage === 'login') navigate('dashboard');
      } else if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false);
        setUser(null);
        navigate('login');
      }
    });

    return () => subscription.unsubscribe();
  }, [loadAllData, navigate, setIsLoggedIn, setUser, setIsCheckingSession]);

  return null;
};

export const AppProvider = ({ children }: { children?: React.ReactNode }) => {
  return (
    <UIProvider>
      <AuthProvider>
        <DataProvider>
          <SyncManager />
          {children}
        </DataProvider>
      </AuthProvider>
    </UIProvider>
  );
};

export const useApp = () => {
  const ui = useUI();
  const auth = useAuth();
  const data = useData();
  return { ...ui, ...auth, ...data };
};
