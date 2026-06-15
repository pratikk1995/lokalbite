import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const store = await prisma.store.findFirst({
      where: { ownerId: user.id },
      include: {
        products: {
          orderBy: { category: 'asc' },
        },
      },
    });

    return NextResponse.json({ store });
  } catch (error) {
    console.error('API Stores Mine GET Error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
