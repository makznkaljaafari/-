
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';
import { shareToWhatsApp, formatVoucherReceipt } from '../services/shareService';

const AddVoucher: React.FC = () => {
  const { addVoucher, navigate, navigationParams, customers, suppliers } = useApp();
  
  const [formData, setFormData] = useState({
    type: (navigationParams?.type || 'قبض') as 'قبض' | 'دفع',
    person_id: navigationParams?.personId || '',
    person_name: '',
    person_type: (navigationParams?.personType || 'عميل') as 'عميل' | 'مورد',
    amount: navigationParams?.amount || 0,
    currency: (navigationParams?.currency || 'YER') as 'YER' | 'SAR' | 'OMR',
    notes: navigationParams?.amount ? `سداد مديونية سابقة` : ''
  });

  const [shareAfterSave, setShareAfterSave] = useState(true);

  useEffect(() => {
    if (formData.person_id) {
      const person = formData.person_type === 'عميل' 
        ? customers.find(c => c.id === formData.person_id)
        : suppliers.find(s => s.id === formData.person_id);
      if (person) setFormData(prev => ({ ...prev, person_name: person.name }));
    }
  }, [formData.person_id, formData.person_type, customers, suppliers]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.person_id || formData.amount <= 0) {
      alert('يرجى اختيار الشخص وتحديد المبلغ');
      return;
    }

    const voucherData = {
      ...formData,
      date: new Date().toISOString()
    };

    addVoucher(voucherData);

    if (shareAfterSave) {
      const text = formatVoucherReceipt(voucherData as any);
      const person = formData.person_type === 'عميل' 
        ? customers.find(c => c.id === formData.person_id)
        : suppliers.find(s => s.id === formData.person_id);
      
      shareToWhatsApp(text, person?.phone);
    }
  };

  const currentSelectionList = formData.person_type === 'عميل' ? customers : suppliers;

  return (
    <PageLayout 
      title={`إصدار سند ${formData.type}`} 
      onBack={() => navigate('dashboard')} 
      headerGradient={formData.type === 'قبض' ? 'from-green-600 to-teal-800' : 'from-amber-600 to-orange-800'}
    >
      <form onSubmit={handleSubmit} className="space-y-6 page-enter max-w-md mx-auto">
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-2xl border border-gray-100 dark:border-slate-800 space-y-8 transition-colors">
          <div className="flex justify-center -mt-20 mb-6">
            <div className={`w-24 h-24 rounded-[1.8rem] shadow-2xl flex items-center justify-center text-5xl text-white border-8 border-white dark:border-slate-900 ${
              formData.type === 'قبض' ? 'bg-green-600' : 'bg-amber-600'
            }`}>
              {formData.type === 'قبض' ? '📥' : '📤'}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase px-2 tracking-widest">اختيار {formData.person_type}</label>
            <select 
              className="w-full bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-xl p-5 font-black text-gray-800 dark:text-white text-lg outline-none appearance-none transition-all"
              value={formData.person_id}
              onChange={e => setFormData({ ...formData, person_id: e.target.value })}
              required
            >
              <option value="">-- اختر من القائمة --</option>
              {currentSelectionList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-black text-slate-600 dark:text-slate-400 px-2 block uppercase">العملة</label>
            <div className="flex gap-2 p-1 bg-gray-50 dark:bg-slate-800 rounded-2xl">
              {['YER', 'SAR', 'OMR'].map(cur => (
                <button
                  key={cur}
                  type="button"
                  onClick={() => setFormData({...formData, currency: cur as any})}
                  className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${
                    formData.currency === cur 
                      ? 'bg-indigo-600 text-white shadow-lg' 
                      : 'text-gray-400'
                  }`}
                >
                  {cur}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase px-2 tracking-widest">المبلغ ({formData.currency})</label>
            <input 
              type="number" 
              className={`w-full bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-6 font-black text-center text-5xl outline-none tabular-nums transition-all ${
                formData.type === 'قبض' ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'
              }`}
              value={formData.amount || ''}
              placeholder="0"
              onChange={e => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
              required
            />
          </div>

          <div className="flex items-center gap-4 p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-white/5">
             <input 
               type="checkbox" 
               id="share_voucher" 
               className="w-6 h-6 accent-indigo-600 cursor-pointer" 
               checked={shareAfterSave}
               onChange={(e) => setShareAfterSave(e.target.checked)}
             />
             <label htmlFor="share_voucher" className="font-black text-sm text-indigo-900 dark:text-indigo-200 cursor-pointer">إرسال إيصال السند عبر واتساب فوراً 💬</label>
          </div>
        </div>

        <button 
          type="submit" 
          className={`w-full p-8 rounded-[2rem] font-black text-xl shadow-2xl active:scale-95 border-4 border-white/10 flex items-center justify-center gap-4 transition-all text-white ${
            formData.type === 'قبض' ? 'bg-green-600 hover:bg-green-700' : 'bg-amber-600 hover:bg-amber-700'
          }`}
        >
          <span>حفظ السند المالي</span>
          <span className="text-3xl">✅</span>
        </button>
      </form>
    </PageLayout>
  );
};

export default AddVoucher;
