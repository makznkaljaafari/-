
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';
import { Customer } from '../types';
import { formatCustomerStatement, shareToWhatsApp } from '../services/shareService';
import { financeService } from '../services/financeService';

const CustomersList: React.FC = () => {
  const { customers, sales, vouchers, navigate } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const handleShareWhatsApp = (customer: Customer) => {
    const debts = financeService.getCustomerBalances(customer.id, sales, vouchers);
    const text = formatCustomerStatement(customer, sales, vouchers, debts);
    shareToWhatsApp(text, customer.phone);
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter((c: Customer) => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (c.phone && c.phone.includes(searchTerm))
    );
  }, [customers, searchTerm]);

  return (
    <PageLayout 
      title="دليل العملاء" 
      onBack={() => navigate('dashboard')} 
      headerExtra={
        <button onClick={() => navigate('add-customer')} className="flex flex-col items-center justify-center w-10 h-10 bg-white/20 rounded-xl shadow-inner active:scale-90 transition-all">
          <span className="text-sm">👤＋</span>
          <span className="text-[7px] font-black">إضافة</span>
        </button>
      }
    >
      <div className="space-y-4 pt-2 page-enter pb-44">
        <div className="relative px-1">
          <input 
            type="text"
            placeholder="ابحث عن عميل..."
            className="w-full bg-white dark:bg-slate-900 rounded-[1.8rem] p-5 pr-12 outline-none text-lg font-black shadow-lg border border-slate-100 dark:border-white/5 text-right transition-all focus:border-primary-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xl opacity-30">🔍</span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {filteredCustomers.map((c: Customer) => {
            const debts = financeService.getCustomerBalances(c.id, sales, vouchers);
            const totalDebt = debts.find(d => d.currency === 'YER')?.amount || 0;

            return (
              <div key={c.id} className="bg-white dark:bg-slate-900 rounded-[2rem] p-5 shadow-md border border-slate-50 dark:border-white/5 flex justify-between items-center transition-all">
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleShareWhatsApp(c)} 
                    className="flex flex-col items-center justify-center w-12 py-2 bg-green-50 text-green-600 rounded-xl border border-green-100 active:scale-90 transition-all"
                  >
                    <span className="text-lg">💬</span>
                    <span className="text-[7px] font-black">واتساب</span>
                  </button>
                  <button 
                    onClick={() => navigate('add-sale', { customerId: c.id })} 
                    className="flex flex-col items-center justify-center w-12 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-white/10 active:scale-90 transition-all"
                  >
                    <span className="text-lg">💰</span>
                    <span className="text-[7px] font-black">بيع</span>
                  </button>
                  <button 
                    onClick={() => navigate('add-voucher', { type: 'قبض', personId: c.id, personType: 'عميل', currency: 'YER' })} 
                    className="flex flex-col items-center justify-center w-12 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded-xl border border-indigo-100 dark:border-indigo-800/20 active:scale-90 transition-all"
                  >
                    <span className="text-lg">📥</span>
                    <span className="text-[7px] font-black">سند</span>
                  </button>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-white text-lg leading-tight">{c.name}</h3>
                    <p className={`text-xs font-black tabular-nums ${totalDebt > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {totalDebt.toLocaleString()} <small className="text-[10px] opacity-70">YER</small>
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-primary-200 dark:border-primary-800/20">👤</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PageLayout>
  );
};

export default CustomersList;
