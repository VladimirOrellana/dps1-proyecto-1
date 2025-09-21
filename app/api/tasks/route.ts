export const runtime = 'nodejs';

import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  const db = await readDB();
  let tasks = db.tasks || [];
  if (projectId) tasks = tasks.filter(t => String(t.projectId) === String(projectId));
  return NextResponse.json(tasks, { status: 200 });
}

export async function POST(req: Request) {
  const { title, status, projectId, assignee } = await req.json().catch(() => ({}));
  if (!title || !status || !projectId) {
    return NextResponse.json({ error: "title, status, projectId requeridos" }, { status: 400 });
  }
  const db = await readDB();
  const nextId = (db.tasks?.reduce((m,t)=>Math.max(m, Number(t.id)||0), 0) ?? 0) + 1;

  const task = { id: nextId, title, status, projectId, assignee };
  db.tasks = db.tasks || [];
  db.tasks.push(task);
  await writeDB(db);
  return NextResponse.json(task, { status: 201 });
}
