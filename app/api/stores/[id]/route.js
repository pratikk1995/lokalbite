import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req, { params }) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Store ID is required' }, { status: 400 });
    }

    const store = await prisma.store.findUnique({
      where: { id },
      include: {
        products: {
          orderBy: { category: 'asc' },
        },
      },
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    return NextResponse.json({ store });
  } catch (error) {
    console.error('API Store Detail GET Error:', error);
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
    const store = await prisma.store.findUnique({
      where: { id },
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Verify ownership or admin rights
    if (store.ownerId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { name, description, address, phone, category, isOpen } = await req.json();

    const data = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (address !== undefined) data.address = address;
    if (phone !== undefined) data.phone = phone;
    if (category !== undefined) data.category = category;
    if (isOpen !== undefined) data.isOpen = isOpen;

    const updatedStore = await prisma.store.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, store: updatedStore });
  } catch (error) {
    console.error('API Store Detail PATCH Error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
