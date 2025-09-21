export const runtime = 'nodejs';

import { NextResponse } from "next/server";
import { readDB, writeDB, genId } from "@/lib/db";

export async function GET() {
  const db = await readDB();
  return NextResponse.json(db.projects || [], { status: 200 });
}

export async function POST(req: Request) {
  const { name, description } = await req.json().catch(() => ({}));
  if (!name) return NextResponse.json({ error: "name requerido" }, { status: 400 });

  const db = await readDB();
  // ids numéricos para compat con json-server ya existente:
  const nextId = (db.projects?.reduce((m,p)=>Math.max(m, Number(p.id)||0), 0) ?? 0) + 1;

  const project = {
    id: nextId,
    name,
    description: description ?? "",
    progress: 0,
    createdAt: new Date().toISOString(),
  };
  db.projects = db.projects || [];
  db.projects.push(project);
  await writeDB(db);
  return NextResponse.json(project, { status: 201 });
}
