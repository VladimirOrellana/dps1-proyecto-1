import { promises as fs } from "fs";
import path from "path";

export type User = { id: number|string; name: string; email: string; password?: string; role?: "manager"|"user" };
export type Project = { id: number|string; name: string; description?: string; progress?: number; createdAt?: string };
export type Task = { id: number|string; title: string; status: "todo"|"doing"|"done"; projectId: number|string; assignee?: string };

export type DB = { users: User[]; projects: Project[]; tasks: Task[] };

// Path normal (local)
const ROOT_DB_PATH = path.join(process.cwd(), "db.json");
// Path temporal (Vercel)
const RUNTIME_DB_PATH = path.join("/tmp", "db.json");

async function ensureRuntimeDB(): Promise<string> {
  // Si no estamos en Vercel => usa el archivo local normal
  if (!process.env.VERCEL) {
    return ROOT_DB_PATH;
  }

  // En Vercel: revisa si ya existe el archivo en /tmp
  try {
    await fs.access(RUNTIME_DB_PATH);
  } catch {
    // Si no existe, cópialo desde la raíz
    const raw = await fs.readFile(ROOT_DB_PATH, "utf8");
    await fs.writeFile(RUNTIME_DB_PATH, raw, "utf8");
  }

  return RUNTIME_DB_PATH;
}

export async function readDB(): Promise<DB> {
  const p = await ensureRuntimeDB();
  const raw = await fs.readFile(p, "utf8");
  return JSON.parse(raw);
}

export async function writeDB(db: DB) {
  const p = await ensureRuntimeDB();
  await fs.writeFile(p, JSON.stringify(db, null, 2), "utf8");
}

export function genId(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2,10)}`;
}
