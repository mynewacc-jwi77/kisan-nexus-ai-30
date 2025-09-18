// Razorpay integration for real payments
declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id?: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  handler: (response: any) => void;
  modal: {
    ondismiss: () => void;
  };
}

export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const createRazorpayPayment = async (options: RazorpayOptions) => {
  const isLoaded = await loadRazorpayScript();
  
  if (!isLoaded) {
    throw new Error('Failed to load Razorpay SDK');
  }

  // Enhanced options with detailed demo success handler
  const enhancedOptions = {
    ...options,
    handler: (response: any) => {
      // Create and show enhanced success modal
      const event = new CustomEvent('paymentSuccess', {
        detail: {
          paymentId: response.razorpay_payment_id,
          amount: options.amount / 100,
          itemName: options.description,
          orderId: response.razorpay_order_id,
          signature: response.razorpay_signature
        }
      });
      
      // Dispatch success event for components to listen
      window.dispatchEvent(event);
      
      // Call original handler
      options.handler(response);
    }
  };

  const razorpay = new window.Razorpay(enhancedOptions);
  razorpay.open();
};

// Razorpay Test Key (replace with live key for production)
export const RAZORPAY_KEY = 'rzp_test_1DP5mmOlF5G5ag'; // This is a test key for demo purposes