import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { email, password, pin } = await req.json();

    if (!email || !password || !pin) {
      return NextResponse.json({ success: false, error: 'Email, password, and PIN required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.password !== password || user.pin !== pin) {
      return NextResponse.json({ success: false, error: 'Invalid email, password, or PIN' });
    }

    // Return true, excluding sensitive info
    return NextResponse.json({ success: true, user: { name: user.name, email: user.email, walletAddress: user.walletAddress } });
  } catch (error) {
    console.error("Login DB Error:", error);
    return NextResponse.json({ success: false, error: 'Database connection error. Check cPanel.' });
  }
}
