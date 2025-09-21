export const runtime = 'nodejs';

import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const changes = await req.json().catch(() => ({}));

  const db = await readDB();
  let updated = null;
  db.tasks = (db.tasks || []).map(t => {
    if (String(t.id) === String(id)) {
      updated = { ...t, ...changes };
      return updated;
    }
    return t;
  });

  if (!updated) return NextResponse.json({ error: "Tarea no encontrada" }, { status: 404 });
  await writeDB(db);
  return NextResponse.json(updated, { status: 200 });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const db = await readDB();
  const before = db.tasks?.length || 0;
  db.tasks = (db.tasks || []).filter(t => String(t.id) !== String(id));
  if ((db.tasks?.length || 0) === before) {
    return NextResponse.json({ error: "Tarea no encontrada" }, { status: 404 });
  }
  await writeDB(db);
  return NextResponse.json({ ok: true }, { status: 200 });
}
