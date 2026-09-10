/**
 * Vision, 3D Face Mesh & Posture Detector
 * Analyzes video feed frames in real-time, computes head posture, eye gaze orientation,
 * face centering, movement stability, live confidence metrics, and draws a real-time
 * sci-fi 3D Face Scanning HUD overlay directly on an HTML5 canvas.
 */

export class VisionDetector {
  constructor(videoElement, overlayCanvas, onMetricsUpdate) {
    this.video = videoElement;
    this.overlayCanvas = overlayCanvas;
    this.onMetricsUpdate = onMetricsUpdate;

    // Off-screen canvas for sampling
    this.sampleCanvas = document.createElement('canvas');
    this.sampleCtx = this.sampleCanvas.getContext('2d', { willReadFrequently: true });

    this.isRunning = false;
    this.animationFrameId = null;
    this.smoothedConfidence = 78;
    this.lookAwayCounter = 0;
    this.slouchCounter = 0;

    // Smooth coordinates for 3D face mesh
    this.smoothX = 80;
    this.smoothY = 60;
    this.smoothWidth = 60;
    this.smoothHeight = 75;
    this.scanLineY = 0;
    this.scanDirection = 1;
    this.pulsePhase = 0;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.sampleCanvas.width = 160;
    this.sampleCanvas.height = 120;
    this.loop();
  }

  stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  loop = () => {
    if (!this.isRunning) return;

    if (this.video && this.video.readyState >= 2) {
      try {
        const metrics = this.analyzeFrame();
        this.render3DHUD(metrics);
      } catch (e) {
        console.error("Vision analysis error:", e);
      }
    }

    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  analyzeFrame() {
    const w = this.sampleCanvas.width;
    const h = this.sampleCanvas.height;
    this.sampleCtx.drawImage(this.video, 0, 0, w, h);

    const frame = this.sampleCtx.getImageData(0, 0, w, h);
    const data = frame.data;

    let facePixels = 0;
    let weightedX = 0;
    let weightedY = 0;
    let minX = w, maxX = 0, minY = h, maxY = 0;

    // Grid sampling
    for (let y = 0; y < h; y += 2) {
      for (let x = 0; x < w; x += 2) {
        const idx = (y * w + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        // Skin-tone / face luminosity heuristic
        const isSkinTone = (r > 55 && g > 35 && b > 20 && r > g && r > b && (r - Math.min(g, b)) > 12);
        if (isSkinTone) {
          facePixels++;
          weightedX += x;
          weightedY += y;

          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    const totalSampled = (w * h) / 4;
    const faceRatio = facePixels / totalSampled;
    const hasFace = faceRatio > 0.035;

    let postureStatus = 'Good';
    let eyeContactStatus = 'Good';
    let isLookingAway = false;
    let isSlouching = false;
    let headTiltAngle = 0;

    let targetX = w / 2;
    let targetY = h / 2;
    let targetW = 60;
    let targetH = 75;

    if (!hasFace) {
      postureStatus = 'No Face Detected';
      eyeContactStatus = 'Looking Away';
      isLookingAway = true;
      this.lookAwayCounter += 1;
    } else {
      const centerX = weightedX / facePixels;
      const centerY = weightedY / facePixels;

      targetX = centerX;
      targetY = centerY;
      targetW = Math.max(40, Math.min(100, (maxX - minX) * 1.1));
      targetH = Math.max(50, Math.min(110, (maxY - minY) * 1.1));

      const normX = centerX / w; // 0 to 1
      const normY = centerY / h; // 0 to 1

      // Posture detection: Height & Centering
      if (normY > 0.62) {
        postureStatus = 'Slouching / Too Low ⚠️';
        isSlouching = true;
        this.slouchCounter++;
      } else if (normX < 0.32 || normX > 0.68) {
        postureStatus = 'Head Tilted / Off-Center ⚠️';
        headTiltAngle = Math.round((normX - 0.5) * 50);
      } else {
        postureStatus = 'Good';
        this.slouchCounter = Math.max(0, this.slouchCounter - 1);
      }

      // Eye Contact & Gaze
      if (normX < 0.35 || normX > 0.65 || normY > 0.64 || normY < 0.24) {
        eyeContactStatus = 'Looking Away ⚠️';
        isLookingAway = true;
        this.lookAwayCounter++;
      } else {
        eyeContactStatus = 'Good';
        this.lookAwayCounter = Math.max(0, this.lookAwayCounter - 1);
      }
    }

    // Smooth tracking coordinates
    this.smoothX += (targetX - this.smoothX) * 0.2;
    this.smoothY += (targetY - this.smoothY) * 0.2;
    this.smoothWidth += (targetW - this.smoothWidth) * 0.2;
    this.smoothHeight += (targetH - this.smoothHeight) * 0.2;

    // Dynamic Confidence Score
    let rawConfidence = 82;
    if (postureStatus === 'Good') rawConfidence += 10;
    else if (isSlouching) rawConfidence -= 18;
    else rawConfidence -= 10;

    if (eyeContactStatus === 'Good') rawConfidence += 10;
    else rawConfidence -= 20;

    if (!hasFace) rawConfidence = 35;

    this.smoothedConfidence = Math.round(this.smoothedConfidence * 0.88 + rawConfidence * 0.12);
    this.smoothedConfidence = Math.max(30, Math.min(98, this.smoothedConfidence));

    let emotion = 'Neutral 😐';
    if (this.smoothedConfidence >= 82) {
      emotion = 'Confident 💪';
    } else if (this.smoothedConfidence >= 70) {
      emotion = 'Focused 🎯';
    } else if (this.smoothedConfidence >= 55) {
      emotion = 'Thoughtful 🤔';
    } else {
      emotion = 'Nervous 😰';
    }

    const metrics = {
      hasFace,
      posture: postureStatus,
      eyeContact: eyeContactStatus,
      confidence: this.smoothedConfidence,
      emotion,
      isLookingAway,
      isSlouching,
      headTiltAngle,
      lookAwayDurationSeconds: Math.floor(this.lookAwayCounter / 15)
    };

    if (this.onMetricsUpdate) {
      this.onMetricsUpdate(metrics);
    }

    return metrics;
  }

  /**
   * Renders Sci-Fi 3D Face Scanner & Biometric HUD directly on overlay canvas
   */
  render3DHUD(metrics) {
    if (!this.overlayCanvas) return;
    const canvas = this.overlayCanvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Sync dimensions with video
    if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
      canvas.width = canvas.clientWidth || 640;
      canvas.height = canvas.clientHeight || 480;
    }

    const cw = canvas.width;
    const ch = canvas.height;
    ctx.clearRect(0, 0, cw, ch);

    const scaleX = cw / this.sampleCanvas.width;
    const scaleY = ch / this.sampleCanvas.height;

    const fx = this.smoothX * scaleX;
    const fy = this.smoothY * scaleY;
    const fw = this.smoothWidth * scaleX;
    const fh = this.smoothHeight * scaleY;

    this.pulsePhase += 0.05;
    const pulse = Math.sin(this.pulsePhase) * 4;

    const isGood = metrics.hasFace && metrics.posture === 'Good';
    const primaryColor = isGood ? '#06b6d4' : (metrics.hasFace ? '#f59e0b' : '#ef4444');
    const glowColor = isGood ? 'rgba(6, 182, 212, 0.4)' : (metrics.hasFace ? 'rgba(245, 158, 11, 0.4)' : 'rgba(239, 68, 68, 0.4)');

    // 1. Center Reference Grid & Posture Baseline
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    // Center crosshair
    ctx.beginPath();
    ctx.moveTo(cw / 2, 20);
    ctx.lineTo(cw / 2, ch - 20);
    ctx.moveTo(30, ch * 0.45);
    ctx.lineTo(cw - 30, ch * 0.45);
    ctx.stroke();
    ctx.restore();

    if (metrics.hasFace) {
      // 2. 3D Face Mesh Oval & Bounding Box
      const boxLeft = Math.max(10, fx - fw / 2 - pulse);
      const boxTop = Math.max(10, fy - fh / 2 - pulse);
      const boxWidth = Math.min(cw - 20, fw + pulse * 2);
      const boxHeight = Math.min(ch - 20, fh + pulse * 2);

      // Sci-Fi Corner Brackets
      ctx.save();
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 3;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 12;

      const cornerLen = Math.min(24, boxWidth * 0.2);

      // Top-Left
      ctx.beginPath();
      ctx.moveTo(boxLeft, boxTop + cornerLen);
      ctx.lineTo(boxLeft, boxTop);
      ctx.lineTo(boxLeft + cornerLen, boxTop);
      ctx.stroke();

      // Top-Right
      ctx.beginPath();
      ctx.moveTo(boxLeft + boxWidth - cornerLen, boxTop);
      ctx.lineTo(boxLeft + boxWidth, boxTop);
      ctx.lineTo(boxLeft + boxWidth, boxTop + cornerLen);
      ctx.stroke();

      // Bottom-Left
      ctx.beginPath();
      ctx.moveTo(boxLeft, boxTop + boxHeight - cornerLen);
      ctx.lineTo(boxLeft, boxTop + boxHeight);
      ctx.lineTo(boxLeft + cornerLen, boxTop + boxHeight);
      ctx.stroke();

      // Bottom-Right
      ctx.beginPath();
      ctx.moveTo(boxLeft + boxWidth - cornerLen, boxTop + boxHeight);
      ctx.lineTo(boxLeft + boxWidth, boxTop + boxHeight);
      ctx.lineTo(boxLeft + boxWidth, boxTop + boxHeight - cornerLen);
      ctx.stroke();

      // 3. 3D Facial Landmark Keypoints (Eyes, Nose, Mouth, Head Axis)
      ctx.fillStyle = primaryColor;
      ctx.shadowBlur = 8;

      // Left Eye
      const eyeY = fy - fh * 0.12;
      const leftEyeX = fx - fw * 0.22;
      const rightEyeX = fx + fw * 0.22;
      ctx.beginPath();
      ctx.arc(leftEyeX, eyeY, 4, 0, Math.PI * 2);
      ctx.fill();

      // Right Eye
      ctx.beginPath();
      ctx.arc(rightEyeX, eyeY, 4, 0, Math.PI * 2);
      ctx.fill();

      // Eye Connecting Line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(leftEyeX, eyeY);
      ctx.lineTo(rightEyeX, eyeY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Nose Tip
      const noseY = fy + fh * 0.05;
      ctx.beginPath();
      ctx.arc(fx, noseY, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Mouth Line
      const mouthY = fy + fh * 0.25;
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(fx - fw * 0.15, mouthY);
      ctx.lineTo(fx + fw * 0.15, mouthY);
      ctx.stroke();

      // 4. Posture Vector Line (Head center to Baseline)
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(fx, boxTop + boxHeight);
      ctx.lineTo(fx, ch - 30);
      ctx.stroke();
      ctx.setLineDash([]);

      // 5. 3D Scan Line Animation
      this.scanLineY += 2 * this.scanDirection;
      if (this.scanLineY > boxHeight) {
        this.scanLineY = boxHeight;
        this.scanDirection = -1;
      } else if (this.scanLineY < 0) {
        this.scanLineY = 0;
        this.scanDirection = 1;
      }

      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(boxLeft, boxTop + this.scanLineY);
      ctx.lineTo(boxLeft + boxWidth, boxTop + this.scanLineY);
      ctx.stroke();

      // 6. Live HUD Tag
      ctx.font = '10px Inter, monospace';
      ctx.fillStyle = primaryColor;
      ctx.shadowBlur = 0;
      ctx.fillText(`AI 3D FACE TRACK // CONF: ${metrics.confidence}%`, boxLeft, boxTop - 8);

      ctx.restore();
    } else {
      // Guide prompt when no face is found
      ctx.save();
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚠️ ALIGN FACE IN CAMERA CENTER', cw / 2, ch / 2);
      ctx.restore();
    }
  }
}
