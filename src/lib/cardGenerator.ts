import QRCode from 'qrcode';
import { TuitionPost } from './types';

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
  SAT: 'Saturday',
  SUN: 'Sunday',
  MON: 'Monday',
  TUE: 'Tuesday',
  WED: 'Wednesday',
  THU: 'Thursday',
  FRI: 'Friday',
};

export async function generateTuitionCard(
  post: TuitionPost,
  shareUrl: string = 'https://porabo.online'
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not available');

  // ─── 1. Background gradient ───
  const bg = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
  bg.addColorStop(0, '#0A0F19');
  bg.addColorStop(0.5, '#0B1428');
  bg.addColorStop(1, '#070A12');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  // ─── 2. Radial glows ───
  const g1 = ctx.createRadialGradient(CARD_WIDTH, 0, 0, CARD_WIDTH, 0, 720);
  g1.addColorStop(0, 'rgba(59,130,246,0.35)');
  g1.addColorStop(1, 'rgba(59,130,246,0)');
  ctx.fillStyle = g1;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  const g2 = ctx.createRadialGradient(0, CARD_HEIGHT, 0, 0, CARD_HEIGHT, 600);
  g2.addColorStop(0, 'rgba(16,185,129,0.22)');
  g2.addColorStop(1, 'rgba(16,185,129,0)');
  ctx.fillStyle = g2;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  // ─── 3. Dot grid pattern ───
  ctx.fillStyle = 'rgba(59,130,246,0.07)';
  for (let x = 0; x < CARD_WIDTH; x += 32) {
    for (let y = 0; y < CARD_HEIGHT; y += 32) {
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ─── 4. Top accent line ───
  const topLine = ctx.createLinearGradient(0, 0, CARD_WIDTH, 0);
  topLine.addColorStop(0, 'rgba(59,130,246,0)');
  topLine.addColorStop(0.5, 'rgba(56,189,248,0.9)');
  topLine.addColorStop(1, 'rgba(59,130,246,0)');
  ctx.fillStyle = topLine;
  ctx.fillRect(0, 0, CARD_WIDTH, 3);

  // ─── 5. Header: Logo + Brand ───
  const logoX = PADDING + 28;
  const logoY = 80;
  const logoR = 26;

  const lglow = ctx.createRadialGradient(logoX, logoY, 0, logoX, logoY, 60);
  lglow.addColorStop(0, 'rgba(56,189,248,0.6)');
  lglow.addColorStop(1, 'rgba(56,189,248,0)');
  ctx.fillStyle = lglow;
  ctx.beginPath();
  ctx.arc(logoX, logoY, 60, 0, Math.PI * 2);
  ctx.fill();

  const lbg = ctx.createLinearGradient(
    logoX - logoR,
    logoY - logoR,
    logoX + logoR,
    logoY + logoR
  );
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
    if (dh > maxDim) {
      dh = maxDim;
      dw = maxDim * aspect;
    }
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

  // ─── 6. Badge ───
  let yPos = 165;
  const badgeText = 'TUITION OPPORTUNITY';
  ctx.font = 'bold 15px "SF Mono", Monaco, monospace';
  const bTextW = ctx.measureText(badgeText).width;
  const bW = bTextW + 50;

  const bGrad = ctx.createLinearGradient(PADDING, yPos, PADDING + bW, yPos);
  bGrad.addColorStop(0, 'rgba(6,182,212,0.3)');
  bGrad.addColorStop(1, 'rgba(59,130,246,0.15)');
  ctx.fillStyle = bGrad;
  roundRect(ctx, PADDING, yPos, bW, 42, 21);
  ctx.fill();
  ctx.strokeStyle = 'rgba(56,189,248,0.7)';
  ctx.lineWidth = 2;
  roundRect(ctx, PADDING, yPos, bW, 42, 21);
  ctx.stroke();

  ctx.fillStyle = '#67E8F9';
  ctx.textBaseline = 'middle';
  ctx.fillText(badgeText, PADDING + 25, yPos + 22);

  // ─── 7. Title ───
  yPos = 240;
  const maxW = CARD_WIDTH - PADDING * 2;
  ctx.font = 'bold 50px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.textBaseline = 'top';
  const titleLines = wrapText(ctx, post.title, maxW, 2);
  titleLines.forEach((line) => {
    ctx.fillText(line, PADDING, yPos);
    yPos += 60;
  });

  // ─── 8. Subject • Grade line ───
  yPos += 5;
  ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = '#22D3EE';
  ctx.textBaseline = 'top';
  ctx.fillText(`${post.subject}  •  ${post.gradeLevel}`, PADDING, yPos);
  yPos += 45;

  // ─── 9. Info Grid (2x2) ───
  yPos += 10;
  const gap = 14;
  const cellW = (maxW - gap) / 2;
  const cellH = 130;

  const drawCell = (
    x: number,
    y: number,
    label: string,
    value: string,
    valueColor: string,
    borderColor: string,
    wrapValue = false
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

  drawCell(
    PADDING,
    yPos,
    'MONTHLY BUDGET',
    `৳ ${post.salaryBudget.toLocaleString()}`,
    '#34D399',
    'rgba(16,185,129,0.4)'
  );

  const modeText =
    post.tuitionMode === 'ONLINE'
      ? '🌐 Online'
      : post.tuitionMode === 'OFFLINE'
        ? '🏠 Offline'
        : post.tuitionMode === 'BOTH'
          ? '🔄 Both'
          : 'Flexible';
  const modeColor =
    post.tuitionMode === 'ONLINE'
      ? '#22D3EE'
      : post.tuitionMode === 'OFFLINE'
        ? '#34D399'
        : '#A78BFA';
  drawCell(
    PADDING + cellW + gap,
    yPos,
    'TUITION MODE',
    modeText,
    modeColor,
    'rgba(59,130,246,0.4)'
  );

  yPos += cellH + gap;

  drawCell(
    PADDING,
    yPos,
    'DAYS PER WEEK',
    `${post.daysPerWeek} days`,
    '#FFFFFF',
    'rgba(59,130,246,0.4)'
  );
  drawCell(
    PADDING + cellW + gap,
    yPos,
    'CURRICULUM',
    post.curriculum,
    '#FFFFFF',
    'rgba(59,130,246,0.4)',
    true
  );

  yPos += cellH + 20;

  // ─── 10. Weekly Schedule ───
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

  // ─── 11. Location pill (area only) ───
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

  // ─── 12. Privacy note ───
  ctx.font = '500 13px "SF Mono", Monaco, monospace';
  ctx.fillStyle = '#64748B';
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  ctx.fillText('Exact address unlocks only after accepting a tutor', PADDING, yPos);

  // ─── 13. QR Card (fixed bottom position) ───
  const qrSize = 200;
  const qrX = (CARD_WIDTH - qrSize) / 2;
  const qrY = 1080;

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

  // ─── 14. QR caption ───
  ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = '#38BDF8';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Scan to view on Porabo', CARD_WIDTH / 2, qrY + qrSize + 28);

  // ─── 15. Footer ───
  const fY = CARD_HEIGHT - 110;
  const fGrad = ctx.createLinearGradient(0, fY, CARD_WIDTH, fY);
  fGrad.addColorStop(0, 'rgba(59,130,246,0.05)');
  fGrad.addColorStop(0.5, 'rgba(59,130,246,0.22)');
  fGrad.addColorStop(1, 'rgba(59,130,246,0.05)');
  ctx.fillStyle = fGrad;
  ctx.fillRect(0, fY, CARD_WIDTH, 110);

  const fBorder = ctx.createLinearGradient(0, fY, CARD_WIDTH, fY);
  fBorder.addColorStop(0, 'rgba(56,189,248,0)');
  fBorder.addColorStop(0.5, 'rgba(56,189,248,0.6)');
  fBorder.addColorStop(1, 'rgba(56,189,248,0)');
  ctx.fillStyle = fBorder;
  ctx.fillRect(0, fY, CARD_WIDTH, 2);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 30px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('porabo.online', CARD_WIDTH / 2, fY + 40);

  ctx.font = '600 14px "SF Mono", Monaco, monospace';
  ctx.fillStyle = '#38BDF8';
  ctx.fillText('No Commission  •  No Ads Fee  •  100% Verified', CARD_WIDTH / 2, fY + 78);

  return canvas.toDataURL('image/png');
}

export async function downloadTuitionCard(post: TuitionPost): Promise<void> {
  const dataUrl = await generateTuitionCard(post, 'https://porabo.online');
  const slug =
    post.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+$/, '')
      .slice(0, 40) || 'tuition';
  const filename = `porabo-tuition-${slug}-${Date.now()}.png`;
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}