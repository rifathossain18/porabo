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

// ═══════════════════════════════════════════════════════════════════
// SHARED: Background + Header (reusable for both cards)
// ═══════════════════════════════════════════════════════════════════
async function drawPremiumBackground(
  ctx: CanvasRenderingContext2D,
  topAccentColor: string = 'rgba(56,189,248,0.9)'
) {
  // Gradient
  const bg = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
  bg.addColorStop(0, '#0A0F19');
  bg.addColorStop(0.5, '#0B1428');
  bg.addColorStop(1, '#070A12');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  // Glows
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

  // Dot grid
  ctx.fillStyle = 'rgba(59,130,246,0.07)';
  for (let x = 0; x < CARD_WIDTH; x += 32) {
    for (let y = 0; y < CARD_HEIGHT; y += 32) {
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Top accent line
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

function drawInitialCircle(
  ctx: CanvasRenderingContext2D,
  name: string,
  cx: number,
  cy: number,
  r: number
) {
  const initial = name.trim().charAt(0).toUpperCase() || 'P';
  ctx.save();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${Math.round(r * 0.7)}px -apple-system, BlinkMacSystemFont, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initial, cx, cy + 4);
  ctx.restore();
}

// ═══════════════════════════════════════════════════════════════════
// TUITION CARD (existing feature)
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

  // Title
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

  // Subject • Grade
  yPos += 5;
  ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = '#22D3EE';
  ctx.textBaseline = 'top';
  ctx.fillText(`${post.subject}  •  ${post.gradeLevel}`, PADDING, yPos);
  yPos += 45;

  // Info grid 2x2
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

  // Weekly schedule
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

  // Location pill
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
// 🆕 TEACHER BIO CARD — premium profile marketing card
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

  await drawPremiumBackground(ctx, 'rgba(52,211,153,0.9)');
  await drawHeader(ctx);

  drawBadge(ctx, 165, 'VERIFIED EDUCATOR', 'emerald');

  // ─── Large Profile Picture ───
  const photoR = 130;
  const photoCX = CARD_WIDTH / 2;
  const photoCY = 370;

  // Photo glow
  const pglow = ctx.createRadialGradient(photoCX, photoCY, 0, photoCX, photoCY, photoR + 45);
  pglow.addColorStop(0, 'rgba(52,211,153,0.4)');
  pglow.addColorStop(1, 'rgba(52,211,153,0)');
  ctx.fillStyle = pglow;
  ctx.beginPath();
  ctx.arc(photoCX, photoCY, photoR + 45, 0, Math.PI * 2);
  ctx.fill();

  // Photo background
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

  // Border
  ctx.strokeStyle = '#34D399';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Inner circle border
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(photoCX, photoCY, photoR - 6, 0, Math.PI * 2);
  ctx.stroke();

  // Draw photo or initial
  if (tutor.profilePicture) {
    try {
      const img = await loadImage(tutor.profilePicture, true);
      ctx.save();
      ctx.beginPath();
      ctx.arc(photoCX, photoCY, photoR - 7, 0, Math.PI * 2);
      ctx.clip();
      const scale = Math.max((photoR * 2) / img.width, (photoR * 2) / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      ctx.drawImage(img, photoCX - dw / 2, photoCY - dh / 2, dw, dh);
      ctx.restore();
    } catch {
      drawInitialCircle(ctx, tutor.fullName, photoCX, photoCY, photoR);
    }
  } else {
    drawInitialCircle(ctx, tutor.fullName, photoCX, photoCY, photoR);
  }

  // ─── Name ───
  let yPos = 545;
  const maxW = CARD_WIDTH - PADDING * 2;

  ctx.font = 'bold 54px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  const nameLines = wrapText(ctx, tutor.fullName, maxW, 2);
  nameLines.forEach((line) => {
    ctx.fillText(line, CARD_WIDTH / 2, yPos);
    yPos += 65;
  });

  // ─── Institution • Department ───
  yPos += 8;
  const instDept = [tutor.institution, tutor.department].filter(Boolean).join('  •  ') || 'Verified Educator';
  ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = '#22D3EE';
  ctx.textAlign = 'center';
  const instDeptLines = wrapText(ctx, instDept, maxW, 1);
  ctx.fillText(instDeptLines[0] || instDept, CARD_WIDTH / 2, yPos);
  yPos += 55;

  // ─── Qualifications ───
  if (tutor.qualifications) {
    const qH = 92;
    ctx.fillStyle = 'rgba(17,24,39,0.9)';
    roundRect(ctx, PADDING, yPos, maxW, qH, 20);
    ctx.fill();
    ctx.strokeStyle = 'rgba(59,130,246,0.4)';
    ctx.lineWidth = 2;
    roundRect(ctx, PADDING, yPos, maxW, qH, 20);
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.font = '600 13px "SF Mono", Monaco, monospace';
    ctx.fillStyle = '#94A3B8';
    ctx.textBaseline = 'top';
    ctx.fillText('QUALIFICATIONS', PADDING + 24, yPos + 16);

    ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    const qMaxW = maxW - 48;
    const qLines = wrapText(ctx, tutor.qualifications, qMaxW, 2);
    qLines.forEach((line, i) => {
      ctx.fillText(line, PADDING + 24, yPos + 44 + i * 28);
    });
    yPos += qH + 20;
  }

  // ─── Degrees ───
  if (tutor.degrees && tutor.degrees.length > 0) {
    const degreesShown = tutor.degrees.slice(0, 2);
    const degreeBoxH = 62 + degreesShown.length * 105 + 12;

    ctx.fillStyle = 'rgba(17,24,39,0.9)';
    roundRect(ctx, PADDING, yPos, maxW, degreeBoxH, 20);
    ctx.fill();
    ctx.strokeStyle = 'rgba(6,182,212,0.4)';
    ctx.lineWidth = 2;
    roundRect(ctx, PADDING, yPos, maxW, degreeBoxH, 20);
    ctx.stroke();

    ctx.font = 'bold 14px "SF Mono", Monaco, monospace';
    ctx.fillStyle = '#22D3EE';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.fillText('ACADEMIC DEGREES', PADDING + 24, yPos + 18);

    degreesShown.forEach((deg, i) => {
      const dy = yPos + 58 + i * 105;

      // Degree name (left)
      ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'left';
      const degMaxW = maxW - 48;
      const degNameLines = wrapText(ctx, deg.degreeName, degMaxW, 1);
      ctx.fillText(degNameLines[0] || deg.degreeName, PADDING + 24, dy);

      // Institution (left, blue)
      ctx.font = '600 15px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillStyle = '#60A5FA';
      const instMaxW = degMaxW - 130;
      const instLines = wrapText(ctx, deg.institution, instMaxW, 1);
      ctx.fillText(instLines[0] || deg.institution, PADDING + 24, dy + 32);

      // Year • Result (right)
      const yearResult = [deg.passingYear, deg.result].filter(Boolean).join(' • ');
      ctx.font = 'bold 15px "SF Mono", Monaco, monospace';
      ctx.fillStyle = '#34D399';
      ctx.textAlign = 'right';
      ctx.fillText(yearResult, CARD_WIDTH - PADDING - 24, dy + 8);
      ctx.textAlign = 'left';

      // Divider between degrees
      if (i < degreesShown.length - 1) {
        ctx.strokeStyle = 'rgba(59,130,246,0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(PADDING + 24, dy + 78);
        ctx.lineTo(CARD_WIDTH - PADDING - 24, dy + 78);
        ctx.stroke();
      }
    });

    yPos += degreeBoxH + 20;
  }

  // ─── QR Code ───
  await drawQR(ctx, 1120, shareUrl, 'Scan to view full profile');

  // ─── Footer ───
  drawFooter(ctx);

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