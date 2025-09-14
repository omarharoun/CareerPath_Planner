"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Resource = {
  id: string;
  title: string;
  url: string;
  source: string | null;
  tags: string[] | null;
};

export default function ResourcesPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [catalog, setCatalog] = useState<Resource[]>([]);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    async function load() {
      const { data } = await supabase
        .from("resources")
        .select("id,title,url,source,tags")
        .order("created_at", { ascending: false })
        .limit(100);
      if (!ignore && data) setCatalog(data as unknown as Resource[]);
    }
    load();
    return () => {
      ignore = true;
    };
  }, [supabase]);

  const filtered = catalog.filter((r) => {
    const q = query.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      (r.source || "").toLowerCase().includes(q) ||
      (r.tags || []).some((t) => t.toLowerCase().includes(q))
    );
  });

  async function saveResource(resourceId: string) {
    setSaving(resourceId);
    await supabase.from("saved_resources").insert({ resource_id: resourceId });
    setSaving(null);
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Resources</h1>
      <div className="mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search topics, tags, sources…"
          className="w-full border rounded px-3 py-2 bg-transparent"
        />
      </div>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((r) => (
          <li key={r.id} className="border rounded p-4">
            <div className="font-medium">{r.title}</div>
            <div className="text-xs text-gray-500 mt-1">
              {r.source ? r.source + " • " : ""}
              <a href={r.url} className="underline" target="_blank" rel="noreferrer">Open</a>
            </div>
            {r.tags && r.tags.length ? (
              <div className="mt-2 flex flex-wrap gap-1">
                {r.tags.map((t) => (
                  <span key={t} className="text-[10px] px-1.5 py-0.5 rounded border">
                    {t}
                  </span>
                ))}
              </div>
            ) : null}
            <div className="mt-3">
              <button
                onClick={() => saveResource(r.id)}
                disabled={saving === r.id}
                className="text-sm px-3 py-1.5 rounded border"
              >
                {saving === r.id ? "Saving…" : "Save to library"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

