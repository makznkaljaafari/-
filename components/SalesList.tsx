
import React, { useState, memo, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';
import { Sale } from '../types';
import { formatSaleInvoice, shareToWhatsApp } from '../services/shareService';

const SaleCard = memo(({ 
  sale, 
  onWhatsApp, 
  onReturn,
  onDelete,
  onView,
  disabled
}: { 
  sale: Sale, 
  onWhatsApp: (s: Sale) => void, 
  onReturn: (s: Sale) => void,
  onDelete: (s: Sale) => void,
  onView: (s: Sale) => void,
  disabled: boolean
}) => {
  const isReturned = sale.is_returned;
  
  return (
    <div className={`relative bg-white dark:bg-slate-900 rounded-[2.5rem] p-5 shadow-sm border border-slate-100 dark:border-slate-800 transition-all active:scale-[0.98] ${isReturned ? 'opacity-50 grayscale-[0.5]' : ''} ${disabled ? 'pointer-events-none opacity-40' : ''}`}>
      {/* شريط الحالة الجانبي */}
      <div className={`absolute top-8 bottom-8 right-0 w-1.5 rounded-l-full ${
        isReturned ? 'bg-slate-400' : (sale.status === 'نقدي' ? 'bg-emerald-500' : 'bg-orange-500')
      }`}></div>

      <div className="flex justify-between items-start pr-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-black text-slate-900 dark:text-white text-base leading-tight">
              {sale.customer_name}
            </h3>
            {isReturned && <span className="text-[8px] font-black bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full uppercase">مرتجع</span>}
          </div>
          <div className="flex flex-wrap items-center gap-y-1 gap-x-3 mt-1">
             <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
               📅 {new Date(sale.date).toLocaleDateString('ar-YE')}
             </span>
             <span className="text-[10px] font-black text-emerald-600/70 dark:text-emerald-400/70 flex items-center gap-1 tabular-nums">
               🕒 {new Date(sale.date).toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' })}
             </span>
             <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg ${
               sale.status === 'نقدي' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 'bg-orange-50 text-orange-600 dark:bg-orange-900/20'
             }`}>
               {sale.status}
             </span>
          </div>
          <p className="text-[10px] font-bold text-slate-400 mt-2">🌿 {sale.qat_type} | 📦 {sale.quantity} كيس</p>
        </div>

        <div className="text-left flex flex-col items-end gap-1">
          <p className={`text-xl font-black tabular-nums leading-none ${sale.status === 'آجل' && !isReturned ? 'text-orange-600' : 'text-emerald-600'}`}>
            {sale.total.toLocaleString()}
          </p>
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">{sale.currency}</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 mt-5 pr-4">
        <button 
          onClick={() => onWhatsApp(sale)} 
          className="bg-emerald-600 hover:bg-emerald-500 text-white flex flex-col items-center justify-center gap-1 py-3 rounded-2xl shadow-lg active:scale-90 transition-all border-b-4 border-emerald-800"
          disabled={isReturned}
        >
          <span className="text-lg">💬</span>
          <span className="text-[7px] font-black">واتساب</span>
        </button>

        <button 
          onClick={() => onView(sale)} 
          className="bg-slate-800 dark:bg-slate-700 text-white flex flex-col items-center justify-center gap-1 py-3 rounded-2xl shadow-lg active:scale-90 transition-all border-b-4 border-slate-950"
        >
          <span className="text-lg">📄</span>
          <span className="text-[7px] font-black">عرض</span>
        </button>

        {!isReturned ? (
          <button 
            onClick={() => onReturn(sale)} 
            className="bg-amber-500 hover:bg-amber-400 text-white flex flex-col items-center justify-center gap-1 py-3 rounded-2xl shadow-lg active:scale-90 transition-all border-b-4 border-amber-700"
            title="إرجاع"
          >
            <span className="text-lg">🔄</span>
            <span className="text-[7px] font-black">إرجاع</span>
          </button>
        ) : (
          <div className="bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center gap-1 py-3 rounded-2xl opacity-40">
             <span className="text-lg">🔄</span>
             <span className="text-[7px] font-black">مرتجع</span>
          </div>
        )}

        <button 
          onClick={() => onDelete(sale)} 
          className="bg-rose-600 hover:bg-rose-500 text-white flex flex-col items-center justify-center gap-1 py-3 rounded-2xl shadow-lg active:scale-90 transition-all border-b-4 border-rose-800"
          title="حذف نهائي"
        >
          <span className="text-lg">🗑️</span>
          <span className="text-[7px] font-black">حذف</span>
        </button>
      </div>
    </div>
  );
});

const SalesList: React.FC = () => {
  const { sales, navigate, returnSale, deleteSale, user, addNotification, isLoading } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'الكل' | 'نقدي' | 'آجل' | 'مرتجع'>('الكل');

  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const matchesSearch = sale.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           sale.qat_type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = 
        filter === 'الكل' ? true :
        filter === 'مرتجع' ? sale.is_returned :
        sale.status === filter && !sale.is_returned;
      return matchesSearch && matchesFilter;
    });
  }, [sales, searchTerm, filter]);

  const stats = useMemo(() => {
    return filteredSales.reduce((acc, sale) => {
      if (!sale.is_returned) {
        acc.totalAmount += sale.total;
        acc.totalQty += sale.quantity;
      }
      acc.count += 1;
      return acc;
    }, { totalAmount: 0, totalQty: 0, count: 0 });
  }, [filteredSales]);

  const handleReturn = async (sale: Sale) => {
    if (window.confirm(`هل أنت متأكد من إرجاع فاتورة "${sale.customer_name}"؟ سيتم استعادة الكمية للمخزون.`)) {
      try {
        await returnSale(sale.id);
      } catch (e: any) {
        addNotification("فشل الإرجاع ⚠️", e.message, "warning");
      }
    }
  };

  const handleDelete = async (sale: Sale) => {
    if (window.confirm(`⚠️ تحذير نهائي!\nهل تريد حذف فاتورة "${sale.customer_name}" من السجل السحابي تماماً؟ لا يمكن التراجع عن هذا الإجراء.`)) {
      try {
        await deleteSale(sale.id);
      } catch (e: any) {
        addNotification("فشل الحذف ⚠️", "عذراً، تعذر حذف الفاتورة حالياً.", "warning");
      }
    }
  };

  const handleView = (sale: Sale) => {
    navigate('invoice-view', { sale });
  };

  const handleWhatsApp = (sale: Sale) => shareToWhatsApp(formatSaleInvoice(sale, user?.agency_name || 'وكالة الشويع'));

  return (
    <PageLayout title="سجل المبيعات" onBack={() => navigate('dashboard')}>
      <div className="space-y-6 pt-1 page-enter pb-40 max-w-md mx-auto">
        
        {/* ملخص إحصائي سريع */}
        <div className="grid grid-cols-2 gap-3">
           <div className="bg-slate-900 dark:bg-black rounded-[2rem] p-5 text-white border border-white/5 shadow-xl">
              <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest mb-1">إجمالي المبيعات ({filter})</p>
              <div className="flex items-baseline gap-1">
                 <span className="text-xl font-black tabular-nums">{stats.totalAmount.toLocaleString()}</span>
                 <span className="text-[8px] font-bold opacity-40 uppercase">YER</span>
              </div>
           </div>
           <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-5 shadow-sm border border-slate-100 dark:border-slate-800">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">إجمالي الأكياس</p>
              <div className="flex items-baseline gap-1">
                 <span className="text-xl font-black tabular-nums text-slate-800 dark:text-white">{stats.totalQty}</span>
                 <span className="text-[8px] font-bold text-slate-400">كيس</span>
              </div>
           </div>
        </div>

        {/* مؤشر التحميل */}
        {isLoading && (
          <div className="flex items-center justify-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800">
            <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">جاري تحديث السجل السحابي...</p>
          </div>
        )}

        {/* البحث والفلترة */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
          <div className="relative">
            <input 
              type="text"
              placeholder="ابحث باسم العميل أو نوع القات..."
              className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500 rounded-2xl p-4 pr-12 outline-none font-black text-sm text-slate-800 dark:text-white transition-all shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg opacity-30">🔍</span>
          </div>
          <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-x-auto no-scrollbar">
            {['الكل', 'نقدي', 'آجل', 'مرتجع'].map((f) => (
              <button 
                key={f} 
                onClick={() => setFilter(f as any)} 
                className={`flex-1 py-3 px-4 rounded-xl font-black text-[10px] whitespace-nowrap transition-all ${
                  filter === f ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:text-emerald-600'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* قائمة البطاقات */}
        <div className="space-y-3">
          {filteredSales.length > 0 ? (
            filteredSales.map((sale) => (
              <SaleCard 
                key={sale.id} 
                sale={sale} 
                onWhatsApp={handleWhatsApp} 
                onReturn={handleReturn}
                onDelete={handleDelete}
                onView={handleView}
                disabled={isLoading}
              />
            ))
          ) : (
            <div className="text-center py-20 opacity-20 flex flex-col items-center gap-4">
               <span className="text-7xl">📂</span>
               <p className="font-black text-lg text-slate-400">لا توجد عمليات مبيعات مسجلة</p>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default SalesList;
