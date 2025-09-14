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
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Skills</h1>
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
          {skills.map((s) => (
            <li key={s.id} className="border rounded px-3 py-2 flex items-center justify-between">
              <div>
                <div className="font-medium">{s.name}</div>
                <div className="text-xs text-gray-500">Level: {s.level ?? "n/a"}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

