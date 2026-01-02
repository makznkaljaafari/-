
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';

const WasteList: React.FC = () => {
  const { wasteRecords, navigate } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = wasteRecords.filter(w => 
    w.qat_type.includes(searchTerm) || w.reason.includes(searchTerm)
  );

  const totalLoss = filtered.reduce((sum, w) => sum + w.estimated_loss, 0);

  return (
    <PageLayout title="سجل التالف والخسائر" onBack={() => navigate('dashboard')} headerGradient="from-rose-700 to-red-900">
      <div className="space-y-6 pt-2 page-enter">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-800">
          <input 
            type="text"
            placeholder="بحث في التالف..."
            className="w-full bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-rose-500 rounded-xl p-4 font-bold outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl overflow-hidden border border-gray-200 dark:border-slate-800">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-rose-600 text-white font-black text-xs">
                  <th className="p-4 text-center">التاريخ</th>
                  <th className="p-4">الصنف</th>
                  <th className="p-4 text-center">الكمية</th>
                  <th className="p-4 text-center">الخسارة</th>
                  <th className="p-4 text-center">السبب</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((w, index) => (
                  <tr key={w.id} className={`border-b border-gray-100 dark:border-slate-800 transition-colors ${index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-gray-50/30'}`}>
                    <td className="p-4 text-center text-[10px] font-bold opacity-50">
                      {new Date(w.date).toLocaleDateString('ar-YE')}
                    </td>
                    <td className="p-4 font-black">{w.qat_type}</td>
                    <td className="p-4 text-center font-black text-rose-600">{w.quantity} كيس</td>
                    <td className="p-4 text-center font-black tabular-nums">{w.estimated_loss.toLocaleString()}</td>
                    <td className="p-4 text-center text-[10px] font-bold">{w.reason}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="p-20 text-center opacity-20 font-black">لا توجد خسائر تالف مسجلة</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-rose-900 text-white p-6 rounded-[2.5rem] flex justify-between items-center shadow-xl">
           <div>
              <p className="text-[10px] font-black uppercase opacity-60">إجمالي الخسائر المقدرة</p>
              <p className="text-2xl font-black">{totalLoss.toLocaleString()} ريال</p>
           </div>
           <button onClick={() => navigate('add-waste')} className="bg-white text-rose-900 px-6 py-3 rounded-xl font-black shadow-lg">إضافة تالف ＋</button>
        </div>
      </div>
      <div className="pb-32"></div>
    </PageLayout>
  );
};

export default WasteList;
