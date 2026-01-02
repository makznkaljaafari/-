
import React, { memo, useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

interface LayoutProps {
  title: string;
  headerExtra?: React.ReactNode;
  children: React.ReactNode;
  onBack?: () => void;
  headerGradient?: string;
}

const DigitalClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = time.toLocaleTimeString('ar-YE', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: true 
  });

  const dateString = time.toLocaleDateString('ar-YE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });

  return (
    <div className="flex flex-col items-end justify-center px-4 border-r-2 border-white/10 ml-2">
      <div className="text-[12px] font-black tabular-nums tracking-widest text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]">
        {timeString}
      </div>
      <div className="text-[8px] font-black text-white/50 whitespace-nowrap uppercase tracking-tighter">
        {dateString}
      </div>
    </div>
  );
};

export const PageLayout: React.FC<LayoutProps> = ({ 
  title, 
  headerExtra, 
  children, 
  onBack,
  headerGradient = "from-slate-800 to-slate-950 dark:from-slate-900 dark:to-black" 
}) => {
  return (
    <div className="flex flex-col min-h-screen bg-light-bg dark:bg-dark-bg transition-colors duration-500 overflow-x-hidden">
      
      {/* Floating Header - Ultra Compact & High Contrast */}
      <div className="sticky top-0 z-40 w-full flex justify-center px-3 pt-3 pointer-events-none">
        <header className={`w-full max-w-md bg-gradient-to-br ${headerGradient} text-white shadow-2xl rounded-[2rem] overflow-hidden pointer-events-auto border border-white/10 dark:border-white/5 relative transform transition-all duration-300`}>
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[radial-gradient(circle_at_top_right,white,transparent)]"></div>
          
          <div className="flex items-center justify-between px-5 h-16 relative z-10">
            <div className="flex items-center gap-3">
              {onBack && (
                <button 
                  onClick={onBack} 
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-xl active:scale-90 transition-all border border-white/10 backdrop-blur-md shadow-lg"
                >
                  →
                </button>
              )}
              <div className="flex flex-col">
                <h1 className="text-sm font-black tracking-tight truncate max-w-[130px] leading-tight text-white drop-shadow-sm">
                  {title}
                </h1>
                <div className="flex items-center gap-1.5">
                   <span className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse"></span>
                   <p className="text-[7px] font-black text-white/50 uppercase tracking-[0.2em]">نظام الشويع v3</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <DigitalClock />
              {headerExtra}
            </div>
          </div>
        </header>
      </div>

      {/* Main content - Optimized Spacing */}
      <main className="flex-1 w-full px-4 pt-6 pb-40 flex flex-col items-center">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>
    </div>
  );
};
