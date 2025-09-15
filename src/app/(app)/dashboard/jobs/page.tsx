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
  salary_range: string | null;
  location: string | null;
  remote_type: "remote" | "hybrid" | "onsite" | null;
  applied_date: string | null;
  follow_up_date: string | null;
  priority: number;
  created_at: string;
  updated_at: string;
};

type Interview = {
  id: string;
  user_id: string;
  job_id: string;
  interview_type: "phone" | "video" | "onsite" | "technical" | "behavioral";
  scheduled_date: string | null;
  duration_minutes: number | null;
  interviewer_name: string | null;
  interviewer_role: string | null;
  preparation_notes: string | null;
  outcome_notes: string | null;
  rating: number | null;
  status: "scheduled" | "completed" | "cancelled" | "rescheduled";
  created_at: string;
};

type JobFollowUp = {
  id: string;
  user_id: string;
  job_id: string;
  follow_up_type: "thank_you" | "status_check" | "additional_info" | "networking";
  scheduled_date: string;
  completed: boolean;
  notes: string | null;
  created_at: string;
};

const statuses: Job["status"][] = ["saved", "applied", "interview", "offer", "rejected"];

export default function JobsPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [reloadToken, setReloadToken] = useState(0);
  const [query, setQuery] = useState("");
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [followUps, setFollowUps] = useState<JobFollowUp[]>([]);
  
  // Form states
  const [company, setCompany] = useState("");
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<Job["status"]>("saved");
  const [url, setUrl] = useState("");
  const [salaryRange, setSalaryRange] = useState("");
  const [location, setLocation] = useState("");
  const [remoteType, setRemoteType] = useState<Job["remote_type"]>(null);
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState(1);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"kanban" | "interviews" | "followups" | "analytics">("kanban");
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [showJobForm, setShowJobForm] = useState(false);

  async function fetchJobs() {
    // light ping to validate access; kanban handles its own fetch
    await supabase.from("jobs").select("id", { count: "exact", head: true });
  }

  async function fetchInterviews() {
    const { data } = await supabase
      .from("interviews")
      .select("*")
      .order("scheduled_date", { ascending: true });
    if (data) setInterviews(data as Interview[]);
  }

  async function fetchFollowUps() {
    const { data } = await supabase
      .from("job_follow_ups")
      .select("*")
      .order("scheduled_date", { ascending: true });
    if (data) setFollowUps(data as JobFollowUp[]);
  }

  useEffect(() => {
    Promise.all([fetchJobs(), fetchInterviews(), fetchFollowUps()])
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onAddJob(e: React.FormEvent) {
    e.preventDefault();
    if (!company.trim() || !title.trim()) return;
    const { error } = await supabase.from("jobs").insert({ 
      company, 
      title, 
      status, 
      url: url || null,
      salary_range: salaryRange || null,
      location: location || null,
      remote_type: remoteType,
      notes: notes || null,
      priority,
      applied_date: status === "applied" ? new Date().toISOString().split('T')[0] : null
    });
    if (!error) {
      setCompany("");
      setTitle("");
      setStatus("saved");
      setUrl("");
      setSalaryRange("");
      setLocation("");
      setRemoteType(null);
      setNotes("");
      setPriority(1);
      setReloadToken((t) => t + 1);
      setShowJobForm(false);
      setMessage("Job application added successfully");
      setTimeout(() => setMessage(""), 1500);
    }
  }

  async function addInterview(jobId: string, interviewData: Partial<Interview>) {
    const { error } = await supabase.from("interviews").insert({
      job_id: jobId,
      ...interviewData
    });
    if (!error) {
      fetchInterviews();
      setMessage("Interview scheduled successfully");
      setTimeout(() => setMessage(""), 1500);
    }
  }

  async function addFollowUp(jobId: string, followUpData: Partial<JobFollowUp>) {
    const { error } = await supabase.from("job_follow_ups").insert({
      job_id: jobId,
      ...followUpData
    });
    if (!error) {
      fetchFollowUps();
      setMessage("Follow-up scheduled successfully");
      setTimeout(() => setMessage(""), 1500);
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading job applications...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Job Application Management</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("kanban")}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              activeTab === "kanban" ? "bg-blue-50 border-blue-200 text-blue-700" : "border-gray-200"
            }`}
          >
            Kanban Board
          </button>
          <button
            onClick={() => setActiveTab("interviews")}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              activeTab === "interviews" ? "bg-blue-50 border-blue-200 text-blue-700" : "border-gray-200"
            }`}
          >
            Interviews
          </button>
          <button
            onClick={() => setActiveTab("followups")}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              activeTab === "followups" ? "bg-blue-50 border-blue-200 text-blue-700" : "border-gray-200"
            }`}
          >
            Follow-ups
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              activeTab === "analytics" ? "bg-blue-50 border-blue-200 text-blue-700" : "border-gray-200"
            }`}
          >
            Analytics
          </button>
        </div>
      </div>

      {message && (
        <div className="px-4 py-3 rounded-lg border border-green-200 bg-green-50 text-green-700">
          {message}
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex gap-4">
        <button
          onClick={() => setShowJobForm(!showJobForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showJobForm ? "Cancel" : "Add New Job Application"}
        </button>
        <input
          className="flex-1 max-w-md border rounded-lg px-3 py-2 bg-white"
          placeholder="Search company or title…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Add Job Form */}
      {showJobForm && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Add New Job Application</h2>
          <form onSubmit={onAddJob} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Company *</label>
                <input 
                  className="w-full border rounded-lg px-3 py-2 bg-white" 
                  value={company} 
                  onChange={(e) => setCompany(e.target.value)} 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Job Title *</label>
                <input 
                  className="w-full border rounded-lg px-3 py-2 bg-white" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select 
                  className="w-full border rounded-lg px-3 py-2 bg-white" 
                  value={status} 
                  onChange={(e) => setStatus(e.target.value as Job["status"])}
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Priority</label>
                <select 
                  className="w-full border rounded-lg px-3 py-2 bg-white" 
                  value={priority} 
                  onChange={(e) => setPriority(Number(e.target.value))}
                >
                  <option value={1}>Low</option>
                  <option value={2}>Medium</option>
                  <option value={3}>High</option>
                  <option value={4}>Very High</option>
                  <option value={5}>Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Remote Type</label>
                <select 
                  className="w-full border rounded-lg px-3 py-2 bg-white" 
                  value={remoteType || ""} 
                  onChange={(e) => setRemoteType(e.target.value as Job["remote_type"] || null)}
                >
                  <option value="">Not specified</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">On-site</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <input 
                  className="w-full border rounded-lg px-3 py-2 bg-white" 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, State/Country"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Salary Range</label>
                <input 
                  className="w-full border rounded-lg px-3 py-2 bg-white" 
                  value={salaryRange} 
                  onChange={(e) => setSalaryRange(e.target.value)}
                  placeholder="e.g. $80k - $100k"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Job Posting URL</label>
              <input 
                className="w-full border rounded-lg px-3 py-2 bg-white" 
                value={url} 
                onChange={(e) => setUrl(e.target.value)} 
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Notes</label>
              <textarea 
                className="w-full border rounded-lg px-3 py-2 bg-white" 
                rows={3}
                value={notes} 
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Requirements, contacts, application notes..."
              />
            </div>

            <div className="flex gap-2">
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Add Job Application
              </button>
              <button 
                type="button" 
                onClick={() => setShowJobForm(false)}
                className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === "kanban" && (
        <div>
          <JobsKanban reloadToken={reloadToken} filterQuery={query} />
        </div>
      )}

      {activeTab === "interviews" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Interview Management</h2>
            <button
              onClick={() => {
                // This would open an interview scheduling modal
                // For now, we'll just show a placeholder
                setMessage("Interview scheduling feature coming soon!");
                setTimeout(() => setMessage(""), 2000);
              }}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Schedule Interview
            </button>
          </div>
          
          {interviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {interviews.map((interview) => (
                <div key={interview.id} className="border rounded-lg p-4 bg-white shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium">Interview</h3>
                      <p className="text-sm text-gray-600">{interview.interview_type}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      interview.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                      interview.status === 'completed' ? 'bg-green-100 text-green-700' :
                      interview.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {interview.status}
                    </span>
                  </div>
                  
                  {interview.scheduled_date && (
                    <p className="text-sm mb-2">
                      📅 {new Date(interview.scheduled_date).toLocaleString()}
                    </p>
                  )}
                  
                  {interview.interviewer_name && (
                    <p className="text-sm mb-2">
                      👤 {interview.interviewer_name} {interview.interviewer_role && `(${interview.interviewer_role})`}
                    </p>
                  )}
                  
                  {interview.preparation_notes && (
                    <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
                      <strong>Prep Notes:</strong> {interview.preparation_notes}
                    </div>
                  )}
                  
                  {interview.outcome_notes && (
                    <div className="mt-3 p-2 bg-green-50 rounded text-sm">
                      <strong>Outcome:</strong> {interview.outcome_notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-2">No interviews scheduled</p>
              <p>Schedule your first interview to start tracking your progress!</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "followups" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Follow-up Management</h2>
            <button
              onClick={() => {
                // This would open a follow-up scheduling modal
                setMessage("Follow-up scheduling feature coming soon!");
                setTimeout(() => setMessage(""), 2000);
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Schedule Follow-up
            </button>
          </div>
          
          {followUps.length > 0 ? (
            <div className="space-y-4">
              {followUps.map((followUp) => (
                <div key={followUp.id} className="border rounded-lg p-4 bg-white flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        followUp.follow_up_type === 'thank_you' ? 'bg-purple-100 text-purple-700' :
                        followUp.follow_up_type === 'status_check' ? 'bg-blue-100 text-blue-700' :
                        followUp.follow_up_type === 'additional_info' ? 'bg-orange-100 text-orange-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {followUp.follow_up_type.replace('_', ' ')}
                      </span>
                      <span className="font-medium">
                        📅 {new Date(followUp.scheduled_date).toLocaleDateString()}
                      </span>
                      {followUp.completed && <span className="text-green-600">✅ Completed</span>}
                    </div>
                    {followUp.notes && (
                      <p className="text-sm text-gray-600 mt-1">{followUp.notes}</p>
                    )}
                  </div>
                  {!followUp.completed && (
                    <button
                      onClick={async () => {
                        await supabase.from("job_follow_ups").update({ completed: true }).eq("id", followUp.id);
                        fetchFollowUps();
                        setMessage("Follow-up marked as completed");
                        setTimeout(() => setMessage(""), 1500);
                      }}
                      className="text-sm bg-green-50 text-green-700 px-3 py-1 rounded-lg border border-green-200 hover:bg-green-100 transition-colors"
                    >
                      Mark Complete
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-2">No follow-ups scheduled</p>
              <p>Schedule follow-ups to stay on top of your applications!</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Application Analytics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-700">Total Applications</h3>
              <p className="text-2xl font-bold text-blue-900">Coming Soon</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-700">Interviews</h3>
              <p className="text-2xl font-bold text-green-900">{interviews.length}</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-medium text-purple-700">Follow-ups</h3>
              <p className="text-2xl font-bold text-purple-900">{followUps.length}</p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="font-medium text-orange-700">Response Rate</h3>
              <p className="text-2xl font-bold text-orange-900">Coming Soon</p>
            </div>
          </div>
          
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">Detailed Analytics Coming Soon</p>
            <p>Track your application success rates, response times, and more!</p>
          </div>
        </div>
      )}
    </div>
  );
}

