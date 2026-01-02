
import { useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { financeService } from '../services/financeService';
import { shareToWhatsApp, formatCustomerStatement, formatSupplierStatement } from '../services/shareService';

export const useAIProcessor = () => {
  const { 
    sales, customers, purchases, vouchers, suppliers, categories, exchangeRates,
    addSale, addPurchase, addVoucher, addExpense, returnSale, returnPurchase, 
    addCustomer, addSupplier, deleteCustomer, deleteSupplier, deleteSale, deletePurchase,
    deleteVoucher, updateVoucher, updateExchangeRates, createCloudBackup, addNotification,
    addCategory, deleteCategory, updateCategory
  } = useApp();

  const [pendingAction, setPendingAction] = useState<any>(null);
  const [ambiguityMatches, setAmbiguityMatches] = useState<any[]>([]);
  const [debtWarning, setDebtWarning] = useState<number | null>(null);
  const [errorInfo, setErrorInfo] = useState<string | null>(null);

  const validateToolCall = useCallback((name: string, args: any) => {
    setErrorInfo(null);
    setDebtWarning(null);
    setAmbiguityMatches([]);

    // التحقق من تكرار الأشخاص (عميل/مورد)
    if (name === 'managePerson' && args.action === 'إضافة') {
      const list = args.type === 'عميل' ? customers : suppliers;
      const exists = list.some(p => p.name.trim() === args.name.trim());
      if (exists) {
        setErrorInfo(`خطأ: ال${args.type} "${args.name}" موجود مسبقاً في النظام.`);
        return false;
      }
    }

    // التحقق من تكرار الأصناف (المواد)
    if (name === 'manageCategory' && args.action === 'إضافة') {
      const exists = categories.some(cat => cat.name.trim() === args.name.trim());
      if (exists) {
        setErrorInfo(`خطأ: صنف القات "${args.name}" موجود مسبقاً في المخزون.`);
        return false;
      }
    }

    // التحقق من المبيعات (يجب أن يكون العميل مسجلاً)
    if (name === 'recordSale') {
      const match = customers.find(c => c.name.trim() === args.customer_name.trim() || c.name.includes(args.customer_name));
      if (!match) {
        setErrorInfo(`العميل "${args.customer_name}" غير مسجل. يرجى إضافته أولاً.`);
        return false;
      }
      const debts = financeService.getCustomerBalances(match.id, sales, vouchers);
      const yerDebt = debts.find(b => b.currency === (args.currency || 'YER'))?.amount || 0;
      if (yerDebt > 0) setDebtWarning(yerDebt);
    }

    // التحقق من المرتجعات
    if (name === 'recordReturn') {
      if (args.operation_type === 'بيع') {
        const hasInvoice = sales.some(s => s.customer_name.includes(args.person_name) && !s.is_returned && (args.qat_type ? s.qat_type.includes(args.qat_type) : true));
        if (!hasInvoice) {
          setErrorInfo(`لا توجد فاتورة مبيعات نشطة لـ "${args.person_name}" لإرجاعها.`);
          return false;
        }
      } else {
        const hasInvoice = purchases.some(p => p.supplier_name.includes(args.person_name) && !p.is_returned);
        if (!hasInvoice) {
          setErrorInfo(`لا توجد فاتورة مشتريات لـ "${args.person_name}" لإرجاعها.`);
          return false;
        }
      }
    }

    return true;
  }, [customers, suppliers, sales, vouchers, purchases, categories]);

  const executeAction = useCallback(async (forcedId?: string) => {
    if (!pendingAction) return;
    const { name, args } = pendingAction;

    try {
      switch (name) {
        case 'recordSale':
          const cust = forcedId ? customers.find(c => c.id === forcedId) : customers.find(c => c.name.includes(args.customer_name));
          await addSale({ ...args, customer_id: cust.id, customer_name: cust.name, total: args.quantity * args.unit_price, date: new Date().toISOString() });
          break;

        case 'recordReturn':
          if (args.operation_type === 'بيع') {
            const sale = sales.find(s => s.customer_name.includes(args.person_name) && !s.is_returned);
            await returnSale(sale.id);
          } else {
            const pur = purchases.find(p => p.supplier_name.includes(args.person_name) && !p.is_returned);
            await returnPurchase(pur.id);
          }
          break;

        case 'managePerson':
          if (args.action === 'إضافة') {
            if (args.type === 'عميل') await addCustomer({ name: args.name, phone: args.phone || '', address: args.address_region || '' });
            else await addSupplier({ name: args.name, phone: args.phone || '', region: args.address_region || '' });
          } else if (args.action === 'حذف') {
            const person = (args.type === 'عميل' ? customers : suppliers).find(p => p.name.includes(args.name));
            if (person) args.type === 'عميل' ? await deleteCustomer(person.id) : await deleteSupplier(person.id);
          }
          break;

        case 'manageCategory':
          if (args.action === 'إضافة') {
            await addCategory({ name: args.name, price: args.price || 0, currency: args.currency || 'YER', stock: 0 });
          } else if (args.action === 'حذف') {
            const cat = categories.find(c => c.name.includes(args.name));
            if (cat) await deleteCategory(cat.id);
          }
          break;

        case 'recordVoucher':
          const list = args.type === 'قبض' ? customers : suppliers;
          const target = list.find(p => p.name.includes(args.person_name));
          if (target) await addVoucher({ ...args, person_id: target.id, person_name: target.name, person_type: args.type === 'قبض' ? 'عميل' : 'مورد', date: new Date().toISOString() });
          break;

        case 'systemControl':
          if (args.command === 'نسخ_احتياطي') await createCloudBackup();
          else if (args.command === 'تحديث_الصرف') await updateExchangeRates({ SAR_TO_YER: args.sar_rate || exchangeRates.SAR_TO_YER, OMR_TO_YER: args.omr_rate || exchangeRates.OMR_TO_YER });
          break;

        case 'sendMessage':
          const p = [...customers, ...suppliers].find(x => x.name.includes(args.person_name));
          if (p) {
            let text = "";
            if (args.message_type === 'كشف_حساب') {
              const isCust = customers.some(c => c.id === p.id);
              text = isCust ? formatCustomerStatement(p as any, sales, vouchers, financeService.getCustomerBalances(p.id, sales, vouchers)) : formatSupplierStatement(p as any, purchases, vouchers, financeService.getSupplierBalances(p.id, purchases, vouchers));
            } else {
              text = `تحية من وكالة الشويع.. نرجو مراجعة الحساب يا ${p.name}`;
            }
            shareToWhatsApp(text, (p as any).phone);
          }
          break;
      }

      addNotification("تم التنفيذ بنجاح ✅", "تم تحديث السجلات المالية السحابية.", "success");
      return true;
    } catch (err: any) {
      addNotification("خطأ ⚠️", err.message || "فشل التنفيذ.", "warning");
      return false;
    } finally {
      setPendingAction(null);
      setAmbiguityMatches([]);
      setErrorInfo(null);
    }
  }, [pendingAction, customers, suppliers, sales, purchases, addSale, addVoucher, createCloudBackup, updateExchangeRates, addNotification, exchangeRates, categories, addCustomer, addSupplier, deleteCustomer, deleteSupplier, addCategory, deleteCategory]);

  return {
    pendingAction, setPendingAction,
    ambiguityMatches, setAmbiguityMatches,
    debtWarning, errorInfo,
    validateToolCall, executeAction
  };
};
