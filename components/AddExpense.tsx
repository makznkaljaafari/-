
import React, { useState } from 'react';
import { useUI } from '../context/UIContext';
import { useData } from '../context/DataContext';
import { PageLayout } from './ui/Layout';
import { ExpenseFrequency } from '../types';

const AddExpense: React.FC = () => {
  const { navigate } = useUI();
  const data = useData();
  
  const [formData, setFormData] = useState({
    title: '',
    category: data.expenseCategories[0] || 'نثرية',
    amount: 0,
    currency: 'YER' as 'YER' | 'SAR' | 'OMR',
    notes: ''
  });
  
  const [frequency, setFrequency] = useState<ExpenseFrequency>('شهرياً');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);

  const frequencies: ExpenseFrequency[] = ['يومياً', 'أسبوعياً', 'شهرياً', 'سنوياً'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || formData.amount <= 0) return;
    
    data.addExpense(formData);

    if (saveAsTemplate) {
      data.addExpenseTemplate({
        title: formData.title,
        category: formData.category,
        amount: formData.amount,
        currency: formData.currency,
        frequency: frequency
      });
    }
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      data.addExpenseCategory(newCategoryName.trim());
      setFormData({ ...formData, category: newCategoryName.trim() });
      setNewCategoryName('');
      setShowAddCategory(false);
    }
  };

  return (
    <PageLayout title="تسجيل مصروف جديد" onBack={() => navigate('expenses')} headerGradient="from-amber-600 to-orange-700">
      <form onSubmit={handleSubmit} className="space-y-6 page-enter max-w-md mx-auto">
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-2xl border border-gray-100 dark:border-slate-800 space-y-8">
          <div className="flex justify-center -mt-20 mb-6">
            <div className="w-24 h-24 bg-amber-600 rounded-[1.8rem] shadow-2xl flex items-center justify-center text-5xl text-white border-8 border-white dark:border-slate-900">💸</div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase px-2 tracking-widest">بيان المصروف</label>
            <input 
              type="text" 
              className="w-full bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:bg-white dark:focus:bg-slate-700 focus:border-amber-500 rounded-xl p-5 font-black text-gray-800 dark:text-white text-lg outline-none transition-all shadow-inner"
              placeholder="مثال: فاتورة كهرباء شهر 5"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center px-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">الفئة</label>
              <button 
                type="button" 
                onClick={() => setShowAddCategory(!showAddCategory)}
                className="text-[10px] font-black text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-3 py-1 rounded-full border border-amber-200 dark:border-white/10"
              >
                {showAddCategory ? 'إغلاق' : '＋ إضافة فئة جديدة'}
              </button>
            </div>
            
            {showAddCategory ? (
              <div className="flex gap-2 animate-in slide-in-from-top-2">
                <input 
                  type="text" 
                  className="flex-1 bg-gray-50 dark:bg-slate-800 border-2 border-amber-200 dark:border-slate-700 rounded-xl p-4 font-black text-sm outline-none"
                  placeholder="اسم الفئة..."
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                />
                <button 
                  type="button" 
                  onClick={handleAddCategory}
                  className="bg-amber-600 text-white px-6 rounded-xl font-black text-sm shadow-md"
                >
                  حفظ
                </button>
              </div>
            ) : (
              <select 
                className="w-full bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-amber-500 rounded-xl p-5 font-black text-gray-800 dark:text-white outline-none appearance-none shadow-inner"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
              >
                {data.expenseCategories.map((cat: string) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            )}
          </div>

          <div className="space-y-4">
            <label className="text-xs font-black text-gray-400 dark:text-white uppercase px-2 tracking-widest block">العملة</label>
            <div className="flex bg-gray-50 dark:bg-slate-800 rounded-2xl p-1.5 shadow-inner">
               {['YER', 'SAR', 'OMR'].map((cur) => (
                 <button
                   key={cur}
                   type="button"
                   onClick={() => setFormData({...formData, currency: cur as any})}
                   className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${
                     formData.currency === cur 
                       ? 'bg-amber-600 text-white shadow-lg' 
                       : 'text-gray-400'
                   }`}
                 >
                   {cur}
                 </button>
               ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase px-2 tracking-widest">المبلغ</label>
            <input 
              type="number" 
              className="w-full bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-amber-500 rounded-[2rem] p-8 font-black text-center text-5xl text-amber-600 outline-none tabular-nums shadow-inner"
              value={formData.amount || ''}
              placeholder="0"
              onChange={e => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
              required
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-white/5">
              <input 
                type="checkbox" 
                id="template_check"
                className="w-6 h-6 accent-amber-600 rounded-lg cursor-pointer"
                checked={saveAsTemplate}
                onChange={e => setSaveAsTemplate(e.target.checked)}
              />
              <label htmlFor="template_check" className="font-black text-sm text-amber-900 dark:text-amber-200 cursor-pointer">
                حفظ كمصروف متكرر 🔁
              </label>
            </div>

            {saveAsTemplate && (
              <div className="space-y-3 animate-in slide-in-from-top-4 duration-300">
                <label className="text-[10px] font-black text-amber-600 uppercase tracking-widest px-2">معدل التكرار</label>
                <div className="grid grid-cols-2 gap-2">
                  {frequencies.map(f => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFrequency(f)}
                      className={`py-3 rounded-xl font-black text-xs transition-all border-2 ${
                        frequency === f 
                          ? 'bg-amber-600 text-white border-amber-600 shadow-lg' 
                          : 'bg-white dark:bg-slate-800 text-gray-400 border-gray-100 dark:border-slate-700'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white p-8 rounded-[2rem] font-black text-xl shadow-2xl active:scale-95 border-4 border-white/10 flex items-center justify-center gap-4 transition-all">
          <span>حفظ المصروف</span>
          <span className="text-3xl">✅</span>
        </button>
      </form>
    </PageLayout>
  );
};

export default AddExpense;
