import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { email, chatId } = await req.json();

    if (!email || !chatId) {
      return NextResponse.json({ error: 'Email and chatId required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { telegramChatId: String(chatId) }
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Error linking telegram:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
