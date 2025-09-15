"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
};

type QuickAction = {
  id: string;
  title: string;
  description: string;
  prompt: string;
  icon: string;
};

export default function CoachPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: "init", 
      role: "assistant", 
      content: "Hi! I'm your AI career coach. I have access to your skills profile and job applications to give you personalized advice. How can I help you today?",
      timestamp: new Date().toISOString()
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userStats, setUserStats] = useState<{
    skillsCount: number;
    jobsCount: number;
    interviewsCount: number;
  } | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const quickActions: QuickAction[] = [
    {
      id: "skill-gaps",
      title: "Analyze Skill Gaps",
      description: "Get recommendations for skills to develop",
      prompt: "Analyze my skill gaps and recommend areas for improvement based on my current skills and job applications.",
      icon: "🎯"
    },
    {
      id: "job-strategy",
      title: "Job Search Strategy",
      description: "Optimize your application approach",
      prompt: "Review my job application history and suggest improvements to my job search strategy.",
      icon: "🚀"
    },
    {
      id: "interview-prep",
      title: "Interview Preparation",
      description: "Get ready for upcoming interviews",
      prompt: "Help me prepare for interviews based on my recent applications and interview history.",
      icon: "💼"
    },
    {
      id: "career-path",
      title: "Career Path Planning",
      description: "Plan your next career moves",
      prompt: "Based on my skills and experience, what are some potential career paths I should consider?",
      icon: "🛤️"
    },
    {
      id: "resume-tips",
      title: "Resume Optimization",
      description: "Improve your resume impact",
      prompt: "Give me specific tips to optimize my resume based on my skills and the types of jobs I'm applying to.",
      icon: "📄"
    },
    {
      id: "salary-negotiation",
      title: "Salary Negotiation",
      description: "Negotiate better compensation",
      prompt: "Help me prepare for salary negotiations based on my skills and the job market.",
      icon: "💰"
    }
  ];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    async function fetchUserStats() {
      try {
        const [skillsRes, jobsRes, interviewsRes] = await Promise.all([
          supabase.from("skills").select("id", { count: "exact", head: true }),
          supabase.from("jobs").select("id", { count: "exact", head: true }),
          supabase.from("interviews").select("id", { count: "exact", head: true })
        ]);

        setUserStats({
          skillsCount: skillsRes.count || 0,
          jobsCount: jobsRes.count || 0,
          interviewsCount: interviewsRes.count || 0
        });
      } catch (error) {
        console.error("Failed to fetch user stats:", error);
      }
    }

    fetchUserStats();
  }, [supabase]);

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    const userMsg: Message = { 
      id: crypto.randomUUID(), 
      role: "user", 
      content: text,
      timestamp: new Date().toISOString()
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);
    
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg].slice(-12) }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setMessages((m) => [...m, { 
          id: crypto.randomUUID(), 
          role: "assistant", 
          content: data.reply,
          timestamp: new Date().toISOString()
        }]);
      } else {
        throw new Error("Failed to get response");
      }
    } catch (error) {
      setMessages((m) => [...m, { 
        id: crypto.randomUUID(), 
        role: "assistant", 
        content: "I apologize, but I'm having trouble responding right now. Please try again in a moment.",
        timestamp: new Date().toISOString()
      }]);
    }
    
    setLoading(false);
  }

  async function sendQuickAction(action: QuickAction) {
    const userMsg: Message = { 
      id: crypto.randomUUID(), 
      role: "user", 
      content: action.prompt,
      timestamp: new Date().toISOString()
    };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);
    
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg].slice(-12) }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setMessages((m) => [...m, { 
          id: crypto.randomUUID(), 
          role: "assistant", 
          content: data.reply,
          timestamp: new Date().toISOString()
        }]);
      }
    } catch (error) {
      setMessages((m) => [...m, { 
        id: crypto.randomUUID(), 
        role: "assistant", 
        content: "I apologize, but I'm having trouble responding right now. Please try again in a moment.",
        timestamp: new Date().toISOString()
      }]);
    }
    
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">AI Career Coach</h1>
        {userStats && (
          <div className="flex gap-4 text-sm">
            <div className="bg-blue-50 px-3 py-1 rounded-lg">
              <span className="text-blue-700">Skills: {userStats.skillsCount}</span>
            </div>
            <div className="bg-green-50 px-3 py-1 rounded-lg">
              <span className="text-green-700">Applications: {userStats.jobsCount}</span>
            </div>
            <div className="bg-purple-50 px-3 py-1 rounded-lg">
              <span className="text-purple-700">Interviews: {userStats.interviewsCount}</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {messages.length <= 1 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => sendQuickAction(action)}
                  disabled={loading}
                  className="p-4 border rounded-lg text-left hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{action.icon}</span>
                    <div>
                      <h3 className="font-medium">{action.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chat Interface */}
      <div className="bg-white border rounded-lg shadow-sm">
        <div className="flex flex-col h-[600px]">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] ${m.role === "user" ? "order-2" : "order-1"}`}>
                  <div className={`px-4 py-3 rounded-lg ${
                    m.role === "user" 
                      ? "bg-blue-600 text-white" 
                      : "bg-gray-100 text-gray-900"
                  }`}>
                    <div className="whitespace-pre-wrap">{m.content}</div>
                  </div>
                  {m.timestamp && (
                    <div className={`text-xs text-gray-500 mt-1 ${
                      m.role === "user" ? "text-right" : "text-left"
                    }`}>
                      {new Date(m.timestamp).toLocaleTimeString()}
                    </div>
                  )}
                </div>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  m.role === "user" 
                    ? "bg-blue-600 text-white order-1 ml-3" 
                    : "bg-gray-300 text-gray-700 order-2 mr-3"
                }`}>
                  {m.role === "user" ? "You" : "AI"}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center text-sm font-medium mr-3">
                  AI
                </div>
                <div className="bg-gray-100 px-4 py-3 rounded-lg">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={bottomRef} />
          </div>
          
          {/* Input Form */}
          <div className="border-t p-4">
            <form onSubmit={onSend} className="flex gap-3">
              <input
                className="flex-1 border rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ask about your career, skills, job search, interviews..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Sending..." : "Send"}
              </button>
            </form>
            
            <div className="mt-2 text-xs text-gray-500">
              Your coach has access to your skills profile and job applications for personalized advice.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

