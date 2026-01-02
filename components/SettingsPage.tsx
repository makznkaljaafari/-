
import React, { useState, useEffect } from 'react';
import { useUI } from '../context/UIContext';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

type SettingsTab = 'general' | 'finance' | 'integrations' | 'data' | 'about';

const SettingsPage: React.FC = () => {
  const { navigate, theme, toggleTheme, addNotification } = useUI();
  const { user, updateUser } = useAuth();
  const { exchangeRates, updateExchangeRates, createCloudBackup } = useData();

  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [rates, setRates] = useState(exchangeRates);
  const [isBackingUp, setIsBackingUp] = useState(false);
  
  const [userData, setUserData] = useState(user || {
    agency_name: '',
    full_name: '',
    whatsapp_number: '',
    telegram_username: '',
    enable_voice_ai: false
  });

  useEffect(() => {
    if (user) {
      setUserData(user);
    }
  }, [user]);

  const tabs = [
    { id: 'general', label: 'إعدادات عامة', icon: '⚙️' },
    { id: 'finance', label: 'المالية والعملات', icon: '💱' },
    { id: 'integrations', label: 'التكاملات', icon: '🔌' },
    { id: 'data', label: 'إدارة البيانات', icon: '💾' },
    { id: 'about', label: 'عن النظام', icon: 'ℹ️' },
  ];

  const handleCloudBackup = async () => {
    setIsBackingUp(true);
    try {
      await createCloudBackup();
    } catch (e: any) {
      addNotification('خطأ في النسخ ⚠️', e.message, 'warning');
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleSaveGeneral = () => {
    updateUser(userData);
    addNotification('تم الحفظ 💾', 'تم تحديث الإعدادات السحابية بنجاح.', 'success');
  };

  const applyStandardRates = () => {
    const standard = { SAR_TO_YER: 430, OMR_TO_YER: 425 };
    setRates(standard);
    updateExchangeRates(standard);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] transition-colors duration-500 overflow-x-hidden">
      {/* Header */}
      <div className="sticky top-0 z-40 w-full flex justify-center px-4 pt-4 pointer-events-none">
        <header className="w-full max-w-md bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950 text-white shadow-xl rounded-[1.5rem] overflow-hidden pointer-events-auto border border-white/10 relative transform transition-all duration-300">
          <div className="flex items-center justify-between px-5 h-16 relative z-10">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('dashboard')} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-lg active:scale-90 transition-all border border-white/10 backdrop-blur-md">→</button>
              <h1 className="text-sm font-black tracking-tight leading-tight">إعدادات النظام</h1>
            </div>
          </div>
        </header>
      </div>

      <main className="flex-1 w-full px-4 pt-5 pb-32 overflow-y-auto no-scrollbar flex flex-col items-center">
        <div className="w-full max-w-md space-y-6">
          <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-[2rem] shadow-lg border border-gray-100 dark:border-slate-800 overflow-x-auto no-scrollbar gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SettingsTab)}
                className={`flex-shrink-0 flex items-center gap-2 px-6 py-4 rounded-2xl font-black text-sm transition-all ${
                  activeTab === tab.id 
                    ? 'bg-emerald-600 text-white shadow-md scale-105' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden min-h-[400px]">
            {activeTab === 'general' && (
              <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">اسم الوكالة</label>
                    <input type="text" className="w-full bg-gray-50 dark:bg-slate-800 p-5 rounded-2xl font-black text-lg outline-none border-2 border-transparent focus:border-emerald-500 transition-all text-slate-800 dark:text-white" value={userData.agency_name} onChange={e => setUserData({...userData, agency_name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">اسم المدير / المحاسب</label>
                    <input type="text" className="w-full bg-gray-50 dark:bg-slate-800 p-5 rounded-2xl font-black text-lg outline-none border-2 border-transparent focus:border-emerald-500 transition-all text-slate-800 dark:text-white" value={userData.full_name} onChange={e => setUserData({...userData, full_name: e.target.value})} />
                  </div>
                  <button onClick={handleSaveGeneral} className="w-full bg-emerald-600 text-white p-5 rounded-2xl font-black text-lg shadow-xl active:scale-95 transition-all">حفظ في السحابة ✅</button>
                </div>
                <div className="pt-8 border-t border-gray-100 dark:border-slate-800">
                  <button onClick={toggleTheme} className="w-full bg-gray-50 dark:bg-slate-800 p-6 rounded-2xl flex items-center justify-between group active:scale-95 transition-all">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{theme === 'light' ? '🌙' : '☀️'}</span>
                      <div className="text-right">
                         <p className="font-black text-slate-800 dark:text-white">تغيير وضع المظهر</p>
                         <p className="text-xs text-slate-400 font-bold">التبديل بين الليلي والنهاري</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'integrations' && (
              <div className="p-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div className="bg-emerald-50 dark:bg-emerald-950/20 p-6 rounded-[2rem] border-2 border-emerald-100 dark:border-emerald-800/30">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-2xl text-white shadow-lg">💬</div>
                      <h4 className="font-black text-emerald-900 dark:text-emerald-300">رقم واتساب الوكالة</h4>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">رقم التواصل</label>
                      <input type="tel" className="w-full bg-white dark:bg-slate-800 p-4 rounded-xl font-black text-sm outline-none tabular-nums text-slate-800 dark:text-white" value={userData.whatsapp_number || ''} onChange={e => setUserData({...userData, whatsapp_number: e.target.value})} />
                    </div>
                 </div>
                 <div className="bg-indigo-50 dark:bg-indigo-950/20 p-6 rounded-[2rem] border-2 border-indigo-100 dark:border-indigo-800/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center text-2xl text-white shadow-lg">🎙️</div>
                        <h4 className="font-black text-indigo-900 dark:text-indigo-300">المساعد الصوتي السحابي</h4>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={userData.enable_voice_ai || false} onChange={e => setUserData({...userData, enable_voice_ai: e.target.checked})} />
                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="p-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <section className="space-y-4">
                   <h4 className="font-black text-slate-900 dark:text-white px-2 flex items-center gap-2"><span>☁️</span> النسخ الاحتياطي السحابي</h4>
                   <button onClick={handleCloudBackup} disabled={isBackingUp} className="w-full bg-emerald-50 dark:bg-emerald-900/20 border-2 border-dashed border-emerald-500 text-emerald-700 dark:text-emerald-400 p-8 rounded-[2rem] font-black flex flex-col items-center gap-4 transition-all active:scale-95 disabled:opacity-50">
                     <span className="text-4xl">{isBackingUp ? '🔄' : '📤'}</span>
                     <div className="text-center">
                       <p className="text-lg">إنشاء نسخة احتياطية سحابية</p>
                       <p className="text-[10px] opacity-60">سيتم حفظ بياناتك بشكل آمن في سيرفر Supabase</p>
                     </div>
                   </button>
                 </section>
                 <div className="pt-6 border-t border-gray-100 dark:border-slate-800">
                   <button onClick={() => navigate('activity-log')} className="w-full bg-slate-100 dark:bg-slate-800 p-5 rounded-2xl font-black text-sm text-slate-600 dark:text-slate-400 flex items-center justify-center gap-3">
                     <span>🛡️</span> عرض سجل النشاطات السحابي
                   </button>
                 </div>
              </div>
            )}

            {activeTab === 'finance' && (
               <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800/30 mb-2">
                  <button onClick={applyStandardRates} className="w-full bg-white dark:bg-slate-800 p-4 rounded-xl border-2 border-emerald-500 text-emerald-600 font-black text-sm shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2">تطبيق الأسعار القياسية (430 / 425)</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">السعودي</label>
                    <input type="number" className="w-full bg-gray-50 dark:bg-slate-800 p-5 rounded-2xl font-black text-3xl text-center outline-none border-2 border-transparent focus:border-emerald-500 tabular-nums text-slate-800 dark:text-white" value={rates.SAR_TO_YER} onChange={e => setRates({...rates, SAR_TO_YER: parseFloat(e.target.value) || 0})} />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">العماني</label>
                    <input type="number" className="w-full bg-gray-50 dark:bg-slate-800 p-5 rounded-2xl font-black text-3xl text-center outline-none border-2 border-transparent focus:border-emerald-500 tabular-nums text-slate-800 dark:text-white" value={rates.OMR_TO_YER} onChange={e => setRates({...rates, OMR_TO_YER: parseFloat(e.target.value) || 0})} />
                  </div>
                </div>
                <button onClick={() => updateExchangeRates(rates)} className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black text-lg shadow-xl active:scale-95 transition-all">تحديث أسعار الصرف السحابية ⚡</button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
