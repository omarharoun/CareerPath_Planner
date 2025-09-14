"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Job = {
  id: string;
  company: string;
  title: string;
  status: "saved" | "applied" | "interview" | "offer" | "rejected";
  url: string | null;
};

const COLUMNS: Job["status"][] = ["saved", "applied", "interview", "offer", "rejected"];

export default function JobsKanban() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function reload() {
    const { data } = await supabase
      .from("jobs")
      .select("id,company,title,status,url")
      .order("created_at", { ascending: false });
    setJobs((data || []) as Job[]);
  }

  async function move(jobId: string, status: Job["status"]) {
    await supabase.from("jobs").update({ status }).eq("id", jobId);
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status } : j)));
  }

  function onDragStart(e: React.DragEvent, jobId: string) {
    e.dataTransfer.setData("text/plain", jobId);
  }

  function onDrop(e: React.DragEvent, status: Job["status"]) {
    const jobId = e.dataTransfer.getData("text/plain");
    if (jobId) move(jobId, status);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
      {COLUMNS.map((col) => (
        <div
          key={col}
          className="min-h-[200px] rounded border p-2"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => onDrop(e, col)}
        >
          <div className="text-sm font-semibold capitalize mb-2">{col}</div>
          <div className="space-y-2">
            {jobs.filter((j) => j.status === col).map((j) => (
              <div
                key={j.id}
                draggable
                onDragStart={(e) => onDragStart(e, j.id)}
                className="border rounded p-2 bg-white/50 dark:bg-gray-900 cursor-move"
              >
                <div className="font-medium text-sm">{j.company} — {j.title}</div>
                {j.url ? <a className="text-xs underline" href={j.url} target="_blank" rel="noreferrer">Listing</a> : null}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

