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
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const pageSize = 10;
  const [message, setMessage] = useState("");

  useEffect(() => {
    let ignore = false;
    async function load() {
      const { count } = await supabase
        .from("resources")
        .select("id", { count: "exact", head: true });
      if (!ignore && typeof count === "number") setTotal(count);

      const from = page * pageSize;
      const to = from + pageSize - 1;
      const { data } = await supabase
        .from("resources")
        .select("id,title,url,source,tags")
        .order("created_at", { ascending: false })
        .range(from, to);
      if (!ignore && data) {
        const arr = data as unknown as Resource[];
        setCatalog(arr);
        if (arr.length === 0) {
          await importDemo();
          const { data: again, count: countAfter } = await supabase
            .from("resources")
            .select("id,title,url,source,tags", { count: "exact" })
            .order("created_at", { ascending: false })
            .range(from, to);
          if (!ignore && typeof countAfter === "number") setTotal(countAfter);
          if (!ignore && again) setCatalog(again as unknown as Resource[]);
        }
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [supabase, page]);

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
    setMessage("Saved to library");
    setTimeout(() => setMessage(""), 1500);
  }

  async function importDemo() {
    const demo: Omit<Resource, "id">[] = [
      { title: "How to tailor your resume for each job", url: "https://example.com/resume-tailor", source: "Blog", tags: ["resume", "ats"] },
      { title: "Best outreach templates for cold emails", url: "https://example.com/outreach-templates", source: "Guide", tags: ["outreach", "networking"] },
      { title: "Top SQL interview questions", url: "https://example.com/sql-interview", source: "Article", tags: ["sql", "interview"] },
    ];
    for (const r of demo) {
      await supabase.from("resources").insert({ title: r.title, url: r.url, source: r.source || null, tags: r.tags || [] });
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Resources</h1>
      {message ? <div className="mb-3 text-sm px-3 py-2 rounded border border-green-200 bg-green-50 text-green-700">{message}</div> : null}
      <div className="mb-3 text-sm text-gray-600">{total} total</div>
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
      <div className="mt-4 flex items-center justify-between">
        <button className="px-3 py-1.5 rounded border" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>Previous</button>
        <div className="text-sm">Page {page + 1}</div>
        <button className="px-3 py-1.5 rounded border" disabled={(page + 1) * pageSize >= total} onClick={() => setPage((p) => p + 1)}>Next</button>
      </div>
    </div>
  );
}

