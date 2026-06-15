import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
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

    // Call payment generator
    const linkResult = await createPaymentLink({
      orderId: order.id,
      amount: order.totalAmount,
      customerName: order.customer.name,
      customerPhone: order.customer.phone,
    });

    // Save link reference
    await prisma.order.update({
      where: { id: orderId },
      data: { paymentLinkId: linkResult.id }
    });

    return NextResponse.json({ success: true, short_url: linkResult.short_url });
  } catch (error) {
    console.error('API Payments POST Error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
