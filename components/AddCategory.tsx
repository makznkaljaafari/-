
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';

const AddCategory: React.FC = () => {
  const { categories, addCategory, navigate, addNotification } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    stock: 0,
    price: 0,
    currency: 'YER' as 'YER' | 'SAR' | 'OMR'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = formData.name.trim();
    if (!trimmedName) return;

    // التحقق من التكرار في الواجهة الأمامية
    const isDuplicate = categories.some((cat: any) => cat.name.trim() === trimmedName);
    if (isDuplicate) {
      addNotification("الصنف موجود مسبقاً ⚠️", `صنف القات "${trimmedName}" مسجل بالفعل في المخزون.`, "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      await addCategory({ ...formData, name: trimmedName });
      addNotification("تم الحفظ بنجاح ✅", `تمت إضافة صنف ${trimmedName} للمخزون.`, "success");
      navigate('categories');
    } catch (err: any) {
      addNotification("خطأ ❌", err.message || "فشل في حفظ الصنف", "warning");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout title="إضافة صنف جديد" onBack={() => navigate('categories')} headerGradient="from-emerald-600 to-teal-700">
      <form onSubmit={handleSubmit} className="space-y-8 page-enter max-w-md mx-auto">
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-2xl border border-emerald-50 dark:border-slate-800 space-y-8">
          
          <div className="flex justify-center -mt-20 mb-6">
            <div className="w-24 h-24 bg-emerald-600 rounded-[1.8rem] shadow-2xl flex items-center justify-center text-5xl text-white border-8 border-white dark:border-slate-900">🌿</div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-black text-emerald-900 dark:text-white px-2 tracking-tight block">اسم الصنف (نوع القات)</label>
            <input 
              type="text" 
              className="w-full bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500 rounded-2xl p-5 font-black text-gray-800 dark:text-white text-xl outline-none transition-all"
              placeholder="مثال: رداعي، شرعبي..."
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
              autoFocus
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-4">
            <label className="text-xs font-black text-emerald-600 dark:text-emerald-400 px-2 block uppercase">العملة الافتراضية للصنف</label>
            <div className="flex gap-2 p-1 bg-gray-50 dark:bg-slate-800 rounded-2xl border-2 border-transparent focus-within:border-emerald-500">
              {['YER', 'SAR', 'OMR'].map(cur => (
                <button
                  key={cur}
                  type="button"
                  onClick={() => setFormData({...formData, currency: cur as any})}
                  className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${
                    formData.currency === cur 
                      ? 'bg-emerald-600 text-white shadow-lg' 
                      : 'text-gray-400 hover:text-emerald-600'
                  }`}
                  disabled={isSubmitting}
                >
                  {cur}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <label className="text-xs font-black text-emerald-600 dark:text-emerald-400 px-2 block uppercase">الكمية الافتتاحية</label>
              <input 
                type="number" 
                className="w-full bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500 rounded-xl p-5 font-black text-gray-800 dark:text-white text-center text-2xl outline-none"
                value={formData.stock || ''}
                placeholder="0"
                onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-4">
              <label className="text-xs font-black text-emerald-600 dark:text-emerald-400 px-2 block uppercase">سعر الكيس ({formData.currency})</label>
              <input 
                type="number" 
                className="w-full bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500 rounded-xl p-5 font-black text-gray-800 dark:text-white text-center text-2xl outline-none"
                value={formData.price || ''}
                placeholder="0"
                onChange={e => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                disabled={isSubmitting}
              />
            </div>
          </div>

        </div>
        
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-8 rounded-[2rem] font-black text-xl shadow-2xl active:scale-95 border-4 border-white/10 flex items-center justify-center gap-4 transition-all disabled:opacity-50"
        >
          {isSubmitting ? (
            <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <span>حفظ بيانات الصنف</span>
              <span className="text-3xl">✅</span>
            </>
          )}
        </button>
      </form>
    </PageLayout>
  );
};

export default AddCategory;
