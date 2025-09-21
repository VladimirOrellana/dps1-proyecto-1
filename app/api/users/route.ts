export const runtime = 'nodejs';

import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email")?.toLowerCase();
  const db = await readDB();
  let users = db.users || [];
  if (email) users = users.filter(u => u.email?.toLowerCase().includes(email));
  return NextResponse.json(users, { status: 200 });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { name, email, password, role } = body || {};
  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: "name, email, password, role requeridos" }, { status: 400 });
  }
  const db = await readDB();
  const exists = (db.users || []).some(u => u.email?.toLowerCase() === String(email).toLowerCase());
  if (exists) return NextResponse.json({ error: "email ya existe" }, { status: 409 });
  const id = (db.users?.reduce((m,u)=>Math.max(m, Number(u.id)||0), 0) ?? 0) + 1;
  const user = { id, name, email, password, role };
  db.users = db.users || [];
  db.users.push(user);
  await writeDB(db);
  return NextResponse.json(user, { status: 201 });
}
