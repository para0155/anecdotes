import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenAI API key niet geconfigureerd" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const story = body.story as string;

    if (!story || story.length < 10) {
      return NextResponse.json(
        { error: "Verhaal te kort voor analyse" },
        { status: 400 }
      );
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Je bent een assistent die persoonlijke anekdotes analyseert. Geef suggesties voor tags, personen, locatie en stemming. Antwoord ALLEEN in JSON format:
{
  "tags": ["tag1", "tag2", "tag3"],
  "people": ["naam1"],
  "location": "locatie of null",
  "mood": "emoji of null"
}
Geef maximaal 5 tags, gebruik Nederlandse woorden. Voor mood gebruik een enkele emoji. Als je niet zeker bent, geef null.`,
          },
          {
            role: "user",
            content: story.slice(0, 1000),
          },
        ],
        max_tokens: 200,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("OpenAI API error:", err);
      return NextResponse.json(
        { error: "Fout bij AI analyse" },
        { status: 500 }
      );
    }

    const result = await response.json();
    const content = result.choices[0]?.message?.content || "{}";

    try {
      const parsed = JSON.parse(content);
      return NextResponse.json({
        tags: parsed.tags || [],
        people: parsed.people || [],
        location: parsed.location || null,
        mood: parsed.mood || null,
      });
    } catch {
      return NextResponse.json({ tags: [], people: [], location: null, mood: null });
    }
  } catch (e) {
    console.error("Autotag error:", e);
    return NextResponse.json(
      { error: "Er ging iets mis" },
      { status: 500 }
    );
  }
}
