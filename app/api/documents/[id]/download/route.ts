import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const getSupabaseAuthedClient = (accessToken: string) => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { 'Authorization': `Bearer ${accessToken}` } } }
  )
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || !session.supabaseAccessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = getSupabaseAuthedClient(session.supabaseAccessToken)

    // First, verify the document belongs to the user
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('file_path, file_name, user_id')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single()

    if (docError || !document) {
      console.error('Document fetch error:', docError)
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Generate signed URL for download
    const { data, error } = await supabase.storage
      .from('userdocuments')
      .createSignedUrl(document.file_path, 60) // 60 seconds expiry

    if (error) {
      console.error('Storage signed URL error:', error)
      return NextResponse.json({
        error: 'Could not generate download link',
        details: error.message
      }, { status: 500 })
    }

    if (!data?.signedUrl) {
      return NextResponse.json({
        error: 'No signed URL generated'
      }, { status: 500 })
    }

    return NextResponse.json({
      downloadUrl: data.signedUrl,
      fileName: document.file_name
    })
  } catch (error) {
    console.error('Download API error:', error)
    return NextResponse.json({
      error: 'Failed to generate download link',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
