import { Sale, Purchase, Voucher, Customer, Supplier } from "../types";

export const financeService = {
  /**
   * حساب مديونية عميل محدد بكافة العملات
   */
  getCustomerBalances(customerId: string, sales: Sale[], vouchers: Voucher[]) {
    const currencies = ['YER', 'SAR', 'OMR'] as const;
    return currencies.map(cur => {
      const totalSalesDebt = sales
        .filter(s => s.customer_id === customerId && s.status === 'آجل' && s.currency === cur && !s.is_returned)
        .reduce((sum, s) => sum + s.total, 0);
        
      const totalReceipts = vouchers
        .filter(v => v.person_id === customerId && v.type === 'قبض' && v.currency === cur)
        .reduce((sum, v) => sum + v.amount, 0);

      return { currency: cur, amount: totalSalesDebt - totalReceipts };
    });
  },

  /**
   * حساب مستحقات مورد محدد بكافة العملات
   */
  getSupplierBalances(supplierId: string, purchases: Purchase[], vouchers: Voucher[]) {
    const currencies = ['YER', 'SAR', 'OMR'] as const;
    return currencies.map(cur => {
      const totalPurchases = purchases
        .filter(p => p.supplier_id === supplierId && p.status === 'آجل' && p.currency === cur && !p.is_returned)
        .reduce((sum, p) => sum + p.total, 0);
        
      const totalPayments = vouchers
        .filter(v => v.person_id === supplierId && v.type === 'دفع' && v.currency === cur)
        .reduce((sum, v) => sum + v.amount, 0);

      return { currency: cur, amount: totalPurchases - totalPayments };
    });
  },

  /**
   * حساب ملخص الميزانية العامة (أصول وخصوم)
   */
  getGlobalBudgetSummary(customers: Customer[], suppliers: Supplier[], sales: Sale[], purchases: Purchase[], vouchers: Voucher[]) {
    const currencies = ['YER', 'SAR', 'OMR'] as const;
    return currencies.map(cur => {
      let totalAssets = 0; // ديون العملاء لنا
      let totalLiabilities = 0; // ديوننا للموردين

      customers.forEach(c => {
        const bal = this.getCustomerBalances(c.id, sales, vouchers).find(b => b.currency === cur);
        if (bal && bal.amount > 0) totalAssets += bal.amount;
      });

      suppliers.forEach(s => {
        const bal = this.getSupplierBalances(s.id, purchases, vouchers).find(b => b.currency === cur);
        if (bal && bal.amount > 0) totalLiabilities += bal.amount;
      });

      return {
        currency: cur,
        assets: totalAssets,
        liabilities: totalLiabilities,
        net: totalAssets - totalLiabilities
      };
    });
  }
};