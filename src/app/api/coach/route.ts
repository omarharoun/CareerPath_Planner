import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

const systemPrompt = `You are an AI career coach helping job seekers and employees track skills, plan learning, improve resumes, and optimize job search. 

You have access to the user's:
- Skills profile with levels, categories, and progress tracking
- Job applications and their current status
- Interview history and outcomes
- Career goals and milestones

Provide personalized, data-driven advice based on their actual profile. Be encouraging, specific, and actionable. When appropriate, reference their actual skills, applications, or progress to make recommendations more relevant.

Key coaching areas:
- Skill development and gap analysis
- Job search strategy optimization
- Interview preparation
- Resume and LinkedIn optimization
- Career path planning
- Networking strategies
- Salary negotiation

Always be supportive and motivational while providing practical, actionable advice.`;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const messages = (body?.messages ?? []) as { role: "user" | "assistant"; content: string }[];

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
  }

  try {
    // Get user data to provide context
    const cookieStore = cookies();
    const supabase = createSupabaseServerClient(cookieStore);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user's skills
    const { data: skills } = await supabase
      .from("skills")
      .select("name, level, category, target_level, hours_practiced")
      .eq("user_id", user.id)
      .order("level", { ascending: false });

    // Fetch user's recent job applications
    const { data: jobs } = await supabase
      .from("jobs")
      .select("company, title, status, location, remote_type, salary_range")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    // Fetch recent interviews
    const { data: interviews } = await supabase
      .from("interviews")
      .select("interview_type, status, rating, outcome_notes")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    // Create context about the user
    let userContext = "";
    
    if (skills && skills.length > 0) {
      const topSkills = skills.slice(0, 5);
      const skillGaps = skills.filter(s => s.target_level && s.level && s.level < s.target_level);
      
      userContext += `\n\nUser's Skills Profile:
Top Skills: ${topSkills.map(s => `${s.name} (Level ${s.level}/5${s.target_level ? `, Target: ${s.target_level}` : ''})`).join(', ')}`;
      
      if (skillGaps.length > 0) {
        userContext += `\nSkill Gaps: ${skillGaps.map(s => `${s.name} (${s.level}→${s.target_level})`).join(', ')}`;
      }

      // Group by category
      const categories = [...new Set(skills.map(s => s.category))];
      if (categories.length > 1) {
        userContext += `\nSkill Categories: ${categories.join(', ')}`;
      }
    }

    if (jobs && jobs.length > 0) {
      const statusCounts = jobs.reduce((acc: any, job) => {
        acc[job.status] = (acc[job.status] || 0) + 1;
        return acc;
      }, {});
      
      userContext += `\n\nJob Search Activity:
Recent Applications: ${jobs.length} total
Status Breakdown: ${Object.entries(statusCounts).map(([status, count]) => `${status}: ${count}`).join(', ')}
Recent Companies: ${jobs.slice(0, 3).map(j => j.company).join(', ')}`;

      const remotePrefs = jobs.map(j => j.remote_type).filter(Boolean);
      if (remotePrefs.length > 0) {
        const mostCommon = remotePrefs.reduce((a, b, i, arr) => 
          arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b
        );
        userContext += `\nWork Preference: ${mostCommon}`;
      }
    }

    if (interviews && interviews.length > 0) {
      const avgRating = interviews.filter(i => i.rating).reduce((sum, i) => sum + (i.rating || 0), 0) / interviews.filter(i => i.rating).length;
      userContext += `\n\nInterview History:
Recent Interviews: ${interviews.length}`;
      if (!isNaN(avgRating)) {
        userContext += `\nAverage Rating: ${avgRating.toFixed(1)}/5`;
      }
      
      const completedInterviews = interviews.filter(i => i.status === 'completed');
      if (completedInterviews.length > 0) {
        userContext += `\nCompleted: ${completedInterviews.length}`;
      }
    }

    const client = new OpenAI({ apiKey });
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt + userContext },
        ...messages,
      ],
      temperature: 0.4,
    });
    
    const reply = completion.choices[0]?.message?.content ?? "";
    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Coach API error:", error);
    return NextResponse.json({ error: "AI request failed" }, { status: 500 });
  }
}

