import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import { JobApplication, UserDocument } from '@/lib/types-and-utils';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.supabaseAccessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { 'Authorization': `Bearer ${session.supabaseAccessToken}` } } }
    );

    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });

    if (jobsError) throw jobsError;

    const { data: documents, error: docsError } = await supabase
      .from('documents')
      .select('*');

    if (docsError) throw docsError;
    
    const jobsWithDocuments = jobs.map(job => ({
      ...job,
      documents: documents.filter(doc => doc.job_id === job.id),
    }));

    const unassociatedDocuments = documents.filter(doc => !doc.job_id);

    return NextResponse.json({ jobsWithDocuments, unassociatedDocuments });

  } catch (error) {
    console.error('Error fetching jobs with documents:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}