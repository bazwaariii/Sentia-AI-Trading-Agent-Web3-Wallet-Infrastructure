import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { email, type, updates } = data;

    if (!email || !type || !updates) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    if (type === 'limits') {
      await prisma.user.update({
        where: { email },
        data: {
          defaultMaxPerTx: parseInt(updates.defaultMaxPerTx),
          defaultDailyLimit: parseInt(updates.defaultDailyLimit),
          monthlyBudgetCap: parseInt(updates.monthlyBudgetCap)
        }
      });
    } else if (type === 'settings') {
      await prisma.user.update({
        where: { email },
        data: {
          webhookUrl: updates.webhookUrl
        }
      });
    } else if (type === 'agent_limits') {
      await prisma.agent.update({
        where: { id: updates.agentId },
        data: {
          maxPerTx: parseFloat(updates.maxPerTx),
          dailyLimit: parseFloat(updates.dailyLimit)
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
