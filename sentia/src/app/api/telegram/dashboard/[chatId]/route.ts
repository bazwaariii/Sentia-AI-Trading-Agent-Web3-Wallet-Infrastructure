import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ chatId: string }> }) {
  try {
    const { chatId } = await params;

    const user = await prisma.user.findFirst({
      where: { telegramChatId: String(chatId) },
      include: {
        agents: true,
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not registered with this Telegram ID' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching dashboard for telegram bot:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
