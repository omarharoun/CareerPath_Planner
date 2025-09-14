import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const systemPrompt = `You are an AI career coach helping job seekers and employees track skills, plan learning, improve resumes, and optimize job search. Provide concise, practical, and motivational guidance. Ask clarifying questions when appropriate.`;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const messages = (body?.messages ?? []) as { role: "user" | "assistant"; content: string }[];

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
  }

  const client = new OpenAI({ apiKey });
  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      temperature: 0.4,
    });
    const reply = completion.choices[0]?.message?.content ?? "";
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ error: "AI request failed" }, { status: 500 });
  }
}

