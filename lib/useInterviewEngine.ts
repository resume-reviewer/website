import { useState, useRef, useCallback, useEffect } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import '@tensorflow/tfjs-backend-webgl';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export function useInterviewEngine() {
  const [isEngineReady, setIsEngineReady] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [engineStatus, setEngineStatus] = useState('Loading...');

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Ref untuk model dan API
  const landmarkerRef = useRef<FaceLandmarker | null>(null); 
  const recognitionRef = useRef<any>(null); 
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  
  // Ref untuk proses analisis
  const analysisFrameId = useRef<number | null>(null);
  const answerStartTime = useRef<number>(0);
  const metrics = useRef({
    volumeSum: 0,
    volumeCount: 0,
    eyeContactFrames: 0,
    totalFrames: 0,
  }).current;

  // Inisialisasi semua engine
  const initialize = useCallback(async (languageCode: 'en' | 'id' = 'en') => {
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
      // Setup Media Stream (Video & Audio)
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
        };
      }
      
      // Setup Web Audio API
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      if (SpeechRecognition) {
        console.log("Speech Recognition API is supported by this browser.");
        const recog = new SpeechRecognition();
        recog.continuous = true;
        recog.interimResults = true;
        
        // Set language based on parameter
        recog.lang = languageCode === 'id' ? 'id-ID' : 'en-US';
        console.log(`SpeechRecognition language set to: ${recog.lang}`);

        // Event handler onresult
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

        recog.onstart = () => {
          console.log("Speech recognition has started.");
        };

        recog.onend = () => {
          console.log("Speech recognition has ended.");
          if (isListening) {
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
      setEngineStatus('Error initializing engine. Please check permissions and console.');
    }
  }, [isListening]);

  const analysisLoop = useCallback(() => {
    if (
      !landmarkerRef.current || 
      !videoRef.current || 
      !analyserRef.current || 
      videoRef.current.paused || 
      videoRef.current.ended ||
      videoRef.current.readyState < 3
    ) {
      analysisFrameId.current = requestAnimationFrame(analysisLoop);
      return;
    }

    const startTimeMs = performance.now();
    const results = landmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);

    if (results.faceLandmarks && results.faceLandmarks.length > 0) {
      metrics.eyeContactFrames++;
    }
    metrics.totalFrames++;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    let sum = 0;
    for (const amplitude of dataArray) {
      sum += amplitude * amplitude;
    }
    metrics.volumeSum += Math.sqrt(sum / dataArray.length);
    metrics.volumeCount++;

    analysisFrameId.current = requestAnimationFrame(analysisLoop);
}, [metrics]);

  const startAnswering = useCallback(() => {
    if (!isEngineReady) return;
    setTranscribedText('');
    Object.assign(metrics, { volumeSum: 0, volumeCount: 0, eyeContactFrames: 0, totalFrames: 0 });
    answerStartTime.current = Date.now();
    recognitionRef.current?.start();
    analysisFrameId.current = requestAnimationFrame(analysisLoop);
    setIsListening(true);
  }, [isEngineReady, metrics, analysisLoop]);

  const stopAnswering = useCallback(() => {
    if (!isEngineReady) return;
    recognitionRef.current?.stop();
    if (analysisFrameId.current) {
      cancelAnimationFrame(analysisFrameId.current);
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

    return { transcribedAnswer: transcribedText.trim(), analysis: finalAnalysis };
  }, [isEngineReady, transcribedText, metrics]);
  
  // Cleanup
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach(track => track.stop());
      if (analysisFrameId.current) cancelAnimationFrame(analysisFrameId.current);
      landmarkerRef.current?.close();
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
