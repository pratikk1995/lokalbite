import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST() {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let updatedUser = user;
    if (user.role !== 'ADMIN') {
      updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { role: 'DELIVERY_BOY' }
      });
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('API Delivery Register Error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
