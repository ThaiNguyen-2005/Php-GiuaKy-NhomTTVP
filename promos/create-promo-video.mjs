import { spawn, execFile } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync } from 'node:fs';
import { mkdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const outputDir = path.join(__dirname, 'generated');
const screenDir = path.join(outputDir, 'screens');
const profileDir = path.join(outputDir, 'chrome-profile');
const width = 1280;
const height = 720;
const durationMs = 10000;
const finalVideoName = 'hcmue-library-10s-ad.mp4';
const rawVideoName = 'hcmue-library-10s-ad-browser-raw.mp4';

const chromeCandidates = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
].filter(Boolean);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class CdpSession {
  constructor(socket) {
    this.socket = socket;
    this.nextId = 1;
    this.pending = new Map();
    this.eventWaiters = new Map();

    socket.addEventListener('message', async (event) => {
      const payload =
        typeof event.data === 'string'
          ? event.data
          : event.data instanceof ArrayBuffer
            ? new TextDecoder().decode(event.data)
            : await event.data.text();
      const message = JSON.parse(payload);

      if (message.id && this.pending.has(message.id)) {
        const { resolve, reject } = this.pending.get(message.id);
        this.pending.delete(message.id);

        if (message.error) {
          reject(new Error(`${message.error.message}: ${message.error.data ?? ''}`));
        } else {
          resolve(message.result ?? {});
        }

        return;
      }

      if (message.method && this.eventWaiters.has(message.method)) {
        const waiters = this.eventWaiters.get(message.method);
        this.eventWaiters.delete(message.method);
        waiters.forEach((resolve) => resolve(message.params ?? {}));
      }
    });
  }

  static connect(url) {
    return new Promise((resolve, reject) => {
      const socket = new WebSocket(url);
      socket.addEventListener('open', () => resolve(new CdpSession(socket)), { once: true });
      socket.addEventListener('error', reject, { once: true });
    });
  }

  send(method, params = {}) {
    const id = this.nextId++;

    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  waitFor(method, timeoutMs = 10000) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Timed out waiting for ${method}`));
      }, timeoutMs);

      const wrappedResolve = (params) => {
        clearTimeout(timeout);
        resolve(params);
      };

      const waiters = this.eventWaiters.get(method) ?? [];
      waiters.push(wrappedResolve);
      this.eventWaiters.set(method, waiters);
    });
  }

  close() {
    this.socket.close();
  }
}

function getChromePath() {
  const chromePath = chromeCandidates.find((candidate) => existsSync(candidate));

  if (!chromePath) {
    throw new Error('No Chrome or Edge executable found. Set CHROME_PATH to continue.');
  }

  return chromePath;
}

function getFfmpegPath() {
  const candidates = [
    process.env.FFMPEG_PATH,
    path.join(repoRoot, '.codex-run-logs', 'ffmpeg-tools', 'node_modules', 'ffmpeg-static', 'ffmpeg.exe'),
    'C:\\ProgramData\\chocolatey\\bin\\ffmpeg.exe',
  ].filter(Boolean);

  return candidates.find((candidate) => existsSync(candidate)) ?? 'ffmpeg';
}

function runExecutable(command, args) {
  return new Promise((resolve, reject) => {
    execFile(command, args, { windowsHide: true }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`${error.message}\n${stderr || stdout}`));
        return;
      }

      resolve({ stdout, stderr });
    });
  });
}

async function waitForChrome(port) {
  const endpoint = `http://127.0.0.1:${port}/json/version`;

  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(endpoint);
      if (response.ok) {
        return response.json();
      }
    } catch {
      await sleep(250);
    }
  }

  throw new Error('Chrome did not expose a debugging endpoint in time.');
}

async function createTarget(port, url = 'about:blank') {
  const encoded = encodeURIComponent(url);
  let response = await fetch(`http://127.0.0.1:${port}/json/new?${encoded}`, { method: 'PUT' });

  if (!response.ok) {
    response = await fetch(`http://127.0.0.1:${port}/json/new?${encoded}`);
  }

  if (!response.ok) {
    throw new Error(`Could not create Chrome target: ${response.status}`);
  }

  return response.json();
}

async function evaluate(session, expression, awaitPromise = true) {
  const result = await session.send('Runtime.evaluate', {
    expression,
    awaitPromise,
    returnByValue: true,
  });

  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text ?? 'Runtime evaluation failed.');
  }

  return result.result?.value;
}

