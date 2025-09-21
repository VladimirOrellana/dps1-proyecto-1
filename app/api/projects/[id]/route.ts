import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";

export async function PATCH(_req: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const body = await _req.json().catch(() => ({}));
  const db = await readDB();
  let updated = null;

  db.projects = (db.projects || []).map(p => {
    if (String(p.id) === String(id)) {
      updated = { ...p, ...body };
      return updated;
    }
    return p;
  });

  if (!updated) return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
  await writeDB(db);
  return NextResponse.json(updated, { status: 200 });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const db = await readDB();
  const before = db.projects?.length || 0;

  db.projects = (db.projects || []).filter(p => String(p.id) !== String(id));
  db.tasks = (db.tasks || []).filter(t => String(t.projectId) !== String(id));

  if ((db.projects?.length || 0) === before) {
    return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
  }
  await writeDB(db);
  return NextResponse.json({ ok: true }, { status: 200 });
}
