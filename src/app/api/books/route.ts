import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const sort = searchParams.get("sort") || "created_at";

    let query = supabaseAdmin
      .from("books")
      .select("*, categories(name), users!books_uploaded_by_fkey(name)", { count: "exact" })
      .eq("is_active", true);

    if (search) {
      query = query.textSearch("fts", search);
    }
    if (category) {
      query = query.eq("category_id", category);
    }

    const sortColumn =
      sort === "views" ? "views" : sort === "downloads" ? "downloads" : "created_at";

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: books, count, error } = await query
      .order(sortColumn, { ascending: false })
      .range(from, to);

    if (error) throw error;

    const total = count || 0;
    return NextResponse.json({
      books: books?.map((b: any) => ({
        ...b,
        category: b.categories,
        uploadedBy: b.users,
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user.role === "student") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    const { data: book, error } = await supabaseAdmin
      .from("books")
      .insert({
        title: body.title,
        author: body.author,
        description: body.description,
        category_id: body.category_id || null,
        cover_image: body.cover_image || "",
        file_url: body.file_url,
        pages: body.pages || null,
        language: body.language || "English",
        published_year: body.published_year || null,
        publisher: body.publisher || null,
        uploaded_by: session.user.id,
      })
      .select()
      .single();

    if (error) throw error;

    if (body.category_id) {
      await supabaseAdmin.rpc("increment_book_count", { cat_id: body.category_id });
    }

    return NextResponse.json(book, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
