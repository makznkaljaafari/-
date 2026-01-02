
import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Dashboard from './components/Dashboard';
import SalesList from './components/SalesList';
import AddSale from './components/AddSale';
import PurchasesList from './components/PurchasesList';
import AddPurchase from './components/AddPurchase';
import CustomersList from './components/CustomersList';
import AddCustomer from './components/AddCustomer';
import SuppliersList from './components/SuppliersList';
import AddSupplier from './components/AddSupplier';
import CategoriesList from './components/CategoriesList';
import AddCategory from './components/AddCategory';
import VouchersList from './components/VouchersList';
import AIAdvisor from './components/AIAdvisor';
import NotificationsPage from './components/NotificationsPage';
import ExpensesList from './components/ExpensesList';
import AddExpense from './components/AddExpense';
import DebtsReport from './components/DebtsReport';
import AddOpeningBalance from './components/AddOpeningBalance';
import Reports from './components/Reports';
import SettingsPage from './components/SettingsPage';
import BarcodeScanner from './components/BarcodeScanner';
import BottomNav from './components/BottomNav';
import VoiceAssistant from './components/VoiceAssistant';
import LoginPage from './components/LoginPage';
import VisualInvoice from './components/VisualInvoice';
import WasteList from './components/WasteList';
import AddWaste from './components/AddWaste';
import ActivityLogPage from './components/ActivityLogPage';
import { ToastContainer } from './components/ui/Toast';
import ErrorBoundary from './components/ErrorBoundary';

const SplashScreen = () => (
  <div className="fixed inset-0 bg-[#020617] flex flex-col items-center justify-center z-[100]">
    <div className="relative">
      <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
      <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-700 rounded-[2rem] flex items-center justify-center text-5xl shadow-2xl animate-bounce-soft relative z-10 border-4 border-white/10">
        🌿
      </div>
    </div>
    <div className="mt-8 flex flex-col items-center gap-2">
      <h2 className="text-white font-black text-xl tracking-tighter">وكالة الشويع للقات</h2>
      <div className="flex gap-1">
        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></div>
        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      </div>
      <p className="text-white/20 text-[8px] font-black uppercase tracking-[0.3em] mt-4">جاري التحقق من الجلسة السحابية</p>
    </div>
  </div>
);

const AppContent = () => {
  const { currentPage, theme, isLoggedIn, isCheckingSession, activeToasts, removeToast } = useApp();

  if (isCheckingSession) return <SplashScreen />;

  const renderPage = () => {
    if (!isLoggedIn) return <LoginPage />;

    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'sales': return <SalesList />;
      case 'add-sale': return <AddSale />;
      case 'purchases': return <PurchasesList />;
      case 'add-purchase': return <AddPurchase />;
      case 'customers': return <CustomersList />;
      case 'add-customer': return <AddCustomer />;
      case 'suppliers': return <SuppliersList />;
      case 'add-supplier': return <AddSupplier />;
      case 'categories': return <CategoriesList />;
      case 'add-category': return <AddCategory />;
      case 'vouchers': return <VouchersList />;
      case 'expenses': return <ExpensesList />;
      case 'add-expense': return <AddExpense />;
      case 'waste': return <WasteList />;
      case 'add-waste': return <AddWaste />;
      case 'debts': return <DebtsReport />;
      case 'add-opening-balance': return <AddOpeningBalance />;
      case 'reports': return <Reports />;
      case 'settings': return <SettingsPage />;
      case 'ai-advisor': return <AIAdvisor />;
      case 'notifications': return <NotificationsPage />;
      case 'scanner': return <BarcodeScanner />;
      case 'invoice-view': return <VisualInvoice />;
      case 'activity-log': return <ActivityLogPage />;
      case 'login': return <LoginPage />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col relative overflow-hidden w-full transition-colors duration-500 ${theme === 'dark' ? 'dark bg-slate-950' : 'bg-gray-100'}`}>
      <ToastContainer toasts={activeToasts} removeToast={removeToast} />
      {renderPage()}
      {isLoggedIn && <BottomNav />}
      {isLoggedIn && <VoiceAssistant />}
    </div>
  );
};

const App = () => (
  <ErrorBoundary>
    <AppProvider>
      <AppContent />
    </AppProvider>
  </ErrorBoundary>
);

export default App;
