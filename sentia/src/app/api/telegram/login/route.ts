import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { email, password, pin, telegramChatId } = await req.json();

    if (!email || !password || !pin || !telegramChatId) {
      return NextResponse.json({ success: false, error: 'All fields required' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' });
    }

    if (user.password !== password || user.pin !== pin) {
      return NextResponse.json({ success: false, error: 'Invalid credentials or PIN' });
    }

    // Unlink this telegramChatId from any other accounts first
    await prisma.user.updateMany({
      where: { telegramChatId: telegramChatId.toString() },
      data: { telegramChatId: null },
    });

    // Update the telegramChatId for the current user
    await prisma.user.update({
      where: { id: user.id },
      data: { telegramChatId: telegramChatId.toString() },
    });

    return NextResponse.json({ success: true, message: 'Logged in successfully', user: { name: user.name, walletAddress: user.walletAddress } });
  } catch (error) {
    console.error('Telegram login error:', error);
    return NextResponse.json({ success: false, error: 'Database connection error. Check cPanel.' });
  }
}
