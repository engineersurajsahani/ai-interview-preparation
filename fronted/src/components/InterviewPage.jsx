import React, { useState, useRef, useEffect, useCallback } from 'react';
import './InterviewPage.css';
import { saveInterviewResult } from '../firebase';
import { VisionDetector } from '../utils/visionDetector';
import { AudioDetector, speakQuestion, stopSpeech } from '../utils/audioDetector';
import { ProctoringGuard } from '../utils/proctoringGuard';

const ROLE_OPTIONS = [
  { id: 'software_engineer', name: 'Software Engineer', icon: '💻', desc: 'System design, DSA, problem solving & clean code' },
  { id: 'frontend_developer', name: 'Frontend Engineer (React)', icon: '⚛️', desc: 'UI architecture, performance, hooks & modern JS' },
  { id: 'backend_developer', name: 'Backend Engineer (Python/API)', icon: '⚙️', desc: 'Databases, scalable APIs, microservices & security' },
  { id: 'data_science_ai', name: 'AI & Data Scientist', icon: '🧠', desc: 'Machine learning, neural networks, LLMs & data pipelines' },
  { id: 'hr_behavioral', name: 'HR & Behavioral Round', icon: '🤝', desc: 'Communication, team leadership, STAR method & fit' }
];

const DIFFICULTY_LEVELS = ['Junior', 'Mid', 'Senior'];

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function InterviewPage({ user, onLogout }) {
  // Setup State
  const [stage, setStage] = useState('setup'); // 'setup' | 'interview' | 'question_result' | 'final_report'
  const [selectedRole, setSelectedRole] = useState('frontend_developer');
  const [difficulty, setDifficulty] = useState('Mid');
  const [questionCount, setQuestionCount] = useState(3);
  const [customTopic, setCustomTopic] = useState('');
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  // Questions State
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState(false);

  // Live Real-Time Vision & Audio Metrics
  const [visionMetrics, setVisionMetrics] = useState({
    hasFace: false,
    posture: 'Checking Posture...',
    eyeContact: 'Checking Gaze...',
    confidence: 78,
    emotion: 'Analyzing 🎯',
    isLookingAway: false,
    isSlouching: false,
    headTiltAngle: 0
  });

  const [audioMetrics, setAudioMetrics] = useState({
    volume: 0,
    voiceClarity: 'Clear ✅',
    isSpeaking: false
  });

  const [transcriptData, setTranscriptData] = useState({
    transcript: '',
    fillerCount: 0,
    foundFillers: []
  });

  // Proctoring & Anti-Cheating State
  const [integrityScore, setIntegrityScore] = useState(100);
  const [proctoringAlert, setProctoringAlert] = useState(null);
  const [violationsList, setViolationsList] = useState([]);
  const [proctoringStats, setProctoringStats] = useState({
    tabSwitches: 0,
    copyAttempts: 0,
    pasteAttempts: 0,
    lookAwayWarnings: 0
  });

  // Answering & Evaluation State
  const [isRecording, setIsRecording] = useState(false);
  const [currentAnswerEvaluation, setCurrentAnswerEvaluation] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [sessionResults, setSessionResults] = useState([]);

  // Refs
  const videoRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const streamRef = useRef(null);
  const visionDetectorRef = useRef(null);
  const audioDetectorRef = useRef(null);
  const proctoringGuardRef = useRef(null);

  // Robust Camera Initializer with automatic device fallback
  const startCamera = async () => {
    try {
      setCameraError(null);
      let stream = streamRef.current;

      if (!stream || !stream.active) {
        try {
          // Attempt high quality video + audio
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280, min: 640 }, height: { ideal: 720, min: 480 }, facingMode: 'user' },
            audio: true
          });
        } catch (firstErr) {
          console.warn("Full media constraints failed, attempting fallback to video only:", firstErr);
          // Fallback to video only
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          });
        }
        streamRef.current = stream;
      }

      // Bind to video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.log("Video play notice:", playErr);
        }
      }

      return stream;
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraError('Camera access denied or device not found. Please allow camera permissions.');
      return null;
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // Bind video element whenever stage changes to 'interview'
  useEffect(() => {
    if (stage === 'interview') {
      const attachVideo = async () => {
        const stream = await startCamera();
        if (videoRef.current && stream) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(e => console.log('Autoplay handled:', e));

          // Start continuous real-time 3D vision tracking
          if (!visionDetectorRef.current && overlayCanvasRef.current) {
            const vision = new VisionDetector(
              videoRef.current,
              overlayCanvasRef.current,
              (metrics) => {
                setVisionMetrics(metrics);
                if (metrics.lookAwayDurationSeconds >= 4 && proctoringGuardRef.current) {
                  proctoringGuardRef.current.reportGazeViolation(metrics.lookAwayDurationSeconds);
                }
              }
            );
            vision.start();
            visionDetectorRef.current = vision;
          }
        }
      };
      attachVideo();
    }
  }, [stage]);

  // Video Ref Callback for instant element mounting attachment
  const handleVideoRef = useCallback((node) => {
    videoRef.current = node;
    if (node && streamRef.current) {
      node.srcObject = streamRef.current;
      node.play().catch(e => console.log('Ref play notice:', e));
    }
  }, []);

  // Trigger proctoring warning toast
  const showProctoringWarning = useCallback((violation) => {
    setProctoringAlert(violation);
    setTimeout(() => {
      setProctoringAlert(null);
    }, 4500);
  }, []);

  // Fetch / Generate AI Questions
  const handleStartInterview = async () => {
    setIsLoadingQuestions(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/generate-questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: selectedRole,
          level: difficulty,
          count: questionCount,
          customTopic: customTopic.trim()
        })
      });

      let qList = [];
      if (response.ok) {
        const data = await response.json();
        qList = data.questions;
      } else {
        throw new Error('Fallback to local questions');
      }

      setQuestions(qList);
      setCurrentQuestionIndex(0);
      setSessionResults([]);
      setIntegrityScore(100);
      setViolationsList([]);
      setStage('interview');

      // Initialize Proctoring Guard
      const guard = new ProctoringGuard(({ violation, violations, integrityScore: newScore, stats }) => {
        setIntegrityScore(newScore);
        setViolationsList(violations);
        setProctoringStats(stats);
        showProctoringWarning(violation);
      });
      guard.start();
      proctoringGuardRef.current = guard;

      if (qList.length > 0) {
        playQuestionSpeech(qList[0].question);
      }
    } catch (err) {
      console.warn("Using fallback question pool:", err);
      const fallbackQuestions = [
        { id: 1, question: `Can you introduce yourself and discuss your key strengths relevant to a ${selectedRole.replace('_', ' ')} role?` },
        { id: 2, question: `Explain a challenging technical obstacle you faced in your recent project and how you solved it.` },
        { id: 3, question: `How do you ensure code quality, testability, and optimal performance under tight deadlines?` }
      ];
      setQuestions(fallbackQuestions);
      setCurrentQuestionIndex(0);
      setStage('interview');

      const guard = new ProctoringGuard(({ violation, violations, integrityScore: newScore, stats }) => {
        setIntegrityScore(newScore);
        setViolationsList(violations);
        setProctoringStats(stats);
        showProctoringWarning(violation);
      });
      guard.start();
      proctoringGuardRef.current = guard;

      playQuestionSpeech(fallbackQuestions[0].question);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  // Text-To-Speech for Question
  const playQuestionSpeech = (questionText) => {
    setIsSpeakingQuestion(true);
    speakQuestion(questionText, () => {
      setIsSpeakingQuestion(false);
    });
  };

  // Start Answering & Audio Tracking
  const handleStartAnswering = () => {
    stopSpeech();
    setIsSpeakingQuestion(false);
    setIsRecording(true);
    setTranscriptData({ transcript: '', fillerCount: 0, foundFillers: [] });

    // Ensure 3D Vision tracking is active
    if (!visionDetectorRef.current && videoRef.current && overlayCanvasRef.current) {
      const vision = new VisionDetector(
        videoRef.current,
        overlayCanvasRef.current,
        (metrics) => {
          setVisionMetrics(metrics);
          if (metrics.lookAwayDurationSeconds >= 4 && proctoringGuardRef.current) {
            proctoringGuardRef.current.reportGazeViolation(metrics.lookAwayDurationSeconds);
          }
        }
      );
      vision.start();
      visionDetectorRef.current = vision;
    }

    // Initialize Audio Detector
    if (streamRef.current) {
      const audio = new AudioDetector(
        streamRef.current,
        (transData) => setTranscriptData(transData),
        (voiceData) => setAudioMetrics(voiceData)
      );
      audio.start();
      audioDetectorRef.current = audio;
    }
  };

  // Stop Answering & Submit for AI Evaluation
  const handleStopAndAnalyze = async () => {
    setIsRecording(false);
    setIsEvaluating(true);

    if (audioDetectorRef.current) {
      audioDetectorRef.current.stop();
    }

    const currentQ = questions[currentQuestionIndex];
    const candidateTranscript = transcriptData.transcript.trim();

    try {
      const response = await fetch(`${API_BASE_URL}/api/evaluate-answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQ?.question || '',
          transcript: candidateTranscript,
          role: selectedRole,
          metrics: {
            confidence: visionMetrics.confidence,
            posture: visionMetrics.posture,
            eyeContact: visionMetrics.eyeContact,
            fillerCount: transcriptData.fillerCount
          }
        })
      });

      let evaluation = null;
      if (response.ok) {
        evaluation = await response.json();
      } else {
        throw new Error('Fallback evaluation');
      }

      const questionResult = {
        questionNumber: currentQuestionIndex + 1,
        question: currentQ?.question || '',
        transcript: candidateTranscript || '(No audio transcribed / silent answer)',
        score: evaluation.overallScore,
        contentScore: evaluation.contentScore,
        confidence: visionMetrics.confidence,
        emotion: visionMetrics.emotion,
        posture: visionMetrics.posture,
        eyeContact: visionMetrics.eyeContact,
        voiceClarity: audioMetrics.voiceClarity,
        fillerWords: transcriptData.fillerCount,
        feedback: evaluation.feedback,
        strengths: evaluation.strengths,
        improvements: evaluation.improvements,
        date: new Date().toISOString()
      };

      setCurrentAnswerEvaluation(questionResult);
      setSessionResults(prev => [...prev, questionResult]);
      setStage('question_result');
    } catch (err) {
      const wordCount = candidateTranscript.split(/\s+/).filter(Boolean).length;
      const fallbackEval = {
        questionNumber: currentQuestionIndex + 1,
        question: currentQ?.question || '',
        transcript: candidateTranscript || '(Answer recorded without live transcript)',
        score: Math.min(100, Math.round(visionMetrics.confidence * 0.5 + (wordCount > 15 ? 40 : 25))),
        contentScore: wordCount > 15 ? 75 : 50,
        confidence: visionMetrics.confidence,
        emotion: visionMetrics.emotion,
        posture: visionMetrics.posture,
        eyeContact: visionMetrics.eyeContact,
        voiceClarity: audioMetrics.voiceClarity,
        fillerWords: transcriptData.fillerCount,
        feedback: wordCount > 15
          ? 'Good explanation! You demonstrated solid confidence and answered with relevant structure.'
          : 'Answer was brief. Expand with specific project experiences and the STAR method.',
        strengths: ['Active body language', 'Good engagement'],
        improvements: ['Include deeper architectural examples'],
        date: new Date().toISOString()
      };

      setCurrentAnswerEvaluation(fallbackEval);
      setSessionResults(prev => [...prev, fallbackEval]);
      setStage('question_result');
    } finally {
      setIsEvaluating(false);
    }
  };

  // Next Question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setCurrentAnswerEvaluation(null);
      setTranscriptData({ transcript: '', fillerCount: 0, foundFillers: [] });
      setStage('interview');

      if (questions[nextIndex]) {
        playQuestionSpeech(questions[nextIndex].question);
      }
    } else {
      handleCompleteInterview();
    }
  };

  // Finish Interview & Show Full Report
  const handleCompleteInterview = () => {
    stopSpeech();
    if (visionDetectorRef.current) visionDetectorRef.current.stop();
    if (audioDetectorRef.current) audioDetectorRef.current.stop();
    if (proctoringGuardRef.current) proctoringGuardRef.current.stop();
    stopCamera();

    const avgScore = sessionResults.length > 0
      ? Math.round(sessionResults.reduce((acc, r) => acc + r.score, 0) / sessionResults.length)
      : 75;

    if (user) {
      saveInterviewResult(user.uid, {
        role: selectedRole,
        difficulty,
        totalQuestions: questions.length,
        averageScore: avgScore,
        integrityScore,
        violations: violationsList,
        results: sessionResults,
        completedAt: new Date().toISOString()
      });
    }

    setStage('final_report');
  };

  // Reset to setup
  const handleRestartSetup = () => {
    stopSpeech();
    if (visionDetectorRef.current) visionDetectorRef.current.stop();
    if (audioDetectorRef.current) audioDetectorRef.current.stop();
    if (proctoringGuardRef.current) proctoringGuardRef.current.stop();
    stopCamera();
    setStage('setup');
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSessionResults([]);
    setCurrentAnswerEvaluation(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSpeech();
      if (visionDetectorRef.current) visionDetectorRef.current.stop();
      if (audioDetectorRef.current) audioDetectorRef.current.stop();
      if (proctoringGuardRef.current) proctoringGuardRef.current.stop();
      stopCamera();
    };
  }, []);

  // ================= RENDER STAGES =================

  // 1. SETUP STAGE (3D Configurator)
  if (stage === 'setup') {
    return (
      <div className="interview-container">
        <div className="setup-wrapper">
          <div className="setup-header">
            <div className="setup-badge">⚡ AI-Powered 3D Interview Simulation</div>
            <h1>Configure Your <span className="gradient-text">AI Interview Session</span></h1>
            <p>Select your job role, experience level, and launch dynamic AI question generation with live 3D face mesh & proctoring analysis.</p>
          </div>

          <div className="setup-grid">
            {/* Domain Selection */}
            <div className="setup-card card-3d">
              <h3>1. Select Job Role & Domain</h3>
              <div className="role-options">
                {ROLE_OPTIONS.map(role => (
                  <div
                    key={role.id}
                    className={`role-item ${selectedRole === role.id ? 'active' : ''}`}
                    onClick={() => setSelectedRole(role.id)}
                  >
                    <span className="role-icon">{role.icon}</span>
                    <div className="role-info">
                      <h4>{role.name}</h4>
                      <p>{role.desc}</p>
                    </div>
                    <div className="role-check">{selectedRole === role.id ? '✓' : ''}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Level & Settings */}
            <div className="setup-card card-3d">
              <h3>2. Interview Settings</h3>

              <div className="setting-group">
                <label>Experience / Difficulty Level</label>
                <div className="difficulty-selector">
                  {DIFFICULTY_LEVELS.map(lvl => (
                    <button
                      key={lvl}
                      type="button"
                      className={`diff-btn ${difficulty === lvl ? 'active' : ''}`}
                      onClick={() => setDifficulty(lvl)}
                    >
                      {lvl === 'Junior' && '🌱 '}
                      {lvl === 'Mid' && '🚀 '}
                      {lvl === 'Senior' && '👑 '}
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="setting-group">
                <label>Number of AI Questions</label>
                <div className="count-selector">
                  {[3, 5, 7].map(num => (
                    <button
                      key={num}
                      type="button"
                      className={`count-btn ${questionCount === num ? 'active' : ''}`}
                      onClick={() => setQuestionCount(num)}
                    >
                      {num} Questions
                    </button>
                  ))}
                </div>
              </div>

              <div className="setting-group">
                <label>Custom Focus Area / Tech Stack (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Next.js, FastAPI, Docker, Microservices..."
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  className="custom-input"
                />
              </div>

              {/* Real-time AI Features Checklist */}
              <div className="features-checklist">
                <h4>🛡️ Live AI 3D Analysis Enabled:</h4>
                <ul>
                  <li>✅ <strong>Dynamic AI Questions:</strong> Role-tailored questions generated dynamically</li>
                  <li>✅ <strong>AI Voice Pronunciation:</strong> AI reads questions aloud with speech synthesis</li>
                  <li>✅ <strong>3D Face Mesh & Posture HUD:</strong> Real-time head tilt, posture & face tracking</li>
                  <li>✅ <strong>Live Dynamic Confidence Gauge:</strong> 0-100% real-time confidence rating</li>
                  <li>✅ <strong>Anti-Cheating Proctoring:</strong> Tab switch, copy/paste & lookaway detection</li>
                </ul>
              </div>

              <div className="setup-actions">
                <button
                  className="btn-start-session"
                  onClick={handleStartInterview}
                  disabled={isLoadingQuestions}
                >
                  {isLoadingQuestions ? '🤖 Generating AI Questions...' : '🚀 Launch AI Interview Session →'}
                </button>
                <button className="btn-secondary-setup" onClick={onLogout}>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. QUESTION RESULT STAGE
  if (stage === 'question_result' && currentAnswerEvaluation) {
    return (
      <div className="interview-container">
        <div className="result-wrapper">
          <div className="result-card card-3d">
            <div className="result-header">
              <span className="result-tag">Question {currentQuestionIndex + 1} of {questions.length} Evaluated</span>
              <h1>AI Performance Analysis</h1>
              <p className="evaluated-question">"{currentAnswerEvaluation.question}"</p>
            </div>

            <div className="scores-grid">
              <div className="score-box main-score">
                <span className="score-val">{currentAnswerEvaluation.score}%</span>
                <span className="score-lbl">Overall Question Score</span>
              </div>
              <div className="score-box">
                <span className="score-val">{currentAnswerEvaluation.confidence}%</span>
                <span className="score-lbl">Confidence Level</span>
              </div>
              <div className="score-box">
                <span className="score-val">{currentAnswerEvaluation.posture}</span>
                <span className="score-lbl">Posture Status</span>
              </div>
              <div className="score-box">
                <span className="score-val">{currentAnswerEvaluation.fillerWords}</span>
                <span className="score-lbl">Filler Words</span>
              </div>
            </div>

            <div className="transcript-preview">
              <h4>🗣️ Your Transcribed Answer:</h4>
              <p>{currentAnswerEvaluation.transcript}</p>
            </div>

            <div className="feedback-section">
              <div className="feedback-card">
                <h4>🤖 AI Feedback:</h4>
                <p>{currentAnswerEvaluation.feedback}</p>
              </div>

              <div className="feedback-cols">
                <div className="feedback-col strengths">
                  <h4>✨ Key Strengths</h4>
                  <ul>
                    {currentAnswerEvaluation.strengths?.map((s, i) => (
                      <li key={i}>✓ {s}</li>
                    ))}
                  </ul>
                </div>
                <div className="feedback-col improvements">
                  <h4>💡 Improvement Tips</h4>
                  <ul>
                    {currentAnswerEvaluation.improvements?.map((imp, i) => (
                      <li key={i}>→ {imp}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="result-actions">
              <button className="btn-next-question" onClick={handleNextQuestion}>
                {currentQuestionIndex < questions.length - 1 ? 'Next AI Question →' : '📊 View Complete Interview Report →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. FINAL REPORT STAGE
  if (stage === 'final_report') {
    const avgScore = sessionResults.length > 0
      ? Math.round(sessionResults.reduce((acc, r) => acc + r.score, 0) / sessionResults.length)
      : 75;
    const avgConfidence = sessionResults.length > 0
      ? Math.round(sessionResults.reduce((acc, r) => acc + r.confidence, 0) / sessionResults.length)
      : 78;
    const totalFillers = sessionResults.reduce((acc, r) => acc + (r.fillerWords || 0), 0);

    return (
      <div className="interview-container">
        <div className="final-report-wrapper">
          <div className="final-report-card card-3d">
            <div className="final-header">
              <span className="final-badge">🏆 Session Complete</span>
              <h1>Interview Performance & Proctoring Report</h1>
              <p>Role: <strong>{selectedRole.replace('_', ' ').toUpperCase()}</strong> ({difficulty} Level)</p>
            </div>

            {/* Overall Score Cards */}
            <div className="final-metrics-row">
              <div className="metric-box hero-metric">
                <span className="metric-num">{avgScore}%</span>
                <span className="metric-name">Overall Performance</span>
              </div>
              <div className="metric-box">
                <span className="metric-num">{avgConfidence}%</span>
                <span className="metric-name">Avg Confidence</span>
              </div>
              <div className="metric-box">
                <span className={`metric-num ${integrityScore >= 80 ? 'good' : 'warning'}`}>{integrityScore}%</span>
                <span className="metric-name">🛡️ Proctoring Integrity</span>
              </div>
              <div className="metric-box">
                <span className="metric-num">{totalFillers}</span>
                <span className="metric-name">Total Filler Words</span>
              </div>
            </div>

            {/* Anti-Cheating & Proctoring Integrity Audit Log */}
            <div className="proctoring-audit-card">
              <div className="audit-header">
                <h3>🛡️ Anti-Cheating & Proctoring Audit</h3>
                <span className={`integrity-pill ${integrityScore >= 80 ? 'clean' : 'flagged'}`}>
                  {integrityScore >= 80 ? '✅ Verified Clean Session' : '⚠️ Suspicious Activity Detected'}
                </span>
              </div>

              <div className="audit-stats-grid">
                <div className="audit-stat">
                  <span>Tab Switches:</span> <strong>{proctoringStats.tabSwitches}</strong>
                </div>
                <div className="audit-stat">
                  <span>Copy Attempts:</span> <strong>{proctoringStats.copyAttempts}</strong>
                </div>
                <div className="audit-stat">
                  <span>Paste Attempts:</span> <strong>{proctoringStats.pasteAttempts}</strong>
                </div>
                <div className="audit-stat">
                  <span>Gaze Warnings:</span> <strong>{proctoringStats.lookAwayWarnings}</strong>
                </div>
              </div>

              {violationsList.length > 0 ? (
                <div className="violations-log">
                  <h4>Recorded Proctoring Events:</h4>
                  <ul>
                    {violationsList.map((v, idx) => (
                      <li key={idx}>
                        <span className="v-time">[{v.time}]</span>
                        <span className="v-title">{v.title}</span>
                        <span className="v-desc">{v.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="clean-proctoring-msg">
                  🎉 No cheating, tab switching, or clipboard violations detected. 100% integrity maintained!
                </div>
              )}
            </div>

            {/* Question by Question Review */}
            <div className="questions-history">
              <h3>📝 Question Breakdown ({sessionResults.length} Questions)</h3>
              {sessionResults.map((res, index) => (
                <div key={index} className="history-item">
                  <div className="history-item-header">
                    <span className="q-num">Q{index + 1}: {res.question}</span>
                    <span className="q-score">{res.score}%</span>
                  </div>
                  <p className="history-transcript"><strong>Answer:</strong> "{res.transcript}"</p>
                  <div className="history-meta">
                    <span>Confidence: <strong>{res.confidence}%</strong></span>
                    <span>Posture: <strong>{res.posture}</strong></span>
                    <span>Emotion: <strong>{res.emotion}</strong></span>
                    <span>Voice: <strong>{res.voiceClarity}</strong></span>
                  </div>
                  <div className="history-feedback">
                    <strong>AI Feedback:</strong> {res.feedback}
                  </div>
                </div>
              ))}
            </div>

            <div className="final-actions">
              <button className="btn-primary-action" onClick={handleRestartSetup}>
                🔄 Start Another Interview Session
              </button>
              <button className="btn-logout-action" onClick={onLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 4. LIVE INTERVIEW STAGE (Active Video HUD with 3D Canvas Overlay)
  const currentQ = questions[currentQuestionIndex] || { question: 'Loading AI Question...' };

  return (
    <div className="interview-container">
      {/* Real-time Proctoring Warning Toast */}
      {proctoringAlert && (
        <div className="proctoring-toast">
          <span className="toast-icon">⚠️</span>
          <div className="toast-body">
            <strong>Proctoring Alert: {proctoringAlert.title}</strong>
            <p>{proctoringAlert.description}</p>
          </div>
          <span className="toast-penalty">-{proctoringAlert.penalty}%</span>
        </div>
      )}

      {/* Header */}
      <div className="interview-header">
        <div className="header-left">
          <button className="back-btn" onClick={handleRestartSetup}>← Exit Session</button>
          <h2>🎯 Live AI Interview: <span className="highlight-role">{selectedRole.replace('_', ' ').toUpperCase()}</span></h2>
        </div>

        <div className="header-right">
          <div className="proctor-badge">
            <span className="proctor-dot"></span>
            <span>Shield: {integrityScore}%</span>
          </div>
          <div className="question-counter">
            Question <span>{currentQuestionIndex + 1}</span> / {questions.length}
          </div>
        </div>
      </div>

      <div className="interview-main">
        {/* Left Column: Live Camera Video with 3D Canvas HUD */}
        <div className="video-section card-3d">
          <video
            ref={handleVideoRef}
            autoPlay
            muted
            playsInline
            className="video-feed"
          />

          {/* 3D Sci-Fi Face Mesh & HUD Canvas Overlay */}
          <canvas ref={overlayCanvasRef} className="hud-canvas-overlay" />

          {/* Camera Error Fallback Card */}
          {cameraError && (
            <div className="camera-error-banner">
              <p>⚠️ {cameraError}</p>
              <button className="btn-retry-cam" onClick={startCamera}>🔄 Reconnect Camera</button>
            </div>
          )}

          {/* Top Badges */}
          <div className="camera-hud-overlay">
            <div className="hud-top-row">
              <div className={`hud-badge ${visionMetrics.posture.includes('Good') ? 'good' : 'warning'}`}>
                🧍 Posture: {visionMetrics.posture}
              </div>
              <div className={`hud-badge ${visionMetrics.eyeContact.includes('Good') ? 'good' : 'warning'}`}>
                👁️ Eye Contact: {visionMetrics.eyeContact}
              </div>
            </div>

            {/* Bottom Camera Info */}
            <div className="hud-bottom-row">
              <div className="live-status-pill">
                <span className={`recording-dot ${isRecording ? 'recording' : ''}`}></span>
                <span>{isRecording ? '🎙️ Live Analysis Active' : 'Ready'}</span>
              </div>
              <button className="btn-cam-refresh" onClick={startCamera} title="Refresh Camera Feed">
                📹 Cam Active
              </button>
              <div className="hud-emotion-pill">
                {visionMetrics.emotion}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Question, Live Confidence Gauge & Transcriber */}
        <div className="question-section">
          {/* AI Question Card */}
          <div className="question-box card-3d">
            <div className="q-box-top">
              <span className="q-badge">AI Question {currentQuestionIndex + 1}</span>
              <button
                className={`btn-speaker ${isSpeakingQuestion ? 'speaking' : ''}`}
                onClick={() => playQuestionSpeech(currentQ.question)}
                title="Listen to AI Question"
              >
                {isSpeakingQuestion ? '🔊 Speaking...' : '🔊 Replay Voice'}
              </button>
            </div>
            <p className="q-text">{currentQ.question}</p>
          </div>

          {/* Real-time Dynamic Confidence Level & Metrics Dashboard */}
          <div className="analysis-live card-3d">
            <div className="analysis-header-row">
              <h4>📊 Live Real-Time Biometrics</h4>
              <span className="conf-status-tag">
                {visionMetrics.confidence >= 80 ? '🌟 High Confidence' : visionMetrics.confidence >= 60 ? '👍 Steady Confidence' : '⚠️ Building Confidence'}
              </span>
            </div>

            {/* Dynamic Confidence Meter Bar */}
            <div className="confidence-meter-box">
              <div className="conf-header">
                <span>🎯 Real-Time Confidence Level</span>
                <span className="conf-percentage">{visionMetrics.confidence}%</span>
              </div>
              <div className="bar">
                <div
                  className="bar-fill"
                  style={{
                    width: `${visionMetrics.confidence}%`,
                    background: visionMetrics.confidence >= 75
                      ? 'linear-gradient(90deg, #10b981, #06b6d4)'
                      : visionMetrics.confidence >= 55
                      ? 'linear-gradient(90deg, #f59e0b, #6366f1)'
                      : 'linear-gradient(90deg, #ef4444, #f59e0b)'
                  }}
                ></div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="analysis-grid">
              <div className="analysis-item">
                <span className="lbl">😊 Facial State</span>
                <span className="value">{visionMetrics.emotion}</span>
              </div>
              <div className="analysis-item">
                <span className="lbl">🧍 Posture Align</span>
                <span className={`value ${visionMetrics.posture.includes('Good') ? 'good' : 'warn'}`}>
                  {visionMetrics.posture}
                </span>
              </div>
              <div className="analysis-item">
                <span className="lbl">👁️ Screen Attention</span>
                <span className={`value ${visionMetrics.eyeContact.includes('Good') ? 'good' : 'warn'}`}>
                  {visionMetrics.eyeContact}
                </span>
              </div>
              <div className="analysis-item">
                <span className="lbl">🎤 Voice Clarity</span>
                <span className="value">{audioMetrics.voiceClarity}</span>
              </div>
            </div>

            {/* Live Speech-to-Text Transcription Box */}
            <div className="live-transcript-card">
              <div className="transcript-head">
                <span>🗣️ Live Speech Transcription:</span>
                <span className="filler-pill">Fillers: {transcriptData.fillerCount}</span>
              </div>
              <div className="transcript-text">
                {transcriptData.transcript ? (
                  transcriptData.transcript
                ) : (
                  <span className="transcript-placeholder">
                    {isRecording ? 'Listening... Speak your answer clearly into your microphone.' : 'Click "Start Answering" below to speak.'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="interview-controls">
            {!isRecording ? (
              <button
                className="btn-start"
                onClick={handleStartAnswering}
                disabled={isEvaluating}
              >
                🎤 Start Answering
              </button>
            ) : (
              <button
                className="btn-stop"
                onClick={handleStopAndAnalyze}
                disabled={isEvaluating}
              >
                {isEvaluating ? '⏳ Analyzing Answer with AI...' : '⏹ Stop & AI Evaluate Answer'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default InterviewPage;