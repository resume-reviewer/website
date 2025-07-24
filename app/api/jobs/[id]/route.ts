// File: /app/api/jobs/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

// Fungsi untuk mendapatkan Supabase client yang terotentikasi
const getSupabaseAuthedClient = (accessToken: string) => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { 'Authorization': `Bearer ${accessToken}` } } }
  );
};

// Handler untuk metode PATCH (Update Sebagian)
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.supabaseAccessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = params;
    const { status } = await request.json(); // Ambil status baru dari body request

    if (!status) {
      return NextResponse.json({ error: 'Status field is required' }, { status: 400 });
    }

    const supabase = getSupabaseAuthedClient(session.supabaseAccessToken);

    const { data, error } = await supabase
      .from('jobs')
      .update({ status: status })
      .eq('id', id)
      .eq('user_id', session.user.id) // Pastikan pengguna hanya bisa update miliknya sendiri
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Kode error jika tidak ada baris yang ditemukan
        return NextResponse.json({ error: 'Job not found or access denied' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error updating job status:', error);
    return NextResponse.json({ error: 'Failed to update job status' }, { status: 500 });
  }
}