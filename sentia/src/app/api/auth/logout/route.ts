import { NextResponse } from 'next/server';

export async function POST() {
  // Web logout just clears localStorage on the client side
  // This endpoint exists for completeness / future session management
  return NextResponse.json({ success: true, message: 'Logged out' });
}
