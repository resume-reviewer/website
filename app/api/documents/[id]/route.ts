// File: /app/api/documents/[id]/route.ts

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

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.supabaseAccessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAuthedClient(session.supabaseAccessToken);

    // Langkah 1: Dapatkan path file dari database SEBELUM menghapus record.
    // Ini juga berfungsi sebagai verifikasi bahwa pengguna adalah pemilik dokumen.
    const { data: docData, error: fetchError } = await supabase
      .from('documents')
      .select('file_path')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single();

    if (fetchError || !docData) {
      return NextResponse.json({ error: 'Document not found or access denied' }, { status: 404 });
    }

    // Langkah 2: Hapus file dari Supabase Storage.
    const { error: storageError } = await supabase.storage
      .from('userdocuments')
      .remove([docData.file_path]);

    if (storageError) {
      // Bahkan jika file tidak ada di storage, kita tetap lanjutkan menghapus record DB
      console.warn(`Storage deletion warning for ${docData.file_path}:`, storageError.message);
    }

    // Langkah 3: Hapus record dari tabel database.
    const { error: dbError } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (dbError) {
      throw dbError; // Jika ini gagal, berarti ada masalah serius
    }

    return NextResponse.json({ message: 'Document deleted successfully' });

  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}