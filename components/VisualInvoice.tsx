
import React from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';
import { formatSaleInvoice, shareToWhatsApp } from '../services/shareService';

const VisualInvoice: React.FC = () => {
  const { navigationParams, navigate, user } = useApp();
  const sale = navigationParams?.sale;

  if (!sale) { navigate('sales'); return null; }

  const handleShare = () => {
    const text = formatSaleInvoice(sale, user?.agency_name || 'وكالة الشويع');
    shareToWhatsApp(text);
  };

  return (
    <PageLayout title="إيصال المبيعات" onBack={() => navigate('sales')} headerGradient="from-slate-900 to-slate-800">
      <div className="flex flex-col items-center pt-6 space-y-8 page-enter">
        
        {/* تصميم الفاتورة الورقية الحرارية */}
        <div className="w-full max-w-[80mm] bg-white text-black p-6 shadow-2xl rounded-sm relative receipt-paper border-t-4 border-black">
           <div className="text-center border-b-2 border-black pb-4 mb-4">
              <h2 className="text-xl font-black">{user?.agency_name || 'وكالة الشويع'}</h2>
              <p className="text-[9px] font-bold">فرع المبيعات المركزية</p>
              <p className="text-[8px] mt-1">{new Date(sale.date).toLocaleString('ar-YE')}</p>
           </div>

           <div className="space-y-3 text-sm">
              <div className="flex justify-between font-black border-b border-gray-200 pb-2">
                 <span>العميل:</span>
                 <span>{sale.customer_name}</span>
              </div>

              <table className="w-full text-right text-xs">
                 <thead>
                    <tr className="border-b-2 border-black">
                       <th className="py-2">الصنف</th>
                       <th className="py-2 text-center">كمية</th>
                       <th className="py-2 text-left">سعر</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                    <tr className="font-bold">
                       <td className="py-3">{sale.qat_type}</td>
                       <td className="py-3 text-center">{sale.quantity}</td>
                       <td className="py-3 text-left">{sale.unit_price.toLocaleString()}</td>
                    </tr>
                 </tbody>
              </table>

              <div className="border-t-2 border-black pt-4 mt-4 space-y-2">
                 <div className="flex justify-between font-black text-lg">
                    <span>الإجمالي:</span>
                    <span>{sale.total.toLocaleString()} {sale.currency}</span>
                 </div>
                 <div className="flex justify-between text-[10px] font-bold">
                    <span>طريقة الدفع:</span>
                    <span>{sale.status}</span>
                 </div>
              </div>
           </div>

           <div className="mt-8 pt-4 border-t border-dashed border-black text-center space-y-3">
              <div className="flex justify-center grayscale">
                 <div className="w-16 h-16 bg-black p-1">
                    <div className="w-full h-full bg-white grid grid-cols-4 grid-rows-4 gap-1 p-0.5">
                       {Array.from({length:16}).map((_,i) => <div key={i} className={`rounded-sm ${Math.random() > 0.4 ? 'bg-black' : 'bg-white'}`}></div>)}
                    </div>
                 </div>
              </div>
              <p className="text-[8px] font-black leading-tight uppercase">
                 نظام وكالة الشويع الذكي<br/>شكرًا لزيارتكم
              </p>
           </div>
           
           {/* تأثير الورق المقطوع في الأسفل */}
           <div className="absolute -bottom-2 left-0 right-0 h-4 bg-[radial-gradient(circle,transparent_0,transparent_4px,white_4px,white_100%)] bg-[length:12px_12px] rotate-180"></div>
        </div>

        {/* أزرار الإجراءات */}
        <div className="flex gap-4 w-full max-w-sm no-print">
           <button onClick={handleShare} className="flex-1 bg-green-600 text-white p-5 rounded-3xl font-black shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 border-b-4 border-green-800">
              <span>واتساب</span>
              <span className="text-xl">💬</span>
           </button>
           <button onClick={() => window.print()} className="flex-1 bg-slate-900 text-white p-5 rounded-3xl font-black shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 border-b-4 border-black">
              <span>طباعة حرارية</span>
              <span className="text-xl">📄</span>
           </button>
        </div>

        <button onClick={() => navigate('dashboard')} className="text-slate-400 font-bold text-sm underline pb-10 no-print">العودة للرئيسية</button>
      </div>
    </PageLayout>
  );
};

export default VisualInvoice;
