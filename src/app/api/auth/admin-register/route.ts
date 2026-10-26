import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase";

const ADMIN_ACCESS_CODE = process.env.ADMIN_ACCESS_CODE || "NDI-ADMIN-2024";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, adminCode } = await req.json();

    if (!name || !email || !password || !adminCode) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (adminCode !== ADMIN_ACCESS_CODE) {
      return NextResponse.json(
        { error: "Invalid admin access code" },
        { status: 403 }
      );
    }

    const { data: existing } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase())
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(password, 12);
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .insert({
        name,
        email: email.toLowerCase(),
        password: hashed,
        role: "admin",
      })
      .select("id")
      .single();

    if (error) throw error;

    return NextResponse.json(
      { message: "Admin account created", userId: user.id },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Registration failed" },
      { status: 500 }
    );
  }
}
