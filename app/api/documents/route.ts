// File: /app/api/documents/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

const getSupabaseAuthedClient = (accessToken: string) => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { 'Authorization': `Bearer ${accessToken}` } } }
  );
};

// GET: Mengambil daftar dokumen pengguna
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.supabaseAccessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAuthedClient(session.supabaseAccessToken);
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

// POST: Mengunggah file baru
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.supabaseAccessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const documentType = formData.get('documentType') as string;

    if (!file || !documentType) {
      return NextResponse.json({ error: 'File and document type are required' }, { status: 400 });
    }

    const supabase = getSupabaseAuthedClient(session.supabaseAccessToken);
    // Membuat path file yang aman di dalam folder unik milik pengguna
    const filePath = `${session.user.id}/${Date.now()}_${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from('userdocuments')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: dbData, error: dbError } = await supabase
      .from('documents')
      .insert({
        user_id: session.user.id,
        file_name: file.name,
        file_path: filePath,
        document_type: documentType,
      })
      .select()
      .single();

    if (dbError) throw dbError;
    
    return NextResponse.json(dbData);
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 });
  }
}