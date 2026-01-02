
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';

const AddCustomer: React.FC = () => {
  const { customers, addCustomer, navigate, addNotification } = useApp();
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedName = formData.name.trim();

    if (!trimmedName) {
      addNotification("تنبيه ⚠️", "يرجى إدخال اسم العميل", "warning");
      return;
    }

    // التحقق من تكرار الاسم
    const isDuplicate = customers.some((c: any) => c.name.trim() === trimmedName);
    if (isDuplicate) {
      addNotification("الاسم موجود مسبقاً ⚠️", `العميل "${trimmedName}" مسجل بالفعل في النظام.`, "warning");
      return;
    }

    if (!formData.phone.trim()) {
      addNotification("تنبيه ⚠️", "يرجى إدخال رقم الهاتف للتواصل", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      await addCustomer({ ...formData, name: trimmedName });
      addNotification("تم الحفظ بنجاح ✅", `تمت إضافة العميل ${trimmedName} بنجاح.`, "success");
      navigate('customers');
    } catch (err: any) {
      const errorMsg = err?.message || (typeof err === 'string' ? err : "حدث خطأ غير متوقع أثناء الحفظ السحابي");
      addNotification("خطأ في السحابة ❌", errorMsg, "warning");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout title="إضافة عميل جديد" onBack={() => navigate('customers')} headerGradient="from-blue-600 to-indigo-800">
      <form onSubmit={handleSubmit} className="space-y-8 page-enter max-w-md mx-auto">
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-2xl border border-blue-50 dark:border-slate-800 space-y-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-[5rem]"></div>
          
          <div className="flex justify-center -mt-20 mb-6 relative z-10">
            <div className="w-24 h-24 bg-blue-600 rounded-[1.8rem] shadow-2xl flex items-center justify-center text-5xl text-white border-8 border-white dark:border-slate-900 animate-logo-float">👤</div>
          </div>

          <div className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">الاسم الكامل</label>
              <input 
                className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-5 font-black text-lg outline-none border-2 border-transparent focus:border-blue-500 transition-all text-slate-800 dark:text-white"
                placeholder="اسم العميل الرباعي"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">رقم الجوال (واتساب)</label>
              <input 
                type="tel"
                className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-5 font-black text-lg outline-none border-2 border-transparent focus:border-blue-500 transition-all text-slate-800 dark:text-white tabular-nums"
                placeholder="77xxxxxxx"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">العنوان / المنطقة</label>
              <input 
                className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-5 font-black text-lg outline-none border-2 border-transparent focus:border-blue-500 transition-all text-slate-800 dark:text-white"
                placeholder="مكان السكن أو العمل"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white p-7 rounded-[2rem] font-black text-xl shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50 border-b-8 border-blue-800"
        >
          {isSubmitting ? (
            <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <span>حفظ العميل في السحابة</span>
              <span className="text-3xl">💾</span>
            </>
          )}
        </button>
      </form>
    </PageLayout>
  );
};

export default AddCustomer;
