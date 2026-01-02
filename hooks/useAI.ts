
import { useState, useCallback, useEffect } from 'react';
import { getQuickInsight, speakText, stopSpeaking } from '../services/geminiService';
import { Sale } from '../types';

export const useAIAdvisor = (sales: Sale[]) => {
  const [advice, setAdvice] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const fetchAdvice = useCallback(async () => {
    if (sales.length === 0) {
      setAdvice("لا توجد مبيعات كافية للتحليل حالياً. ابدأ بإضافة مبيعاتك!");
      return;
    }
    setIsLoading(true);
    const result = await getQuickInsight(sales);
    setAdvice(result);
    setIsLoading(false);
  }, [sales]);

  const toggleSpeech = useCallback(async () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }
    
    setIsSpeaking(true);
    const success = await speakText(advice, () => setIsSpeaking(false));
    if (!success) setIsSpeaking(false);
  }, [advice, isSpeaking]);

  useEffect(() => {
    fetchAdvice();
    return () => stopSpeaking();
  }, [fetchAdvice]);

  return { advice, isLoading, isSpeaking, toggleSpeech, refresh: fetchAdvice };
};
