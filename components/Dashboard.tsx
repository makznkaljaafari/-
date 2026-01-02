
import React, { useMemo, useState } from 'react';
import { useUI } from '../context/UIContext';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { PageLayout } from './ui/Layout';
import { financeService } from '../services/financeService';

const Dashboard: React.FC = () => {
  const { navigate, theme, toggleTheme } = useUI();
  const { user } = useAuth();
  const { 
    sales, purchases, vouchers, customers, suppliers
  } = useData();
  
  const [isMasked, setIsMasked] = useState(false);

  const budgetSummary = useMemo(() => {
    return financeService.getGlobalBudgetSummary(customers, suppliers, sales, purchases, vouchers);
  }, [customers, suppliers, sales, purchases, vouchers]);

  const yerSummary = budgetSummary.find(s => s.currency === 'YER') || { assets: 0, liabilities: 0, net: 0 };

  const mainServices = [
    { id: 'sales', label: 'المبيعات', icon: '💰', color: 'from-emerald-400 to-emerald-600', glow: 'text-emerald-400' },
    { id: 'purchases', label: 'المشتريات', icon: '📦', color: 'from-orange-400 to-orange-600', glow: 'text-orange-400' },
    { id: 'vouchers', label: 'مركز السندات', icon: '📥', color: 'from-indigo-500 to-indigo-700', glow: 'text-indigo-400' },
    { id: 'debts', label: 'الميزانية', icon: '⚖️', color: 'from-rose-400 to-rose-600', glow: 'text-rose-400' },
    { id: 'expenses', label: 'المصاريف', icon: '💸', color: 'from-amber-400 to-amber-600', glow: 'text-amber-400' },
    { id: 'categories', label: 'المخزون', icon: '🌿', color: 'from-teal-400 to-teal-600', glow: 'text-teal-400' },
    { id: 'customers', label: 'العملاء', icon: '👥', color: 'from-indigo-400 to-indigo-600', glow: 'text-indigo-400' },
    { id: 'suppliers', label: 'الموردين', icon: '🚛', color: 'from-orange-500 to-orange-700', glow: 'text-orange-500' },
    { id: 'reports', label: 'التقارير', icon: '📊', color: 'from-purple-400 to-purple-600', glow: 'text-purple-400' },
    { id: 'waste', label: 'التالف', icon: '🥀', color: 'from-red-400 to-red-600', glow: 'text-red-400' },
    { id: 'activity-log', label: 'النشاطات', icon: '🛡️', color: 'from-slate-500 to-slate-700', glow: 'text-slate-400' },
  ];

  const formatAmount = (val: number) => isMasked ? '••••••' : val.toLocaleString();

  return (
    <PageLayout 
      title={user?.agency_name || 'وكالة الشويع'}
      headerExtra={
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('notifications')} className="w-10 h-10 glass-icon rounded-2xl flex items-center justify-center text-lg active:scale-90 transition-all hover:bg-white/20">🔔</button>
          <button onClick={() => navigate('settings')} className="w-10 h-10 glass-icon rounded-2xl flex items-center justify-center text-lg active:scale-90 transition-all hover:bg-white/20">⚙️</button>
          <button onClick={toggleTheme} className="w-10 h-10 glass-icon rounded-2xl flex items-center justify-center text-lg active:scale-90 transition-all hover:bg-white/20">{theme === 'light' ? '🌙' : '☀️'}</button>
        </div>
      }
    >
      <div className="space-y-5 pb-32 page-enter">
        <div className="relative group overflow-hidden bg-slate-900 dark:bg-black rounded-[1.8rem] p-4 text-white shadow-xl border border-white/5 animate-float max-w-[340px] mx-auto w-full">
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.08),transparent_60%)]"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[8px] font-black text-emerald-400 uppercase tracking-[0.3em] opacity-70">الرصيد الموحد</span>
                <button 
                  onClick={() => setIsMasked(!isMasked)} 
                  className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[10px] hover:bg-white/10 transition-colors"
                  title={isMasked ? 'إظهار المبالغ' : 'إخفاء المبالغ'}
                >
                  {isMasked ? '👁️' : '🙈'}
                </button>
              </div>
              <div className="bg-emerald-500/10 px-1.5 py-0.5 rounded-lg border border-emerald-500/20 backdrop-blur-md">
                <span className="text-[7px] font-black text-emerald-400">YER</span>
              </div>
            </div>
            
            <h2 className="text-2xl font-black tabular-nums tracking-tighter mb-4 bg-gradient-to-l from-white to-slate-400 bg-clip-text text-transparent">
              {formatAmount(yerSummary.net)}
            </h2>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/5 backdrop-blur-md p-2 rounded-xl border border-white/5 flex items-center justify-between">
                <span className="text-[7px] font-black text-emerald-400 uppercase">لنا</span>
                <span className="text-[11px] font-black tabular-nums">+{formatAmount(yerSummary.assets)}</span>
              </div>
              <div className="bg-white/5 backdrop-blur-md p-2 rounded-xl border border-white/5 flex items-center justify-between">
                <span className="text-[7px] font-black text-rose-400 uppercase">علينا</span>
                <span className="text-[11px] font-black tabular-nums">-{formatAmount(yerSummary.liabilities)}</span>
              </div>
            </div>
          </div>
        </div>

        <section>
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="text-[9px] font-black text-light-muted dark:text-dark-muted uppercase tracking-widest flex items-center gap-1.5">
               <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></span>
               الخدمات الأساسية
            </h3>
          </div>
          <div className="grid grid-cols-4 gap-3 px-1">
            {mainServices.map((service) => (
              <button 
                key={service.id} 
                onClick={() => navigate(service.id as any)}
                className="flex flex-col items-center gap-1.5 group outline-none"
              >
                <div className={`relative w-14 h-14 rounded-[1.4rem] bg-gradient-to-br ${service.color} p-[1px] shadow-lg icon-depth group-hover:scale-110 group-active:scale-90 transition-all`}>
                  <div className="w-full h-full bg-light-card dark:bg-dark-card backdrop-blur-md rounded-[1.3rem] flex items-center justify-center text-xl border border-white/10">
                    <span className={`drop-shadow-[0_0_8px_currentColor] ${service.glow}`}>{service.icon}</span>
                  </div>
                </div>
                <span className="text-[8px] font-black text-light-muted dark:text-dark-muted tracking-tighter uppercase whitespace-nowrap">{service.label}</span>
              </button>
            ))}
          </div>
        </section>

        <div 
          onClick={() => navigate('ai-advisor')}
          className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-800 p-4 rounded-[1.8rem] text-white shadow-lg group cursor-pointer active:scale-95 transition-all border border-white/10"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl animate-pulse"></div>
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-xl rounded-xl flex items-center justify-center text-2xl shadow-inner border border-white/20 animate-pulse-glow">🤖</div>
              <div className="text-right">
                <p className="font-black text-sm tracking-tight">المحاسب الذكي</p>
                <p className="text-[8px] font-bold text-indigo-200/50 uppercase tracking-widest">تحليل Gemini</p>
              </div>
            </div>
            <div className="w-8 h-8 glass-icon rounded-full flex items-center justify-center text-white/30 group-hover:text-white transition-all text-sm">←</div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Dashboard;
