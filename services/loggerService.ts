
export const logger = {
  error: (msg: string, err?: any) => {
    // يمكن هنا إضافة إرسال الأخطاء لخدمة مثل Sentry مستقبلاً
    console.error(`[ERROR] ${msg}`, err);
  },
  warn: (msg: string) => {
    console.warn(`[WARN] ${msg}`);
  },
  info: (msg: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[INFO] ${msg}`);
    }
  }
};
