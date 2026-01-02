
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';
import { QatCategory } from '../types';

const CategoriesList: React.FC = () => {
  const { categories, navigate, deleteCategory, addNotification } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategories = useMemo(() => {
    return categories.filter(cat => 
      cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  const handleDelete = async (cat: QatCategory) => {
    if (window.confirm(`هل أنت متأكد من حذف صنف "${cat.name}"؟`)) {
      try {
        await deleteCategory(cat.id);
        addNotification("تم الحذف 🗑️", `تم حذف صنف ${cat.name} من المخزون.`, "success");
      } catch (err: any) {
        addNotification("عذراً ⚠️", "لا يمكن حذف الصنف لوجود عمليات مرتبطة به.", "warning");
      }
    }
  };

  return (
    <PageLayout 
      title="جرد المخزون" 
      onBack={() => navigate('dashboard')} 
      headerGradient="from-teal-700 to-emerald-900"
    >
      <div className="space-y-4 pt-2 page-enter pb-44">
        
        {/* شريط البحث المدمج */}
        <div className="relative px-1">
          <input 
            type="text"
            placeholder="ابحث عن صنف..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 focus:border-emerald-500 rounded-2xl p-4 pr-12 outline-none transition-all font-black text-sm shadow-sm text-gray-800 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute right-5 top-1/2 -translate-y-1/2 text-lg opacity-30">🔍</span>
        </div>

        {/* شبكة البطاقات المصغرة */}
        <div className="grid grid-cols-1 gap-3">
          {filteredCategories.map((cat) => (
            <div key={cat.id} className="bg-white dark:bg-slate-900 rounded-[1.8rem] p-5 shadow-md border border-slate-100 dark:border-white/5 relative overflow-hidden group transition-all">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{cat.name}</h3>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">سعر البيع: {cat.price.toLocaleString()} <small className="opacity-70">{cat.currency}</small></p>
                  </div>
                  <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center text-xl">🌿</div>
                </div>

                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 mb-4">
                  <div className="text-right">
                    <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-0.5">المتوفر حالياً</p>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-3xl font-black tabular-nums ${cat.stock < 5 ? 'text-red-600 animate-pulse' : 'text-slate-800 dark:text-white'}`}>
                        {cat.stock}
                      </span>
                      <span className="text-[10px] font-black text-slate-400">أكياس</span>
                    </div>
                  </div>
                  
                  {cat.stock < 5 && (
                    <div className="bg-red-100 dark:bg-red-900/40 px-2 py-1 rounded-lg flex items-center gap-1">
                      <span className="text-xs">⚠️</span>
                      <span className="text-[7px] font-black text-red-600 dark:text-red-400 uppercase">منخفض</span>
                    </div>
                  )}
                </div>

                {/* أزرار الإجراءات مع المسميات */}
                <div className="flex gap-2">
                  <button 
                    onClick={() => navigate('add-sale', { qatType: cat.name })} 
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white flex flex-col items-center justify-center gap-0.5 py-2.5 rounded-xl shadow-sm active:scale-95 transition-all border-b-2 border-emerald-800"
                  >
                    <span className="text-lg">💰</span>
                    <span className="text-[8px] font-black">بيع سريع</span>
                  </button>
                  
                  <button 
                    onClick={() => navigate('add-category', { categoryId: cat.id })} 
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white flex flex-col items-center justify-center gap-0.5 py-2.5 rounded-xl shadow-sm active:scale-95 transition-all border-b-2 border-slate-950"
                  >
                    <span className="text-lg">📝</span>
                    <span className="text-[8px] font-black">تعديل</span>
                  </button>

                  <button 
                    onClick={() => handleDelete(cat)} 
                    className="w-12 bg-rose-50 hover:bg-rose-100 text-rose-600 flex flex-col items-center justify-center gap-0.5 py-2.5 rounded-xl shadow-sm active:scale-95 transition-all border border-rose-100"
                  >
                    <span className="text-lg">🗑️</span>
                    <span className="text-[7px] font-black">حذف</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={() => navigate('add-category')} 
          className="fixed bottom-32 right-6 w-14 h-14 bg-emerald-600 text-white rounded-2xl shadow-2xl flex items-center justify-center text-3xl z-40 border-4 border-white dark:border-slate-950 active:scale-90 transition-all hover:bg-emerald-500"
        >
          ＋
        </button>
      </div>
    </PageLayout>
  );
};

export default CategoriesList;
