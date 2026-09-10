/**
 * Anti-Cheating & Proctoring Guard
 * Real-time monitoring for:
 * 1. Tab switches / window blur
 * 2. Copy/Paste/Cut & Right Click attempts
 * 3. Extended Looking Away / Absence from camera
 * 4. Suspicious keyboard shortcuts
 * 5. Calculation of Integrity / Proctoring Score & Audit Log
 */

export class ProctoringGuard {
  constructor(onViolation) {
    this.onViolation = onViolation;
    this.violations = [];
    this.tabSwitchCount = 0;
    this.copyAttemptCount = 0;
    this.pasteAttemptCount = 0;
    this.lookAwayWarningCount = 0;
    this.integrityScore = 100;
    this.isActive = false;
    this.lookAwayTimer = null;
  }

  start() {
    if (this.isActive) return;
    this.isActive = true;

    // 1. Tab Switch & Window Blur Detection
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    window.addEventListener('blur', this.handleWindowBlur);

    // 2. Clipboard & Context Menu Prevention & Detection
    document.addEventListener('copy', this.handleCopy);
    document.addEventListener('paste', this.handlePaste);
    document.addEventListener('cut', this.handleCut);
    document.addEventListener('contextmenu', this.handleContextMenu);

    // 3. Keyboard Shortcuts Shield (Ctrl+C, Ctrl+V, Alt+Tab, F12)
    window.addEventListener('keydown', this.handleKeyDown);
  }

  stop() {
    this.isActive = false;
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('blur', this.handleWindowBlur);
    document.removeEventListener('copy', this.handleCopy);
    document.removeEventListener('paste', this.handlePaste);
    document.removeEventListener('cut', this.handleCut);
    document.removeEventListener('contextmenu', this.handleContextMenu);
    window.removeEventListener('keydown', this.handleKeyDown);

    if (this.lookAwayTimer) {
      clearInterval(this.lookAwayTimer);
    }
  }

  recordViolation(type, title, description, penalty = 10) {
    if (!this.isActive) return;

    const violation = {
      id: Date.now(),
      time: new Date().toLocaleTimeString(),
      type,
      title,
      description,
      penalty
    };

    this.violations.push(violation);
    this.integrityScore = Math.max(10, this.integrityScore - penalty);

    if (this.onViolation) {
      this.onViolation({
        violation,
        violations: this.violations,
        integrityScore: this.integrityScore,
        stats: {
          tabSwitches: this.tabSwitchCount,
          copyAttempts: this.copyAttemptCount,
          pasteAttempts: this.pasteAttemptCount,
          lookAwayWarnings: this.lookAwayWarningCount
        }
      });
    }
  }

  handleVisibilityChange = () => {
    if (document.hidden) {
      this.tabSwitchCount++;
      this.recordViolation(
        'TAB_SWITCH',
        'Tab Switched / App Minimized',
        'Candidate left the interview window or switched tabs.',
        15
      );
    }
  };

  handleWindowBlur = () => {
    if (!document.hidden) {
      this.tabSwitchCount++;
      this.recordViolation(
        'WINDOW_BLUR',
        'Focus Lost',
        'Interview window lost active focus.',
        10
      );
    }
  };

  handleCopy = (e) => {
    e.preventDefault();
    this.copyAttemptCount++;
    this.recordViolation(
      'COPY_ATTEMPT',
      'Copying Prevented',
      'Candidate attempted to copy question or content from screen.',
      12
    );
  };

  handlePaste = (e) => {
    e.preventDefault();
    this.pasteAttemptCount++;
    this.recordViolation(
      'PASTE_ATTEMPT',
      'Pasting Prevented',
      'Candidate attempted to paste external text into the session.',
      15
    );
  };

  handleCut = (e) => {
    e.preventDefault();
    this.recordViolation(
      'CUT_ATTEMPT',
      'Cut Prevented',
      'Candidate attempted to cut text.',
      10
    );
  };

  handleContextMenu = (e) => {
    e.preventDefault();
    this.recordViolation(
      'RIGHT_CLICK',
      'Right Click Blocked',
      'Candidate attempted to open browser context menu.',
      5
    );
  };

  handleKeyDown = (e) => {
    // Detect Ctrl+C, Ctrl+V, F12 (Inspect), Alt+Tab
    if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C')) {
      this.handleCopy(e);
    } else if ((e.ctrlKey || e.metaKey) && (e.key === 'v' || e.key === 'V')) {
      this.handlePaste(e);
    } else if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
      e.preventDefault();
      this.recordViolation(
        'DEVTOOLS',
        'Inspect / DevTools Blocked',
        'Candidate attempted to open developer tools.',
        20
      );
    }
  };

  reportGazeViolation(durationSeconds) {
    if (durationSeconds >= 4) {
      this.lookAwayWarningCount++;
      this.recordViolation(
        'LOOKING_AWAY',
        'Candidate Looking Away',
        `Looking away from screen / face uncentered for ${durationSeconds}s.`,
        8
      );
    }
  }

  getSummary() {
    return {
      integrityScore: this.integrityScore,
      totalViolations: this.violations.length,
      violationsList: this.violations,
      isFlagged: this.integrityScore < 70,
      stats: {
        tabSwitches: this.tabSwitchCount,
        copyAttempts: this.copyAttemptCount,
        pasteAttempts: this.pasteAttemptCount,
        lookAwayWarnings: this.lookAwayWarningCount
      }
    };
  }
}
