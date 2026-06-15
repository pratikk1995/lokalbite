import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const addresses = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ addresses });
  } catch (error) {
    console.error('API Addresses GET Error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { label, fullAddress, landmark } = await req.json();
    if (!label || !fullAddress) {
      return NextResponse.json({ error: 'Label and full address are required' }, { status: 400 });
    }

    const address = await prisma.address.create({
      data: {
        userId: user.id,
        label,
        fullAddress,
        landmark: landmark || ''
      }
    });

    return NextResponse.json({ success: true, address });
  } catch (error) {
    console.error('API Addresses POST Error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
