import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { createClient } from "@supabase/supabase-js"

const getSupabaseAuthedClient = (accessToken: string) => {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  })
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.supabaseAccessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const supabase = getSupabaseAuthedClient(session.supabaseAccessToken)

    // Fetch documents with job information using a left join
    const { data, error } = await supabase
      .from("documents")
      .select(`
        *,
        job:jobs(*)
      `)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching documents with jobs:", error)
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 })
  }
}