async function navigate(session, url, settleMs = 1600) {
  const loadPromise = session.waitFor('Page.loadEventFired', 15000).catch(() => null);
  await session.send('Page.navigate', { url });
  await loadPromise;
  await evaluate(
    session,
    `document.fonts && document.fonts.ready ? document.fonts.ready.then(() => true) : true`
  ).catch(() => true);
  await sleep(settleMs);
  await evaluate(
    session,
    `Promise.race([
      Promise.all(Array.from(document.images).map((image) => image.complete ? true : new Promise((resolve) => {
        image.onload = resolve;
        image.onerror = resolve;
      }))),
      new Promise((resolve) => setTimeout(resolve, 2500))
    ]).then(() => true)`
  ).catch(() => true);
}

async function capture(session, name) {
  const screenshot = await session.send('Page.captureScreenshot', {
    format: 'png',
    fromSurface: true,
    captureBeyondViewport: false,
  });
  const filePath = path.join(screenDir, `${name}.png`);
  await writeFile(filePath, Buffer.from(screenshot.data, 'base64'));
  return {
    name,
    filePath,
    dataUrl: `data:image/png;base64,${screenshot.data}`,
  };
}

async function loginStudent() {
  const response = await fetch('http://127.0.0.1:8000/api/login', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      role: 'student',
      identifier: '1',
      password: 'Library@2026',
    }),
  });

  if (!response.ok) {
    throw new Error(`Student login failed with status ${response.status}: ${await response.text()}`);
  }

  return response.json();
}

async function captureAppScreens(session) {
  const screens = [];

  await navigate(session, 'http://localhost:3000/login', 1800);
  screens.push(await capture(session, 'login'));

  const auth = await loginStudent();
  const storedSession = JSON.stringify({
    token: auth.token,
    role: auth.role,
    user: auth.user,
  });

  await evaluate(
    session,
    `localStorage.setItem('book-loan-auth', ${JSON.stringify(storedSession)}); true;`
  );

  const pages = [
    ['home', 'http://localhost:3000/home'],
    ['requests', 'http://localhost:3000/requests'],
    ['digital', 'http://localhost:3000/digital'],
    ['requests-track', 'http://localhost:3000/requests'],
  ];

  for (const [name, url] of pages) {
    await navigate(session, url, 4600);
    screens.push(await capture(session, name));
  }

  return screens;
}

