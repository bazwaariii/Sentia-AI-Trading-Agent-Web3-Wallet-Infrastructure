import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

export async function POST(req: Request) {
  try {
    const { name, email, password, pin } = await req.json();

    if (!name || !email || !password || !pin) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 });
    }

    if (!/^\d{6}$/.test(pin)) {
      return NextResponse.json({ error: 'PIN must be exactly 6 digits' }, { status: 400 });
    }

    // Check existing
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    // Generate real Solana wallet
    const keypair = Keypair.generate();
    const walletAddress = keypair.publicKey.toBase58();
    const walletPrivateKey = bs58.encode(keypair.secretKey);

    // Create user (Mock hashing for hackathon demo)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: password, // In production, bcrypt.hashSync(password, 10)
        pin: pin,
        walletAddress,
        walletPrivateKey,
        agents: {
          create: [
            { name: "Trading Bot Alpha", pubkey: walletAddress },
            { name: "DeFi Agent", pubkey: walletAddress }
          ]
        },

      }
    });

    return NextResponse.json({ success: true, user: { ...user, walletPrivateKey: undefined } });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
