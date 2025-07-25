
import { useState, useRef, useCallback, useEffect } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import '@tensorflow/tfjs-backend-webgl';

// Check if we're in browser environment and get SpeechRecognition safely
const getSpeechRecognition = () => {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
};

const SpeechRecognition = getSpeechRecognition();

// Perbarui definisi hook untuk menerima languageCode sebagai parameter
export function useInterviewEngine(languageCode: 'en' | 'id' = 'en') {
  const [isEngineReady, setIsEngineReady] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [engineStatus, setEngineStatus] = useState('Loading...');

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const analysisFrameId = useRef<number | null>(null);
  const answerStartTime = useRef<number>(0);
  const isCleaningUp = useRef<boolean>(false);
  const metrics = useRef({
    volumeSum: 0,
    volumeCount: 0,
    eyeContactFrames: 0,
    totalFrames: 0,
  }).current;

  // Filter MediaPipe/TensorFlow console logs
  useEffect(() => {
    const originalConsoleError = console.error;
    const originalConsoleLog = console.log;
    const originalConsoleInfo = console.info;

    const filterLogs = (originalFn: typeof console.error) => (...args: any[]) => {
      const message = args.join(' ');
      // Filter out MediaPipe/TensorFlow informational messages
      if (message.includes('TensorFlow Lite XNNPACK delegate') ||
        message.includes('INFO: Created TensorFlow') ||
        message.includes('MediaPipe')) {
        return; // Don't log these messages
      }
      originalFn.apply(console, args);
    };

    console.error = filterLogs(originalConsoleError);
    console.log = filterLogs(originalConsoleLog);
    console.info = filterLogs(originalConsoleInfo);

    return () => {
      console.error = originalConsoleError;
      console.log = originalConsoleLog;
      console.info = originalConsoleInfo;
    };
  }, []);

  // Perbarui useCallback dependencies untuk initialize dan tambahkan setelan lang
  const initialize = useCallback(async () => {
    // Check if we're in browser environment
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      setEngineStatus('This feature is only available in the browser');
      return;
    }

    // Check for HTTPS in production
    if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
      setEngineStatus('Camera and microphone access requires HTTPS. Please access this page through a secure connection.');
      return;
    }

    // Check if mediaDevices is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setEngineStatus('Camera and microphone access is not supported in this browser or context.');
      return;
    }

    // Set isCleaningUp ke false setiap kali inisialisasi dimulai
    isCleaningUp.current = false;
    try {
      setEngineStatus('Loading vision models...');
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

      const landmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numFaces: 1,
      });
      landmarkerRef.current = landmarker;

      setEngineStatus('Requesting camera and microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }, 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(console.warn);
        };
      }

      // Create AudioContext with better error handling
      let audioContext: AudioContext;
      try {
        // Use webkitAudioContext as fallback for older browsers
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioContext = new AudioContextClass();
        audioContextRef.current = audioContext;
        
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current = analyser;
      } catch (audioError) {
        console.warn('AudioContext creation failed:', audioError);
        setEngineStatus('Audio analysis not available, but video will still work.');
      }

      if (SpeechRecognition) {
        console.log("Speech Recognition API is supported by this browser.");
        const recog = new SpeechRecognition();
        recog.continuous = true;
        recog.interimResults = true;

        // --- Perubahan KUNCI: Menetapkan properti 'lang' ---
        recog.lang = languageCode === 'id' ? 'id-ID' : 'en-US';
        console.log(`SpeechRecognition language set to: ${recog.lang}`);
        // --- Akhir Perubahan KUNCI ---

        recog.onresult = (event: SpeechRecognitionEvent) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript + ' ';
            }
          }
          if (finalTranscript) {
            console.log("Transcript received:", finalTranscript);
            setTranscribedText(prev => prev + finalTranscript);
          }
        };

        recog.onstart = () => console.log("Speech recognition has started.");
        recog.onend = () => {
          console.log("Speech recognition has ended.");
          // Hanya set isListening ke false jika bukan bagian dari proses cleanup manual
          // Ini mencegah flickering jika stopAnswering dipanggil
          if (!isCleaningUp.current) {
            setIsListening(false);
          }
        };

        recog.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error("Speech recognition error:", event.error);
          if (event.error === 'not-allowed') {
            setEngineStatus("Microphone access was denied. Please allow microphone access in your browser settings.");
          } else {
            setEngineStatus(`Speech recognition error: ${event.error}`);
          }
          setIsListening(false); // Pastikan state listening direset saat ada error
        };

        recognitionRef.current = recog;
      } else {
        console.error("Speech Recognition API is NOT supported by this browser.");
        setEngineStatus("Speech recognition is not supported by your browser. Please use Google Chrome or Microsoft Edge.");
      }

      setIsEngineReady(true);
      setEngineStatus('Ready');
    } catch (error) {
      console.error("Failed to initialize interview engine:", error);
      
      // Provide more specific error messages based on the error type
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          setEngineStatus('Camera/microphone access was denied. Please allow access and refresh the page.');
        } else if (error.name === 'NotFoundError') {
          setEngineStatus('No camera or microphone found. Please connect a camera and microphone.');
        } else if (error.name === 'NotSupportedError') {
          setEngineStatus('Camera/microphone access is not supported in this browser.');
        } else if (error.name === 'NotReadableError') {
          setEngineStatus('Camera/microphone is already in use by another application.');
        } else if (error.name === 'OverconstrainedError') {
          setEngineStatus('Camera constraints could not be satisfied. Trying with basic settings...');
          // Retry with basic constraints
          try {
            const basicStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            streamRef.current = basicStream;
            if (videoRef.current) {
              videoRef.current.srcObject = basicStream;
            }
            setIsEngineReady(true);
            setEngineStatus('Ready (basic quality)');
          } catch (basicError) {
            setEngineStatus('Failed to initialize camera even with basic settings.');
          }
        } else {
          setEngineStatus(`Initialization error: ${error.message}`);
        }
      } else {
        setEngineStatus('Unknown error occurred during initialization.');
      }
    }
  }, [languageCode]); // Tambahkan languageCode sebagai dependency

  const analysisLoop = useCallback(() => {
    if (isCleaningUp.current) return;

    if (
      !landmarkerRef.current ||
      !videoRef.current ||
      videoRef.current.paused ||
      videoRef.current.ended ||
      videoRef.current.readyState < 3
    ) {
      analysisFrameId.current = requestAnimationFrame(analysisLoop);
      return;
    }

    try {
      const startTimeMs = performance.now();
      const results = landmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);

      if (results.faceLandmarks && results.faceLandmarks.length > 0) {
        metrics.eyeContactFrames++;
      }
      metrics.totalFrames++;

      // Only analyze audio if analyser is available
      if (analyserRef.current) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (const amplitude of dataArray) {
          sum += amplitude * amplitude;
        }
        metrics.volumeSum += Math.sqrt(sum / dataArray.length);
        metrics.volumeCount++;
      }

      if (!isCleaningUp.current) {
        analysisFrameId.current = requestAnimationFrame(analysisLoop);
      }
    } catch (error) {
      console.warn("Analysis loop error:", error);
    }
  }, [metrics]);

  const startAnswering = useCallback(() => {
    if (!isEngineReady) return;
    setTranscribedText('');
    Object.assign(metrics, { volumeSum: 0, volumeCount: 0, eyeContactFrames: 0, totalFrames: 0 });
    answerStartTime.current = Date.now();
    
    // Start speech recognition if available
    try {
      recognitionRef.current?.start();
    } catch (error) {
      console.warn('Speech recognition failed to start:', error);
      // Continue without speech recognition
    }
    
    analysisFrameId.current = requestAnimationFrame(analysisLoop);
    setIsListening(true);
  }, [isEngineReady, metrics, analysisLoop]);

  const stopAnswering = useCallback(() => {
    if (!isEngineReady) return;
    
    // Hentikan pengenalan suara secara eksplisit di sini
    try {
      recognitionRef.current?.stop();
    } catch (error) {
      console.warn('Error stopping speech recognition:', error);
    }

    if (analysisFrameId.current) {
      cancelAnimationFrame(analysisFrameId.current);
      analysisFrameId.current = null;
    }
    setIsListening(false);

    const durationSeconds = (Date.now() - answerStartTime.current) / 1000;
    const wordCount = transcribedText.trim().split(/\s+/).filter(Boolean).length;

    const finalAnalysis = {
      speechPace: durationSeconds > 1 ? (wordCount / durationSeconds) * 60 : 0,
      volumeLevel: metrics.volumeCount > 0 ? (metrics.volumeSum / metrics.volumeCount) / 128 - 1 : 0,
      eyeContactPercentage: metrics.totalFrames > 0 ? (metrics.eyeContactFrames / metrics.totalFrames) * 100 : 0,
      headMovement: 0,
    };

    // Reset metrics setelah dihitung dan digunakan
    Object.assign(metrics, { volumeSum: 0, volumeCount: 0, eyeContactFrames: 0, totalFrames: 0 });

    return { transcribedAnswer: transcribedText.trim(), analysis: finalAnalysis };
  }, [isEngineReady, transcribedText, metrics]);

  // Improved cleanup with proper error handling
  useEffect(() => {
    return () => {
      isCleaningUp.current = true; // Set flag untuk cleanup

      try {
        // Stop media tracks
        streamRef.current?.getTracks().forEach(track => {
          try {
            track.stop();
          } catch (error) {
            console.warn("Error stopping media track:", error);
          }
        });
      } catch (error) {
        console.warn("Error stopping media stream:", error);
      }

      // Cancel animation frame
      if (analysisFrameId.current) {
        cancelAnimationFrame(analysisFrameId.current);
        analysisFrameId.current = null;
      }

      // Close landmarker with error handling
      try {
        if (landmarkerRef.current) {
          landmarkerRef.current.close();
          landmarkerRef.current = null;
        }
      } catch (error) {
        // Silently handle the close error as it's just a cleanup issue
        console.warn("Landmarker cleanup warning (this is normal):", error);
      }

      // Close audio context
      try {
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close();
        }
      } catch (error) {
        console.warn("Error closing audio context:", error);
      }

      // Stop speech recognition
      try {
        // Gunakan recognitionRef.current?.abort() untuk menghentikan paksa
        // atau recognitionRef.current?.stop() jika Anda ingin event onend dipicu
        recognitionRef.current?.abort();
      } catch (error) {
        console.warn("Error stopping speech recognition:", error);
      }
    };
  }, []);

  return {
    videoRef,
    initialize,
    isEngineReady,
    engineStatus,
    isListening,
    transcribedText,
    startAnswering,
    stopAnswering,
  };
}
