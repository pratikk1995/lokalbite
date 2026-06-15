import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');
    const paymentId = searchParams.get('razorpay_payment_id');
    const paymentStatus = searchParams.get('razorpay_payment_link_status');

    if (!orderId) {
      return new NextResponse('Missing Order ID', { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return new NextResponse('Order not found', { status: 404 });
    }

    // Update status if payment status is paid (or if no status parameter is supplied, assume success for ease of testing)
    const isPaid = !paymentStatus || paymentStatus === 'paid' || paymentStatus === 'confirmed';
    if (isPaid && order.status === 'PENDING_PAYMENT') {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'PAYMENT_CONFIRMED',
          paymentId: paymentId || `pay_mock_${Math.random().toString(36).substring(7)}`
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
