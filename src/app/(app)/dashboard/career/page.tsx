"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Path = { id: string; title: string; description: string | null };
type Milestone = { id: string; title: string; target_date: string | null; completed: boolean; position: number };

export default function CareerPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [paths, setPaths] = useState<Path[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    reloadPaths();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reloadMilestones = useCallback(async (pathId: string) => {
    const { data } = await supabase
      .from("milestones")
      .select("id,title,target_date,completed,position")
      .eq("career_path_id", pathId)
      .order("position", { ascending: true });
    setMilestones((data || []) as Milestone[]);
  }, [supabase]);

  useEffect(() => {
    if (selectedId) reloadMilestones(selectedId);
  }, [selectedId, reloadMilestones]);

  async function reloadPaths() {
    const { data } = await supabase.from("career_paths").select("id,title,description").order("created_at", { ascending: true });
    const arr = (data || []) as Path[];
    setPaths(arr);
    if (!selectedId && arr.length) setSelectedId(arr[0].id);
  }

  // moved into useCallback above

  async function addPath(e: React.FormEvent) {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    await supabase.from("career_paths").insert({ title });
    setNewTitle("");
    reloadPaths();
    setMessage("Path added");
    setTimeout(() => setMessage(""), 1500);
  }

  async function addMilestone() {
    if (!selectedId) return;
    const title = prompt("Milestone title");
    if (!title) return;
    const target = prompt("Target date (YYYY-MM-DD)") || null;
    await supabase.from("milestones").insert({ career_path_id: selectedId, title, target_date: target });
    reloadMilestones(selectedId);
    setMessage("Milestone added");
    setTimeout(() => setMessage(""), 1500);
  }

  async function toggleMilestone(id: string, completed: boolean) {
    await supabase.from("milestones").update({ completed: !completed }).eq("id", id);
    if (selectedId) reloadMilestones(selectedId);
    setMessage("Milestone updated");
    setTimeout(() => setMessage(""), 1500);
  }

  async function deleteMilestone(id: string) {
    await supabase.from("milestones").delete().eq("id", id);
    if (selectedId) reloadMilestones(selectedId);
    setMessage("Milestone deleted");
    setTimeout(() => setMessage(""), 1500);
  }

  async function deletePath(pathId: string) {
    await supabase.from("career_paths").delete().eq("id", pathId);
    setSelectedId(null);
    reloadPaths();
    setMessage("Path deleted");
    setTimeout(() => setMessage(""), 1500);
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Career Path</h1>
      {message ? <div className="mb-3 text-sm px-3 py-2 rounded border border-green-200 bg-green-50 text-green-700">{message}</div> : null}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <aside className="md:col-span-1 border rounded p-3">
          <form onSubmit={addPath} className="flex gap-2 mb-3">
            <input className="flex-1 border rounded px-3 py-2 bg-transparent" placeholder="New path title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
            <button className="px-4 py-2 border rounded">Add</button>
          </form>
          <ul className="space-y-1">
            {paths.map((p) => (
              <li key={p.id}>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedId(p.id)}
                    className={`flex-1 text-left px-3 py-2 rounded border ${selectedId === p.id ? "bg-gray-100 dark:bg-gray-800" : ""}`}
                  >
                    {p.title}
                  </button>
                  <button className="text-xs px-2 py-1 rounded border" onClick={() => deletePath(p.id)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </aside>
        <section className="md:col-span-2">
          <div className="flex items-center justify-between">
            <div className="font-medium">Milestones</div>
            <button onClick={addMilestone} disabled={!selectedId} className="text-sm px-3 py-1.5 rounded border">Add Milestone</button>
          </div>
          <ul className="mt-3 space-y-2">
            {milestones.map((m) => (
              <li key={m.id} className="border rounded px-3 py-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={m.completed} onChange={() => toggleMilestone(m.id, m.completed)} />
                  <div>
                    <div className="font-medium">{m.title}</div>
                    {m.target_date ? <div className="text-xs text-gray-500">Target: {m.target_date}</div> : null}
                  </div>
                </div>
                <button className="text-xs px-3 py-1.5 rounded border" onClick={() => deleteMilestone(m.id)}>Delete</button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

