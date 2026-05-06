import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ 
    status: "ok", 
    service: "Atlas Global Payments — Frontend",
    version: "2.0.0",
    auth: "supabase-jwks"
  });
}
