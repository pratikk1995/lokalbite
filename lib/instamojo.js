// Instamojo Payment Gateway Integration
const INSTAMOJO_API_KEY = process.env.INSTAMOJO_API_KEY;
const INSTAMOJO_AUTH_TOKEN = process.env.INSTAMOJO_AUTH_TOKEN;

// Use test or production URL based on environment
const INSTAMOJO_BASE_URL = process.env.INSTAMOJO_ENV === 'production'
  ? 'https://www.instamojo.com/api/1.1'
  : 'https://test.instamojo.com/api/1.1';

export async function createPaymentRequest({ orderId, amount, customerName, customerPhone, customerEmail }) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // If credentials are not configured, use mock flow for testing
  if (!INSTAMOJO_API_KEY || !INSTAMOJO_AUTH_TOKEN || INSTAMOJO_API_KEY === 'mock') {
    console.log(`[LokaBite Payment] Instamojo not configured. Mock payment for order: ${orderId}`);
    return {
      id: `mock_${Math.random().toString(36).substring(7)}`,
      payment_url: `${appUrl}/api/payments/callback?orderId=${orderId}&payment_status=Credit`,
    };
  }

  try {
    const res = await fetch(`${INSTAMOJO_BASE_URL}/payment-requests/`, {
      method: 'POST',
      headers: {
        'X-Api-Key': INSTAMOJO_API_KEY,
        'X-Auth-Token': INSTAMOJO_AUTH_TOKEN,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        purpose: `LokaBite Order #${orderId.substring(0, 8)}`,
        amount: amount.toFixed(2),
        buyer_name: customerName || 'Customer',
        phone: customerPhone.replace('+91', ''),
        email: customerEmail || 'customer@lokabite.app',
        redirect_url: `${appUrl}/api/payments/callback?orderId=${orderId}`,
        webhook: `${appUrl}/api/payments/webhook`,
        send_email: false,
        send_sms: false,
        allow_repeated_payments: false,
      }).toString(),
    });

    const data = await res.json();

    if (!data.success) {
      console.error('Instamojo error:', JSON.stringify(data));
      throw new Error(data.message || 'Failed to create payment request');
    }

    return {
      id: data.payment_request.id,
      payment_url: data.payment_request.longurl,
    };
  } catch (error) {
    console.error('Failed to create Instamojo payment request:', error);
    throw error;
  }
}
