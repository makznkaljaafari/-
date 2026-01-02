
import React, { memo } from 'react';
import { useApp } from '../context/AppContext';

const BottomNav: React.FC = () => {
  const { currentPage, navigate } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'الرئيسية', icon: '🏠', color: 'text-blue-500' },
    { id: 'sales', label: 'المبيعات', icon: '💰', color: 'text-emerald-500' },
    { id: 'add-sale', label: 'إضافة', icon: '＋', primary: true },
    { id: 'ai-advisor', label: 'المحاسب', icon: '🤖', color: 'text-indigo-500' },
    { id: 'customers', label: 'العملاء', icon: '👥', color: 'text-purple-500' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none px-6 pb-6">
      <nav className="w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl border border-white/20 dark:border-white/5 h-20 flex justify-around items-center rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] pointer-events-auto px-2">
        {navItems.map((item) => (
          <button 
            key={item.id}
            onClick={() => navigate(item.id as any)}
            className={`flex flex-col items-center gap-1 transition-all duration-300 relative group flex-1 ${
              item.primary 
                ? '-translate-y-8' 
                : ''
            }`}
          >
            {item.primary ? (
              <div className="flex flex-col items-center gap-1">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary-500 blur-2xl opacity-40 animate-pulse"></div>
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-700 rounded-[1.8rem] flex items-center justify-center text-3xl text-white shadow-[0_15px_35px_-5px_rgba(16,185,129,0.5)] border-4 border-white dark:border-slate-800 animate-bounce-soft relative z-10 transition-transform active:scale-90">
                    {item.icon}
                  </div>
                </div>
                <span className="text-[9px] font-black text-primary-600 dark:text-primary-400 tracking-tighter uppercase mt-1">
                  {item.label}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center w-full">
                <div className={`text-2xl transition-all duration-300 ${currentPage === item.id ? 'animate-pulse-glow drop-shadow-[0_0_8px_currentColor] scale-110' : 'icon-depth opacity-50' } ${currentPage === item.id ? (item as any).color : 'text-slate-500'}`}>
                  {item.icon}
                </div>
                <span className={`text-[9px] font-black tracking-tighter uppercase transition-all duration-300 mt-1 ${currentPage === item.id ? 'opacity-100 translate-y-0 text-slate-800 dark:text-white' : 'opacity-60 text-slate-500'}`}>
                  {item.label}
                </span>
                {currentPage === item.id && (
                  <div className={`absolute -bottom-2 w-1.5 h-1.5 rounded-full animate-pulse bg-current ${item.color}`}></div>
                )}
              </div>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default memo(BottomNav);
