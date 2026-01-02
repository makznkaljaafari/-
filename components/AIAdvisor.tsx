
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';
import { getChatResponse } from '../services/geminiService';
import { ChatMessage } from '../types';
import { useAIProcessor } from '../hooks/useAIProcessor';

const AIAdvisor: React.FC = () => {
  const { sales, customers, purchases, vouchers, categories, suppliers, exchangeRates, navigate } = useApp();
  const { 
    pendingAction, setPendingAction, ambiguityMatches, setAmbiguityMatches, 
    debtWarning, errorInfo, validateToolCall, executeAction 
  } = useAIProcessor();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome', role: 'model',
        text: 'أهلاً يا مدير. أنا محاسبك الخارق وجاهز لإدارة كل شيء: (بيع، شراء، ديون، حذف، تعديل، مراسلة، أو نسخ احتياطي). كيف أخدمك؟',
        timestamp: new Date().toISOString()
      }]);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping, pendingAction, ambiguityMatches, errorInfo]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const aiResponse = await getChatResponse(input, messages, { sales, customers, purchases, vouchers, categories, suppliers, rates: exchangeRates });
      
      if (aiResponse.toolCalls && aiResponse.toolCalls.length > 0) {
        const tool = aiResponse.toolCalls[0];
        if (validateToolCall(tool.name, tool.args)) {
          setPendingAction(tool);
        }
      }

      const modelMsg: ChatMessage = { 
        id: (Date.now() + 1).toString(), role: 'model', 
        text: aiResponse.text || "أبشر يا مدير، جاري التجهيز...", 
        timestamp: new Date().toISOString() 
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch (err) {
      setMessages(prev => [...prev, { id: 'err', role: 'model', text: 'عذراً، حصل خلل فني. حاول ثانية.', timestamp: new Date().toISOString() }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <PageLayout title="المحاسب الخارق" onBack={() => navigate('dashboard')} headerGradient="from-indigo-900 via-slate-900 to-black">
      <div className="flex flex-col h-[78vh] max-w-2xl mx-auto space-y-4">
        
        <div ref={scrollRef} className="flex-1 bg-white/40 dark:bg-slate-950/40 rounded-[2.5rem] p-5 overflow-y-auto no-scrollbar space-y-6 backdrop-blur-md shadow-inner">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[85%] p-5 rounded-[2.2rem] shadow-sm ${
                m.role === 'user' ? 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white rounded-bl-none' : 'bg-indigo-600 text-white rounded-br-none'
              }`}>
                <p className="font-bold text-sm leading-relaxed">{m.text}</p>
              </div>
            </div>
          ))}
          {isTyping && <div className="flex justify-end p-2 animate-pulse text-indigo-500 font-black">جاري التفكير...</div>}
        </div>

        {/* واجهة التأكيد والخطأ */}
        {(pendingAction || errorInfo || ambiguityMatches.length > 0) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[3rem] p-8 shadow-2xl border-2 border-white/10 overflow-hidden">
              
              {errorInfo ? (
                <div className="text-center space-y-6">
                  <span className="text-6xl">⚠️</span>
                  <h3 className="text-xl font-black text-rose-600">تعذر التنفيذ</h3>
                  <p className="font-bold text-slate-500">{errorInfo}</p>
                  <button onClick={() => setPendingAction(null)} className="w-full bg-slate-100 dark:bg-slate-800 py-4 rounded-2xl font-black">فهمت</button>
                </div>
              ) : pendingAction ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-4xl shadow-lg">⚡</div>
                    <div className="text-right">
                      <h4 className="font-black text-lg text-slate-900 dark:text-white">تأكيد العملية</h4>
                      <p className="text-[10px] font-black text-indigo-500 uppercase">مراجعة المحاسب الذكي</p>
                    </div>
                  </div>

                  {debtWarning && <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-xs font-black text-center">⚠️ ديون سابقة: {debtWarning.toLocaleString()} YER</div>}

                  <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl space-y-3">
                    {Object.entries(pendingAction.args).map(([k, v]: any) => (
                      <div key={k} className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2">
                        <span className="text-[9px] font-black text-slate-400 uppercase">{k}</span>
                        <span className="font-black text-indigo-600 text-sm">{String(v)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => executeAction()} className="flex-[2] bg-indigo-600 text-white py-6 rounded-2xl font-black shadow-xl">تأكيد القيد ✅</button>
                    <button onClick={() => setPendingAction(null)} className="flex-1 bg-slate-200 dark:bg-slate-800 text-slate-500 py-6 rounded-2xl font-black">إلغاء</button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}

        <form onSubmit={handleSend} className="relative">
          <input 
            type="text" 
            className="w-full bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 pr-8 pl-24 font-black text-slate-800 dark:text-white shadow-2xl outline-none" 
            value={input} onChange={e => setInput(e.target.value)} 
            placeholder="اطلب أي شيء (بيع، حذف، نسخ، مراسلة)..." 
          />
          <button type="submit" disabled={isTyping} className="absolute left-3 top-1/2 -translate-y-1/2 w-16 h-16 bg-indigo-600 text-white rounded-full shadow-lg active:scale-90 transition-all flex items-center justify-center">
            🚀
          </button>
        </form>
      </div>
    </PageLayout>
  );
};

export default AIAdvisor;
