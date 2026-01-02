
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';
import { shareToWhatsApp, formatVoucherReceipt } from '../services/shareService';
import { Voucher, VoucherEditEntry } from '../types';

const VouchersList: React.FC = () => {
  const { vouchers, navigate, updateVoucher, addVoucher, customers, suppliers, addNotification } = useApp();
  
  const [filter, setFilter] = useState<'الكل' | 'قبض' | 'دفع'>('الكل');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVoucherId, setEditingVoucherId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Voucher>>({});
  
  const [newVoucher, setNewVoucher] = useState({
    type: 'قبض' as 'قبض' | 'دفع',
    person_id: '',
    person_type: 'عميل' as 'عميل' | 'مورد',
    amount: 0,
    currency: 'YER' as 'YER' | 'SAR' | 'OMR',
    notes: ''
  });

  const filteredVouchers = useMemo(() => {
    return vouchers.filter(v => filter === 'الكل' || v.type === filter);
  }, [vouchers, filter]);

  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVoucher.person_id || newVoucher.amount <= 0) {
      addNotification("تنبيه ⚠️", "يرجى اختيار الاسم وتحديد المبلغ", "warning");
      return;
    }

    const person = newVoucher.person_type === 'عميل' 
      ? customers.find(c => c.id === newVoucher.person_id)
      : suppliers.find(s => s.id === newVoucher.person_id);

    try {
      const voucherData = {
        ...newVoucher,
        person_name: person?.name || 'مجهول',
        date: new Date().toISOString()
      };
      await addVoucher(voucherData);
      setShowAddForm(false);
      setNewVoucher({ type: 'قبض', person_id: '', person_type: 'عميل', amount: 0, currency: 'YER', notes: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartEdit = (voucher: Voucher) => {
    setEditingVoucherId(voucher.id);
    setEditForm({ ...voucher });
  };

  const handleSaveEdit = () => {
    if (!editingVoucherId || !editForm.amount || editForm.amount <= 0) return;
    const originalVoucher = vouchers.find(v => v.id === editingVoucherId);
    if (!originalVoucher) return;

    const newHistoryEntry: VoucherEditEntry = {
      date: new Date().toISOString(),
      previous_amount: originalVoucher.amount,
      previous_notes: originalVoucher.notes || ''
    };

    updateVoucher(editingVoucherId, {
      amount: editForm.amount,
      notes: editForm.notes,
      currency: editForm.currency,
      edit_history: [newHistoryEntry, ...(originalVoucher.edit_history || [])].slice(0, 5)
    });
    setEditingVoucherId(null);
  };

  const handleShare = (voucher: Voucher) => {
    const text = formatVoucherReceipt(voucher);
    const person = voucher.person_type === 'عميل' 
      ? customers.find(c => c.id === voucher.person_id)
      : suppliers.find(s => s.id === voucher.person_id);
    shareToWhatsApp(text, person?.phone);
  };

  const totalReceipts = vouchers.filter(v => v.type === 'قبض').reduce((sum, v) => sum + v.amount, 0);
  const totalPayments = vouchers.filter(v => v.type === 'دفع').reduce((sum, v) => sum + v.amount, 0);

  return (
    <PageLayout title="مركز السندات المالية" onBack={() => navigate('dashboard')} headerGradient="from-indigo-700 to-slate-950">
      <div className="space-y-6 pt-2 page-enter pb-32">
        
        {/* أزرار العمليات السريعة */}
        <div className="grid grid-cols-2 gap-3 px-1">
          <button 
            onClick={() => { setNewVoucher(v => ({ ...v, type: 'قبض', person_type: 'عميل' })); setShowAddForm(true); }}
            className="bg-emerald-600 text-white p-5 rounded-[2rem] font-black shadow-lg active:scale-95 transition-all border-b-4 border-emerald-800 flex flex-col items-center gap-1"
          >
            <span className="text-2xl">📥</span>
            <span className="text-[10px] uppercase tracking-tighter">سند قبض جديد</span>
          </button>
          <button 
            onClick={() => { setNewVoucher(v => ({ ...v, type: 'دفع', person_type: 'مورد' })); setShowAddForm(true); }}
            className="bg-amber-600 text-white p-5 rounded-[2rem] font-black shadow-lg active:scale-95 transition-all border-b-4 border-amber-800 flex flex-col items-center gap-1"
          >
            <span className="text-2xl">📤</span>
            <span className="text-[10px] uppercase tracking-tighter">سند دفع جديد</span>
          </button>
        </div>

        {/* نموذج الإضافة المنبثق */}
        {showAddForm && (
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end justify-center animate-in fade-in">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[3rem] p-8 shadow-2xl animate-in slide-in-from-bottom-full duration-500">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">إصدار سند {newVoucher.type}</h3>
                <button onClick={() => setShowAddForm(false)} className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-xl">✕</button>
              </div>
              
              <form onSubmit={handleCreateVoucher} className="space-y-5">
                <div className="flex gap-1 p-1 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                  <button type="button" onClick={() => setNewVoucher({...newVoucher, person_type: 'عميل'})} className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${newVoucher.person_type === 'عميل' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400'}`}>عميل</button>
                  <button type="button" onClick={() => setNewVoucher({...newVoucher, person_type: 'مورد'})} className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${newVoucher.person_type === 'مورد' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400'}`}>مورد</button>
                </div>

                <select className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-xl font-black outline-none border border-transparent focus:border-indigo-500" value={newVoucher.person_id} onChange={e => setNewVoucher({...newVoucher, person_id: e.target.value})} required>
                  <option value="">-- اختر {newVoucher.person_type} --</option>
                  {(newVoucher.person_type === 'عميل' ? customers : suppliers).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>

                <div className="relative">
                  <input type="number" className="w-full bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl font-black text-center text-4xl outline-none text-indigo-600 tabular-nums" placeholder="0" value={newVoucher.amount || ''} onChange={e => setNewVoucher({...newVoucher, amount: parseInt(e.target.value) || 0})} required />
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase tracking-widest">{newVoucher.currency}</span>
                </div>

                <textarea className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-xl font-bold text-sm outline-none" placeholder="البيان (اختياري)..." rows={2} value={newVoucher.notes} onChange={e => setNewVoucher({...newVoucher, notes: e.target.value})} />

                <button type="submit" className={`w-full py-5 rounded-2xl font-black text-lg text-white shadow-xl transition-all active:scale-95 ${newVoucher.type === 'قبض' ? 'bg-emerald-600' : 'bg-amber-600'}`}>
                  حفظ السند السحابي ✅
                </button>
              </form>
            </div>
          </div>
        )}

        {/* التصفية والبحث */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-800 flex gap-2">
          {['الكل', 'قبض', 'دفع'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`flex-1 py-4 rounded-xl font-black text-[10px] transition-all ${
                filter === f ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400'
              }`}
            >
              {f === 'الكل' ? 'جميع السندات' : f === 'قبض' ? 'مقبوضات' : 'مدفوعات'}
            </button>
          ))}
        </div>

        {/* قائمة السندات */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl overflow-hidden border border-gray-200 dark:border-slate-800">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-right border-collapse min-w-[550px]">
              <thead>
                <tr className="bg-indigo-600 dark:bg-indigo-800 text-white font-black">
                  <th className="p-4 text-center w-10">#</th>
                  <th className="p-4">النوع</th>
                  <th className="p-4">الجهة</th>
                  <th className="p-4 text-center">المبلغ</th>
                  <th className="p-4 text-center">إجراء</th>
                </tr>
              </thead>
              <tbody>
                {filteredVouchers.map((v, index) => {
                  const isEditing = editingVoucherId === v.id;
                  return (
                    <tr key={v.id} className={`border-b border-gray-100 dark:border-slate-800 transition-colors ${index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-gray-50/30'}`}>
                      <td className="p-4 text-center font-black opacity-30 text-xs">{index + 1}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-lg font-black text-[8px] whitespace-nowrap ${
                          v.type === 'قبض' ? 'bg-green-100 text-green-700 dark:bg-green-900/40' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40'
                        }`}>
                          {v.type === 'قبض' ? '📥 قبض' : '📤 دفع'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-black text-gray-900 dark:text-white text-xs">{v.person_name}</p>
                          <p className="text-[8px] text-gray-400 font-bold">{v.notes || 'بدون بيان'}</p>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        {isEditing ? (
                          <input type="number" className="w-20 bg-gray-50 dark:bg-slate-800 border border-indigo-200 rounded p-1 font-black text-xs text-center tabular-nums" value={editForm.amount} onChange={e => setEditForm({...editForm, amount: parseFloat(e.target.value) || 0})} />
                        ) : (
                          <span className="font-black text-sm text-indigo-600 tabular-nums">
                            {v.amount.toLocaleString()} <small className="text-[8px] opacity-60">{v.currency}</small>
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          {isEditing ? (
                            <button onClick={handleSaveEdit} className="bg-green-600 text-white px-2 py-1 rounded text-[8px] font-black">حفظ</button>
                          ) : (
                            <>
                              <button onClick={() => handleShare(v)} className="w-8 h-8 bg-green-50 text-green-600 rounded-lg flex items-center justify-center text-sm shadow-sm active:scale-90 transition-all">💬</button>
                              <button onClick={() => handleStartEdit(v)} className="w-8 h-8 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center text-sm shadow-sm active:scale-90 transition-all">📝</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* الإجماليات */}
        <div className="bg-indigo-900 dark:bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 flex justify-between items-center shadow-2xl text-white">
          <div className="text-right">
            <p className="text-[9px] font-black text-indigo-400 uppercase mb-1 opacity-80">صافي التدفق المالي</p>
            <p className={`text-2xl font-black tabular-nums ${totalReceipts - totalPayments >= 0 ? 'text-green-400' : 'text-amber-400'}`}>
              {(totalReceipts - totalPayments).toLocaleString()} <small className="text-xs">YER</small>
            </p>
          </div>
          <div className="flex flex-col gap-1 text-left opacity-60">
            <p className="text-[8px] font-black">مقبوضات: +{totalReceipts.toLocaleString()}</p>
            <p className="text-[8px] font-black">مدفوعات: -{totalPayments.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default VouchersList;
