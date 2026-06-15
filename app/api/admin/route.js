import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req) {
  try {
    const user = await getSession();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'stats';

    if (type === 'stores') {
      const stores = await prisma.store.findMany({
        include: { owner: true },
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json({ stores });
    }

    if (type === 'users') {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json({ users });
    }

    if (type === 'orders') {
      const orders = await prisma.order.findMany({
        include: {
          store: true,
          customer: true,
          address: true
        },
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json({ orders });
    }

    // Default stats view
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalUsers, activeStores, pendingStores, ordersToday, totalOrders] = await Promise.all([
      prisma.user.count(),
      prisma.store.count({ where: { isApproved: true } }),
      prisma.store.count({ where: { isApproved: false } }),
      prisma.order.count({ where: { createdAt: { gte: today } } }),
      prisma.order.count()
    ]);

    return NextResponse.json({
      stats: {
        totalUsers,
        activeStores,
        pendingStores,
        ordersToday,
        totalOrders
      }
    });
  } catch (error) {
    console.error('API Admin GET Error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = await getSession();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, storeId, approve, userId, role, active } = await req.json();

    if (action === 'approve_store') {
      if (!storeId) {
        return NextResponse.json({ error: 'Store ID is required' }, { status: 400 });
      }
      const store = await prisma.store.update({
        where: { id: storeId },
        data: { isApproved: !!approve }
      });
      return NextResponse.json({ success: true, store });
    }

    if (action === 'change_role') {
      if (!userId || !role) {
        return NextResponse.json({ error: 'User ID and Role are required' }, { status: 400 });
      }
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role }
      });
      return NextResponse.json({ success: true, user: updatedUser });
    }

    if (action === 'toggle_user') {
      if (!userId || active === undefined) {
        return NextResponse.json({ error: 'User ID and active status are required' }, { status: 400 });
      }
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { isActive: !!active }
      });
      return NextResponse.json({ success: true, user: updatedUser });
    }

    return NextResponse.json({ error: 'Invalid admin action' }, { status: 400 });
  } catch (error) {
    console.error('API Admin POST Error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
