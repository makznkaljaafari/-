
import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';

const NotificationsPage: React.FC = () => {
  const { notifications, markNotificationsAsRead, navigate } = useApp();

  useEffect(() => {
    markNotificationsAsRead();
  }, []);

  return (
    <PageLayout 
      title="التنبيهات" 
      onBack={() => navigate('dashboard')}
      headerGradient="from-slate-800 to-slate-900"
    >
      <div className="space-y-4 pt-4 page-enter">
        {notifications.length > 0 ? (
          notifications.map(n => (
            <div 
              key={n.id} 
              className={`p-6 rounded-[2rem] border-2 transition-all ${
                n.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800/30' :
                n.type === 'warning' ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800/30' :
                'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/30'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className={`font-black text-lg ${
                  n.type === 'success' ? 'text-green-900 dark:text-green-300' :
                  n.type === 'warning' ? 'text-red-900 dark:text-red-300' :
                  'text-blue-900 dark:text-blue-300'
                }`}>
                  {n.title}
                </h3>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">
                  {new Date(n.date).toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className={`font-bold leading-relaxed ${
                n.type === 'success' ? 'text-green-800/80 dark:text-green-400/90' :
                n.type === 'warning' ? 'text-red-800/80 dark:text-red-400/90' :
                'text-blue-800/80 dark:text-blue-400/90'
              }`}>
                {n.message}
              </p>
            </div>
          ))
        ) : (
          <div className="text-center py-32 opacity-20 flex flex-col items-center gap-6">
            <span className="text-8xl">📭</span>
            <p className="font-black text-2xl text-slate-400 dark:text-slate-500">لا توجد تنبيهات حالياً</p>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default NotificationsPage;
