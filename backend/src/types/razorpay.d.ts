declare module "razorpay" {
  interface RazorpayOrder {
    id: string;
    amount: number;
    currency: string;
    receipt?: string;
    notes?: Record<string, string>;
  }

  interface RazorpayPayment {
    id: string;
    amount: number;
    currency?: string;
    order_id?: string;
    status?: string;
    method?: string;
    notes?: Record<string, string>;
  }

  interface RazorpayOrderCreateParams {
    amount: number;
    currency: string;
    receipt: string;
    notes?: Record<string, string>;
  }

  export default class Razorpay {
    constructor(options: { key_id: string; key_secret: string });
    orders: {
      create(params: RazorpayOrderCreateParams): Promise<RazorpayOrder>;
      fetch(orderId: string): Promise<RazorpayOrder>;
    };
    payments: {
      fetch(paymentId: string): Promise<RazorpayPayment>;
    };
  }
}
