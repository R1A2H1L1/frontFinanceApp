import { NextRequest, NextResponse } from 'next/server';

const API_BASE = 'http://98.84.30.134:8080/api/auth';

async function handler(req: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join('/');
  const { searchParams } = new URL(req.url);
  const query = searchParams.toString();
  const targetUrl = `${API_BASE}/${path}${query ? `?${query}` : ''}`;

  let body: string | undefined;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    try { body = await req.text(); } catch { body = undefined; }
  }

  const res = await fetch(targetUrl, {
    method: req.method,
    headers: { 'Content-Type': 'application/json' },
    body: body || undefined,
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;