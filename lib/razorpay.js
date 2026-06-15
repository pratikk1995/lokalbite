import Razorpay from 'razorpay';

let razorpay = null;

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && !process.env.RAZORPAY_KEY_ID.includes('mockkeyid')) {
  try {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  } catch (e) {
    console.error('Error initializing Razorpay client:', e.message);
  }
}

export async function createPaymentLink({ orderId, amount, customerName, customerPhone }) {
  if (!razorpay) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    console.log(`[LokaBite Payment] Razorpay credentials not configured or using mock. Generating mock checkout callback for order: ${orderId}`);
    return {
      id: `plink_mock_${Math.random().toString(36).substring(7)}`,
      short_url: `${appUrl}/api/payments/callback?orderId=${orderId}&razorpay_payment_link_status=paid`,
    };
  }

  try {
    // Convert Rupees to Paise
    const amountInPaisa = Math.round(amount * 100);

    const paymentLink = await razorpay.paymentLink.create({
      amount: amountInPaisa,
      currency: 'INR',
      accept_partial: false,
      description: `LokaBite Order #${orderId.substring(0, 8)}`,
      customer: {
        name: customerName || 'Valued Customer',
        phone: customerPhone.startsWith('+91') ? customerPhone : `+91${customerPhone}`,
      },
      notify: {
        sms: false,
        email: false,
      },
      reminder_enable: false,
      notes: {
        orderId: orderId,
      },
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/callback?orderId=${orderId}`,
      callback_method: 'get',
      options: {
        checkout: {
          method: {
            netbanking: '1',
            card: '1',
            upi: '1',
            wallet: '0', // Wallet disabled as requested
          },
        },
      },
    });

    return {
      id: paymentLink.id,
      short_url: paymentLink.short_url,
    };
  } catch (error) {
    console.error('Failed to create Razorpay payment link:', error);
    throw error;
  }
}
export { razorpay };
