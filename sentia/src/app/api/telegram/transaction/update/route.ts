import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { txId, status } = await req.json();

    if (!txId || !status) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const updatedTx = await prisma.transaction.update({
      where: { id: txId },
      data: { status }
    });

    return NextResponse.json({ success: true, transaction: updatedTx });
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
