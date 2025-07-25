// File: /app/api/jobs/[id]/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { createClient } from "@supabase/supabase-js"

const getSupabaseAuthedClient = (accessToken: string) => {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  })
}

// PATCH: Update Job (termasuk status, dan kini juga detail lainnya)
export async function PATCH(
  request: NextRequest,
  // Perbarui tipe context.params menjadi Promise<any> atau any
  context: { params: Promise<any> }, // Mengubah ke Promise<any>
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || !session.supabaseAccessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Await context.params before accessing its properties
  const params = await context.params
  const jobId = params.id

  if (!jobId) {
    return NextResponse.json({ error: "Job ID is required" }, { status: 400 })
  }

  try {
    const updateData = await request.json()

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No update data provided" }, { status: 400 })
    }

    const supabase = getSupabaseAuthedClient(session.supabaseAccessToken)

    const { data, error } = await supabase
      .from("jobs")
      .update(updateData)
      .eq("id", jobId)
      .eq("user_id", session.user.id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message || "Failed to update job.")
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating job:", error)
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    return NextResponse.json({ error: `Failed to update job: ${errorMessage}` }, { status: 500 })
  }
}

// DELETE: Delete Job
export async function DELETE(request: NextRequest, context: { params: Promise<any> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || !session.supabaseAccessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const params = await context.params
  const jobId = params.id

  if (!jobId) {
    return NextResponse.json({ error: "Job ID is required" }, { status: 400 })
  }

  try {
    const supabase = getSupabaseAuthedClient(session.supabaseAccessToken)

    // First, get all documents associated with this job
    const { data: documents, error: documentsError } = await supabase
      .from("documents")
      .select("id, file_path")
      .eq("job_id", jobId)
      .eq("user_id", session.user.id)

    if (documentsError) {
      console.error("Error fetching documents:", documentsError)
    }

    // Delete associated documents from storage and database
    if (documents && documents.length > 0) {
      // Delete files from storage
      const filePaths = documents.map((doc) => doc.file_path)
      const { error: storageError } = await supabase.storage.from("userdocuments").remove(filePaths)

      if (storageError) {
        console.error("Error deleting files from storage:", storageError)
      }

      // Delete document records from database
      const { error: docDeleteError } = await supabase
        .from("documents")
        .delete()
        .eq("job_id", jobId)
        .eq("user_id", session.user.id)

      if (docDeleteError) {
        console.error("Error deleting document records:", docDeleteError)
      }
    }

    // Delete the job
    const { error } = await supabase.from("jobs").delete().eq("id", jobId).eq("user_id", session.user.id)

    if (error) {
      throw new Error(error.message || "Failed to delete job.")
    }

    return NextResponse.json(
      {
        message: "Job and associated documents deleted successfully",
        deletedDocuments: documents?.length || 0,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error deleting job:", error)
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    return NextResponse.json({ error: `Failed to delete job: ${errorMessage}` }, { status: 500 })
  }
}

// GET: Get Single Job
export async function GET(
  request: NextRequest,
  // Perbarui tipe context.params menjadi Promise<any> atau any
  context: { params: Promise<any> }, // Mengubah ke Promise<any>
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || !session.supabaseAccessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Await context.params before accessing its properties
  const params = await context.params
  const jobId = params.id

  if (!jobId) {
    return NextResponse.json({ error: "Job ID is required" }, { status: 400 })
  }

  try {
    const supabase = getSupabaseAuthedClient(session.supabaseAccessToken)

    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .eq("user_id", session.user.id)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        // Not Found
        return NextResponse.json({ error: "Job not found" }, { status: 404 })
      }
      throw new Error(error.message || "Failed to fetch job.")
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching job:", error)
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    return NextResponse.json({ error: `Failed to fetch job: ${errorMessage}` }, { status: 500 })
  }
}
