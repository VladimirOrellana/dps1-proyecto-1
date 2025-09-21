'use client'
import { useState } from 'react';
import { Projects } from '@/lib/api';

export default function ProjectForm({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await Projects.create({ name, description: desc, progress: 0, createdAt: new Date().toISOString() });
    setName(''); setDesc(''); onCreated();
  }

  return (
    <form className="card grid gap-3" onSubmit={submit}>
      <h3 className="font-semibold">Create Project</h3>
      <div>
        <label className="label">Name</label>
        <input className="input" value={name} onChange={e => setName(e.target.value)} required />
      </div>
      <div>
        <label className="label">Description</label>
        <textarea className="input" value={desc} onChange={e => setDesc(e.target.value)} />
      </div>
      <button className="btn btn-primary w-fit">Create</button>
    </form>
  )
}
