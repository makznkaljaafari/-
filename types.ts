
export interface User {
  id: string;
  email: string;
  full_name: string;
  agency_name: string;
  whatsapp_number?: string;
  telegram_username?: string;
  enable_voice_ai?: boolean;
  auto_backup_interval?: BackupInterval;
  last_daily_recap?: string;
  created_at?: string;
}

export type BackupInterval = 'none' | 'daily' | '2days' | 'weekly' | 'monthly';

export interface ActivityLog {
  id: string;
  user_id?: string;
  action: string;
  details: string;
  timestamp: string;
  type: 'sale' | 'purchase' | 'voucher' | 'system' | 'waste';
}

export interface AppNotification {
  id: string;
  user_id?: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'info' | 'ai_alert';
  date: string;
  read: boolean;
}

export type Page = 'login' | 'dashboard' | 'sales' | 'add-sale' | 'purchases' | 'add-purchase' | 'customers' | 'add-customer' | 'suppliers' | 'add-supplier' | 'categories' | 'add-category' | 'vouchers' | 'add-voucher' | 'ai-advisor' | 'notifications' | 'expenses' | 'add-expense' | 'debts' | 'reports' | 'add-opening-balance' | 'settings' | 'scanner' | 'invoice-view' | 'waste' | 'add-waste' | 'activity-log';
export type Theme = 'light' | 'dark';

export interface ExchangeRates {
  SAR_TO_YER: number;
  OMR_TO_YER: number;
}

export interface Sale {
  id: string;
  user_id?: string;
  customer_id: string;
  customer_name: string;
  qat_type: string;
  quantity: number;
  unit_price: number;
  total: number;
  status: 'نقدي' | 'آجل';
  currency: 'YER' | 'SAR' | 'OMR';
  notes?: string;
  date: string;
  is_returned?: boolean;
  returned_at?: string;
  created_at?: string;
}

export interface Customer {
  id: string;
  user_id?: string;
  name: string;
  phone: string;
  address?: string;
  created_at?: string;
}

export interface Supplier {
  id: string;
  user_id?: string;
  name: string;
  phone: string;
  region?: string;
  created_at?: string;
}

export interface Purchase {
  id: string;
  user_id?: string;
  supplier_id: string;
  supplier_name: string;
  qat_type: string;
  quantity: number;
  unit_price: number;
  total: number;
  status: 'نقدي' | 'آجل';
  currency: 'YER' | 'SAR' | 'OMR';
  notes?: string;
  date: string;
  is_returned?: boolean;
  returned_at?: string;
  created_at?: string;
}

// Add missing VoucherEditEntry type
export interface VoucherEditEntry {
  date: string;
  previous_amount: number;
  previous_notes: string;
}

export interface Voucher {
  id: string;
  user_id?: string;
  type: 'قبض' | 'دفع';
  person_id: string;
  person_name: string;
  person_type: 'عميل' | 'مورد';
  amount: number;
  currency: 'YER' | 'SAR' | 'OMR';
  notes: string;
  date: string;
  // Update edit_history to use VoucherEditEntry
  edit_history?: VoucherEditEntry[];
  created_at?: string;
}

export interface QatCategory {
  id: string;
  user_id?: string;
  name: string;
  stock: number;
  price: number;
  currency: 'YER' | 'SAR' | 'OMR';
  low_stock_threshold: number;
  created_at?: string;
}

// Add missing ExpenseFrequency type
export type ExpenseFrequency = 'يومياً' | 'أسبوعياً' | 'شهرياً' | 'سنوياً';

export interface Expense {
  id: string;
  user_id?: string;
  title: string;
  category: string;
  amount: number;
  currency: 'YER' | 'SAR' | 'OMR';
  notes?: string;
  date: string;
  created_at?: string;
}

// Add missing ExpenseTemplate interface
export interface ExpenseTemplate {
  id: string;
  user_id?: string;
  title: string;
  category: string;
  amount: number;
  currency: 'YER' | 'SAR' | 'OMR';
  frequency: ExpenseFrequency;
  created_at?: string;
}

export interface Waste {
  id: string;
  user_id?: string;
  qat_type: string;
  quantity: number;
  estimated_loss: number;
  reason: string;
  date: string;
  created_at?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}
