/**
 * Audio and Speech Detector
 * Tracks voice clarity, microphone energy, speech cadence, and performs live Speech-to-Text
 * with real-time filler word detection. Also handles Text-to-Speech question reading.
 */

const FILLER_WORDS = ['um', 'uh', 'er', 'ah', 'like', 'you know', 'actually', 'basically', 'literally', 'so yeah', 'right'];

export class AudioDetector {
  constructor(stream, onTranscriptUpdate, onVoiceMetricsUpdate) {
    this.stream = stream;
    this.onTranscriptUpdate = onTranscriptUpdate;
    this.onVoiceMetricsUpdate = onVoiceMetricsUpdate;

    this.audioContext = null;
    this.analyser = null;
    this.dataArray = null;
    this.source = null;
    this.recognition = null;
    this.isListening = false;
    this.audioInterval = null;
    this.fullTranscript = '';
    this.fillerWordCount = 0;
    this.foundFillerWords = [];
  }

  start() {
    this.initAudioContext();
    this.initSpeechRecognition();
  }

  initAudioContext() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx || !this.stream) return;

      this.audioContext = new AudioCtx();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

      this.source = this.audioContext.createMediaStreamSource(this.stream);
      this.source.connect(this.analyser);

      this.audioInterval = setInterval(() => {
        if (!this.analyser) return;
        this.analyser.getByteFrequencyData(this.dataArray);

        let sum = 0;
        for (let i = 0; i < this.dataArray.length; i++) {
          sum += this.dataArray[i];
        }
        const averageVolume = sum / this.dataArray.length;
        const normalizedVolume = Math.min(100, Math.round((averageVolume / 128) * 100));

        let voiceClarity = 'Clear ✅';
        if (normalizedVolume < 4) {
          voiceClarity = 'Low / Silent 🔇';
        } else if (normalizedVolume > 85) {
          voiceClarity = 'Too Loud ⚠️';
        }

        if (this.onVoiceMetricsUpdate) {
          this.onVoiceMetricsUpdate({
            volume: normalizedVolume,
            voiceClarity,
            isSpeaking: normalizedVolume > 8
          });
        }
      }, 200);
    } catch (e) {
      console.warn("Audio Context initialization notice:", e);
    }
  }

  initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech Recognition API not supported in this browser.");
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          this.fullTranscript += ' ' + event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const currentText = (this.fullTranscript + ' ' + interimTranscript).trim();
      this.countFillerWords(currentText);

      if (this.onTranscriptUpdate) {
        this.onTranscriptUpdate({
          transcript: currentText,
          fillerCount: this.fillerWordCount,
          foundFillers: this.foundFillerWords
        });
      }
    };

    this.recognition.onerror = (event) => {
      console.warn("Speech recognition error:", event.error);
    };

    try {
      this.recognition.start();
      this.isListening = true;
    } catch (e) {
      console.warn("Speech recognition start notice:", e);
    }
  }

  countFillerWords(text) {
    const lower = text.toLowerCase();
    let count = 0;
    const found = [];

    FILLER_WORDS.forEach((filler) => {
      const regex = new RegExp(`\\b${filler}\\b`, 'gi');
      const matches = lower.match(regex);
      if (matches) {
        count += matches.length;
        found.push({ word: filler, count: matches.length });
      }
    });

    this.fillerWordCount = count;
    this.foundFillerWords = found;
  }

  stop() {
    if (this.audioInterval) {
      clearInterval(this.audioInterval);
    }
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {}
      this.isListening = false;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch (e) {}
    }
  }
}

/**
 * AI Voice Text-to-Speech Engine
 */
export const speakQuestion = (text, onEnd) => {
  if (!('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  utterance.pitch = 1.0;
  utterance.lang = 'en-US';

  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find(v => v.lang.includes('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha')));
  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  utterance.onend = () => {
    if (onEnd) onEnd();
  };

  utterance.onerror = () => {
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(utterance);
};

export const stopSpeech = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};
