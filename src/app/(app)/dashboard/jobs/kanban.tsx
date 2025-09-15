"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Job = {
  id: string;
  company: string;
  title: string;
  status: "saved" | "applied" | "interview" | "offer" | "rejected";
  url: string | null;
  salary_range: string | null;
  location: string | null;
  remote_type: "remote" | "hybrid" | "onsite" | null;
  priority: number;
};

const COLUMNS: Job["status"][] = ["saved", "applied", "interview", "offer", "rejected"];

export default function JobsKanban({ reloadToken = 0, filterQuery = "" }: { reloadToken?: number; filterQuery?: string }) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadToken]);

  async function reload() {
    const { data } = await supabase
      .from("jobs")
      .select("id,company,title,status,url,salary_range,location,remote_type,priority")
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false });
    setJobs((data || []) as Job[]);
  }

  async function move(jobId: string, status: Job["status"]) {
    await supabase.from("jobs").update({ status }).eq("id", jobId);
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status } : j)));
  }

  async function remove(jobId: string) {
    await supabase.from("jobs").delete().eq("id", jobId);
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
    setMessage("Job deleted");
    setTimeout(() => setMessage(""), 1500);
  }

  function onDragStart(e: React.DragEvent, jobId: string) {
    e.dataTransfer.setData("text/plain", jobId);
  }

  function onDrop(e: React.DragEvent, status: Job["status"]) {
    const jobId = e.dataTransfer.getData("text/plain");
    if (jobId) move(jobId, status);
  }

  const q = filterQuery.toLowerCase();
  const visible = q
    ? jobs.filter((j) => j.company.toLowerCase().includes(q) || j.title.toLowerCase().includes(q))
    : jobs;

  return (
    <div>
      {message ? <div className="mb-3 text-sm px-3 py-2 rounded border border-green-200 bg-green-50 text-green-700">{message}</div> : null}
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
            {visible.filter((j) => j.status === col).map((j) => (
              <div
                key={j.id}
                draggable
                onDragStart={(e) => onDragStart(e, j.id)}
                className="border rounded-lg p-3 bg-white shadow-sm cursor-move hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{j.company}</div>
                    <div className="text-sm text-gray-600">{j.title}</div>
                  </div>
                  {j.priority > 3 && (
                    <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                      High Priority
                    </span>
                  )}
                </div>
                
                <div className="space-y-1 text-xs text-gray-500 mb-3">
                  {j.location && <div>📍 {j.location}</div>}
                  {j.remote_type && (
                    <div>
                      {j.remote_type === 'remote' ? '🏠' : j.remote_type === 'hybrid' ? '🏢🏠' : '🏢'} {j.remote_type.charAt(0).toUpperCase() + j.remote_type.slice(1)}
                    </div>
                  )}
                  {j.salary_range && <div>💰 {j.salary_range}</div>}
                </div>

                <div className="flex items-center gap-2">
                  {j.url && (
                    <a 
                      className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-200 hover:bg-blue-100 transition-colors" 
                      href={j.url} 
                      target="_blank" 
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View Listing
                    </a>
                  )}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(j.id);
                    }} 
                    className="text-xs text-red-600 hover:text-red-800 transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      </div>
    </div>
  );
}

