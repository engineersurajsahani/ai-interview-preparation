import React, { useState, useEffect } from 'react';
import './App.css';
import { signUp, signIn, logOut, getUserData } from './firebase';
import InterviewPage from './components/InterviewPage';
import ThreeDCanvas from './components/ThreeDCanvas';

function App() {
  const [scrolled, setScrolled] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [user, setUser] = useState(null);

  // Mouse 3D tilt tracking for Hero card
  const [heroCardTilt, setHeroCardTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleHeroMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -20;
    setHeroCardTilt({ x, y });
  };

  const handleHeroMouseLeave = () => {
    setHeroCardTilt({ x: 0, y: 0 });
  };

  // ===== SIGNUP =====
  const handleSignup = async () => {
    if (!name || !email || !password) {
      alert('Please fill all fields');
      return;
    }
    const result = await signUp(email, password, name);
    if (result.success) {
      alert('✅ Signup successful! Please login.');
      setShowSignup(false);
      setShowLogin(true);
      setEmail('');
      setPassword('');
      setName('');
    } else {
      alert('❌ ' + result.error);
    }
  };

  // ===== LOGIN =====
  const handleLogin = async () => {
    if (!email || !password) {
      alert('Please enter email and password');
      return;
    }
    const result = await signIn(email, password);
    if (result.success) {
      const userData = await getUserData(result.user.uid);
      setUser({
        uid: result.user.uid,
        name: userData?.name || result.user.displayName || 'User',
        email: result.user.email,
        data: userData
      });
      setShowLogin(false);
      setEmail('');
      setPassword('');
    } else {
      alert('❌ ' + result.error);
    }
  };

  // Quick Guest Demo Access
  const handleGuestDemo = () => {
    setUser({
      uid: 'guest_' + Date.now(),
      name: 'Candidate Guest',
      email: 'guest@demo.ai'
    });
  };

  // ===== LOGOUT =====
  const handleLogout = async () => {
    try {
      await logOut();
      setUser(null);
    } catch (error) {
      setUser(null);
    }
  };

  // If user is logged in, show the 3D Interview Suite
  if (user) {
    return <InterviewPage user={user} onLogout={handleLogout} />;
  }

  // ===== 3D LANDING PAGE =====
  return (
    <div className="site-3d">
      {/* 3D Interactive Particle Matrix */}
      <ThreeDCanvas />

      {/* Navigation */}
      <nav className={`nav-3d ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-inner">
          <div className="logo-3d">
            <div className="logo-orb">⚡</div>
            <div className="logo-text-group">
              <span className="logo-text">AI PREP</span>
              <span className="badge-3d">3D v4.0</span>
            </div>
          </div>

          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">3D Engine</a>
            <a href="#proctoring">Proctoring</a>
            <a href="#testimonials">Reviews</a>
          </div>

          <div className="nav-btns">
            <button className="btn-guest-demo" onClick={handleGuestDemo}>
              ⚡ Instant Demo
            </button>
            <button className="btn-login-3d" onClick={() => { setShowLogin(true); setShowSignup(false); }}>
              Login
            </button>
            <button className="btn-signup-3d" onClick={() => { setShowSignup(true); setShowLogin(false); }}>
              Get Started →
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION WITH 3D INTERACTIVE HOLOGRAM */}
      <section className="hero-3d">
        <div className="hero-inner">
          <div className="hero-text-content">
            <div className="hero-badge-pill">
              <span className="badge-dot"></span>
              <span>Next-Gen 3D Biometrics & AI Proctoring</span>
            </div>

            <h1 className="hero-title">
              Ace Technical Interviews with <br />
              <span className="gradient-3d-text">Real-Time 3D AI Biometrics</span>
            </h1>

            <p className="hero-subtitle">
              Dynamic AI Question Generation, Live Posture & Confidence Tracking, and Anti-Cheating Proctoring powered by real-time computer vision.
            </p>

            <div className="hero-cta-group">
              <button className="btn-hero-primary" onClick={handleGuestDemo}>
                <span>Launch Free 3D Interview →</span>
              </button>
              <button className="btn-hero-secondary" onClick={() => { setShowSignup(true); }}>
                <span>Create Pro Account</span>
              </button>
            </div>

            <div className="hero-stats-row">
              <div className="stat-card-3d">
                <span className="stat-num">98.4%</span>
                <span className="stat-lbl">AI Vision Accuracy</span>
              </div>
              <div className="stat-card-3d">
                <span className="stat-num">50K+</span>
                <span className="stat-lbl">Simulated Interviews</span>
              </div>
              <div className="stat-card-3d">
                <span className="stat-num">100%</span>
                <span className="stat-lbl">Proctored Integrity</span>
              </div>
            </div>
          </div>

          {/* 3D Holographic AI Scanner Preview Card */}
          <div
            className="hero-3d-visual"
            onMouseMove={handleHeroMouseMove}
            onMouseLeave={handleHeroMouseLeave}
            style={{
              transform: `perspective(1000px) rotateX(${heroCardTilt.y}deg) rotateY(${heroCardTilt.x}deg)`
            }}
          >
            <div className="holo-frame-3d">
              <div className="holo-header">
                <div className="holo-dots">
                  <span></span><span></span><span></span>
                </div>
                <span className="holo-tag">LIVE 3D BIOMETRICS SCANNER</span>
              </div>

              {/* Holographic AI Simulation */}
              <div className="holo-screen">
                <div className="holo-radar-ring"></div>
                <div className="holo-radar-ring ring-2"></div>
                <div className="holo-avatar-container">
                  <div className="holo-avatar-mesh">🤖</div>
                  <div className="holo-scan-bar"></div>
                </div>

                {/* Floating 3D Metric Pills */}
                <div className="floating-metric metric-1">
                  <span className="metric-icon">😊</span>
                  <div>
                    <strong>Emotion</strong>
                    <p>Confident 💪</p>
                  </div>
                </div>

                <div className="floating-metric metric-2">
                  <span className="metric-icon">🧍</span>
                  <div>
                    <strong>Posture Vector</strong>
                    <p>Good Posture ✅</p>
                  </div>
                </div>

                <div className="floating-metric metric-3">
                  <span className="metric-icon">🎯</span>
                  <div>
                    <strong>Live Confidence</strong>
                    <p>94% Level</p>
                  </div>
                </div>

                <div className="floating-metric metric-4">
                  <span className="metric-icon">🛡️</span>
                  <div>
                    <strong>Proctoring</strong>
                    <p>100% Clean</p>
                  </div>
                </div>
              </div>

              <div className="holo-footer">
                <span className="holo-status">● Live Stream Active</span>
                <span className="holo-fps">60 FPS AI Pipeline</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3D FEATURES GRID */}
      <section className="features-section-3d" id="features">
        <div className="section-header-3d">
          <span className="section-pill">⚡ Core Capabilities</span>
          <h2>Engineered for Interview Mastery</h2>
          <p>Cutting-edge AI vision, speech acoustics, and anti-cheating systems in a unified 3D platform.</p>
        </div>

        <div className="features-grid-3d">
          {[
            {
              icon: '🤖',
              title: 'Dynamic AI Question Engine',
              desc: 'Generates tailored technical & behavioral questions based on your specific role, level, and tech stack.',
              tag: 'Generative AI'
            },
            {
              icon: '🧍',
              title: 'Real-Time Posture & Head Tilt',
              desc: 'Continuous computer vision tracks slouching, head angle, centering, and body language alignment.',
              tag: '3D Vision'
            },
            {
              icon: '🎯',
              title: 'Dynamic Confidence Gauge',
              desc: 'Calculates your live 0-100% confidence level by synthesizing facial cues, speech steadiness & eye contact.',
              tag: 'Biometrics'
            },
            {
              icon: '🛡️',
              title: 'Anti-Cheating Proctoring',
              desc: 'Detects tab switches, copy/paste attempts, looking away from screen, and logs a verified Integrity Score.',
              tag: 'Proctoring'
            },
            {
              icon: '🔊',
              title: 'AI Speech & Voice Synthesis',
              desc: 'AI reads questions aloud with natural voice synthesis and transcribes your answers in real-time.',
              tag: 'Voice Engine'
            },
            {
              icon: '📊',
              title: 'Granular Evaluation & Tips',
              desc: 'Instant scoring, STAR method suggestions, vocabulary insights, and actionable growth feedback.',
              tag: 'Analytics'
            }
          ].map((f, i) => (
            <div className="feature-card-3d" key={i}>
              <div className="feature-top">
                <div className="feature-icon-3d">{f.icon}</div>
                <span className="feature-badge-3d">{f.tag}</span>
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
              <div className="feature-glow"></div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS / 3D INTERACTIVE FLOW */}
      <section className="workflow-section-3d" id="how-it-works">
        <div className="section-header-3d">
          <span className="section-pill">📋 Process</span>
          <h2>3 Steps to Interview Dominance</h2>
        </div>

        <div className="workflow-steps-3d">
          <div className="workflow-card-3d">
            <div className="step-num-3d">01</div>
            <div className="step-icon-3d">⚙️</div>
            <h3>Configure Domain</h3>
            <p>Pick your target role (Frontend, Backend, AI, Fullstack, HR) and experience level.</p>
          </div>

          <div className="workflow-arrow-3d">➔</div>

          <div className="workflow-card-3d">
            <div className="step-num-3d">02</div>
            <div className="step-icon-3d">🎥</div>
            <h3>Live AI Simulation</h3>
            <p>Answer dynamic AI questions with live 3D face mesh, posture, and proctoring feedback.</p>
          </div>

          <div className="workflow-arrow-3d">➔</div>

          <div className="workflow-card-3d">
            <div className="step-num-3d">03</div>
            <div className="step-icon-3d">🏆</div>
            <h3>Comprehensive Audit</h3>
            <p>Receive granular answer scores, body language analysis, and verified integrity reports.</p>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="cta-section-3d">
        <div className="cta-card-3d">
          <div className="cta-glow"></div>
          <h2>Ready to Test Your Interview Readiness?</h2>
          <p>Join thousands of candidates who improved their offer rate by 4x using real-time AI biometrics.</p>
          <div className="cta-actions">
            <button className="btn-cta-primary" onClick={handleGuestDemo}>
              Launch 3D Interview Now ⚡
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer-3d">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="logo-orb">⚡</div>
            <span>AI Interview Prep 3D</span>
            <span className="footer-badge">v4.0 Pro</span>
          </div>
          <p className="footer-copy">© 2026 AI Interview Prep. Powered by Real-Time Vision & Biometrics.</p>
        </div>
      </footer>

      {/* ===== 3D LOGIN MODAL ===== */}
      {showLogin && (
        <div className="modal-overlay-3d" onClick={() => setShowLogin(false)}>
          <div className="modal-3d" onClick={e => e.stopPropagation()}>
            <button className="modal-close-3d" onClick={() => setShowLogin(false)}>✕</button>
            <div className="modal-icon-3d">👋</div>
            <h2>Welcome Back</h2>
            <p className="modal-sub-3d">Login to continue your 3D interview training</p>
            <div className="input-group-3d">
              <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="input-group-3d">
              <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button className="btn-modal-submit" onClick={handleLogin}>Login to Dashboard →</button>
            <p className="modal-footer-3d">
              Don't have an account? <span onClick={() => { setShowLogin(false); setShowSignup(true); }}>Sign Up</span>
            </p>
          </div>
        </div>
      )}

      {/* ===== 3D SIGNUP MODAL ===== */}
      {showSignup && (
        <div className="modal-overlay-3d" onClick={() => setShowSignup(false)}>
          <div className="modal-3d" onClick={e => e.stopPropagation()}>
            <button className="modal-close-3d" onClick={() => setShowSignup(false)}>✕</button>
            <div className="modal-icon-3d">🚀</div>
            <h2>Create Pro Account</h2>
            <p className="modal-sub-3d">Start practicing with 3D AI biometrics today</p>
            <div className="input-group-3d">
              <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="input-group-3d">
              <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="input-group-3d">
              <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button className="btn-modal-submit" onClick={handleSignup}>Create Account →</button>
            <p className="modal-footer-3d">
              Already have an account? <span onClick={() => { setShowSignup(false); setShowLogin(true); }}>Login</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;