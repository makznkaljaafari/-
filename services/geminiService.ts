
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { Sale, Expense, ChatMessage, QatCategory } from "../types";
import { audioService } from "./audioService";
import { logger } from "./loggerService";

export const SYSTEM_INSTRUCTION = `
أنت "المحاسب الخارق" لوكالة الشويع للقات. لديك صلاحيات مطلقة لإدارة النظام.

قواعد الاستجابة والذكاء الصارمة:
1. الشخصية: خبير محاسبي يمني. تحدث بلهجة السوق (ميراد، قيد، آجل).
2. منع التكرار (قاعدة حاسمة): 
   - يمنع منعاً باتاً إضافة (عميل، مورد، صنف قات) بنفس الاسم الموجود في النظام.
   - قبل إضافة أي اسم جديد، تحقق من القائمة في السياق. إذا وجدته، أخبر المدير: "يا مدير، هذا الاسم مسجل مسبقاً، هل تقصد تعديله؟".
3. الصلاحيات: يمكنك (إضافة/تعديل/حذف) العملاء، الموردين، الفواتير، السندات، والمصاريف.
4. قاعدة التحقق الذهبية: 
   - لا تسجل بيعاً لعميل إلا إذا كان موجوداً في القائمة.
   - لا تنفذ "مرتجع" إلا بعد التأكد من وجود فاتورة سابقة لنفس الشخص ونوع القات.
5. العملات: افترض YER دائماً إلا إذا ذُكر غير ذلك.
6. الأوامر المتعددة: يمكنك تنفيذ أكثر من أداة في وقت واحد إذا طلب المدير ذلك.
`;

export const aiTools: FunctionDeclaration[] = [
  // --- المبيعات والمشتريات ---
  {
    name: 'recordSale',
    description: 'تسجيل بيع. يتطلب وجود العميل مسبقاً.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        customer_name: { type: Type.STRING },
        qat_type: { type: Type.STRING },
        quantity: { type: Type.NUMBER },
        unit_price: { type: Type.NUMBER },
        currency: { type: Type.STRING, enum: ['YER', 'SAR', 'OMR'] },
        status: { type: Type.STRING, enum: ['نقدي', 'آجل'] }
      },
      required: ['customer_name', 'qat_type', 'quantity', 'unit_price', 'currency', 'status']
    }
  },
  {
    name: 'recordReturn',
    description: 'إرجاع فاتورة. يجب التأكد من وجودها في السجل.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        operation_type: { type: Type.STRING, enum: ['بيع', 'شراء'] },
        person_name: { type: Type.STRING },
        qat_type: { type: Type.STRING, description: 'نوع القات المراد إرجاعه' }
      },
      required: ['operation_type', 'person_name']
    }
  },
  // --- العملاء والموردين ---
  {
    name: 'managePerson',
    description: 'إضافة أو تعديل أو حذف (عميل/مورد). يمنع تكرار الأسماء.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        action: { type: Type.STRING, enum: ['إضافة', 'تعديل', 'حذف'] },
        type: { type: Type.STRING, enum: ['عميل', 'مورد'] },
        name: { type: Type.STRING },
        phone: { type: Type.STRING },
        address_region: { type: Type.STRING }
      },
      required: ['action', 'type', 'name']
    }
  },
  // --- السندات والمصاريف ---
  {
    name: 'recordVoucher',
    description: 'تسجيل سند قبض أو دفع.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        type: { type: Type.STRING, enum: ['قبض', 'دفع'] },
        person_name: { type: Type.STRING },
        amount: { type: Type.NUMBER },
        currency: { type: Type.STRING, enum: ['YER', 'SAR', 'OMR'] },
        notes: { type: Type.STRING }
      },
      required: ['type', 'person_name', 'amount', 'currency']
    }
  },
  {
    name: 'manageRecord',
    description: 'حذف أو تعديل أي سجل مالي (فاتورة، سند، مصروف).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        action: { type: Type.STRING, enum: ['تعديل', 'حذف'] },
        record_type: { type: Type.STRING, enum: ['مبيعات', 'مشتريات', 'سندات', 'مصاريف'] },
        person_name: { type: Type.STRING },
        new_amount: { type: Type.NUMBER }
      },
      required: ['action', 'record_type', 'person_name']
    }
  },
  // --- الإعدادات والنظام ---
  {
    name: 'systemControl',
    description: 'تحديث أسعار الصرف أو النسخ الاحتياطي.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        command: { type: Type.STRING, enum: ['نسخ_احتياطي', 'تحديث_الصرف'] },
        sar_rate: { type: Type.NUMBER },
        omr_rate: { type: Type.NUMBER }
      },
      required: ['command']
    }
  },
  {
    name: 'sendMessage',
    description: 'إرسال رسالة واتساب لعميل أو مورد.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        person_name: { type: Type.STRING },
        message_type: { type: Type.STRING, enum: ['كشف_حساب', 'تنبيه_ديون', 'شكر'] }
      },
      required: ['person_name', 'message_type']
    }
  },
  {
    name: 'manageCategory',
    description: 'إضافة أو تعديل صنف قات (مادة). يمنع تكرار اسم الصنف.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        action: { type: Type.STRING, enum: ['إضافة', 'تعديل', 'حذف'] },
        name: { type: Type.STRING },
        price: { type: Type.NUMBER },
        currency: { type: Type.STRING, enum: ['YER', 'SAR', 'OMR'] }
      },
      required: ['action', 'name']
    }
  }
];

