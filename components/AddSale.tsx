
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';
import { shareToWhatsApp, formatSaleInvoice } from '../services/shareService';

const AddSale: React.FC = () => {
  const { customers, categories, addSale, navigate, navigationParams, addNotification, user } = useApp();
  const [formData, setFormData] = useState({
    customer_id: navigationParams?.customerId || '',
    qat_type: navigationParams?.qatType || '',
    quantity: 1,
    unit_price: 0,
    status: 'نقدي' as 'نقدي' | 'آجل',
    currency: 'YER' as 'YER' | 'SAR' | 'OMR',
    notes: ''
  });
  
  const [shareAfterSave, setShareAfterSave] = useState(true);

  // تحديث الصنف الافتراضي إذا لم يكن محدداً
  useEffect(() => {
    if (!formData.qat_type && categories.length > 0) {
      setFormData(prev => ({ ...prev, qat_type: categories[0].name }));
    }
  }, [categories, formData.qat_type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const customer = customers.find(c => c.id === formData.customer_id);
    if (!customer) {
      addNotification("تنبيه ⚠️", "يرجى اختيار العميل أولاً", "warning");
      return;
    }
    if (!formData.qat_type) {
      addNotification("تنبيه ⚠️", "يرجى اختيار نوع القات", "warning");
      return;
    }
    if (formData.unit_price <= 0) {
      addNotification("خطأ في السعر ⚠️", "يرجى إدخال سعر البيع", "warning");
      return;
    }

    const total = formData.quantity * formData.unit_price;
    const saleData = { 
      ...formData, 
      customer_name: customer.name, 
      total, 
      date: new Date().toISOString() 
    };
    
    await addSale(saleData);
    
    // إرسال الفاتورة عبر واتساب فقط إذا اختار المستخدم ذلك
    if (shareAfterSave) {
      const text = formatSaleInvoice(saleData as any, user?.agency_name || 'وكالة الشويع');
      shareToWhatsApp(text, customer.phone);
    }
    
    navigate('sales');
  };

  const quickPrices = [5000, 10000, 15000, 20000, 25000, 30000];

  return (
    <PageLayout title="فاتورة بيع جديدة" onBack={() => navigate('dashboard')}>
      <form onSubmit={handleSubmit} className="space-y-5 page-enter max-w-md mx-auto pb-32">
        
        {/* اختيار العميل */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800">
          <label className="text-[10px] font-black text-slate-400 uppercase block mb-3 px-2 tracking-widest">العميل المستلم</label>
          <div className="relative">
            <select 
              className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 pr-10 font-black text-lg outline-none border-2 border-transparent focus:border-emerald-500 text-slate-800 dark:text-white appearance-none transition-all"
              value={formData.customer_id}
              onChange={e => setFormData({ ...formData, customer_id: e.target.value })}
              required
            >
              <option value="">-- اختر العميل --</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <span className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30">👤</span>
          </div>
        </div>

        {/* اختيار نوع القات (الصنف) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800">
          <label className="text-[10px] font-black text-slate-400 uppercase block mb-3 px-2 tracking-widest">نوع القات (الصنف)</label>
          <div className="relative">
            <select 
              className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 pr-10 font-black text-lg outline-none border-2 border-transparent focus:border-emerald-500 text-slate-800 dark:text-white appearance-none transition-all"
              value={formData.qat_type}
              onChange={e => setFormData({ ...formData, qat_type: e.target.value })}
              required
            >
              <option value="">-- اختر نوع القات --</option>
              {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
            </select>
            <span className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30">🌿</span>
          </div>
        </div>

        {/* اختيار العملة وحالة الدفع */}
        <div className="grid grid-cols-2 gap-3">
          {/* العملة */}
          <div className="bg-white dark:bg-slate-900 p-2 rounded-[1.8rem] shadow-sm border border-slate-100 dark:border-slate-800 flex gap-1">
            {['YER', 'SAR', 'OMR'].map((cur) => (
              <button
                key={cur}
                type="button"
                onClick={() => setFormData({...formData, currency: cur as any})}
                className={`flex-1 py-3 rounded-xl font-black text-[10px] transition-all ${
                  formData.currency === cur 
                    ? 'bg-emerald-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-emerald-600'
                }`}
              >
                {cur}
              </button>
            ))}
          </div>

          {/* نوع الدفع */}
          <div className="bg-white dark:bg-slate-900 p-2 rounded-[1.8rem] shadow-sm border border-slate-100 dark:border-slate-800 flex gap-1">
            {['نقدي', 'آجل'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFormData({...formData, status: s as any})}
                className={`flex-1 py-3 rounded-xl font-black text-[10px] transition-all ${
                  formData.status === s 
                    ? s === 'نقدي' ? 'bg-emerald-600 text-white shadow-md' : 'bg-rose-600 text-white shadow-md'
                    : 'text-slate-400'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* الكمية */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800">
          <label className="text-[10px] font-black text-slate-400 uppercase block mb-4 text-center tracking-widest">الكمية (أكياس)</label>
          <div className="flex items-center justify-center gap-6">
            <button 
              type="button" 
              onClick={() => setFormData(p => ({...p, quantity: Math.max(1, p.quantity-1)}))} 
              className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl text-2xl font-black text-slate-400 active:scale-90 transition-all border border-slate-100 dark:border-slate-700"
            >
              －
            </button>
            <input 
              type="number" 
              className="w-20 bg-transparent text-center font-black text-4xl outline-none text-slate-800 dark:text-white tabular-nums" 
              value={formData.quantity} 
              onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 1})} 
            />
            <button 
              type="button" 
              onClick={() => setFormData(p => ({...p, quantity: p.quantity+1}))} 
              className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl text-2xl font-black text-emerald-600 active:scale-90 transition-all border border-emerald-100 dark:border-emerald-800/30"
            >
              ＋
            </button>
          </div>
        </div>

        {/* السعر */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800">
          <label className="text-[10px] font-black text-slate-400 uppercase block mb-4 text-center tracking-widest">السعر للكيس الواحد ({formData.currency})</label>
          <input 
            type="number" 
            className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500 rounded-2xl p-6 font-black text-center text-4xl outline-none text-emerald-600 tabular-nums shadow-inner transition-all mb-4" 
            value={formData.unit_price || ''} 
            placeholder="0" 
            onChange={e => setFormData({ ...formData, unit_price: parseInt(e.target.value) || 0 })} 
          />
          <div className="grid grid-cols-3 gap-2">
            {quickPrices.map(p => (
              <button 
                key={p} 
                type="button" 
                onClick={() => setFormData({...formData, unit_price: p})}
                className="bg-slate-50 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white dark:text-slate-300 py-3 rounded-xl text-[10px] font-black transition-all border border-slate-100 dark:border-slate-700"
              >
                {p.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* خيار المشاركة عبر واتساب */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] shadow-sm border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-between">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl flex items-center justify-center text-xl">💬</div>
             <div>
               <p className="font-black text-xs text-slate-800 dark:text-white">إرسال عبر واتساب</p>
               <p className="text-[9px] text-slate-400 font-bold">فتح المحادثة بعد الحفظ فوراً</p>
             </div>
           </div>
           <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={shareAfterSave}
                onChange={e => setShareAfterSave(e.target.checked)}
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
           </label>
        </div>

        {/* الملخص والحفظ */}
        <div className="bg-slate-900 dark:bg-black text-white p-8 rounded-[3rem] shadow-2xl flex justify-between items-center border border-white/5 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all"></div>
           <div className="relative z-10">
              <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-[0.2em] mb-1">إجمالي الفاتورة</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-black tabular-nums">{(formData.quantity * formData.unit_price).toLocaleString()}</p>
                <span className="text-[10px] font-bold opacity-50 uppercase">{formData.currency}</span>
              </div>
           </div>
           <button 
             type="submit" 
             className="relative z-10 bg-emerald-600 hover:bg-emerald-500 px-8 py-5 rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all border-b-4 border-emerald-800 flex items-center gap-2"
           >
              <span>حفظ الفاتورة</span>
              <span className="text-xl">💾</span>
           </button>
        </div>
      </form>
    </PageLayout>
  );
};

export default AddSale;
