import QRCode from 'qrcode';
import { TuitionPost, User } from './types';

const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1440;
const PADDING = 68;
const LOGO_SRC = '/assets/porabo_logo_transparent_90065b0b.svg';

const loadImage = (src: string, crossOrigin?: boolean): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (crossOrigin) img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load: ${src}`));
    img.src = src;
  });
};

const wrapText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] => {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  if (lines.length > maxLines) {
    const trunc = lines.slice(0, maxLines);
    let last = trunc[maxLines - 1];
    while (ctx.measureText(`${last}...`).width > maxWidth && last.length > 0) {
      last = last.slice(0, -1);
    }
    trunc[maxLines - 1] = `${last}...`;
    return trunc;
  }
  return lines;
};

const roundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
};

const DAY_LABELS: Record<string, string> = {
  SAT: 'Saturday', SUN: 'Sunday', MON: 'Monday', TUE: 'Tuesday',
  WED: 'Wednesday', THU: 'Thursday', FRI: 'Friday',
};

async function drawPremiumBackground(
  ctx: CanvasRenderingContext2D,
  topAccentColor: string = 'rgba(56,189,248,0.9)'
) {
  const bg = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
  bg.addColorStop(0, '#0A0F19');
  bg.addColorStop(0.5, '#0B1428');
  bg.addColorStop(1, '#070A12');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  const g1 = ctx.createRadialGradient(CARD_WIDTH, 0, 0, CARD_WIDTH, 0, 720);
  g1.addColorStop(0, 'rgba(59,130,246,0.35)');
  g1.addColorStop(1, 'rgba(59,130,246,0)');
  ctx.fillStyle = g1;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  const g2 = ctx.createRadialGradient(0, CARD_HEIGHT, 0, 0, CARD_HEIGHT, 600);
  g2.addColorStop(0, 'rgba(6,182,212,0.22)');
  g2.addColorStop(1, 'rgba(6,182,212,0)');
  ctx.fillStyle = g2;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  ctx.fillStyle = 'rgba(59,130,246,0.07)';
  for (let x = 0; x < CARD_WIDTH; x += 32) {
    for (let y = 0; y < CARD_HEIGHT; y += 32) {
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const topLine = ctx.createLinearGradient(0, 0, CARD_WIDTH, 0);
  topLine.addColorStop(0, 'rgba(59,130,246,0)');
  topLine.addColorStop(0.5, topAccentColor);
  topLine.addColorStop(1, 'rgba(59,130,246,0)');
  ctx.fillStyle = topLine;
  ctx.fillRect(0, 0, CARD_WIDTH, 3);
}

async function drawHeader(ctx: CanvasRenderingContext2D) {
  const logoX = PADDING + 28;
  const logoY = 90;
  const logoR = 26;

  const lglow = ctx.createRadialGradient(logoX, logoY, 0, logoX, logoY, 60);
  lglow.addColorStop(0, 'rgba(56,189,248,0.6)');
  lglow.addColorStop(1, 'rgba(56,189,248,0)');
  ctx.fillStyle = lglow;
  ctx.beginPath();
  ctx.arc(logoX, logoY, 60, 0, Math.PI * 2);
  ctx.fill();

  const lbg = ctx.createLinearGradient(logoX - logoR, logoY - logoR, logoX + logoR, logoY + logoR);
  lbg.addColorStop(0, '#1E3A8A');
  lbg.addColorStop(1, '#0369A1');
  ctx.fillStyle = lbg;
  ctx.beginPath();
  ctx.arc(logoX, logoY, logoR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#38BDF8';
  ctx.lineWidth = 2;
  ctx.stroke();

  try {
    const logoImg = await loadImage(LOGO_SRC);
    ctx.save();
    ctx.beginPath();
    ctx.arc(logoX, logoY, logoR - 3, 0, Math.PI * 2);
    ctx.clip();
    const aspect = logoImg.width / logoImg.height;
    const maxDim = logoR * 2 - 8;
    let dw = maxDim;
    let dh = maxDim / aspect;
    if (dh > maxDim) { dh = maxDim; dw = maxDim * aspect; }
    ctx.drawImage(logoImg, logoX - dw / 2, logoY - dh / 2, dw, dh);
    ctx.restore();
  } catch {
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 32px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('P', logoX, logoY + 2);
  }

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 34px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('Porabo', PADDING + 74, logoY - 2);

  ctx.fillStyle = '#38BDF8';
  ctx.font = '600 12px "SF Mono", Monaco, monospace';
  ctx.fillText("BANGLADESH'S LARGEST TUITION NETWORK", PADDING + 76, logoY + 20);
}

function drawBadge(
  ctx: CanvasRenderingContext2D,
  yPos: number,
  text: string,
  colorScheme: 'cyan' | 'emerald' = 'cyan'
) {
  ctx.font = 'bold 15px "SF Mono", Monaco, monospace';
  const bTextW = ctx.measureText(text).width;
  const bW = bTextW + 50;

  const bGrad = ctx.createLinearGradient(PADDING, yPos, PADDING + bW, yPos);
  if (colorScheme === 'emerald') {
    bGrad.addColorStop(0, 'rgba(16,185,129,0.3)');
    bGrad.addColorStop(1, 'rgba(6,182,212,0.15)');
  } else {
    bGrad.addColorStop(0, 'rgba(6,182,212,0.3)');
    bGrad.addColorStop(1, 'rgba(59,130,246,0.15)');
  }
  ctx.fillStyle = bGrad;
  roundRect(ctx, PADDING, yPos, bW, 42, 21);
  ctx.fill();
  ctx.strokeStyle = colorScheme === 'emerald' ? 'rgba(52,211,153,0.7)' : 'rgba(56,189,248,0.7)';
  ctx.lineWidth = 2;
  roundRect(ctx, PADDING, yPos, bW, 42, 21);
  ctx.stroke();

  ctx.fillStyle = colorScheme === 'emerald' ? '#6EE7B7' : '#67E8F9';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillText(text, PADDING + 25, yPos + 22);
}

async function drawQR(
  ctx: CanvasRenderingContext2D,
  qrY: number,
  shareUrl: string,
  caption: string
) {
  const qrSize = 200;
  const qrX = (CARD_WIDTH - qrSize) / 2;

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.7)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 12;
  ctx.fillStyle = '#FFFFFF';
  roundRect(ctx, qrX, qrY, qrSize, qrSize, 22);
  ctx.fill();
  ctx.restore();

  try {
    const qrUrl = await QRCode.toDataURL(shareUrl, {
      width: 500,
      margin: 1,
      color: { dark: '#0B0F19', light: '#FFFFFF' },
      errorCorrectionLevel: 'M',
    });
    const qrImg = await loadImage(qrUrl, true);
    const inner = 16;
    ctx.drawImage(qrImg, qrX + inner, qrY + inner, qrSize - inner * 2, qrSize - inner * 2);
  } catch (e) {
    console.warn('QR gen failed:', e);
  }

  ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = '#38BDF8';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(caption, CARD_WIDTH / 2, qrY + qrSize + 28);
}

function drawFooter(ctx: CanvasRenderingContext2D) {
  const fY = CARD_HEIGHT - 90;
  const fGrad = ctx.createLinearGradient(0, fY, CARD_WIDTH, fY);
  fGrad.addColorStop(0, 'rgba(59,130,246,0.05)');
  fGrad.addColorStop(0.5, 'rgba(59,130,246,0.22)');
  fGrad.addColorStop(1, 'rgba(59,130,246,0.05)');
  ctx.fillStyle = fGrad;
  ctx.fillRect(0, fY, CARD_WIDTH, 90);

  const fBorder = ctx.createLinearGradient(0, fY, CARD_WIDTH, fY);
  fBorder.addColorStop(0, 'rgba(56,189,248,0)');
  fBorder.addColorStop(0.5, 'rgba(56,189,248,0.6)');
  fBorder.addColorStop(1, 'rgba(56,189,248,0)');
  ctx.fillStyle = fBorder;
  ctx.fillRect(0, fY, CARD_WIDTH, 2);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('porabo.online', CARD_WIDTH / 2, fY + 34);

  ctx.font = '600 13px "SF Mono", Monaco, monospace';
  ctx.fillStyle = '#38BDF8';
  ctx.fillText('No Commission  •  No Ads Fee  •  100% Verified', CARD_WIDTH / 2, fY + 66);
}

// ═══════════════════════════════════════════════════════════════════
// TUITION CARD
// ═══════════════════════════════════════════════════════════════════
export async function generateTuitionCard(
  post: TuitionPost,
  shareUrl: string = 'https://porabo.online'
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not available');

  await drawPremiumBackground(ctx);
  await drawHeader(ctx);

  drawBadge(ctx, 165, 'TUITION OPPORTUNITY', 'cyan');

  let yPos = 240;
  const maxW = CARD_WIDTH - PADDING * 2;
  ctx.font = 'bold 50px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  const titleLines = wrapText(ctx, post.title, maxW, 2);
  titleLines.forEach((line) => {
    ctx.fillText(line, PADDING, yPos);
    yPos += 60;
  });

  yPos += 5;
  ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = '#22D3EE';
  ctx.textBaseline = 'top';
  ctx.fillText(`${post.subject}  •  ${post.gradeLevel}`, PADDING, yPos);
  yPos += 45;

  yPos += 10;
  const gap = 14;
  const cellW = (maxW - gap) / 2;
  const cellH = 130;

  const drawCell = (
    x: number, y: number, label: string, value: string,
    valueColor: string, borderColor: string, wrapValue = false
  ) => {
    ctx.fillStyle = 'rgba(17,24,39,0.9)';
    roundRect(ctx, x, y, cellW, cellH, 20);
    ctx.fill();
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    roundRect(ctx, x, y, cellW, cellH, 20);
    ctx.stroke();

    ctx.font = '600 13px "SF Mono", Monaco, monospace';
    ctx.fillStyle = '#94A3B8';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.fillText(label, x + 22, y + 24);

    if (wrapValue) {
      ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillStyle = valueColor;
      const lines = wrapText(ctx, value, cellW - 44, 2);
      lines.forEach((l, i) => ctx.fillText(l, x + 22, y + 60 + i * 26));
    } else {
      ctx.font = 'bold 30px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillStyle = valueColor;
      ctx.fillText(value, x + 22, y + 58);
    }
  };

  drawCell(PADDING, yPos, 'MONTHLY BUDGET', `৳ ${post.salaryBudget.toLocaleString()}`, '#34D399', 'rgba(16,185,129,0.4)');

  const modeText =
    post.tuitionMode === 'ONLINE' ? '🌐 Online'
    : post.tuitionMode === 'OFFLINE' ? '🏠 Offline'
    : post.tuitionMode === 'BOTH' ? '🔄 Both'
    : 'Flexible';
  const modeColor =
    post.tuitionMode === 'ONLINE' ? '#22D3EE'
    : post.tuitionMode === 'OFFLINE' ? '#34D399'
    : '#A78BFA';
  drawCell(PADDING + cellW + gap, yPos, 'TUITION MODE', modeText, modeColor, 'rgba(59,130,246,0.4)');

  yPos += cellH + gap;

  drawCell(PADDING, yPos, 'DAYS PER WEEK', `${post.daysPerWeek} days`, '#FFFFFF', 'rgba(59,130,246,0.4)');
  drawCell(PADDING + cellW + gap, yPos, 'CURRICULUM', post.curriculum, '#FFFFFF', 'rgba(59,130,246,0.4)', true);

  yPos += cellH + 20;

  if (post.weeklySchedule && post.weeklySchedule.length > 0) {
    const maxRows = Math.min(post.weeklySchedule.length, 4);
    const schedH = 56 + maxRows * 36;
    ctx.fillStyle = 'rgba(17,24,39,0.9)';
    roundRect(ctx, PADDING, yPos, maxW, schedH, 20);
    ctx.fill();
    ctx.strokeStyle = 'rgba(6,182,212,0.4)';
    ctx.lineWidth = 2;
    roundRect(ctx, PADDING, yPos, maxW, schedH, 20);
    ctx.stroke();

    ctx.font = 'bold 14px "SF Mono", Monaco, monospace';
    ctx.fillStyle = '#22D3EE';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.fillText('WEEKLY SCHEDULE', PADDING + 24, yPos + 18);

    post.weeklySchedule.slice(0, maxRows).forEach((slot, i) => {
      const rowY = yPos + 50 + i * 36;
      ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'left';
      ctx.fillText(DAY_LABELS[slot.day] || slot.day, PADDING + 24, rowY);

      ctx.font = 'bold 18px "SF Mono", Monaco, monospace';
      ctx.fillStyle = '#22D3EE';
      ctx.textAlign = 'right';
      ctx.fillText(`${slot.startTime} – ${slot.endTime}`, PADDING + maxW - 24, rowY);
    });
    ctx.textAlign = 'left';

    yPos += schedH + 20;
  }

  const locText = `${post.areaName}, ${post.district}`;
  ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, sans-serif';
  const locW = ctx.measureText(locText).width + 90;
  ctx.fillStyle = 'rgba(30,58,138,0.5)';
  roundRect(ctx, PADDING, yPos, locW, 54, 27);
  ctx.fill();
  ctx.strokeStyle = 'rgba(96,165,250,0.7)';
  ctx.lineWidth = 2;
  roundRect(ctx, PADDING, yPos, locW, 54, 27);
  ctx.stroke();

  ctx.font = '22px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#60A5FA';
  ctx.textAlign = 'left';
  ctx.fillText('📍', PADDING + 22, yPos + 27);

  ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = '#E0F2FE';
  ctx.fillText(locText, PADDING + 56, yPos + 27);
  yPos += 72;

  ctx.font = '500 13px "SF Mono", Monaco, monospace';
  ctx.fillStyle = '#64748B';
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  ctx.fillText('Exact address unlocks only after accepting a tutor', PADDING, yPos);

  await drawQR(ctx, 1120, shareUrl, 'Scan to view on Porabo');
  drawFooter(ctx);

  return canvas.toDataURL('image/png');
}

export async function downloadTuitionCard(post: TuitionPost): Promise<void> {
  const dataUrl = await generateTuitionCard(post, 'https://porabo.online');
  const slug =
    post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '').slice(0, 40) || 'tuition';
  const filename = `porabo-tuition-${slug}-${Date.now()}.png`;
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ═══════════════════════════════════════════════════════════════════
// 🎨 TEACHER BIO CARD — Elegant magazine layout
// Small circular photo (280px) with premium cinematic background
// ═══════════════════════════════════════════════════════════════════
export async function generateTeacherCard(
  tutor: User,
  shareUrl: string = 'https://porabo.online'
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not available');

  // ─── 1. Background ───
  const bg = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
  bg.addColorStop(0, '#070A12');
  bg.addColorStop(0.5, '#0B1428');
  bg.addColorStop(1, '#050810');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  const g1 = ctx.createRadialGradient(CARD_WIDTH, 0, 0, CARD_WIDTH, 0, 800);
  g1.addColorStop(0, 'rgba(6,182,212,0.28)');
  g1.addColorStop(1, 'rgba(6,182,212,0)');
  ctx.fillStyle = g1;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  const g2 = ctx.createRadialGradient(0, CARD_HEIGHT, 0, 0, CARD_HEIGHT, 700);
  g2.addColorStop(0, 'rgba(16,185,129,0.22)');
  g2.addColorStop(1, 'rgba(16,185,129,0)');
  ctx.fillStyle = g2;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  // Dot grid
  ctx.fillStyle = 'rgba(56,189,248,0.06)';
  for (let x = 0; x < CARD_WIDTH; x += 40) {
    for (let y = 0; y < CARD_HEIGHT; y += 40) {
      ctx.beginPath();
      ctx.arc(x, y, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Top accent line
  const topLine = ctx.createLinearGradient(0, 0, CARD_WIDTH, 0);
  topLine.addColorStop(0, 'rgba(59,130,246,0)');
  topLine.addColorStop(0.5, 'rgba(52,211,153,0.9)');
  topLine.addColorStop(1, 'rgba(59,130,246,0)');
  ctx.fillStyle = topLine;
  ctx.fillRect(0, 0, CARD_WIDTH, 3);

  // ─── 2. Premium corner accents ───
  const cornerSize = 40;
  const cornerPad = 24;
  ctx.strokeStyle = 'rgba(52,211,153,0.5)';
  ctx.lineWidth = 3;
  // Top-left
  ctx.beginPath();
  ctx.moveTo(cornerPad, cornerPad + cornerSize);
  ctx.lineTo(cornerPad, cornerPad);
  ctx.lineTo(cornerPad + cornerSize, cornerPad);
  ctx.stroke();
  // Top-right
  ctx.beginPath();
  ctx.moveTo(CARD_WIDTH - cornerPad - cornerSize, cornerPad);
  ctx.lineTo(CARD_WIDTH - cornerPad, cornerPad);
  ctx.lineTo(CARD_WIDTH - cornerPad, cornerPad + cornerSize);
  ctx.stroke();
  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(cornerPad, CARD_HEIGHT - cornerPad - cornerSize);
  ctx.lineTo(cornerPad, CARD_HEIGHT - cornerPad);
  ctx.lineTo(cornerPad + cornerSize, CARD_HEIGHT - cornerPad);
  ctx.stroke();
  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(CARD_WIDTH - cornerPad - cornerSize, CARD_HEIGHT - cornerPad);
  ctx.lineTo(CARD_WIDTH - cornerPad, CARD_HEIGHT - cornerPad);
  ctx.lineTo(CARD_WIDTH - cornerPad, CARD_HEIGHT - cornerPad - cornerSize);
  ctx.stroke();

  // ─── 3. Header: Logo + Verified Badge ───
  const logoX = PADDING + 24;
  const logoY = 92;
  const logoR = 24;

  const lglow = ctx.createRadialGradient(logoX, logoY, 0, logoX, logoY, 60);
  lglow.addColorStop(0, 'rgba(56,189,248,0.6)');
  lglow.addColorStop(1, 'rgba(56,189,248,0)');
  ctx.fillStyle = lglow;
  ctx.beginPath();
  ctx.arc(logoX, logoY, 60, 0, Math.PI * 2);
  ctx.fill();

  const lbg = ctx.createLinearGradient(logoX - logoR, logoY - logoR, logoX + logoR, logoY + logoR);
  lbg.addColorStop(0, '#1E3A8A');
  lbg.addColorStop(1, '#0369A1');
  ctx.fillStyle = lbg;
  ctx.beginPath();
  ctx.arc(logoX, logoY, logoR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#38BDF8';
  ctx.lineWidth = 2;
  ctx.stroke();

  try {
    const logoImg = await loadImage(LOGO_SRC);
    ctx.save();
    ctx.beginPath();
    ctx.arc(logoX, logoY, logoR - 3, 0, Math.PI * 2);
    ctx.clip();
    const aspect = logoImg.width / logoImg.height;
    const maxDim = logoR * 2 - 8;
    let dw = maxDim;
    let dh = maxDim / aspect;
    if (dh > maxDim) { dh = maxDim; dw = maxDim * aspect; }
    ctx.drawImage(logoImg, logoX - dw / 2, logoY - dh / 2, dw, dh);
    ctx.restore();
  } catch {
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('P', logoX, logoY + 2);
  }

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 32px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('Porabo', PADDING + 66, logoY - 2);

  ctx.fillStyle = '#38BDF8';
  ctx.font = '600 11px "SF Mono", Monaco, monospace';
  ctx.fillText("BANGLADESH'S LARGEST TUITION NETWORK", PADDING + 68, logoY + 18);

  // Verified badge (top-right)
  const badgeText = '✓ VERIFIED';
  ctx.font = 'bold 14px "SF Mono", Monaco, monospace';
  const bTextW = ctx.measureText(badgeText).width;
  const bW = bTextW + 44;
  const bX = CARD_WIDTH - PADDING - bW;

  ctx.fillStyle = 'rgba(16,185,129,0.28)';
  roundRect(ctx, bX, 78, bW, 42, 21);
  ctx.fill();
  ctx.strokeStyle = 'rgba(52,211,153,0.8)';
  ctx.lineWidth = 2;
  roundRect(ctx, bX, 78, bW, 42, 21);
  ctx.stroke();

  ctx.fillStyle = '#6EE7B7';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.fillText(badgeText, bX + bW / 2, 99);

  // ─── 4. Circular Profile Photo (280px) ───
  const photoR = 140;
  const photoCX = CARD_WIDTH / 2;
  const photoCY = 365;

  // Outer glow
  const photoGlow = ctx.createRadialGradient(photoCX, photoCY, 0, photoCX, photoCY, photoR + 60);
  photoGlow.addColorStop(0, 'rgba(52,211,153,0.35)');
  photoGlow.addColorStop(0.6, 'rgba(6,182,212,0.15)');
  photoGlow.addColorStop(1, 'rgba(6,182,212,0)');
  ctx.fillStyle = photoGlow;
  ctx.beginPath();
  ctx.arc(photoCX, photoCY, photoR + 60, 0, Math.PI * 2);
  ctx.fill();

  // Outer orbital ring
  ctx.strokeStyle = 'rgba(56,189,248,0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(photoCX, photoCY, photoR + 28, 0, Math.PI * 2);
  ctx.stroke();

  // Dashed decorative ring
  ctx.strokeStyle = 'rgba(52,211,153,0.5)';
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.arc(photoCX, photoCY, photoR + 16, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Photo background (placeholder)
  const pbg = ctx.createLinearGradient(
    photoCX - photoR, photoCY - photoR,
    photoCX + photoR, photoCY + photoR
  );
  pbg.addColorStop(0, '#065F46');
  pbg.addColorStop(1, '#0E7490');
  ctx.fillStyle = pbg;
  ctx.beginPath();
  ctx.arc(photoCX, photoCY, photoR, 0, Math.PI * 2);
  ctx.fill();

  // Photo border
  ctx.strokeStyle = '#34D399';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(photoCX, photoCY, photoR, 0, Math.PI * 2);
  ctx.stroke();

  // Inner white ring
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(photoCX, photoCY, photoR - 8, 0, Math.PI * 2);
  ctx.stroke();

  // Draw photo or initial
  let photoDrawn = false;
  if (tutor.profilePicture) {
    try {
      const img = await loadImage(tutor.profilePicture, true);
      ctx.save();
      ctx.beginPath();
      ctx.arc(photoCX, photoCY, photoR - 8, 0, Math.PI * 2);
      ctx.clip();
      const scale = Math.max((photoR * 2) / img.width, (photoR * 2) / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      ctx.drawImage(img, photoCX - dw / 2, photoCY - dh / 2, dw, dh);
      ctx.restore();
      photoDrawn = true;
    } catch (err) {
      console.warn('Photo load failed:', err);
    }
  }

  if (!photoDrawn) {
    const initial = tutor.fullName.trim().charAt(0).toUpperCase() || 'P';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 110px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initial, photoCX, photoCY + 10);
  }

  // Small sparkle badge (bottom-right of photo)
  const sparkleX = photoCX + photoR * 0.72;
  const sparkleY = photoCY + photoR * 0.72;
  ctx.fillStyle = '#34D399';
  ctx.beginPath();
  ctx.arc(sparkleX, sparkleY, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('✓', sparkleX, sparkleY + 2);

  // ─── 5. Name ───
  let yPos = 570;
  const maxW = CARD_WIDTH - PADDING * 2;

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 20;

  ctx.font = 'bold 62px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  const nameLines = wrapText(ctx, tutor.fullName, maxW, 2);
  nameLines.forEach((line) => {
    ctx.fillText(line, CARD_WIDTH / 2, yPos);
    yPos += 74;
  });
  ctx.restore();

  // ─── 6. Institution • Department ───
  yPos += 4;
  const instDept = [tutor.institution, tutor.department].filter(Boolean).join('  •  ') || 'Verified Educator';
  ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = '#22D3EE';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  const instDeptLines = wrapText(ctx, instDept, maxW, 1);
  ctx.fillText(instDeptLines[0] || instDept, CARD_WIDTH / 2, yPos);
  yPos += 55;

  // ─── 7. Divider ───
  const divGrad = ctx.createLinearGradient(CARD_WIDTH / 2 - 100, 0, CARD_WIDTH / 2 + 100, 0);
  divGrad.addColorStop(0, 'rgba(56,189,248,0)');
  divGrad.addColorStop(0.5, 'rgba(56,189,248,0.5)');
  divGrad.addColorStop(1, 'rgba(56,189,248,0)');
  ctx.fillStyle = divGrad;
  ctx.fillRect(CARD_WIDTH / 2 - 100, yPos, 200, 2);
  yPos += 26;

  // ─── 8. Qualifications chip ───
  if (tutor.qualifications) {
    const qText = tutor.qualifications;
    ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, sans-serif';
    const qLines = wrapText(ctx, qText, maxW - 130, 1);
    const displayQ = qLines[0] || qText;
    const qTextWidth = ctx.measureText(displayQ).width;
    const qLabelW = Math.min(qTextWidth + 88, maxW);
    const qX = (CARD_WIDTH - qLabelW) / 2;

    ctx.fillStyle = 'rgba(30,58,138,0.4)';
    roundRect(ctx, qX, yPos, qLabelW, 56, 28);
    ctx.fill();
    ctx.strokeStyle = 'rgba(96,165,250,0.6)';
    ctx.lineWidth = 2;
    roundRect(ctx, qX, yPos, qLabelW, 56, 28);
    ctx.stroke();

    ctx.font = '22px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = '#60A5FA';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎓', qX + 22, yPos + 29);

    ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = '#E0F2FE';
    ctx.fillText(displayQ, qX + 58, yPos + 29);
    yPos += 76;
  }

  // ─── 9. Degrees Section ───
  if (tutor.degrees && tutor.degrees.length > 0) {
    // Section header
    ctx.font = 'bold 13px "SF Mono", Monaco, monospace';
    ctx.fillStyle = '#94A3B8';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('ACADEMIC DEGREES', CARD_WIDTH / 2, yPos);
    yPos += 28;

    const degreesShown = tutor.degrees.slice(0, 2);
    degreesShown.forEach((deg) => {
      const boxH = 88;

      // Box background
      ctx.fillStyle = 'rgba(17,24,39,0.9)';
      roundRect(ctx, PADDING, yPos, maxW, boxH, 18);
      ctx.fill();
      ctx.strokeStyle = 'rgba(6,182,212,0.35)';
      ctx.lineWidth = 1.5;
      roundRect(ctx, PADDING, yPos, maxW, boxH, 18);
      ctx.stroke();

      // Left accent bar
      ctx.fillStyle = '#22D3EE';
      roundRect(ctx, PADDING, yPos + 12, 4, boxH - 24, 2);
      ctx.fill();

      // Degree name
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillStyle = '#FFFFFF';
      const degNameLines = wrapText(ctx, deg.degreeName, maxW - 260, 1);
      ctx.fillText(degNameLines[0] || deg.degreeName, PADDING + 26, yPos + 18);

      // Institution
      ctx.font = '600 14px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillStyle = '#94A3B8';
      const instLines = wrapText(ctx, deg.institution, maxW - 260, 1);
      ctx.fillText(instLines[0] || deg.institution, PADDING + 26, yPos + 50);

      // Year • Result (right aligned)
      const yearResult = [deg.passingYear, deg.result].filter(Boolean).join(' • ');
      ctx.font = 'bold 14px "SF Mono", Monaco, monospace';
      ctx.fillStyle = '#34D399';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(yearResult, CARD_WIDTH - PADDING - 22, yPos + boxH / 2);

      yPos += boxH + 14;
    });
  }

  // ─── 10. QR Code + Marketing (bottom) ───
  const qrSize = 150;
  const qrX = PADDING;
  const qrY = CARD_HEIGHT - qrSize - 100;

  // QR white card
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 24;
  ctx.fillStyle = '#FFFFFF';
  roundRect(ctx, qrX, qrY, qrSize, qrSize, 16);
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = 'rgba(56,189,248,0.5)';
  ctx.lineWidth = 2;
  roundRect(ctx, qrX, qrY, qrSize, qrSize, 16);
  ctx.stroke();

  try {
    const qrUrl = await QRCode.toDataURL(shareUrl, {
      width: 500,
      margin: 1,
      color: { dark: '#0B0F19', light: '#FFFFFF' },
      errorCorrectionLevel: 'M',
    });
    const qrImg = await loadImage(qrUrl, true);
    const inner = 12;
    ctx.drawImage(qrImg, qrX + inner, qrY + inner, qrSize - inner * 2, qrSize - inner * 2);
  } catch (e) {
    console.warn('QR gen failed:', e);
  }

  // QR caption
  ctx.font = 'bold 12px "SF Mono", Monaco, monospace';
  ctx.fillStyle = '#94A3B8';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('Scan to connect', qrX, qrY + qrSize + 12);

  // Right side: porabo.online marketing
  const taglineX = qrX + qrSize + 28;
  const taglineY = qrY + 14;

  ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('porabo.online', taglineX, taglineY);

  ctx.font = '600 13px "SF Mono", Monaco, monospace';
  ctx.fillStyle = '#38BDF8';
  ctx.fillText('No Commission', taglineX, taglineY + 36);
  ctx.fillText('No Ads Fee', taglineX, taglineY + 58);
  ctx.fillText('100% Verified', taglineX, taglineY + 80);

  // ─── 11. Footer bar ───
  const fY = CARD_HEIGHT - 56;
  const fGrad = ctx.createLinearGradient(0, fY, CARD_WIDTH, fY);
  fGrad.addColorStop(0, 'rgba(59,130,246,0.05)');
  fGrad.addColorStop(0.5, 'rgba(59,130,246,0.22)');
  fGrad.addColorStop(1, 'rgba(59,130,246,0.05)');
  ctx.fillStyle = fGrad;
  ctx.fillRect(0, fY, CARD_WIDTH, 56);

  const fBorder = ctx.createLinearGradient(0, fY, CARD_WIDTH, fY);
  fBorder.addColorStop(0, 'rgba(56,189,248,0)');
  fBorder.addColorStop(0.5, 'rgba(56,189,248,0.6)');
  fBorder.addColorStop(1, 'rgba(56,189,248,0)');
  ctx.fillStyle = fBorder;
  ctx.fillRect(0, fY, CARD_WIDTH, 2);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('Verified Educator Profile  •  porabo.online', CARD_WIDTH / 2, fY + 28);

  return canvas.toDataURL('image/png');
}

export async function downloadTeacherCard(tutor: User): Promise<void> {
  const dataUrl = await generateTeacherCard(tutor, 'https://porabo.online');
  const slug =
    tutor.fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '').slice(0, 40) || 'teacher';
  const filename = `porabo-teacher-${slug}-${Date.now()}.png`;
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}