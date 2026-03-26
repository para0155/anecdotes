type SpeechCallback = (text: string, isFinal: boolean) => void;
type ErrorCallback = (error: string) => void;

interface SpeechSession {
  stop: () => void;
  isListening: () => boolean;
}

export function isSpeechSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
}

export async function requestMicPermission(): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(t => t.stop());
    return true;
  } catch {
    return false;
  }
}

export function startListening(
  onResult: SpeechCallback,
  onEnd: () => void,
  onError?: ErrorCallback
): SpeechSession | null {
  if (!isSpeechSupported()) {
    onError?.('Spraakherkenning wordt niet ondersteund in deze browser. Gebruik Chrome of Edge.');
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.lang = 'nl-NL';
  recognition.continuous = true;
  recognition.interimResults = true;

  let listening = true;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recognition.onresult = (event: any) => {
    let finalTranscript = '';
    let interimTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }
    }

    if (finalTranscript) {
      onResult(finalTranscript, true);
    } else if (interimTranscript) {
      onResult(interimTranscript, false);
    }
  };

  recognition.onend = () => {
    listening = false;
    onEnd();
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recognition.onerror = (event: any) => {
    listening = false;
    const errorMap: Record<string, string> = {
      'not-allowed': 'Microfoon toegang geweigerd. Sta microfoon toe in je browserinstellingen.',
      'no-speech': 'Geen spraak gedetecteerd. Probeer opnieuw.',
      'audio-capture': 'Geen microfoon gevonden. Sluit een microfoon aan.',
      'network': 'Netwerkfout. Controleer je internetverbinding.',
      'aborted': 'Opname geannuleerd.',
      'service-not-allowed': 'Spraakherkenning is niet beschikbaar. Gebruik Chrome of Edge.',
    };
    const msg = errorMap[event.error] || `Fout: ${event.error}`;
    onError?.(msg);
    onEnd();
  };

  try {
    recognition.start();
  } catch (e) {
    onError?.(`Kon spraakherkenning niet starten: ${e}`);
    return null;
  }

  return {
    stop: () => {
      listening = false;
      try { recognition.stop(); } catch { /* already stopped */ }
    },
    isListening: () => listening,
  };
}
