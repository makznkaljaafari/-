
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Page, Theme, AppNotification } from '../types';
import { dataService } from '../services/dataService';

interface UIContextType {
  currentPage: Page;
  navigationParams: any;
  theme: Theme;
  activeToasts: any[];
  notifications: AppNotification[];
  navigate: (p: Page, params?: any) => void;
  toggleTheme: () => void;
  addNotification: (title: string, message: string, type: AppNotification['type']) => Promise<void>;
  removeToast: (id: string) => void;
  markNotificationsAsRead: () => Promise<void>;
  setNotifications: React.Dispatch<React.SetStateAction<AppNotification[]>>;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [navigationParams, setNavigationParams] = useState<any>(null);
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'light');
  const [activeToasts, setActiveToasts] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const navigate = useCallback((p: Page, params?: any) => {
    setCurrentPage(p);
    setNavigationParams(params || null);
  }, []);

  const toggleTheme = useCallback(() => {
    const nt = theme === 'light' ? 'dark' : 'light';
    setTheme(nt);
    localStorage.setItem('theme', nt);
    document.documentElement.classList.toggle('dark', nt === 'dark');
  }, [theme]);

  const addNotification = useCallback(async (title: string, message: string, type: AppNotification['type']) => {
    try {
      const saved = await dataService.saveNotification({ title, message, type, date: new Date().toISOString(), read: false });
      setNotifications(prev => [saved, ...prev]);
      const toastId = Math.random().toString(36).substr(2, 9);
      setActiveToasts(prev => [...prev, { id: toastId, title, message, type }]);
    } catch (e) { console.error(e); }
  }, []);

  const removeToast = useCallback((id: string) => {
    setActiveToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const markNotificationsAsRead = useCallback(async () => {
    await dataService.markAllNotificationsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const value = useMemo(() => ({
    currentPage, navigationParams, theme, activeToasts, notifications,
    navigate, toggleTheme, addNotification, removeToast, markNotificationsAsRead, setNotifications
  }), [currentPage, navigationParams, theme, activeToasts, notifications, navigate, toggleTheme, addNotification, removeToast, markNotificationsAsRead]);

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used within UIProvider');
  return context;
};
