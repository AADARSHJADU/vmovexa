import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';

export const PaymentProcessingModal = ({
  isOpen,
  onClose,
  data, // { id, title, customerName, amount, type }
  onPaymentSuccess,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('upi'); // default to UPI for fastest experience
  const [paymentStep, setPaymentStep] = useState('input'); // 'input' | 'processing' | 'success'
  const [selectedBank, setSelectedBank] = useState('HDFC');
  const [upiId, setUpiId] = useState('');

  const [cardData, setCardData] = useState({
    name: data?.customerName || '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  });

  const [transactionId, setTransactionId] = useState('');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setPaymentStep('input');
      setTransactionId(`TXN${Date.now()}`);
      if (data?.customerName) {
        setCardData(prev => ({ ...prev, name: data.customerName }));
      }
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, data]);

  if (!isOpen || !data) return null;

  const numericAmount = typeof data.amount === 'number'
    ? data.amount
    : Number(String(data.amount).replace(/[^0-9.]/g, '')) || 50000;

  const baseAmount = Math.round(numericAmount / 1.18);
  const gstAmount = numericAmount - baseAmount;


  const handlePay = (methodName) => {
    setPaymentStep('processing');

    setTimeout(() => {
      const result = {
        transactionId: transactionId || `TXN${Date.now()}`,
        utrNumber: `UTR-VMX-${Math.floor(100000000 + Math.random() * 900000000)}`,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        method: methodName,
        amount: numericAmount,
        customerName: data.customerName,
        itemId: data.id,
      };

      setPaymentStep('success');

      if (onPaymentSuccess) {
        onPaymentSuccess(result);
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={paymentStep === 'processing' ? undefined : onClose}
      />

      {/* Simplified, Modern Modal Box */}
      <div className="relative z-50 w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 my-auto">
        
        {/* Header */}
        <div className="p-5 pb-4 border-b border-slate-100 flex items-start justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                {paymentStep === 'success' ? t('payment.confirmed_title', 'Payment Confirmed') : t('payment.complete_title', 'Complete Payment')}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {t('payment.secured_badge', '🔒 Secured')}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5 truncate max-w-[280px]">
              {data.title || data.id}
            </p>
          </div>

          {paymentStep !== 'processing' && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {/* Amount Pill Bar */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs shrink-0">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              {t('payment.total_amount', 'Total Amount')}
            </span>
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              ₹{numericAmount.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="text-right text-[11px] text-slate-500">
            <div>{t('payment.base_amount', 'Base:')} <span className="font-semibold text-slate-700">₹{baseAmount.toLocaleString('en-IN')}</span></div>
            <div>{t('payment.gst_label', '+ 18% GST:')} <span className="font-semibold text-slate-700">₹{gstAmount.toLocaleString('en-IN')}</span></div>
          </div>
        </div>

        {/* STEP 1: PAYMENT INPUT FORM */}
        {paymentStep === 'input' && (
          <div className="p-5 space-y-4 text-xs overflow-y-auto flex-1">
            
            {/* Simple Method Tabs */}
            <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl">
              {[
                { id: 'upi', label: t('payment.method_upi', 'UPI / QR'), icon: '📱' },
                { id: 'card', label: t('payment.method_card', 'Card'), icon: '💳' },
                { id: 'netbanking', label: t('payment.method_netbanking', 'NetBanking'), icon: '🏦' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 rounded-lg font-bold text-center transition-all flex items-center justify-center gap-1 text-[11px] ${
                    activeTab === tab.id
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* TAB 1: UPI */}
            {activeTab === 'upi' && (
              <div className="space-y-3.5 pt-1">
                {/* Clean QR Box */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                  <div className="w-20 h-20 bg-slate-900 rounded-xl p-1.5 flex flex-col justify-between shrink-0 shadow-sm mx-auto sm:mx-0">
                    <div className="flex justify-between">
                      <div className="w-4 h-4 border-2 border-white bg-slate-900 rounded-xs"></div>
                      <div className="w-4 h-4 border-2 border-white bg-slate-900 rounded-xs"></div>
                    </div>
                    <div className="text-center text-[7px] font-mono text-white font-bold tracking-wider">
                      VMOVEXA
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="w-4 h-4 border-2 border-white bg-slate-900 rounded-xs"></div>
                      <div className="w-2.5 h-2.5 bg-emerald-400 rounded-xs"></div>
                    </div>
                  </div>

                  <div>
                    <p className="font-bold text-slate-900 text-xs">{t('payment.upi_scan_pay', 'Scan & Pay via Any UPI App')}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{t('payment.upi_apps', 'Google Pay, PhonePe, Paytm, BHIM')}</p>
                    <span className="inline-block mt-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {t('payment.zero_surcharge', 'Zero Surcharge')}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-bold text-[11px]">{t('payment.enter_upi_id', 'Or Enter UPI ID')}</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="username@upi"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handlePay(`UPI (${upiId})`)}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <span>{t('payment.pay_now', 'Pay')} ₹{numericAmount.toLocaleString('en-IN')}</span>
                  <span>→</span>
                </button>
              </div>
            )}

            {/* TAB 2: CARDS */}
            {activeTab === 'card' && (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-slate-600 font-bold text-[11px]">{t('payment.card_details', 'Card Details')}</label>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    value={cardData.cardNumber}
                    onChange={(e) => setCardData({ ...cardData, cardNumber: e.target.value })}
                    placeholder={t('payment.card_number_placeholder', 'Card Number')}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={cardData.expiry}
                      onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                      placeholder={t('payment.expiry_placeholder', 'MM/YY')}
                      className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="password"
                      maxLength={4}
                      value={cardData.cvv}
                      onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                      placeholder={t('payment.cvv_placeholder', 'CVV')}
                      className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <input
                    type="text"
                    value={cardData.name}
                    onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                    placeholder={t('payment.cardholder_name', 'Cardholder Name')}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handlePay(`Card (•••• ${cardData.cardNumber.slice(-4)})`)}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <span>{t('payment.pay_now', 'Pay')} ₹{numericAmount.toLocaleString('en-IN')}</span>
                  <span>→</span>
                </button>
              </div>
            )}

            {/* TAB 3: NET BANKING */}
            {activeTab === 'netbanking' && (
              <div className="space-y-3 pt-1">
                <label className="text-slate-600 font-bold text-[11px] block">{t('payment.choose_bank', 'Choose Your Bank')}</label>
                
                <div className="grid grid-cols-2 gap-2">
                  {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank'].map(bank => (
                    <button
                      key={bank}
                      type="button"
                      onClick={() => setSelectedBank(bank)}
                      className={`p-3 rounded-xl border text-left font-bold transition-all ${
                        selectedBank === bank
                          ? 'border-blue-500 bg-blue-50 text-blue-900 ring-1 ring-blue-500'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-xs">{bank}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{t('payment.instant_authorization', 'Instant Authorization')}</div>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handlePay(`${selectedBank} NetBanking`)}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 mt-2"
                >
                  <span>{t('payment.pay_now', 'Pay')} ₹{numericAmount.toLocaleString('en-IN')} {t('payment.pay_with', 'with')} {selectedBank}</span>
                  <span>→</span>
                </button>
              </div>
            )}

          </div>
        )}

        {/* STEP 2: PROCESSING STATE */}
        {paymentStep === 'processing' && (
          <div className="p-8 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin mx-auto" />
            <div>
              <p className="font-bold text-slate-900 text-sm">{t('payment.processing_title', 'Processing Payment...')}</p>
              <p className="text-xs text-slate-400 mt-1">{t('payment.processing_subtitle', 'Securing nodal clearance with banking gateway')}</p>
            </div>
          </div>
        )}

        {/* STEP 3: SUCCESS STATE */}
        {paymentStep === 'success' && (
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-50 border-2 border-emerald-300 text-emerald-600 rounded-full mx-auto flex items-center justify-center text-2xl font-black shadow-sm">
              ✓
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">{t('payment.success_title', 'Payment Successful!')}</h3>
              <p className="text-xs font-bold text-emerald-700 mt-0.5">
                ₹{numericAmount.toLocaleString('en-IN')} {t('payment.received', 'Received')}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                {t('payment.live_broadcasting', 'Your campaign is now LIVE & Broadcasting on bus screens')} 📺
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 text-left space-y-1">
              <div className="flex justify-between">
                <span>{t('payment.transaction_id_label', 'Transaction ID:')}</span>
                <span className="font-mono font-bold text-slate-900">{transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('common.status', 'Status')}:</span>
                <span className="font-bold text-emerald-700">{t('payment.settled_confirmed', 'Settled & Confirmed ✓')}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
            >
              {t('payment.back_to_campaigns', 'Done / Back to Campaigns')}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
