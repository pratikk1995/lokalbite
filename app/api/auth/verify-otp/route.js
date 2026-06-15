import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createSession } from '@/lib/auth';

export async function POST(req) {
  try {
    const { phone, otp, name } = await req.json();
    if (!phone || !otp) {
      return NextResponse.json({ error: 'Phone and OTP are required' }, { status: 400 });
    }

    const formattedPhone = phone.trim();

    const user = await prisma.user.findUnique({
      where: { phone: formattedPhone },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify code matching
    if (!user.otp || user.otp !== otp) {
      return NextResponse.json({ error: 'Invalid OTP code' }, { status: 400 });
    }

    // Verify expiry
    if (user.otpExpiry && user.otpExpiry < new Date()) {
      return NextResponse.json({ error: 'OTP code has expired' }, { status: 400 });
    }

    // Clear otp from database and save user name if provided
    const updateData = {
      otp: null,
      otpExpiry: null,
    };
    if (name && name.trim()) {
      updateData.name = name.trim();
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    // Set cookie
    await createSession(updatedUser.id);

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('API Verify OTP Error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
