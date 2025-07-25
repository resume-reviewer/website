import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { createClient } from "@supabase/supabase-js"

const getSupabaseAuthedClient = (accessToken: string) => {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  })
}

export async function DELETE(request: NextRequest, context: { params: Promise<any> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || !session.supabaseAccessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const params = await context.params
  const documentId = params.id

  if (!documentId) {
    return NextResponse.json({ error: "Document ID is required" }, { status: 400 })
  }

  try {
    const supabase = getSupabaseAuthedClient(session.supabaseAccessToken)

    // First, get the document to get the file path
    const { data: document, error: fetchError } = await supabase
      .from("documents")
      .select("file_path")
      .eq("id", documentId)
      .eq("user_id", session.user.id)
      .single()

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return NextResponse.json({ error: "Document not found" }, { status: 404 })
      }
      throw fetchError
    }

    // Delete the file from storage
    const { error: storageError } = await supabase.storage.from("userdocuments").remove([document.file_path])

    if (storageError) {
      console.error("Error deleting file from storage:", storageError)
      // Continue with database deletion even if storage deletion fails
    }

    // Delete the document record from database
    const { error: dbError } = await supabase
      .from("documents")
      .delete()
      .eq("id", documentId)
      .eq("user_id", session.user.id)

    if (dbError) {
      throw dbError
    }

    return NextResponse.json({ message: "Document deleted successfully" })
  } catch (error) {
    console.error("Error deleting document:", error)
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 })
  }
}
