"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Skill = {
  id: string;
  user_id: string;
  name: string;
  level: number | null;
  created_at: string;
};

export default function SkillsPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [name, setName] = useState("");
  const [level, setLevel] = useState<number | "">("");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingLevel, setEditingLevel] = useState<number | "">("");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"created" | "name" | "level">("created");
  const [message, setMessage] = useState("");

  async function fetchSkills() {
    const { data, error } = await supabase
      .from("skills")
      .select("id,user_id,name,level,created_at")
      .order("created_at", { ascending: false });
    if (!error && data) setSkills(data as Skill[]);
  }

  useEffect(() => {
    fetchSkills().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onAddSkill(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const { error } = await supabase
      .from("skills")
      .insert({ name, level: level === "" ? null : Number(level) });
    if (!error) {
      setName("");
      setLevel("");
      fetchSkills();
      setMessage("Skill added");
      setTimeout(() => setMessage(""), 1500);
    }
  }

  function startEdit(skill: Skill) {
    setEditingId(skill.id);
    setEditingName(skill.name);
    setEditingLevel(skill.level ?? "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingName("");
    setEditingLevel("");
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    const payload: Partial<Skill> = {
      name: editingName.trim(),
      level: editingLevel === "" ? null : Number(editingLevel),
    } as unknown as Partial<Skill>;
    await supabase.from("skills").update(payload).eq("id", editingId);
    cancelEdit();
    fetchSkills();
    setMessage("Skill updated");
    setTimeout(() => setMessage(""), 1500);
  }

  async function deleteSkill(skillId: string) {
    await supabase.from("skills").delete().eq("id", skillId);
    setSkills((prev) => prev.filter((s) => s.id !== skillId));
    setMessage("Skill deleted");
    setTimeout(() => setMessage(""), 1500);
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Skills</h1>
      {message ? <div className="mb-3 text-sm px-3 py-2 rounded border border-green-200 bg-green-50 text-green-700">{message}</div> : null}
      <div className="flex flex-wrap gap-3 items-end mb-4">
        <div>
          <label className="block text-sm mb-1">Search</label>
          <input className="w-64 border rounded px-3 py-2 bg-transparent" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name…" />
        </div>
        <div>
          <label className="block text-sm mb-1">Sort by</label>
          <select className="w-44 border rounded px-3 py-2 bg-transparent" value={sortBy} onChange={(e) => setSortBy(e.target.value as "created" | "name" | "level")}>
            <option value="created">Created</option>
            <option value="name">Name</option>
            <option value="level">Level</option>
          </select>
        </div>
      </div>
      <form onSubmit={onAddSkill} className="flex items-end gap-2 mb-6">
        <div className="flex-1">
          <label className="block text-sm mb-1">Name</label>
          <input
            className="w-full border rounded px-3 py-2 bg-transparent"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. React, SQL, Product Design"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Level (0-5)</label>
          <input
            type="number"
            min={0}
            max={5}
            className="w-28 border rounded px-3 py-2 bg-transparent"
            value={level}
            onChange={(e) => setLevel(e.target.value === "" ? "" : Number(e.target.value))}
          />
        </div>
        <button className="h-10 px-4 border rounded">Add</button>
      </form>

      {loading ? (
        <div>Loading…</div>
      ) : (
        <ul className="space-y-2">
          {skills
            .filter((s) => s.name.toLowerCase().includes(query.toLowerCase()))
            .sort((a, b) => {
              if (sortBy === "name") return a.name.localeCompare(b.name);
              if (sortBy === "level") return (b.level ?? -1) - (a.level ?? -1);
              return 0;
            })
            .map((s) => (
            <li key={s.id} className="border rounded px-3 py-2">
              {editingId === s.id ? (
                <form onSubmit={saveEdit} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end">
                  <div className="md:col-span-2">
                    <label className="block text-sm mb-1">Name</label>
                    <input
                      className="w-full border rounded px-3 py-2 bg-transparent"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-sm mb-1">Level (0-5)</label>
                    <input
                      type="number"
                      min={0}
                      max={5}
                      className="w-full border rounded px-3 py-2 bg-transparent"
                      value={editingLevel}
                      onChange={(e) => setEditingLevel(e.target.value === "" ? "" : Number(e.target.value))}
                    />
                  </div>
                  <div className="flex gap-2 md:col-span-2">
                    <button className="h-10 px-4 border rounded">Save</button>
                    <button type="button" onClick={cancelEdit} className="h-10 px-4 border rounded">Cancel</button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-xs text-gray-500">Level: {s.level ?? "n/a"}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => startEdit(s)} className="text-sm px-3 py-1.5 rounded border">Edit</button>
                    <button onClick={() => deleteSkill(s.id)} className="text-sm px-3 py-1.5 rounded border">Delete</button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

