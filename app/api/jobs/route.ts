// File: /app/api/jobs/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import { JobApplication } from '@/lib/types-and-utils';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id || !session.supabaseAccessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabaseAuthedClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: { headers: { 'Authorization': `Bearer ${session.supabaseAccessToken}` } }
      }
    );

    const { data, error } = await supabaseAuthedClient
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false }); // Urutkan dari yang terbaru

    if (error) {
      throw error;
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching jobs:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: `Failed to fetch jobs: ${errorMessage}` }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id || !session.supabaseAccessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabaseAuthedClient = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { 'Authorization': `Bearer ${session.supabaseAccessToken}` } }
    });

    const jobData = await request.json();

    const { 
      job_title, company_name, location, job_url, 
      job_description, notes, application_deadline 
    } = jobData;

    if (!job_title || !company_name) {
      return NextResponse.json({ error: 'Judul Pekerjaan dan Nama Perusahaan wajib diisi' }, { status: 400 });
    }
    
    const { data, error } = await supabaseAuthedClient
      .from('jobs')
      .insert({
        user_id: session.user.id,
        job_title: job_title, // Gunakan variabel snake_case
        company_name: company_name, // Gunakan variabel snake_case
        location: location,
        job_url: job_url,
        job_description: job_description,
        notes: notes,
        application_deadline: application_deadline || null,
        status: 'Saved',
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error WITH authed client:', error);
      throw error;
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Catch block error in /api/jobs:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: `Gagal menyimpan pekerjaan: ${errorMessage}` }, { status: 500 });
  }
}