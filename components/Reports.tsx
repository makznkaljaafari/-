
import React, { useMemo, useState, useEffect } from 'react';
import { useUI } from '../context/UIContext';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { PageLayout } from './ui/Layout';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, YAxis, CartesianGrid } from 'recharts';
import { getFinancialForecast } from '../services/geminiService';
import { dataService } from '../services/dataService';
import { exportService } from '../services/exportService';
import { shareToWhatsApp, formatDailyClosingReport } from '../services/shareService';

const Reports: React.FC = () => {
  const { navigate, addNotification } = useUI();
  const { user } = useAuth();
  const { sales, expenses, purchases, vouchers, categories } = useData();
  
  const [forecast, setForecast] = useState<string>('جاري تحليل البيانات سحابياً...');
  const [isLoadingForecast, setIsLoadingForecast] = useState(true);
  const [financialStats, setFinancialStats] = useState<any[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 30);
        
        const stats = await dataService.getFinancialSummary(start.toISOString(), end.toISOString());
        setFinancialStats(stats || []);
      } catch (e) {
        console.error("Stats Error:", e);
      } finally {
        setIsLoadingStats(false);
      }
    };

    const fetchForecast = async () => {
      try {
        const aiForecast = await getFinancialForecast(sales, expenses, categories);
        setForecast(aiForecast);
      } catch (e) {
        setForecast("تعذر التحليل حالياً، يرجى المحاولة لاحقاً.");
      } finally {
        setIsLoadingForecast(false);
      }
    };

    fetchStats();
    fetchForecast();
  }, [sales, expenses, categories]);

  const chartData = useMemo(() => {
    return sales.slice(0, 15).reverse().map((s: any, i: number) => ({
      name: `ع ${i+1}`,
      sales: s.total,
      date: new Date(s.date).toLocaleDateString('ar-YE', { day: 'numeric', month: 'short' })
    }));
  }, [sales]);

  const handleExportData = (type: 'sales' | 'purchases' | 'expenses') => {
    const dataMap = { sales, purchases, expenses };
    exportService.exportToCSV(dataMap[type], `تقرير_${type}`);
    addNotification("تم التصدير ✅", `تم تجهيز ملف CSV لبيانات ${type}`, "success");
  };

  const handleDailyShare = () => {
    const reportText = formatDailyClosingReport({
      sales, expenses, purchases, vouchers,
      agencyName: user?.agency_name || 'وكالة الشويع'
    });
    shareToWhatsApp(reportText);
    addNotification("تقرير الواتساب 💬", "تم تجهيز ملخص الإغلاق اليومي", "info");
  };

  return (
    <PageLayout title="المحلل المالي الذكي" onBack={() => navigate('dashboard')} headerGradient="from-indigo-600 via-purple-700 to-indigo-950">
      <div className="space-y-6 pt-4 page-enter pb-32">
        
        {/* أزرار الإجراءات السريعة */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={handleDailyShare}
            className="bg-emerald-600 text-white p-4 rounded-2xl font-black text-[10px] shadow-lg flex flex-col items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <span className="text-xl">📊</span>
            توليد إغلاق اليوم (واتساب)
          </button>
          <button 
            onClick={() => handleExportData('sales')}
            className="bg-slate-800 text-white p-4 rounded-2xl font-black text-[10px] shadow-lg flex flex-col items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <span className="text-xl">📥</span>
            تصدير المبيعات (CSV)
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
           {isLoadingStats ? (
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] flex flex-col items-center justify-center border border-gray-100 dark:border-slate-800 shadow-sm">
                 <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                 <p className="text-xs font-black text-slate-400">جاري تجميع البيانات المالية...</p>
              </div>
           ) : financialStats.length > 0 ? (
              financialStats.map((s, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-slate-800 relative overflow-hidden group">
                   <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600"></div>
                   <div className="flex justify-between items-start mb-6">
                      <div>
                         <span className="bg-indigo-600 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md">{s.currency}</span>
                         <p className="text-[10px] font-black text-slate-400 mt-3 uppercase tracking-tighter">صافي الأداء (30 يوم)</p>
                      </div>
                      <div className="text-right">
                         <p className={`font-black text-3xl tabular-nums ${Number(s.net_profit) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {Number(s.net_profit) >= 0 ? '+' : ''}{Math.round(Number(s.net_profit)).toLocaleString()}
                         </p>
                      </div>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-emerald-50 dark:bg-emerald-950/20 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
                         <p className="text-[9px] font-black text-emerald-600 uppercase mb-1">المبيعات</p>
                         <p className="font-black text-xl tabular-nums text-slate-800 dark:text-slate-200">{Math.round(Number(s.total_sales)).toLocaleString()}</p>
                      </div>
                      <div className="bg-orange-50 dark:bg-orange-950/20 p-5 rounded-2xl border border-orange-100 dark:border-orange-800/30">
                         <p className="text-[9px] font-black text-orange-600 uppercase mb-1">المشتريات</p>
                         <p className="font-black text-xl tabular-nums text-slate-800 dark:text-slate-200">{Math.round(Number(s.total_purchases)).toLocaleString()}</p>
                      </div>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-rose-50 dark:bg-rose-950/20 p-5 rounded-2xl border border-rose-100 dark:border-rose-800/30">
                         <p className="text-[9px] font-black text-rose-600 uppercase mb-1">المصاريف</p>
                         <p className="font-black text-xl tabular-nums text-slate-800 dark:text-slate-200">{Math.round(Number(s.total_expenses)).toLocaleString()}</p>
                      </div>
                      <div className="bg-red-50 dark:bg-red-950/20 p-5 rounded-2xl border border-red-100 dark:border-red-800/30">
                         <p className="text-[9px] font-black text-red-600 uppercase mb-1">التالف</p>
                         <p className="font-black text-xl tabular-nums text-slate-800 dark:text-slate-200">{Math.round(Number(s.total_waste)).toLocaleString()}</p>
                      </div>
                   </div>
                </div>
              ))
           ) : (
              <div className="bg-white dark:bg-slate-900 p-12 rounded-[2.5rem] text-center border-2 border-dashed border-slate-200 dark:border-slate-800">
                 <span className="text-4xl mb-4 block">📈</span>
                 <p className="font-black text-sm text-slate-400">لا توجد بيانات مالية كافية حالياً</p>
              </div>
           )}
        </div>

        <section className="bg-gradient-to-br from-indigo-900 via-slate-900 to-black p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group border border-white/5">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>
          <div className="flex items-center gap-4 mb-6">
             <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-4xl shadow-inner border border-white/10 animate-pulse backdrop-blur-md">🔮</div>
             <div>
                <h3 className="font-black text-xl leading-tight">الرؤية الاستراتيجية</h3>
                <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">تحليل Gemini Pro السحابي</p>
             </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl p-7 rounded-[2rem] border border-white/10 min-h-[140px] flex items-center">
             {isLoadingForecast ? (
                <div className="flex flex-col items-center justify-center py-4 w-full gap-4">
                   <div className="w-8 h-8 border-3 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                   <p className="font-black text-[10px] text-indigo-300 uppercase tracking-widest">توليد رؤى ذكية...</p>
                </div>
             ) : (
                <p className="font-bold leading-relaxed text-sm whitespace-pre-line text-indigo-100 italic">
                   "{forecast}"
                </p>
             )}
          </div>
        </section>

        <section className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-xl border border-gray-100 dark:border-slate-800">
          <div className="flex justify-between items-center mb-10 px-2">
             <h3 className="font-black text-sm text-slate-800 dark:text-white uppercase tracking-tighter flex items-center gap-2">
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></span>
                اتجاه المبيعات الأخير
             </h3>
             <span className="text-[10px] font-black text-slate-400 bg-slate-100 dark:bg-slate-800 px-4 py-1.5 rounded-full uppercase tracking-widest">آخر 15 عملية</span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.3} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', background: '#0f172a', color: '#fff' }} 
                  itemStyle={{ fontWeight: 'black', fontSize: '12px', color: '#818cf8' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={5} fillOpacity={1} fill="url(#salesGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </PageLayout>
  );
};

export default Reports;
