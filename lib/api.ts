import axios from 'axios';

// ===== Configuración axios =====
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL : '/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 8000,
});

// ===== Tipos del backend (json-server) =====
export type ApiRole = 'manager' | 'user';

export type ApiUser = {
  id: number;
  name: string;
  email: string;
  password: string;   // <- necesario para comparar en el login
  role: ApiRole;
};

export type ApiProject = {
  id: number;
  name: string;
  description?: string;
  progress?: number;           // si calculas por tareas, esto puede ser opcional
  createdAt?: string;          // ISO
};

export type ApiTask = {
  id: number;
  title: string;
  status: 'todo' | 'done' | 'doing';
  projectId: number;
  assignee?: string;           // si migras a assigneeId: number | null, cambia aquí
  // assigneeId?: number | null;
};

// ===== Helpers CRUD =====
export const Projects = {
  list: () => api.get<ApiProject[]>('/projects').then((r) => r.data),
  create: (data: Partial<ApiProject>) => api.post<ApiProject>('/projects', data).then((r) => r.data),
  update: (id: number, data: Partial<ApiProject>) =>
    api.patch<ApiProject>(`/projects/${id}`, data).then((r) => r.data),
  remove: (id: number) => api.delete<void>(`/projects/${id}`),
};

export const Tasks = {
  list: (projectId?: number) => {
    const params: Record<string, any> = {};
    if (typeof projectId === 'number') params.projectId = projectId;
    return api.get<ApiTask[]>('/tasks', { params }).then((r) => r.data);
  },
  create: (data: Partial<ApiTask>) => api.post<ApiTask>('/tasks', data).then((r) => r.data),
  update: (id: number, data: Partial<ApiTask>) =>
    api.patch<ApiTask>(`/tasks/${id}`, data).then((r) => r.data),
  remove: (id: number) => api.delete<void>(`/tasks/${id}`),
};

export const Users = {
  list: () => api.get<ApiUser[]>('/users').then((r) => r.data),

  register: (data: Omit<ApiUser, 'id'>) =>
    api.post<ApiUser>('/users', data).then((r) => r.data),

  // usado por el login (compara password en el cliente)
  findByEmail: async (email: string): Promise<ApiUser | null> => {
    const res = await api.get<ApiUser[]>('/users', { params: { email } });
    return res.data?.[0] ?? null;
  },

  // opcional: si alguna vez quieres validar por query directa
  // (json-server permite filtrar por múltiples campos)
  findByEmailAndPassword: async (email: string, password: string): Promise<ApiUser | null> => {
    const res = await api.get<ApiUser[]>('/users', { params: { email, password } });
    return res.data?.[0] ?? null;
  },
};
