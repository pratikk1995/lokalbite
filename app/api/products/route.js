import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(req) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the store belonging to the logged-in owner
    const store = await prisma.store.findFirst({
      where: { ownerId: user.id },
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found. Register a store first.' }, { status: 400 });
    }

    const { name, description, price, category, available } = await req.json();
    if (!name || price === undefined || !category) {
      return NextResponse.json({ error: 'Name, price, and category are required' }, { status: 400 });
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return NextResponse.json({ error: 'Price must be a valid positive number' }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parsedPrice,
        category,
        available: available !== undefined ? available : true,
        storeId: store.id,
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('API Product POST Error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
