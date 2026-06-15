import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let orders = [];

    // Role-based logic
    if (user.role === 'ADMIN') {
      orders = await prisma.order.findMany({
        include: {
          store: true,
          customer: true,
          address: true,
          orderItems: {
            include: { product: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else if (user.role === 'STORE_OWNER') {
      orders = await prisma.order.findMany({
        where: {
          store: { ownerId: user.id }
        },
        include: {
          store: true,
          customer: true,
          address: true,
          orderItems: {
            include: { product: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else if (user.role === 'DELIVERY_BOY') {
      orders = await prisma.order.findMany({
        where: {
          deliveryBoyId: user.id
        },
        include: {
          store: true,
          customer: true,
          address: true,
          orderItems: {
            include: { product: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      // CUSTOMER
      orders = await prisma.order.findMany({
        where: {
          customerId: user.id
        },
        include: {
          store: true,
          customer: true,
          address: true,
          orderItems: {
            include: { product: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('API Orders GET Error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId, addressId, notes, items } = await req.json();
    if (!storeId || !addressId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Store, address, and items list are required' }, { status: 400 });
    }

    // Verify store exists and is active
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });
    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }
    if (!store.isApproved || !store.isOpen) {
      return NextResponse.json({ error: 'Store is currently closed or suspended' }, { status: 400 });
    }

    // Extract product IDs
    const productIds = items.map(i => i.productId);

    // Fetch prices from DB to prevent client tampering
    const dbProducts = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        storeId,
      }
    });

    if (dbProducts.length !== productIds.length) {
      return NextResponse.json({ error: 'Some products are invalid or belong to another store' }, { status: 400 });
    }

    // Calculate subtotal
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = dbProducts.find(p => p.id === item.productId);
      if (!product.available) {
        return NextResponse.json({ error: `Product "${product.name}" is currently unavailable` }, { status: 400 });
      }
      
      const qty = parseInt(item.quantity);
      if (isNaN(qty) || qty <= 0) {
        return NextResponse.json({ error: 'Product quantities must be positive integers' }, { status: 400 });
      }

      subtotal += product.price * qty;
      orderItems.push({
        productId: product.id,
        quantity: qty,
        price: product.price // snapshot price
      });
    }

    const deliveryFee = 20.0; // Flat fee
    const totalAmount = subtotal + deliveryFee;

    // Create order structure
    const order = await prisma.order.create({
      data: {
        customerId: user.id,
        storeId,
        addressId,
        status: 'PENDING_PAYMENT',
        subtotal,
        deliveryFee,
        totalAmount,
        notes: notes || '',
        orderItems: {
          create: orderItems
        }
      },
      include: {
        orderItems: true
      }
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('API Orders POST Error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