function makeRenderHtml(screens) {
  const screenPayload = screens.map((screen) => ({
    name: screen.name,
    src: `/screens/${path.basename(screen.filePath)}`,
  }));

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>HCMUE Library Promo Renderer</title>
  <style>
    html, body { margin: 0; width: 100%; height: 100%; background: #07111f; overflow: hidden; }
    canvas { display: block; width: 100vw; height: 100vh; }
  </style>
</head>
<body>
<canvas id="promo" width="${width}" height="${height}"></canvas>
<script>
const W = ${width};
const H = ${height};
const DURATION = ${durationMs};
const screenSources = ${JSON.stringify(screenPayload)};
const canvas = document.getElementById('promo');
const ctx = canvas.getContext('2d');

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);
const easeOut = (t) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
const easeInOut = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function roundRect(x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawCover(image, x, y, w, h) {
  const scale = Math.max(w / image.width, h / image.height);
  const sw = w / scale;
  const sh = h / scale;
  const sx = (image.width - sw) / 2;
  const sy = (image.height - sh) / 2;
  ctx.drawImage(image, sx, sy, sw, sh, x, y, w, h);
}

function drawShadowCard(x, y, w, h, r, alpha = 0.32) {
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, ' + alpha + ')';
  ctx.shadowBlur = 34;
  ctx.shadowOffsetY = 18;
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  roundRect(x, y, w, h, r);
  ctx.fill();
  ctx.restore();
}

function drawBrowserFrame(image, x, y, w, h, scale = 1, active = 1) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  ctx.translate(-cx, -cy);
  drawShadowCard(x, y, w, h, 22, 0.42 * active);
  ctx.globalAlpha = active;
  roundRect(x, y, w, h, 22);
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.fill();
  ctx.save();
  roundRect(x, y, w, h, 22);
  ctx.clip();
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(x, y, w, 42);
  ['#ef4444', '#f59e0b', '#22c55e'].forEach((color, index) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x + 24 + index * 18, y + 21, 6, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.fillStyle = '#e2e8f0';
  roundRect(x + 94, y + 12, w - 128, 18, 9);
  ctx.fill();
  drawCover(image, x, y + 42, w, h - 42);
  ctx.restore();
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 1.5;
  roundRect(x, y, w, h, 22);
  ctx.stroke();
  ctx.restore();
}

function drawText(text, x, y, size, weight = 800, color = '#ffffff', align = 'left') {
  ctx.font = weight + ' ' + size + 'px Inter, Segoe UI, Arial, sans-serif';
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
}

function drawWrappedText(text, x, y, maxWidth, size, lineHeight, color, weight = 700) {
  ctx.font = weight + ' ' + size + 'px Inter, Segoe UI, Arial, sans-serif';
  ctx.fillStyle = color;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const next = line ? line + ' ' + word : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  lines.push(line);
  lines.forEach((entry, index) => ctx.fillText(entry, x, y + index * lineHeight));
}

function drawMovingText(t) {
  const tapeY = 626;
  const text = 'NEW ERA OF LIBRARY  //  HCMUE STUDENTS, COME JOIN US FOR FREE  //  DIGITAL BORROWING  //  STUDY ANYTIME  //  ';
  const isIntro = t < 2.45;
  ctx.save();
  ctx.globalAlpha = isIntro ? 0.9 : 0.94;
  ctx.fillStyle = isIntro ? 'rgba(219, 245, 255, 0.76)' : 'rgba(3, 7, 18, 0.66)';
  ctx.fillRect(0, tapeY - 29, W, 58);
  ctx.strokeStyle = isIntro ? 'rgba(14, 165, 233, 0.45)' : 'rgba(20, 184, 166, 0.45)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, tapeY - 29);
  ctx.lineTo(W, tapeY - 29);
  ctx.moveTo(0, tapeY + 29);
  ctx.lineTo(W, tapeY + 29);
  ctx.stroke();
  ctx.font = '800 23px Inter, Segoe UI, Arial, sans-serif';
  ctx.textBaseline = 'middle';
  const textWidth = ctx.measureText(text).width;
  let x = -((t * 150) % textWidth);
  while (x < W) {
    const gradient = ctx.createLinearGradient(x, tapeY, x + textWidth, tapeY);
    if (isIntro) {
      gradient.addColorStop(0, '#0369a1');
      gradient.addColorStop(0.5, '#0891b2');
      gradient.addColorStop(1, '#2563eb');
    } else {
      gradient.addColorStop(0, '#67e8f9');
      gradient.addColorStop(0.5, '#fef3c7');
      gradient.addColorStop(1, '#fb7185');
    }
    ctx.fillStyle = gradient;
    ctx.fillText(text, x, tapeY);
    x += textWidth;
  }
  ctx.restore();
}

function drawBackground(t) {
  const pulse = (Math.sin(t * Math.PI * 2) + 1) / 2;
  const isIntro = t < 2.45;
  const gradient = ctx.createLinearGradient(0, 0, W, H);
  if (isIntro) {
    gradient.addColorStop(0, '#effaff');
    gradient.addColorStop(0.38, '#c7ecff');
    gradient.addColorStop(0.72, '#9bdcff');
    gradient.addColorStop(1, '#eaf7ff');
  } else {
    gradient.addColorStop(0, '#06111f');
    gradient.addColorStop(0.42, '#10283b');
    gradient.addColorStop(0.73, '#123b3f');
    gradient.addColorStop(1, '#2a1632');
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.globalAlpha = isIntro ? 0.34 : 0.23;
  for (let i = 0; i < 9; i += 1) {
    const y = 80 + i * 66 + Math.sin(t * 2.2 + i) * 9;
    const x = -120 + ((t * 95 + i * 142) % (W + 240));
    const lineGradient = ctx.createLinearGradient(x, y, x + 240, y);
    lineGradient.addColorStop(0, isIntro ? 'rgba(14, 165, 233, 0)' : 'rgba(45, 212, 191, 0)');
    lineGradient.addColorStop(0.5, isIntro ? 'rgba(14, 165, 233, 0.7)' : 'rgba(45, 212, 191, 0.72)');
    lineGradient.addColorStop(1, isIntro ? 'rgba(37, 99, 235, 0)' : 'rgba(251, 191, 36, 0)');
    ctx.strokeStyle = lineGradient;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 240, y);
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = isIntro ? 0.22 + pulse * 0.1 : 0.18 + pulse * 0.08;
  ctx.strokeStyle = isIntro ? '#0284c7' : '#38bdf8';
  ctx.lineWidth = 1;
  for (let x = -20; x < W + 20; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x + Math.sin(t + x) * 4, 0);
    ctx.lineTo(x - 84, H);
    ctx.stroke();
  }
  ctx.restore();
}

function drawIntro(t) {
  const intro = clamp(t / 2.3, 0, 1);
  const glow = 0.5 + 0.5 * Math.sin(t * 7);
  ctx.save();
  ctx.globalAlpha = 1 - smooth(clamp((t - 2.05) / 0.55, 0, 1));
  drawText('HCMUE LIBRARY', W / 2, 114, 24, 800, '#0284c7', 'center');
  ctx.shadowColor = 'rgba(14,165,233,' + (0.28 + glow * 0.22) + ')';
  ctx.shadowBlur = 22;
  drawText('NEW ERA', W / 2, 267 - (1 - intro) * 20, 92, 900, '#075985', 'center');
  drawText('OF LIBRARY', W / 2, 357 + (1 - intro) * 20, 82, 900, '#0284c7', 'center');
  ctx.shadowBlur = 0;
  drawText('HCMUE students, come join us for free', W / 2, 456, 34, 800, '#0369a1', 'center');
  const scanX = -160 + (W + 320) * ((t * 0.7) % 1);
  const scan = ctx.createLinearGradient(scanX - 80, 0, scanX + 80, 0);
  scan.addColorStop(0, 'rgba(255,255,255,0)');
  scan.addColorStop(0.5, 'rgba(255,255,255,0.55)');
  scan.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = scan;
  ctx.fillRect(scanX - 80, 165, 160, 320);
  ctx.restore();
}

function drawCursor(x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.68)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 38);
  ctx.lineTo(11, 28);
  ctx.lineTo(20, 48);
  ctx.lineTo(31, 43);
  ctx.lineTo(22, 24);
  ctx.lineTo(38, 23);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawClickPulse(x, y, t, clickAt, color = '#38bdf8') {
  const p = clamp((t - clickAt) / 0.7, 0, 1);
  if (p <= 0 || p >= 1) return;
  ctx.save();
  ctx.globalAlpha = (1 - p) * 0.8;
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(x + 10, y + 12, 10 + p * 34, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function cursorBetween(t, start, end, from, to) {
  const p = easeInOut(clamp((t - start) / (end - start), 0, 1));
  return {
    x: lerp(from.x, to.x, p),
    y: lerp(from.y, to.y, p),
  };
}

function drawToast(x, y, t, start, text) {
  const enter = easeOut(clamp((t - start) / 0.45, 0, 1));
  const exit = 1 - smooth(clamp((t - start - 1.35) / 0.45, 0, 1));
  const alpha = enter * exit;
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = 'rgba(240, 253, 250, 0.96)';
  ctx.strokeStyle = 'rgba(20, 184, 166, 0.45)';
  roundRect(x, y - enter * 12, 250, 58, 16);
  ctx.fill();
  ctx.stroke();
  drawText('Request sent', x + 24, y + 19 - enter * 12, 18, 900, '#0f766e');
  drawText(text, x + 24, y + 41 - enter * 12, 12, 750, '#155e75');
  ctx.restore();
}

function drawDemo(t, images) {
  const local = t - 2.05;
  const enter = easeOut(clamp(local / 0.85, 0, 1));
  const screenX = lerp(1280, 470, enter);
  const screenY = 74;
  const screenW = 720;
  const screenH = 456;
  const pillX = lerp(1290, 554, enter);
  const pillY = 512;
  const segments = [
    {
      start: 2.05,
      end: 4.85,
      image: images[1],
      headline: 'Slow click: Borrow Book',
      body: 'Click "Borrow now" and send a study request without paperwork.',
      from: { x: screenX + 548, y: screenY + 136 },
      to: { x: screenX + 226, y: screenY + 378 },
      clickAt: 3.65,
      toast: 'The book is added to your request list.',
    },
    {
      start: 4.85,
      end: 6.55,
      image: images[3],
      headline: 'Open digital docs',
      body: 'Read PDF, EPUB, audio, and slide resources anytime.',
      from: { x: screenX + 505, y: screenY + 145 },
      to: { x: screenX + 332, y: screenY + 383 },
      clickAt: 5.72,
    },
    {
      start: 6.55,
      end: 7.95,
      image: images[4] ?? images[2],
      headline: 'Track every request',
      body: 'See pending, borrowing, returned, and rejected books clearly.',
      from: { x: screenX + 540, y: screenY + 170 },
      to: { x: screenX + 235, y: screenY + 212 },
      clickAt: 7.08,
    },
  ];

  let activeIndex = segments.findIndex((segment) => t < segment.end);
  if (activeIndex < 0) activeIndex = segments.length - 1;
  const segment = segments[activeIndex] ?? segments[segments.length - 1];
  const nextSegment = segments[Math.min(activeIndex + 1, segments.length - 1)];
  const switchProgress = smooth(clamp((t - (segment.end - 0.35)) / 0.35, 0, 1));
  const cursor = cursorBetween(t, segment.start + 0.25, segment.clickAt, segment.from, segment.to);

  ctx.save();
  ctx.globalAlpha = enter;
  drawText('SMART LIBRARY ACCESS', 76, 118, 22, 900, '#67e8f9', 'left');
  drawWrappedText('Borrow books, read digital docs, and track requests in one place.', 76, 154, 330, 32, 38, '#ffffff', 850);

  const statY = 364;
  [
    ['24/7', 'Digital docs'],
    ['Free', 'For HCMUE students'],
    ['Fast', 'Borrow requests'],
  ].forEach(([big, label], index) => {
    const x = 76 + index * 118;
    ctx.fillStyle = index === 1 ? '#fef3c7' : '#a7f3d0';
    roundRect(x, statY, 96, 82, 18);
    ctx.fill();
    drawText(big, x + 48, statY + 28, 25, 900, '#07111f', 'center');
    drawText(label, x + 48, statY + 56, 9, 800, '#334155', 'center');
  });

  drawBrowserFrame(segment.image, screenX - switchProgress * 74, screenY + switchProgress * 8, screenW, screenH, 1 - switchProgress * 0.04, 1 - switchProgress * 0.25);
  if (nextSegment !== segment && switchProgress > 0) {
    ctx.save();
    ctx.globalAlpha = switchProgress * enter;
    drawBrowserFrame(nextSegment.image, screenX + 82 - switchProgress * 82, screenY, screenW, screenH, 0.96 + switchProgress * 0.04, 1);
    ctx.restore();
  }

  if (activeIndex === 0) {
    const highlight = smooth(clamp((t - 3.15) / 0.45, 0, 1)) * (1 - smooth(clamp((t - 4.18) / 0.45, 0, 1)));
    ctx.save();
    ctx.globalAlpha = highlight * 0.62;
    ctx.fillStyle = '#bae6fd';
    roundRect(segment.to.x - 72, segment.to.y - 20, 136, 54, 16);
    ctx.fill();
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
    drawToast(segment.to.x + 74, segment.to.y - 96, t, 3.9, segment.toast);
  }

  drawShadowCard(pillX, pillY, 548, 76, 18, 0.28);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
  roundRect(pillX, pillY, 548, 76, 18);
  ctx.fill();
  ctx.strokeStyle = 'rgba(103,232,249,0.35)';
  ctx.stroke();
  drawText(segment.headline, pillX + 28, pillY + 28, 24, 900, '#fef3c7');
  drawText(segment.body, pillX + 28, pillY + 55, 15, 650, '#dbeafe');

  drawClickPulse(segment.to.x, segment.to.y, t, segment.clickAt);
  const clickScale = 1 - 0.08 * smooth(clamp((t - segment.clickAt) / 0.18, 0, 1)) * (1 - smooth(clamp((t - segment.clickAt - 0.18) / 0.18, 0, 1)));
  drawCursor(cursor.x, cursor.y, clickScale);
  ctx.restore();
}

function drawFinal(t, images) {
  const local = t - 7.85;
  const enter = easeOut(clamp(local / 0.75, 0, 1));
  ctx.save();
  ctx.globalAlpha = enter;
  drawBrowserFrame(images[0], lerp(-420, 68, enter), 88, 470, 322, 0.98, 0.9);
  drawBrowserFrame(images[2], lerp(1270, 742, enter), 88, 470, 322, 0.98, 0.9);
  ctx.fillStyle = 'rgba(7, 17, 31, 0.76)';
  roundRect(312, 120, 656, 340, 26);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.stroke();
  drawText('HCMUE LIBRARY', W / 2, 185, 30, 900, '#67e8f9', 'center');
  drawText('Join Free Today', W / 2, 268, 72, 900, '#ffffff', 'center');
  drawText('Search. Borrow. Read. Repeat.', W / 2, 342, 30, 800, '#fef3c7', 'center');
  drawText('A new library experience for every student.', W / 2, 397, 24, 750, '#a7f3d0', 'center');
  ctx.restore();
}

async function render() {
  const images = await Promise.all(screenSources.map((screen) => loadImage(screen.src)));
  const stream = canvas.captureStream(30);
  const candidates = [
    'video/mp4;codecs=avc1.42E01E',
    'video/mp4',
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm'
  ];
  const mimeType = candidates.find((type) => MediaRecorder.isTypeSupported(type)) || '';
  const chunks = [];
  const recorder = new MediaRecorder(stream, mimeType ? { mimeType, videoBitsPerSecond: 8_000_000 } : { videoBitsPerSecond: 8_000_000 });
  recorder.ondataavailable = (event) => {
    if (event.data && event.data.size) chunks.push(event.data);
  };
  recorder.onstop = async () => {
    const blob = new Blob(chunks, { type: recorder.mimeType || mimeType || 'video/webm' });
    const buffer = await blob.arrayBuffer();
    const bytes = Array.from(new Uint8Array(buffer));
    window.__promoResult = { mimeType: blob.type, bytes };
  };

  const start = performance.now();
  recorder.start(250);

  function frame(now) {
    const elapsed = Math.min(now - start, DURATION);
    const t = elapsed / 1000;
    drawBackground(t);
    drawIntro(t);
    drawDemo(t, images);
    drawFinal(t, images);
    drawMovingText(t);
    if (elapsed < DURATION) {
      requestAnimationFrame(frame);
    } else {
      recorder.stop();
    }
  }

  requestAnimationFrame(frame);
}

render().catch((error) => {
  window.__promoError = error.stack || String(error);
});
</script>
</body>
</html>`;
}

function contentTypeFor(filePath) {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
  if (filePath.endsWith('.png')) return 'image/png';
  if (filePath.endsWith('.webm')) return 'video/webm';
  if (filePath.endsWith('.mp4')) return 'video/mp4';
  return 'application/octet-stream';
}

async function serveRenderDirectory(renderHtml) {
  const server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url, 'http://127.0.0.1');

      if (url.pathname === '/' || url.pathname === '/render.html') {
        response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        response.end(renderHtml);
        return;
      }

      const requestedPath = path.normalize(decodeURIComponent(url.pathname.replace(/^\/+/, '')));
      const filePath = path.join(outputDir, requestedPath);

      if (!filePath.startsWith(outputDir)) {
        response.writeHead(403);
        response.end('Forbidden');
        return;
      }

      const file = await readFile(filePath);
      response.writeHead(200, { 'Content-Type': contentTypeFor(filePath) });
      response.end(file);
    } catch {
      response.writeHead(404);
      response.end('Not found');
    }
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  return server;
}

async function renderVideo(session, screens) {
  const renderHtml = makeRenderHtml(screens);
  const server = await serveRenderDirectory(renderHtml);
  const { port } = server.address();

  try {
    await navigate(session, `http://127.0.0.1:${port}/render.html`, 400);

    let result = null;
    for (let attempt = 0; attempt < 160; attempt += 1) {
      const state = await evaluate(
        session,
        `window.__promoError ? { error: window.__promoError } : (window.__promoResult ? { result: window.__promoResult } : null)`
      );

      if (state?.error) {
        throw new Error(state.error);
      }

      if (state?.result) {
        result = state.result;
        break;
      }

      await sleep(250);
    }

    if (!result) {
      throw new Error('Promo renderer did not finish in time.');
    }

    const extension = result.mimeType.includes('mp4') ? 'mp4' : 'webm';
    const videoPath = path.join(outputDir, `hcmue-library-10s-ad-browser.${extension}`);
    await writeFile(videoPath, Buffer.from(result.bytes));
    const info = await stat(videoPath);
    return {
      videoPath,
      mimeType: result.mimeType,
      size: info.size,
    };
  } finally {
    server.close();
  }
}

