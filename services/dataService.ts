
import { supabase } from './supabaseClient';
import { logger } from './loggerService';
import { 
  Sale, Customer, Purchase, Supplier, QatCategory, 
  Voucher, Expense, Waste, AppNotification, ActivityLog, ExpenseTemplate
} from "../types";

const withRetry = async <T>(fn: () => Promise<T>, retries = 3, delay = 1500): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    const errorMsg = error.message || "";
    const isNetworkError = 
      errorMsg.includes('Failed to fetch') || 
      error.name === 'TypeError' || 
      error.status === 0 ||
      error.status === 502 || 
      error.status === 503;

    if (retries > 0 && isNetworkError) {
      logger.warn(`إعادة محاولة الاتصال... تبقى ${retries} محاولات`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    
    if (error.status === 401) {
      const { data } = await supabase.auth.refreshSession();
      if (data.session) return withRetry(fn, 1, 500);
    }

    logger.error("خطأ في خدمة البيانات:", error);
    throw error;
  }
};

export const dataService = {
  async getUserId() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id;
    } catch (e) {
      return null;
    }
  },

  async ensureUserExists(userId: string) {
    return withRetry(async () => {
      const { data: profile, error } = await supabase.from('users').select('id').eq('id', userId).maybeSingle();
      if (error) throw error;
      
      if (!profile) {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const { error: upsertError } = await supabase.from('users').upsert({
            id: userId,
            email: authUser.email,
            full_name: authUser.user_metadata?.full_name || 'مدير جديد',
            agency_name: authUser.user_metadata?.agency_name || 'وكالة الشويع للقات'
          });
          if (upsertError) throw upsertError;

          await supabase.from('user_settings').upsert({
            user_id: userId,
            theme: 'light',
            currency_preference: 'YER',
            exchange_rates: { SAR_TO_YER: 430, OMR_TO_YER: 425 }
          });
        }
      }
    });
  },

  async getFullProfile(userId: string) {
    return withRetry(async () => {
      const [userRes, settingsRes] = await Promise.all([
        supabase.from('users').select('*').eq('id', userId).maybeSingle(),
        supabase.from('user_settings').select('*').eq('user_id', userId).maybeSingle()
      ]);
      if (userRes.error) throw userRes.error;
      return { ...userRes.data, ...settingsRes.data };
    });
  },

  async getCategories() {
    return withRetry(async () => {
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (error) throw error;
      return data || [];
    });
  },

  async getSales() {
    return withRetry(async () => {
      const { data, error } = await supabase.from('sales').select('*').order('date', { ascending: false });
      if (error) throw error;
      return data || [];
    });
  },

  async getPurchases() {
    return withRetry(async () => {
      const { data, error } = await supabase.from('purchases').select('*').order('date', { ascending: false });
      if (error) throw error;
      return data || [];
    });
  },

  async getVouchers() {
    return withRetry(async () => {
      const { data, error } = await supabase.from('vouchers').select('*').order('date', { ascending: false });
      if (error) throw error;
      return data || [];
    });
  },

  async getCustomers() {
    return withRetry(async () => {
      const { data, error } = await supabase.from('customers').select('*').order('name');
      if (error) throw error;
      return data || [];
    });
  },

  async getSuppliers() {
    return withRetry(async () => {
      const { data, error } = await supabase.from('suppliers').select('*').order('name');
      if (error) throw error;
      return data || [];
    });
  },

  async getExpenses() {
    return withRetry(async () => {
      const { data, error } = await supabase.from('expenses').select('*').order('date', { ascending: false });
      if (error) throw error;
      return data || [];
    });
  },

  async getWaste() {
    return withRetry(async () => {
      const { data, error } = await supabase.from('waste').select('*').order('date', { ascending: false });
      if (error) throw error;
      return data || [];
    });
  },

  async getNotifications() {
    return withRetry(async () => {
      const { data, error } = await supabase.from('notifications').select('*').order('date', { ascending: false }).limit(20);
      if (error) throw error;
      return data || [];
    });
  },

  async getActivityLogs() {
    return withRetry(async () => {
      const { data, error } = await supabase.from('activity_logs').select('*').order('timestamp', { ascending: false }).limit(50);
      if (error) throw error;
      return data || [];
    });
  },

  async getExpenseTemplates() {
    return withRetry(async () => {
      const { data, error } = await supabase.from('expense_templates').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    });
  },

  // Fix: Added missing saveExpenseTemplate method
  async saveExpenseTemplate(template: Partial<ExpenseTemplate>) {
    return withRetry(async () => {
      const userId = await this.getUserId();
      const { data, error } = await supabase.from('expense_templates').insert([{ ...template, user_id: userId }]).select().single();
      if (error) throw error;
      return data;
    });
  },

  async saveSale(sale: Partial<Sale>) {
    return withRetry(async () => {
      const userId = await this.getUserId();
      const { data, error } = await supabase.from('sales').insert([{ ...sale, user_id: userId }]).select().single();
      if (error) throw error;
      return data;
    });
  },

  async saveVoucher(voucher: Partial<Voucher>) {
    return withRetry(async () => {
      const userId = await this.getUserId();
      const { data, error } = await supabase.from('vouchers').insert([{ ...voucher, user_id: userId }]).select().single();
      if (error) throw error;
      return data;
    });
  },

  async saveExpense(expense: Partial<Expense>) {
    return withRetry(async () => {
      const userId = await this.getUserId();
      const { data, error } = await supabase.from('expenses').insert([{ ...expense, user_id: userId }]).select().single();
      if (error) throw error;
      return data;
    });
  },

  async saveCustomer(customer: Partial<Customer>) {
    return withRetry(async () => {
      const userId = await this.getUserId();
      const { data, error } = await supabase.from('customers').insert([{ ...customer, user_id: userId }]).select().single();
      if (error) throw error;
      return data;
    });
  },

  async saveSupplier(supplier: Partial<Supplier>) {
    return withRetry(async () => {
      const userId = await this.getUserId();
      const { data, error } = await supabase.from('suppliers').insert([{ ...supplier, user_id: userId }]).select().single();
      if (error) throw error;
      return data;
    });
  },

  async saveCategory(cat: Partial<QatCategory>) {
    return withRetry(async () => {
      const userId = await this.getUserId();
      const { data, error } = await supabase.from('categories').upsert([{ ...cat, user_id: userId }]).select().single();
      if (error) throw error;
      return data;
    });
  },

  async saveNotification(notification: Partial<AppNotification>) {
    return withRetry(async () => {
      const userId = await this.getUserId();
      const { data, error } = await supabase.from('notifications').insert([{ ...notification, user_id: userId }]).select().single();
      if (error) throw error;
      return data;
    });
  },

  async markAllNotificationsRead() {
    return withRetry(async () => {
      const userId = await this.getUserId();
      await supabase.from('notifications').update({ read: true }).eq('user_id', userId);
    });
  },

  async saveLog(action: string, details: string, type: string) {
    try {
      const userId = await this.getUserId();
      if (userId) {
        await supabase.from('activity_logs').insert([{ user_id: userId, action, details, type }]);
      }
    } catch (e) {
      logger.error("فشل تسجيل اللوغ:", e);
    }
  },

  async deleteRecord(table: string, id: string) {
    return withRetry(async () => {
      const userId = await this.getUserId();
      const { error } = await supabase.from(table).delete().eq('id', id).eq('user_id', userId);
      if (error) throw error;
      return true;
    });
  },

  async updateRecord(table: string, id: string, updates: any) {
    return withRetry(async () => {
      const userId = await this.getUserId();
      const { error } = await supabase.from(table).update(updates).eq('id', id).eq('user_id', userId);
      if (error) throw error;
      return true;
    });
  },

  async returnSale(saleId: string) {
    return withRetry(async () => {
      const userId = await this.getUserId();
      const { error } = await supabase.rpc('return_sale', { sale_uuid: saleId, user_uuid: userId });
      if (error) throw error;
    });
  },

  async returnPurchase(purchaseId: string) {
    return withRetry(async () => {
      const userId = await this.getUserId();
      const { error } = await supabase.rpc('return_purchase', { purchase_uuid: purchaseId, user_uuid: userId });
      if (error) throw error;
    });
  },

  async getOpeningBalances() {
    return withRetry(async () => {
      const { data, error } = await supabase.from('opening_balances').select('*');
      if (error) throw error;
      return data || [];
    });
  },

  async saveOpeningBalance(balance: any) {
    return withRetry(async () => {
      const userId = await this.getUserId();
      const { data, error } = await supabase.from('opening_balances').insert([{ ...balance, user_id: userId }]).select().single();
      if (error) throw error;
      return data;
    });
  },

  async updateProfile(userId: string, updates: any) {
    return withRetry(async () => {
      const { error } = await supabase.from('users').update(updates).eq('id', userId);
      if (error) throw error;
    });
  },

  async updateSettings(userId: string, updates: any) {
    return withRetry(async () => {
      const { error } = await supabase.from('user_settings').update(updates).eq('user_id', userId);
      if (error) throw error;
    });
  },

  async getFinancialSummary(startDate: string, endDate: string) {
    return withRetry(async () => {
      const { data, error } = await supabase.rpc('get_financial_summary', { p_start_date: startDate, p_end_date: endDate });
      if (error) throw error;
      return data || [];
    });
  }
};
