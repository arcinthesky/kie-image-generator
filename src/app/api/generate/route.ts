import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { model, prompt, parameters } = await req.json();
    const apiKey = process.env.KIE_AI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "API Key not found" }, { status: 500 });
    }

    // แผนการเรียก Kie AI API (สมมติมาตรฐาน OpenAI Compatible หรือเฉพาะทาง)
    const response = await fetch(`https://api.kie.ai/v1/images/generations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        ...parameters
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.message || "Failed to generate" }, { status: response.status });
    }

    return NextResponse.json({ url: data.data[0].url });
  } catch (error) {
    console.error("Generate API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
