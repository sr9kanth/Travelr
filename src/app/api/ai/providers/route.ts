import { NextResponse } from 'next/server';
import { getProviderStatuses, getDefaultProvider } from '@/lib/ai';

export async function GET() {
  const providers = getProviderStatuses();
  const defaultProvider = getDefaultProvider();
  return NextResponse.json({ providers, defaultProvider });
}
