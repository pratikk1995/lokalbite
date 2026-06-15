import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    const where = { isApproved: true };
    if (category && category.toLowerCase() !== 'all') {
      where.category = { equals: category, mode: 'insensitive' };
    }

    const stores = await prisma.store.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ stores });
  } catch (error) {
    console.error('API Stores GET Error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, address, phone, category } = await req.json();
    if (!name || !address || !phone || !category) {
      return NextResponse.json({ error: 'Name, address, phone, and category are required' }, { status: 400 });
    }

    // Register store (pending admin approval)
    const store = await prisma.store.create({
      data: {
        name,
        description,
        address,
        phone,
        category,
        ownerId: user.id,
        isApproved: false, // Default requires approval
        isOpen: true,
      },
    });

    // Update user role to STORE_OWNER if they are a CUSTOMER
    if (user.role === 'CUSTOMER') {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: 'STORE_OWNER' },
      });
    }

    return NextResponse.json({ success: true, store });
  } catch (error) {
    console.error('API Stores POST Error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
