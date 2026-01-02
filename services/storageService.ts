
/**
 * تم تعطيل هذا الملف. التطبيق الآن يعتمد على التصدير والاستيراد المحلي للملفات.
 */
export const storageService = {
  async uploadFile() { return { error: "Backend disabled" }; },
  getPublicUrl() { return ""; },
  async deleteFile() { return false; },
  async uploadBackup() { return { error: "Backend disabled" }; }
};