async function captureVideoFrame(ffmpegPath, videoPath, seconds, outputPath) {
  await runExecutable(ffmpegPath, [
    '-y',
    '-ss',
    seconds,
    '-i',
    videoPath,
    '-frames:v',
    '1',
    '-update',
    '1',
    outputPath,
  ]);
}

async function postProcessVideo(video) {
  const ffmpegPath = getFfmpegPath();
  const finalPath = path.join(outputDir, finalVideoName);
  const rawPath = path.join(outputDir, rawVideoName);
  const cleanPath = path.join(outputDir, 'hcmue-library-10s-ad-clean.mp4');
  const previewPath = path.join(outputDir, 'hcmue-library-10s-ad-preview.png');
  const demoFramePath = path.join(outputDir, 'hcmue-library-10s-ad-demo-frame.png');

  await rm(rawPath, { force: true }).catch(() => null);
  await rm(cleanPath, { force: true }).catch(() => null);
  await rm(finalPath, { force: true }).catch(() => null);
  await rename(video.videoPath, rawPath);

  const music =
    'aevalsrc=0.035*sin(2*PI*196*t)+0.028*sin(2*PI*246.94*t)+0.024*sin(2*PI*329.63*t)+0.014*sin(2*PI*493.88*t):s=44100:d=10';
  const filter =
    '[0:v]setpts=PTS-STARTPTS,fps=30,scale=1280:720,format=yuv420p,tpad=stop_mode=clone:stop_duration=1[v];' +
    '[1:a]afade=t=in:st=0:d=0.65,afade=t=out:st=9.15:d=0.85,volume=0.72[a]';

  await runExecutable(ffmpegPath, [
    '-y',
    '-i',
    rawPath,
    '-f',
    'lavfi',
    '-i',
    music,
    '-filter_complex',
    filter,
    '-map',
    '[v]',
    '-map',
    '[a]',
    '-t',
    '10',
    '-c:v',
    'libx264',
    '-preset',
    'medium',
    '-crf',
    '18',
    '-c:a',
    'aac',
    '-b:a',
    '128k',
    '-shortest',
    '-movflags',
    '+faststart',
    cleanPath,
  ]);

  await rename(cleanPath, finalPath);
  await captureVideoFrame(ffmpegPath, finalPath, '00:00:01.2', previewPath);
  await captureVideoFrame(ffmpegPath, finalPath, '00:00:03.7', demoFramePath);
  await rm(rawPath, { force: true }).catch(() => null);

  const info = await stat(finalPath);
  return {
    videoPath: finalPath,
    mimeType: 'video/mp4',
    size: info.size,
    durationMs,
    width,
    height,
    hasAudio: true,
    previewPath,
    demoFramePath,
  };
}

