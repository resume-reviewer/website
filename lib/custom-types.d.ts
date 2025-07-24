// --- File Anda yang sudah ada ---
interface Window {
  SpeechRecognition: typeof SpeechRecognition;
  webkitSpeechRecognition: typeof SpeechRecognition;
}

// Definisikan tipe untuk event hasil transkripsi
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

// Definisikan tipe untuk event error
interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}