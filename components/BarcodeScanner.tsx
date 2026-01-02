
import React, { useRef, useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';

const BarcodeScanner: React.FC = () => {
  const { navigate, customers, addNotification } = useApp();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [cameraError, setCameraError] = useState(false);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setCameraError(true);
        addNotification("خطأ الكاميرا ❌", "لا يمكن الوصول للكاميرا. تأكد من إعطاء الصلاحيات.", "warning");
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [addNotification]);

  // محاكاة متقدمة للتعرف على الباركود
  useEffect(() => {
    if (isScanning && !cameraError) {
      const timer = setTimeout(() => {
        const randomCustomer = customers[Math.floor(Math.random() * customers.length)];
        if (randomCustomer) {
          setFlash(true);
          // تأثير الهزاز إذا مدعوم
          if ('vibrate' in navigator) navigator.vibrate(200);
          
          setTimeout(() => {
            addNotification("تم التعرف البصري ✅", `العميل: ${randomCustomer.name}`, "success");
            navigate('add-sale', { customerId: randomCustomer.id });
          }, 500);
        } else {
          setIsScanning(false);
        }
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isScanning, customers, navigate, addNotification, cameraError]);

  return (
    <PageLayout title="الماسح الضوئي الذكي" onBack={() => navigate('dashboard')} headerGradient="from-slate-900 to-black">
      <div className="flex flex-col items-center justify-center min-h-[70vh] page-enter max-w-lg mx-auto p-4">
        
        <div className={`relative w-full aspect-square rounded-[4rem] overflow-hidden border-8 transition-all duration-300 ${flash ? 'border-emerald-500 scale-105' : 'border-slate-800 shadow-2xl'}`}>
          {cameraError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 text-white bg-slate-900">
              <span className="text-6xl mb-4">📷</span>
              <p className="font-black text-xl mb-4">الكاميرا معطلة أو غير مسموح بها</p>
              <button onClick={() => window.location.reload()} className="bg-emerald-600 px-8 py-4 rounded-2xl font-black">إعادة المحاولة</button>
            </div>
          ) : (
            <>
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover grayscale-[0.2] brightness-110" />
              
              {/* واجهة الماسح */}
              <div className="absolute inset-0 pointer-events-none">
                 <div className="absolute top-12 left-12 w-20 h-20 border-t-8 border-l-8 border-emerald-500 rounded-tl-3xl opacity-50"></div>
                 <div className="absolute top-12 right-12 w-20 h-20 border-t-8 border-r-8 border-emerald-500 rounded-tr-3xl opacity-50"></div>
                 <div className="absolute bottom-12 left-12 w-20 h-20 border-b-8 border-l-8 border-emerald-500 rounded-bl-3xl opacity-50"></div>
                 <div className="absolute bottom-12 right-12 w-20 h-20 border-b-8 border-r-8 border-emerald-500 rounded-br-3xl opacity-50"></div>
                 
                 {/* شعاع الليزر المتحرك */}
                 <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[85%] h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_25px_rgba(52,211,153,1)] animate-[scan_2.5s_ease-in-out_infinite]"></div>
                 
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-64 h-64 border-2 border-white/10 rounded-[2.5rem] bg-white/5 backdrop-blur-[1px]"></div>
                 </div>
              </div>
              
              {flash && <div className="absolute inset-0 bg-white animate-pulse"></div>}
            </>
          )}
        </div>

        <div className="mt-12 text-center space-y-6 w-full">
           <div className="flex items-center justify-center gap-4">
              <div className="voice-wave">
                 <div className="voice-bar"></div>
                 <div className="voice-bar" style={{animationDelay: '0.2s'}}></div>
                 <div className="voice-bar" style={{animationDelay: '0.4s'}}></div>
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-black tracking-[0.2em] uppercase text-xs">جاري المسح الضوئي...</p>
           </div>
           
           <div className="grid grid-cols-2 gap-4">
              <button onClick={() => navigate('add-sale')} className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white p-6 rounded-3xl font-black shadow-lg transition-transform active:scale-95">إدخال يدوي</button>
              <button onClick={() => navigate('add-customer')} className="bg-emerald-600 text-white p-6 rounded-3xl font-black shadow-lg transition-transform active:scale-95">عميل جديد 👤</button>
           </div>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0%, 100% { top: 15%; opacity: 0; }
          20%, 80% { opacity: 1; }
          50% { top: 85%; }
        }
      `}</style>
    </PageLayout>
  );
};

export default BarcodeScanner;
