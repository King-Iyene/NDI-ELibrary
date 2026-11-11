import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: book, error } = await supabaseAdmin
      .from("books")
      .select("*, categories(name), users!books_uploaded_by_fkey(name)")
      .eq("id", params.id)
      .single();

    if (error || !book) return NextResponse.json({ error: "Book not found" }, { status: 404 });

    await supabaseAdmin
      .from("books")
      .update({ views: (book.views || 0) + 1 })
      .eq("id", params.id);

    return NextResponse.json({ ...book, category: book.categories, uploadedBy: book.users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role === "student") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const updateData: Record<string, any> = { updated_at: new Date().toISOString() };
    const allowed = ["title", "author", "description", "category_id", "cover_image", "file_url", "pages", "language", "published_year", "publisher", "is_active"];
    for (const key of allowed) {
      if (key in body) {
        updateData[key] = key === "category_id" ? (body[key] || null) : body[key];
      }
    }
    const { data: book, error } = await supabaseAdmin
      .from("books")
      .update(updateData)
      .eq("id", params.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: "Book not found" }, { status: 404 });

    return NextResponse.json(book);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role === "student") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await supabaseAdmin
      .from("books")
      .update({ is_active: false })
      .eq("id", params.id);

    return NextResponse.json({ message: "Book deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
