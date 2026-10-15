/**
 * razorpay.js — Dynamic loader & checkout orchestrator for Razorpay Standard Checkout SDK.
 */

let loadPromise = null;

/**
 * Loads https://checkout.razorpay.com/v1/checkout.js asynchronously if not already loaded.
 * @returns {Promise<boolean>}
 */
export const loadRazorpaySdk = () => {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);

  if (!loadPromise) {
    loadPromise = new Promise((resolve) => {
      const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existing) {
        existing.addEventListener('load', () => resolve(true));
        existing.addEventListener('error', () => resolve(false));
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => {
        loadPromise = null;
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }

  return loadPromise;
};

/**
 * Opens Razorpay Standard Modal.
 * @param {Object} options
 * @param {string} options.keyId - Razorpay Key ID (rzp_test_... / rzp_live_...)
 * @param {string} options.orderId - Razorpay Order ID (order_...)
 * @param {number} options.amount - Amount in paise (e.g. 1500000)
 * @param {string} [options.currency='INR'] - Currency code
 * @param {string} [options.name='VMOVEXA Platform'] - Organization / Brand name
 * @param {string} [options.description='SaaS Subscription'] - Order description
 * @param {Object} [options.prefill] - { name, email, contact }
 * @param {Object} [options.notes] - Custom metadata
 * @param {string} [options.themeColor='#2563eb'] - Primary branding color
 * @param {Function} options.onSuccess - Callback on payment success: ({ razorpay_payment_id, razorpay_order_id, razorpay_signature })
 * @param {Function} [options.onDismiss] - Callback when user closes payment modal without completing
 * @param {Function} [options.onError] - Callback on payment failure
 */
export const openRazorpayCheckout = async ({
  keyId,
  orderId,
  amount,
  currency = 'INR',
  name = 'VMOVEXA Platform',
  description = 'SaaS Subscription Plan',
  prefill = {},
  notes = {},
  themeColor = '#2563eb',
  onSuccess,
  onDismiss,
  onError,
}) => {
  const loaded = await loadRazorpaySdk();
  if (!loaded) {
    throw new Error('Could not load Razorpay Checkout SDK. Please check your internet connection.');
  }

  const options = {
    key: keyId,
    amount,
    currency: currency.toUpperCase(),
    name,
    description,
    order_id: orderId,
    prefill: {
      name: prefill.name || '',
      email: prefill.email || '',
      contact: prefill.contact || prefill.phone || '',
    },
    notes: {
      ...notes,
    },
    theme: {
      color: themeColor,
    },
    handler: function (response) {
      if (typeof onSuccess === 'function') {
        onSuccess(response);
      }
    },
    modal: {
      ondismiss: function () {
        if (typeof onDismiss === 'function') {
          onDismiss();
        }
      },
      escape: true,
      backdropclose: false,
    },
  };

  const rzpInstance = new window.Razorpay(options);
  if (typeof onError === 'function') {
    rzpInstance.on('payment.failed', function (resp) {
      onError(resp?.error || { description: 'Razorpay payment transaction failed.' });
    });
  }
  rzpInstance.open();
  return rzpInstance;
};

export default { loadRazorpaySdk, openRazorpayCheckout };
