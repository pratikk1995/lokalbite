import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateOTP, sendOTP } from '@/lib/auth';

export async function POST(req) {
  try {
    const { phone } = await req.json();
    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Standardize phone number format if needed (simple trim)
    const formattedPhone = phone.trim();

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Check if this user is the administrator
    const isAdminPhone = process.env.ADMIN_PHONE && formattedPhone === process.env.ADMIN_PHONE.trim();
    const initialRole = isAdminPhone ? 'ADMIN' : 'CUSTOMER';

    // Save/update user record
    await prisma.user.upsert({
      where: { phone: formattedPhone },
      update: {
        otp,
        otpExpiry,
        // Make sure admin status is maintained/set
        ...(isAdminPhone ? { role: 'ADMIN' } : {})
      },
      create: {
        phone: formattedPhone,
        role: initialRole,
        otp,
        otpExpiry,
        isActive: true,
      },
    });

    // Fire otp event
    await sendOTP(formattedPhone, otp);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Send OTP Error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