async function main() {
  await mkdir(screenDir, { recursive: true });
  await rm(profileDir, { recursive: true, force: true });

  const chromePath = getChromePath();
  const port = 9400 + Math.floor(Math.random() * 500);
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--hide-scrollbars',
    '--mute-audio',
    '--no-first-run',
    '--no-default-browser-check',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profileDir}`,
    `--window-size=${width},${height}`,
    'about:blank',
  ], {
    stdio: 'ignore',
  });

  let session;

  try {
    await waitForChrome(port);
    const target = await createTarget(port);
    session = await CdpSession.connect(target.webSocketDebuggerUrl);
    await session.send('Page.enable');
    await session.send('Runtime.enable');
    await session.send('Network.enable');
    await session.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: false,
    });

    const screens = await captureAppScreens(session);
    const rawVideo = await renderVideo(session, screens);
    const video = await postProcessVideo(rawVideo);
    await writeFile(
      path.join(outputDir, 'hcmue-library-10s-ad.json'),
      JSON.stringify({ ...video, screens: screens.map((screen) => screen.filePath) }, null, 2)
    );

    console.log(JSON.stringify(video, null, 2));
  } finally {
    session?.close();
    chrome.kill();
    await Promise.race([
      new Promise((resolve) => chrome.once('exit', resolve)),
      sleep(1500),
    ]).catch(() => null);
    await rm(profileDir, { recursive: true, force: true }).catch(() => null);
  }
}

main().catch((error) => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
