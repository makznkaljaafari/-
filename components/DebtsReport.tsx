
import React, { useMemo, useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';
import { shareToWhatsApp, formatBudgetSummary } from '../services/shareService';
import { financeService } from '../services/financeService';
import { dataService } from '../services/dataService';

const DebtsReport: React.FC = () => {
  const { customers, suppliers, sales, purchases, vouchers, navigate } = useApp();
  const [openingBalances, setOpeningBalances] = useState<any[]>([]);
  const [loadingBalances, setLoadingBalances] = useState(true);

  const budgetSummary = useMemo(() => {
    return financeService.getGlobalBudgetSummary(customers, suppliers, sales, purchases, vouchers);
  }, [customers, suppliers, sales, purchases, vouchers]);

  const yerSummary = budgetSummary.find(s => s.currency === 'YER') || { assets: 0, liabilities: 0, net: 0 };

  useEffect(() => {
    const fetchBalances = async () => {
      const data = await dataService.getOpeningBalances();
      setOpeningBalances(data || []);
      setLoadingBalances(false);
    };
    fetchBalances();
  }, [sales]);

  const handleShareSummary = () => {
    const text = formatBudgetSummary(budgetSummary.filter(s => s.assets > 0 || s.liabilities > 0));
    shareToWhatsApp(text);
  };

  return (
    <PageLayout 
      title="الميزانية والديون" 
      onBack={() => navigate('dashboard')} 
      headerGradient="from-slate-900 via-red-900 to-black"
      headerExtra={
        <button onClick={handleShareSummary} className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-xl shadow-lg active:scale-90 border border-white/20">📤</button>
      }
    >
      <div className="space-y-8 pt-2 page-enter pb-44">
        
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden border border-white/10 text-right">
          <div className="relative z-10">
            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2">الوضع المالي الصافي (ريال)</p>
            <h2 className="text-5xl font-black tabular-nums tracking-tighter mb-8 text-left">
              {yerSummary.net.toLocaleString()}
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <p className="text-[8px] font-bold text-emerald-400 uppercase mb-1">لنا عند العملاء</p>
                <p className="text-xl font-black tabular-nums">+{yerSummary.assets.toLocaleString()}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <p className="text-[8px] font-bold text-red-400 uppercase mb-1">علينا للموردين</p>
                <p className="text-xl font-black tabular-nums">-{yerSummary.liabilities.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        <section className="space-y-4">
          <div className="flex justify-between items-center px-4">
            <button onClick={() => navigate('add-opening-balance')} className="bg-slate-800 text-white px-4 py-2 rounded-xl font-black text-[10px]">إضافة رصيد سابق ＋</button>
            <h3 className="text-sm font-black text-slate-400 uppercase">الأرصدة الافتتاحية (الديون القديمة)</h3>
          </div>
          
          <div className="space-y-2">
            {loadingBalances ? (
              <div className="p-10 text-center opacity-30 font-black">جاري التحميل...</div>
            ) : openingBalances.length > 0 ? (
              openingBalances.map(ob => (
                <div key={ob.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 flex justify-between items-center">
                  <div className="text-right w-full">
                    <h4 className="font-black text-sm text-slate-800 dark:text-white">{ob.person_name} ({ob.person_type})</h4>
                    <p className={`text-xs font-black tabular-nums ${ob.balance_type === 'مدين' ? 'text-red-600' : 'text-emerald-600'}`}>
                      {ob.balance_type === 'مدين' ? 'لنا عنده: ' : 'له عندنا: '}
                      {ob.amount.toLocaleString()} <small>{ob.currency}</small>
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-gray-100 dark:border-slate-800 opacity-30 font-black text-xs">لا توجد أرصدة افتتاحية مسجلة</div>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-sm font-black text-slate-400 uppercase px-4 text-right">ديون العملاء (فواتير آجلة)</h3>
          <div className="grid grid-cols-1 gap-2">
            {customers.map(c => {
              const bal = financeService.getCustomerBalances(c.id, sales, vouchers).find(b => b.currency === 'YER')?.amount || 0;
              if (bal <= 0) return null;
              return (
                <div key={c.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm flex justify-between items-center border border-gray-50 dark:border-slate-800">
                  <button onClick={() => navigate('add-voucher', { type: 'قبض', personId: c.id, personType: 'عميل', amount: bal })} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black">تسوية</button>
                  <div className="text-right">
                    <h4 className="font-black text-slate-800 dark:text-white">{c.name}</h4>
                    <p className="text-2xl font-black text-red-600 tabular-nums">{bal.toLocaleString()} <small className="text-[10px]">YER</small></p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </PageLayout>
  );
};

export default DebtsReport;
