"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Saved = {
  id: string;
  resource_id: string;
  created_at: string;
  notes: string | null;
  resource: { id: string; title: string; url: string; source: string | null; tags: string[] | null } | null;
};

export default function LibraryPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [items, setItems] = useState<Saved[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    reload().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function reload() {
    const { data } = await supabase
      .from("saved_resources")
      .select("id,resource_id,created_at,notes,resource:resource_id(id,title,url,source,tags)")
      .order("created_at", { ascending: false });
    setItems((data || []) as unknown as Saved[]);
  }

  async function remove(id: string) {
    await supabase.from("saved_resources").delete().eq("id", id);
    setItems((prev: Saved[]) => prev.filter((it: Saved) => it.id !== id));
    setMessage("Removed from library");
    setTimeout(() => setMessage(""), 1500);
  }

  const filtered = items.filter((it: Saved) => {
    const r = it.resource;
    if (!r) return false;
    const q = query.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      (r.source || "").toLowerCase().includes(q) ||
      (r.tags || []).some((t: string) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Saved Library</h1>
      {message ? <div className="mb-3 text-sm px-3 py-2 rounded border border-green-200 bg-green-50 text-green-700">{message}</div> : null}
      <div className="mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search saved resources…"
          className="w-full border rounded px-3 py-2 bg-transparent"
        />
      </div>
      {loading ? (
        <div>Loading…</div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((it: Saved) => (
            <li key={it.id} className="border rounded p-4">
              <div className="font-medium">{it.resource?.title}</div>
              <div className="text-xs text-gray-500 mt-1">
                {(it.resource?.source ? it.resource.source + " • " : "")}
                {it.resource?.url ? (
                  <a href={it.resource.url} className="underline" target="_blank" rel="noreferrer">Open</a>
                ) : null}
              </div>
              {it.resource?.tags && it.resource.tags.length ? (
                <div className="mt-2 flex flex-wrap gap-1">
                  {it.resource.tags.map((t: string) => (
                    <span key={t} className="text-[10px] px-1.5 py-0.5 rounded border">
                      {t}
                    </span>
                  ))}
                </div>
              ) : null}
              <div className="mt-3 flex items-center justify-between">
                <div className="text-xs text-gray-500">Saved {new Date(it.created_at).toLocaleDateString()}</div>
                <button onClick={() => remove(it.id)} className="text-sm px-3 py-1.5 rounded border">Remove</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

