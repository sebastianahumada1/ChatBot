import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Basic in-memory rate limiting (best effort for Vercel)
const rateLimitMap = new Map();

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'anonymous';
  const now = Date.now();
  const lastRequest = rateLimitMap.get(ip);

  // Limit to 1 request every 30 seconds per IP
  if (lastRequest && now - lastRequest < 30000) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
  rateLimitMap.set(ip, now);

  try {
    const body = await request.json();
    const { name, phone, message, page, source = 'web' } = body;

    // Validation
    if (!name || name.length < 2 || name.length > 100) {
      return NextResponse.json({ error: 'Nombre inválido' }, { status: 400 });
    }
    if (!phone || phone.length < 7 || phone.length > 20) {
      return NextResponse.json({ error: 'Teléfono inválido' }, { status: 400 });
    }

    // Insert into Supabase using admin client (bypasses RLS)
    const { error } = await supabaseAdmin
      .from('leads')
      .insert([
        { 
          name: name.trim(), 
          phone: phone.trim(), 
          message: message?.trim() || null, 
          page: page || null, 
          source 
        }
      ]);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Error al guardar el lead' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