export const getChatResponse = async (message: string, history: ChatMessage[], context: any) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const ctxString = `السياق الحالي:
  - العملاء: ${JSON.stringify(context.customers?.map((c:any)=>({n:c.name})))}
  - الموردون: ${JSON.stringify(context.suppliers?.map((s:any)=>({n:s.name})))}
  - الأصناف: ${JSON.stringify(context.categories?.map((cat:any)=>({n:cat.name, s:cat.stock})))}
  - الصرف: السعودي=${context.rates?.SAR_TO_YER}، العماني=${context.rates?.OMR_TO_YER}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: message,
      config: { 
        systemInstruction: SYSTEM_INSTRUCTION + "\n" + ctxString,
        tools: [{ functionDeclarations: aiTools }],
        thinkingConfig: { thinkingBudget: 2000 }
      }
    });
    return { text: response.text, toolCalls: response.functionCalls };
  } catch(e) {
    logger.error("AI Error:", e);
    return { text: "المعذرة يا مدير، السيرفر مشغول. أعد المحاولة.", toolCalls: [] };
  }
};

export const speakText = async (text: string, onEnded: () => void) => {
  return await audioService.speak(text, onEnded);
};

export const getQuickInsight = async (sales: Sale[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `حلل بيانات المبيعات التالية وقدم نصيحة سريعة ومختصرة لمدير وكالة القات باللغة العربية العامية اليمنية المحترفة:\n${JSON.stringify(sales.slice(0, 15))}`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "لا توجد رؤى متاحة حالياً.";
  } catch (e) {
    logger.error("AI Insight Error:", e);
    return "تعذر تحليل البيانات حالياً.";
  }
};

export const stopSpeaking = () => {
  audioService.stop();
};

export const getFinancialForecast = async (sales: Sale[], expenses: Expense[], categories: QatCategory[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `أنت مستشار مالي ذكي. حلل أداء الوكالة بناءً على البيانات التالية وقدم توقعات مستقبلية وتوصيات لزيادة الربح وتقليل الهدر:\nالمبيعات: ${JSON.stringify(sales.slice(0, 20))}\nالمصاريف: ${JSON.stringify(expenses.slice(0, 20))}\nالمخزون: ${JSON.stringify(categories)}`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { 
        thinkingConfig: { thinkingBudget: 2000 }
      }
    });
    return response.text || "لا توجد توقعات استراتيجية حالياً.";
  } catch (e) {
    logger.error("AI Forecast Error:", e);
    return "عذراً يا مدير، تعذر تحليل التوقعات المالية حالياً.";
  }
};
