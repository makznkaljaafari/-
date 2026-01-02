
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';
import { dataService } from '../services/dataService';
import { ActivityLog } from '../types';

const ActivityLogPage: React.FC = () => {
  const { navigate } = useApp();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      const data = await dataService.getActivityLogs();
      setLogs(data);
      setIsLoading(false);
    };
    fetchLogs();
  }, []);

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'sale': return '💰';
      case 'purchase': return '📦';
      case 'voucher': return '📥';
      case 'waste': return '🥀';
      default: return '⚙️';
    }
  };

  return (
    <PageLayout title="سجل الرقابة والنشاطات" onBack={() => navigate('dashboard')} headerGradient="from-slate-800 to-slate-950">
      <div className="space-y-4 pt-4 page-enter">
        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800/30 mb-4">
           <p className="text-[10px] font-black text-emerald-700 dark:text-emerald-400">🛡️ ملاحظة: يتم تسجيل كافة العمليات المالية والحذف تلقائياً لضمان الشفافية والرقابة.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : logs.length > 0 ? (
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 flex items-start gap-4 transform-gpu active:scale-95 transition-all">
                <div className="w-12 h-12 bg-gray-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                  {getTypeIcon(log.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-black text-slate-800 dark:text-white text-sm">{log.action}</h4>
                    <span className="text-[9px] font-bold text-slate-400 tabular-nums">
                      {new Date(log.timestamp).toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {log.details}
                  </p>
                  <p className="text-[8px] font-black text-slate-300 dark:text-slate-600 mt-2 uppercase tracking-widest">
                    {new Date(log.timestamp).toLocaleDateString('ar-YE')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 opacity-20">
            <span className="text-8xl">📑</span>
            <p className="font-black text-xl mt-4">لا توجد سجلات حالياً</p>
          </div>
        )}
      </div>
      <div className="pb-32"></div>
    </PageLayout>
  );
};

export default ActivityLogPage;
