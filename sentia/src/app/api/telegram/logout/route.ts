import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { telegramChatId } = await req.json();

    if (!telegramChatId) {
      return NextResponse.json({ error: 'telegramChatId required' }, { status: 400 });
    }

    // Unlink telegramChatId from user
    const result = await prisma.user.updateMany({
      where: { telegramChatId: telegramChatId.toString() },
      data: { telegramChatId: null },
    });

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
      unlinked: result.count,
    });
  } catch (error) {
    console.error('Telegram logout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
