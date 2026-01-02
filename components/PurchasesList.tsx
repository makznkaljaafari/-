
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';
import { Purchase } from '../types';

const PurchasesList: React.FC = () => {
  const { purchases, navigate, returnPurchase, addNotification } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'الكل' | 'نقدي' | 'آجل' | 'مرتجع'>('الكل');

  const filteredPurchases = useMemo(() => {
    return purchases.filter(purchase => {
      const matchesSearch = purchase.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           purchase.qat_type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = 
        filter === 'الكل' ? true :
        filter === 'مرتجع' ? purchase.is_returned :
        purchase.status === filter && !purchase.is_returned;
      return matchesSearch && matchesFilter;
    });
  }, [purchases, searchTerm, filter]);

  const handleReturn = async (purchase: Purchase) => {
    if (window.confirm(`إرجاع المشتريات للمورد؟ سيتم خصم الكمية من المخزون وتوثيقها كمرتجع.`)) {
      await returnPurchase(purchase.id);
      addNotification("تم الإرجاع ✅", "تم تسجيل المرتجع وتعديل المخزون سحابياً.", "info");
    }
  };

  return (
    <PageLayout title="سجل المشتريات" onBack={() => navigate('dashboard')} headerGradient="from-orange-600 to-amber-700">
      <div className="space-y-6 pt-2 page-enter">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col gap-3 text-right">
          <input 
            type="text"
            placeholder="ابحث عن مورد أو صنف..."
            className="w-full bg-gray-50 dark:bg-slate-800 rounded-xl p-4 font-black outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="flex gap-1 p-1 bg-gray-100 dark:bg-slate-800 rounded-xl overflow-x-auto no-scrollbar">
            {['الكل', 'نقدي', 'آجل', 'مرتجع'].map((f) => (
              <button key={f} onClick={() => setFilter(f as any)} className={`flex-1 py-2 px-3 rounded-lg font-black text-[10px] whitespace-nowrap transition-all ${filter === f ? 'bg-orange-600 text-white shadow-md' : 'text-slate-500'}`}>{f}</button>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-200 dark:border-slate-800">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-right border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-amber-600 text-white font-black text-[10px]">
                  <th className="p-4 text-center">#</th>
                  <th className="p-4 text-right">المورد</th>
                  <th className="p-4 text-center">الإجمالي</th>
                  <th className="p-4 text-center">إجراء</th>
                </tr>
              </thead>
              <tbody>
                {filteredPurchases.map((purchase, index) => (
                  <tr key={purchase.id} className={`border-b border-gray-100 dark:border-slate-800 transition-colors ${purchase.is_returned ? 'opacity-40 grayscale-[0.5]' : ''} ${index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-gray-50/50'}`}>
                    <td className="p-4 text-center font-black opacity-40 text-xs">{purchase.is_returned ? '🔄' : index + 1}</td>
                    <td className="p-4 text-right">
                      <p className="font-black text-gray-900 dark:text-white text-xs">{purchase.supplier_name}</p>
                      <span className="font-bold text-gray-400 text-[8px] uppercase">{purchase.qat_type}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="font-black text-amber-600 tabular-nums text-sm">{purchase.total.toLocaleString()}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1">
                        {!purchase.is_returned && (
                          <button 
                            onClick={() => handleReturn(purchase)} 
                            className="flex flex-col items-center justify-center w-12 py-1.5 bg-amber-50 text-amber-600 rounded-lg border border-amber-100 shadow-sm active:scale-90 transition-all"
                          >
                            <span className="text-sm">🔄</span>
                            <span className="text-[7px] font-black">إرجاع</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <button 
          onClick={() => navigate('add-purchase')} 
          className="fixed bottom-32 right-6 w-16 h-16 bg-amber-600 text-white rounded-2xl shadow-2xl flex items-center justify-center text-4xl border-4 border-white z-40 active:scale-90 transition-transform"
        >
          ＋
        </button>
      </div>
    </PageLayout>
  );
};

export default PurchasesList;
