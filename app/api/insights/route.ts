import { NextRequest, NextResponse } from "next/server";

interface AnecdoteSummary {
  subject: string;
  date: string;
  location: string;
  people: string[];
  tags: string[];
  mood: string;
  story: string;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenAI API key niet geconfigureerd. Stel OPENAI_API_KEY in als environment variable." },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const anecdotes = body.anecdotes as AnecdoteSummary[];

    if (!anecdotes || anecdotes.length === 0) {
      return NextResponse.json(
        { error: "Geen anekdotes om te analyseren" },
        { status: 400 }
      );
    }

    const anecdotesText = anecdotes.map((a, i) =>
      `${i + 1}. "${a.subject}" (${a.date})${a.location ? ` - ${a.location}` : ""}${a.people.length > 0 ? ` - Met: ${a.people.join(", ")}` : ""}${a.mood ? ` - Stemming: ${a.mood}` : ""}${a.tags.length > 0 ? ` - Tags: ${a.tags.join(", ")}` : ""}\n   ${a.story}`
    ).join("\n\n");

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
            content: "Je bent een empathische analist die persoonlijke levensverhalen analyseert. Schrijf in het Nederlands. Wees warm, persoonlijk en inzichtelijk. Gebruik markdown-achtige opmaak met ## voor koppen en - voor lijstitems.",
          },
          {
            role: "user",
            content: `Analyseer deze ${anecdotes.length} anekdotes en geef inzichten. Geef de volgende secties:

## Overzicht
Een korte samenvatting van het totaalbeeld.

## Thema's
Welke thema's komen het meest terug?

## Mooiste momenten
Welke verhalen vallen op als bijzonder positief?

## Personen
Een korte analyse per veel voorkomende persoon.

## Locaties
Welke plekken zijn belangrijk?

## Tijdlijn
Hoe ontwikkelen de verhalen zich over tijd?

Hier zijn de anekdotes:

${anecdotesText}`,
          },
        ],
        max_tokens: 1500,
        temperature: 0.7,
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
    const insights = result.choices[0]?.message?.content || "Geen inzichten beschikbaar";

    return NextResponse.json({ insights });
  } catch (e) {
    console.error("Insights error:", e);
    return NextResponse.json(
      { error: "Er ging iets mis bij het verwerken" },
      { status: 500 }
    );
  }
}
