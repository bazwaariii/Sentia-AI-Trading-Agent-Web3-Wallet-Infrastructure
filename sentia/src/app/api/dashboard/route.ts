import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        agents: true,
        transactions: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch Real Balance from Solana Mainnet/Devnet
    let balance = 0;
    try {
      const connection = new Connection("https://api.devnet.solana.com", "confirmed");
      if (user.walletAddress) {
        const pk = new PublicKey(user.walletAddress);
        const lamports = await connection.getBalance(pk);
        balance = lamports / LAMPORTS_PER_SOL;
      }
    } catch (e) {
      console.error("Failed to fetch balance", e);
    }

    return NextResponse.json({ 
      user: { ...user, walletPrivateKey: undefined },
      solBalance: balance
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
