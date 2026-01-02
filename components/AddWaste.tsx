
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';

const AddWaste: React.FC = () => {
  const { addWaste, navigate, categories } = useApp();
  const [formData, setFormData] = useState({
    qat_type: categories[0]?.name || '',
    quantity: 1,
    estimated_loss: 0,
    reason: 'يباس / تلف طبيعي',
    currency: 'YER' as 'YER' | 'SAR' | 'OMR'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.qat_type || formData.quantity <= 0) return;
    
    addWaste({
      ...formData,
      date: new Date().toISOString()
    });
  };

  return (
    <PageLayout title="تسجيل تالف جديد" onBack={() => navigate('waste')} headerGradient="from-rose-600 to-red-800">
      <form onSubmit={handleSubmit} className="space-y-6 page-enter max-w-md mx-auto">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-2xl space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">الصنف التالف</label>
            <select 
              className="w-full bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-rose-500 rounded-xl p-4 font-black outline-none"
              value={formData.qat_type}
              onChange={e => setFormData({...formData, qat_type: e.target.value})}
              required
            >
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">الكمية (بالكيس)</label>
            <input 
              type="number" 
              className="w-full bg-gray-50 dark:bg-slate-800 rounded-xl p-4 font-black text-center text-4xl outline-none text-rose-600"
              value={formData.quantity}
              onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">الخسارة المالية المقدرة</label>
            <input 
              type="number" 
              className="w-full bg-gray-50 dark:bg-slate-800 rounded-xl p-4 font-black text-center text-2xl outline-none"
              value={formData.estimated_loss}
              placeholder="مثلاً: سعر التكلفة"
              onChange={e => setFormData({...formData, estimated_loss: parseInt(e.target.value) || 0})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">السبب</label>
            <textarea 
              className="w-full bg-gray-50 dark:bg-slate-800 rounded-xl p-4 font-bold outline-none"
              rows={3}
              value={formData.reason}
              onChange={e => setFormData({...formData, reason: e.target.value})}
              placeholder="مثال: القات يبس بسبب الحرارة"
            />
          </div>
        </div>

        <button type="submit" className="w-full bg-rose-600 text-white p-6 rounded-[2rem] font-black text-xl shadow-xl active:scale-95 transition-all">
          خصم من المخزون وحفظ الخسارة 🥀
        </button>
      </form>
    </PageLayout>
  );
};

export default AddWaste;
