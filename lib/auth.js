import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import prisma from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev-lokabite-pwa-app-secret';
const COOKIE_NAME = 'lokabite_session';

export async function createSession(userId) {
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: '/',
  });
  return token;
}

export async function getSession() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded || !decoded.userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        stores: {
          where: { isApproved: true }
        }
      }
    });

    if (!user || !user.isActive) return null;
    return user;
  } catch (error) {
    console.error('Session verification error:', error);
    return null;
  }
}

export async function destroySession() {
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
}

export function generateOTP() {
  // Generate a simple 6-digit OTP code
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOTP(phone, otp) {
  console.log('==========================================');
  console.log(`[LokaBite OTP System]`);
  console.log(`Phone: ${phone}`);
  console.log(`OTP Code: ${otp}`);
  console.log('==========================================');

  if (process.env.MSG91_AUTH_KEY && process.env.MSG91_TEMPLATE_ID) {
    try {
      const axios = require('axios');
      await axios.get('https://api.msg91.com/api/v5/otp', {
        params: {
          template_id: process.env.MSG91_TEMPLATE_ID,
          mobile: phone,
          authkey: process.env.MSG91_AUTH_KEY,
          otp: otp,
        },
      });
      console.log(`OTP successfully sent to ${phone} via MSG91`);
    } catch (error) {
      console.error('Failed to send OTP via MSG91:', error.message);
    }
  }
}
