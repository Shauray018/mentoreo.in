declare module "react-native-razorpay" {
  interface RazorpayOptions {
    key: string;
    amount: number | string;
    currency: string;
    name: string;
    description?: string;
    order_id?: string;
    image?: string;
    prefill?: {
      email?: string;
      contact?: string;
      name?: string;
    };
    theme?: {
      color?: string;
    };
    notes?: Record<string, string>;
  }

  interface RazorpaySuccess {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }

  interface RazorpayFailure {
    code: number;
    description: string;
    source: string;
    step: string;
    reason: string;
    metadata?: {
      order_id?: string;
      payment_id?: string;
    };
  }

  const RazorpayCheckout: {
    open(options: RazorpayOptions): Promise<RazorpaySuccess>;
  };

  export default RazorpayCheckout;
  export type { RazorpayFailure, RazorpayOptions, RazorpaySuccess };
}
