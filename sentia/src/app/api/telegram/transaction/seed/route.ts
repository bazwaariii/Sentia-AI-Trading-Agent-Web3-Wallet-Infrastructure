import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { chatId } = await req.json();

    const user = await prisma.user.findFirst({
      where: { telegramChatId: chatId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const agent = await prisma.agent.findFirst({
      where: { ownerId: user.id }
    });

    if (!agent) {
      return NextResponse.json({ error: 'No agents found for user' }, { status: 400 });
    }

    const tx = await prisma.transaction.create({
      data: {
        ownerId: user.id,
        agentId: agent.id,
        amount: Math.floor(Math.random() * 50) + 10,
        token: "USDC",
        status: "pending",
        type: "Agent Trade",
        toAddress: "Raydium Pool",
        hash: "pending"
      }
    });

    return NextResponse.json({ success: true, transaction: tx });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
