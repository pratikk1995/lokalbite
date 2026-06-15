import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req, { params }) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        store: true,
        customer: true,
        address: true,
        deliveryBoy: true,
        orderItems: {
          include: { product: true }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Auth validation
    const isCustomer = order.customerId === user.id;
    const isOwner = order.store.ownerId === user.id;
    const isDelivery = order.deliveryBoyId === user.id;
    const isAdmin = user.role === 'ADMIN';

    if (!isCustomer && !isOwner && !isDelivery && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('API Order Detail GET Error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { status, cancelReason } = await req.json();

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: { store: true }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const isCustomer = order.customerId === user.id;
    const isOwner = order.store.ownerId === user.id;
    const isDelivery = order.deliveryBoyId === user.id;
    const isAdmin = user.role === 'ADMIN';

    // Access control & state machine validations
    if (isAdmin) {
      // Admin has complete control
    } else if (isCustomer) {
      if (status === 'CANCELLED') {
        if (order.status !== 'PENDING_PAYMENT' && order.status !== 'PAYMENT_CONFIRMED') {
          return NextResponse.json({ error: 'Order cannot be cancelled after acceptance' }, { status: 400 });
        }
      } else {
        return NextResponse.json({ error: 'Forbidden status modification' }, { status: 403 });
      }
    } else if (isOwner) {
      const allowedStoreStatuses = ['ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP', 'CANCELLED'];
      if (!allowedStoreStatuses.includes(status)) {
        return NextResponse.json({ error: 'Forbidden status transition for store owner' }, { status: 403 });
      }
      if (status === 'CANCELLED' && order.status !== 'PAYMENT_CONFIRMED' && order.status !== 'ACCEPTED') {
        return NextResponse.json({ error: 'Cannot cancel order at this stage' }, { status: 400 });
      }
    } else if (isDelivery) {
      if (status !== 'DELIVERED') {
        return NextResponse.json({ error: 'Forbidden status transition for delivery boy' }, { status: 403 });
      }
      if (order.status !== 'OUT_FOR_DELIVERY') {
        return NextResponse.json({ error: 'Order must be OUT_FOR_DELIVERY before completing' }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status,
        cancelReason: status === 'CANCELLED' ? (cancelReason || 'Cancelled by operator') : null
      }
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error('API Order Detail PATCH Error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
