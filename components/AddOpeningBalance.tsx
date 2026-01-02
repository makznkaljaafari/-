
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';

const AddOpeningBalance: React.FC = () => {
  const { addOpeningBalance, navigate, customers, suppliers, addNotification } = useApp();
  
  const [formData, setFormData] = useState({
    person_type: 'عميل' as 'عميل' | 'مورد',
    person_id: '',
    person_name: '',
    balance_type: 'مدين' as 'مدين' | 'دائن',
    amount: 0,
    currency: 'YER' as 'YER' | 'SAR' | 'OMR',
    notes: 'رصيد افتتاحي (دين سابق)',
    date: new Date().toISOString()
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.person_id || formData.amount <= 0) {
      if (addNotification) addNotification("تنبيه ⚠️", "يرجى اختيار الشخص والمبلغ", "warning");
      else alert("يرجى اختيار الشخص والمبلغ");
      return;
    }

    const person = formData.person_type === 'عميل' 
      ? customers.find((c: any) => c.id === formData.person_id)
      : suppliers.find((s: any) => s.id === formData.person_id);

    try {
      await addOpeningBalance({
        ...formData,
        person_name: person?.name || 'مجهول'
      });
      addNotification("تم بنجاح ✅", "تم قيد الرصيد السابق سحابياً", "success");
      navigate('debts');
    } catch (err) {
      addNotification("خطأ ❌", "تعذر حفظ الرصيد", "warning");
    }
  };

  const currentSelectionList = formData.person_type === 'عميل' ? customers : suppliers;

  return (
    <PageLayout title="رصيد أول المدة" onBack={() => navigate('debts')}>
      <form onSubmit={handleSubmit} className="space-y-6 page-enter max-w-md mx-auto">
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 shadow-2xl border border-gray-100 dark:border-slate-800 space-y-6">
          <div className="flex justify-center -mt-16 mb-6">
            <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center text-4xl text-white border-4 border-white">📜</div>
          </div>

          <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800 p-2 rounded-2xl">
            <button type="button" onClick={() => setFormData({...formData, person_type: 'عميل', person_id: ''})} className={`py-3 rounded-xl font-black text-xs transition-all ${formData.person_type === 'عميل' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400'}`}>عميل (لنا)</button>
            <button type="button" onClick={() => setFormData({...formData, person_type: 'مورد', person_id: ''})} className={`py-3 rounded-xl font-black text-xs transition-all ${formData.person_type === 'مورد' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400'}`}>مورد (علينا)</button>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">الاسم</label>
            <select className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl p-4 font-black outline-none border border-transparent focus:border-indigo-500" value={formData.person_id} onChange={e => setFormData({...formData, person_id: e.target.value})} required>
              <option value="">-- اختر من القائمة --</option>
              {currentSelectionList.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">المبلغ المستحق</label>
            <input type="number" className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 font-black text-center text-4xl outline-none tabular-nums text-red-600" value={formData.amount || ''} placeholder="0" onChange={e => setFormData({...formData, amount: parseInt(e.target.value) || 0})} required />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {['YER', 'SAR', 'OMR'].map(cur => (
              <button key={cur} type="button" onClick={() => setFormData({...formData, currency: cur as any})} className={`py-3 rounded-xl font-black text-[10px] border-2 transition-all ${formData.currency === cur ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'border-slate-100 text-slate-400'}`}>{cur}</button>
            ))}
          </div>

          <textarea className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl p-4 font-bold text-sm outline-none" rows={2} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="ملاحظات..." />
        </div>

        <button type="submit" className="w-full bg-slate-900 text-white p-7 rounded-[2rem] font-black text-xl shadow-2xl active:scale-95 border-b-8 border-black">حفظ الرصيد السابق</button>
      </form>
    </PageLayout>
  );
};

export default AddOpeningBalance;
