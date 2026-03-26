type SpeechCallback = (text: string, isFinal: boolean) => void;

interface SpeechSession {
  stop: () => void;
  isListening: () => boolean;
}

export function isSpeechSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
}

export function startListening(onResult: SpeechCallback, onEnd: () => void): SpeechSession | null {
  if (!isSpeechSupported()) return null;

  const SpeechRecognition = (window as unknown as Record<string, unknown>).SpeechRecognition ||
    (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognition = new (SpeechRecognition as any)();

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

  recognition.onerror = () => {
    listening = false;
    onEnd();
  };

  recognition.start();

  return {
    stop: () => {
      listening = false;
      recognition.stop();
    },
    isListening: () => listening,
  };
}
