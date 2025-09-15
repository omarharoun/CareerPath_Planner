"use client";

import { useEffect, useMemo, useState } from "react";
import JobsKanban from "./kanban";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Job = {
  id: string;
  user_id: string;
  company: string;
  title: string;
  status: "saved" | "applied" | "interview" | "offer" | "rejected";
  url: string | null;
  notes: string | null;
  created_at: string;
};

const statuses: Job["status"][] = ["saved", "applied", "interview", "offer", "rejected"];

export default function JobsPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [reloadToken, setReloadToken] = useState(0);
  const [query, setQuery] = useState("");
  const [company, setCompany] = useState("");
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<Job["status"]>("saved");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function fetchJobs() {
    // light ping to validate access; kanban handles its own fetch
    await supabase.from("jobs").select("id", { count: "exact", head: true });
  }

  useEffect(() => {
    fetchJobs().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onAddJob(e: React.FormEvent) {
    e.preventDefault();
    if (!company.trim() || !title.trim()) return;
    const { error } = await supabase.from("jobs").insert({ company, title, status, url: url || null });
    if (!error) {
      setCompany("");
      setTitle("");
      setStatus("saved");
      setUrl("");
      setReloadToken((t) => t + 1);
      setMessage("Job added");
      setTimeout(() => setMessage(""), 1500);
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Jobs</h1>
      {message ? <div className="mb-3 text-sm px-3 py-2 rounded border border-green-200 bg-green-50 text-green-700">{message}</div> : null}
      <div className="mb-4">
        <input
          className="w-full md:w-80 border rounded px-3 py-2 bg-transparent"
          placeholder="Search company or title…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <form onSubmit={onAddJob} className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-6">
        <div className="md:col-span-1">
          <label className="block text-sm mb-1">Company</label>
          <input className="w-full border rounded px-3 py-2 bg-transparent" value={company} onChange={(e) => setCompany(e.target.value)} />
        </div>
        <div className="md:col-span-1">
          <label className="block text-sm mb-1">Title</label>
          <input className="w-full border rounded px-3 py-2 bg-transparent" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="md:col-span-1">
          <label className="block text-sm mb-1">Status</label>
          <select className="w-full border rounded px-3 py-2 bg-transparent" value={status} onChange={(e) => setStatus(e.target.value as Job["status"]) }>
            {statuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm mb-1">URL</label>
          <input className="w-full border rounded px-3 py-2 bg-transparent" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
        </div>
        <div className="md:col-span-5">
          <button className="h-10 px-4 border rounded">Add</button>
        </div>
      </form>

      {loading ? <div>Loading…</div> : <JobsKanban reloadToken={reloadToken} filterQuery={query} />}
    </div>
  );
}

