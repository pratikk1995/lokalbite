import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { createPaymentRequest } from '@/lib/instamojo';
import { createPaymentLink } from '@/lib/razorpay';

export async function POST(req) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: true }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.customerId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (order.status !== 'PENDING_PAYMENT') {
      return NextResponse.json({ error: 'Order is not in pending payment status' }, { status: 400 });
    }

    let paymentUrl = '';
    let paymentLinkId = '';

    // Prefer Razorpay if configured, otherwise fallback to Instamojo
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      const paymentResult = await createPaymentLink({
        orderId: order.id,
        amount: order.totalAmount,
        customerName: order.customer.name,
        customerPhone: order.customer.phone,
      });
      paymentLinkId = paymentResult.id;
      paymentUrl = paymentResult.short_url;
    } else {
      const paymentResult = await createPaymentRequest({
        orderId: order.id,
        amount: order.totalAmount,
        customerName: order.customer.name,
        customerPhone: order.customer.phone,
        customerEmail: order.customer.email,
      });
      paymentLinkId = paymentResult.id;
      paymentUrl = paymentResult.payment_url;
    }

    // Save payment request ID
    await prisma.order.update({
      where: { id: orderId },
      data: { paymentLinkId }
    });

    return NextResponse.json({ 
      success: true, 
      payment_url: paymentUrl 
    });
  } catch (error) {
    console.error('API Payments POST Error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
