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
    const formData = await request.formData();
    const audioFile = formData.get("audio") as Blob | null;

    if (!audioFile) {
      return NextResponse.json(
        { error: "Geen audiobestand ontvangen" },
        { status: 400 }
      );
    }

    const whisperForm = new FormData();
    whisperForm.append("file", audioFile, "audio.webm");
    whisperForm.append("model", "whisper-1");
    whisperForm.append("language", "nl");

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: whisperForm,
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Whisper API error:", err);
      return NextResponse.json(
        { error: "Fout bij spraakherkenning" },
        { status: 500 }
      );
    }

    const result = await response.json();
    return NextResponse.json({ text: result.text });
  } catch (e) {
    console.error("Transcribe error:", e);
    return NextResponse.json(
      { error: "Er ging iets mis bij het verwerken" },
      { status: 500 }
    );
  }
}
