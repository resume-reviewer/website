import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

// Helper function untuk Supabase client
const getSupabaseAuthedClient = (accessToken: string) => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { 'Authorization': `Bearer ${accessToken}` } } }
  );
};

// Handler untuk metode PATCH (Update)
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // Updated to handle Promise
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.supabaseAccessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Await the params Promise
  const params = await context.params;
  const jobId = params.id;
  
  if (!jobId) {
    return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
  }

  try {
    const { status } = await request.json();
    if (!status) {
      return NextResponse.json({ error: 'Status is required for update' }, { status: 400 });
    }

    const supabase = getSupabaseAuthedClient(session.supabaseAccessToken);

    const { data, error } = await supabase
      .from('jobs')
      .update({ status: status })
      .eq('id', jobId)
      .eq('user_id', session.user.id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message || 'Failed to update job status.');
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error updating job:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: `Failed to update job: ${errorMessage}` }, { status: 500 });
  }
}