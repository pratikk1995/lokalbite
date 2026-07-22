import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');
    
    // Instamojo fields
    const paymentId = searchParams.get('payment_id');
    const paymentStatus = searchParams.get('payment_status');
    const paymentRequestId = searchParams.get('payment_request_id');
    
    // Razorpay fields
    const razorpayPaymentId = searchParams.get('razorpay_payment_id');
    const razorpayPaymentLinkStatus = searchParams.get('razorpay_payment_link_status');

    if (!orderId) {
      return new NextResponse('Missing Order ID', { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return new NextResponse('Order not found', { status: 404 });
    }

    // Determine if paid based on gateway
    let isPaid = false;
    let finalPaymentId = '';

    if (razorpayPaymentLinkStatus) {
      // Razorpay flow
      isPaid = razorpayPaymentLinkStatus === 'paid';
      finalPaymentId = razorpayPaymentId || `rzp_mock_${Math.random().toString(36).substring(7)}`;
    } else {
      // Instamojo flow
      isPaid = !paymentStatus || paymentStatus === 'Credit' || paymentStatus === 'paid';
      finalPaymentId = paymentId || `im_mock_${Math.random().toString(36).substring(7)}`;
    }

    if (isPaid && order.status === 'PENDING_PAYMENT') {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'PAYMENT_CONFIRMED',
          paymentId: finalPaymentId
        }
      });
    }

    // Redirect to the customer's order tracking page
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.redirect(`${appUrl}/customer/orders/${orderId}`);
  } catch (error) {
    console.error('API Payment Callback Error:', error);
    return new NextResponse('Something went wrong', { status: 500 });
  }
}
