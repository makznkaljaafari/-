
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';
import { Supplier } from '../types';
import { shareToWhatsApp, formatSupplierStatement } from '../services/shareService';
import { financeService } from '../services/financeService';

const SuppliersList: React.FC = () => {
  const { 
    suppliers, 
    purchases, 
    vouchers, 
    navigate,
    deleteSupplier,
    addNotification
  } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');

  const handleShare = (supplier: Supplier) => {
    const balances = financeService.getSupplierBalances(supplier.id, purchases, vouchers);
    const text = formatSupplierStatement(supplier, purchases, vouchers, balances);
    shareToWhatsApp(text, supplier.phone);
  };

  const handleDelete = async (supplier: Supplier) => {
    if (window.confirm(`هل أنت متأكد من حذف المورد "${supplier.name}"؟ سيتم حذف بياناته وسجله نهائياً.`)) {
      try {
        await deleteSupplier(supplier.id);
        addNotification("تم الحذف 🗑️", `تم حذف المورد ${supplier.name} من النظام.`, "success");
      } catch (err: any) {
        addNotification("فشل الحذف ⚠️", err.message || "لا يمكن حذف المورد لوجود عمليات مرتبطة به.", "warning");
      }
    }
  };

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s: Supplier) => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (s.phone && s.phone.includes(searchTerm))
    );
  }, [suppliers, searchTerm]);

  return (
    <PageLayout 
      title="دليل الموردين" 
      onBack={() => navigate('dashboard')} 
      headerGradient="from-orange-700 to-amber-900"
    >
      <div className="space-y-6 pt-2 page-enter pb-44">
        <div className="relative px-1">
          <input 
            type="text"
            placeholder="ابحث عن مورد..."
            className="w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-white/5 focus:border-orange-500 rounded-3xl p-6 pr-14 outline-none transition-all font-black text-xl shadow-lg text-gray-800 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl opacity-30">🔍</span>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {filteredSuppliers.map((s: Supplier) => {
            const balances = financeService.getSupplierBalances(s.id, purchases, vouchers);
            const totalDue = balances.find(b => b.currency === 'YER')?.amount || 0;

            return (
              <div 
                key={s.id} 
                className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 shadow-xl border border-slate-100 dark:border-white/5 relative overflow-hidden transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center text-3xl shadow-inner group-hover:rotate-3 transition-transform">🚛</div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">{s.name}</h3>
                      <p className="text-sm font-bold text-slate-400 tabular-nums">{s.phone || 'بدون رقم هاتف'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 mb-6 flex justify-between items-center border border-slate-100 dark:border-slate-800">
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">المستحقات الحالية</p>
                    <p className={`text-2xl font-black tabular-nums ${totalDue > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {totalDue.toLocaleString()} <small className="text-xs font-bold">YER</small>
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-xl">💰</span>
                  </div>
                </div>

                {/* أزرار الإجراءات مع المسميات */}
                <div className="grid grid-cols-4 gap-2">
                  <button 
                    onClick={() => handleShare(s)} 
                    className="bg-green-600 hover:bg-green-500 text-white flex flex-col items-center justify-center gap-1 py-3 rounded-2xl shadow-lg active:scale-90 transition-all border-b-4 border-green-800"
                  >
                    <span className="text-xl">💬</span>
                    <span className="text-[8px] font-black">واتساب</span>
                  </button>
                  
                  <button 
                    onClick={() => navigate('add-voucher', { type: 'دفع', personId: s.id, personType: 'مورد', currency: 'YER' })} 
                    className="bg-orange-600 hover:bg-orange-500 text-white flex flex-col items-center justify-center gap-1 py-3 rounded-2xl shadow-lg active:scale-90 transition-all border-b-4 border-orange-800"
                  >
                    <span className="text-xl">📤</span>
                    <span className="text-[8px] font-black">سداد</span>
                  </button>
                  
                  <button 
                    onClick={() => navigate('add-purchase', { supplierId: s.id })} 
                    className="bg-slate-800 hover:bg-slate-700 text-white flex flex-col items-center justify-center gap-1 py-3 rounded-2xl shadow-lg active:scale-90 transition-all border-b-4 border-slate-950"
                  >
                    <span className="text-xl">📦</span>
                    <span className="text-[8px] font-black">توريد</span>
                  </button>

                  <button 
                    onClick={() => handleDelete(s)} 
                    className="bg-rose-600 hover:bg-rose-500 text-white flex flex-col items-center justify-center gap-1 py-3 rounded-2xl shadow-lg active:scale-90 transition-all border-b-4 border-rose-800"
                  >
                    <span className="text-xl">🗑️</span>
                    <span className="text-[8px] font-black">حذف</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <button 
          onClick={() => navigate('add-supplier')} 
          className="fixed bottom-32 right-6 w-16 h-16 bg-orange-600 text-white rounded-2xl shadow-2xl flex items-center justify-center text-3xl z-40 border-4 border-white dark:border-slate-950 active:scale-90 transition-all hover:bg-orange-500"
        >
          ＋
        </button>
      </div>
    </PageLayout>
  );
};

export default SuppliersList;
