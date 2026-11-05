import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import QRCode from 'qrcode';
import {
  X,
  Copy,
  Check,
  Share2,
  QrCode as QrIcon,
  MapPin,
  Loader2,
  Sparkles
} from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  district?: string;
  areaName?: string;
  shareUrl: string;
  type: 'post' | 'tutor';
}

const CARD_WIDTH = 720;
const CARD_HEIGHT = 1000;
const PADDING = 60;
const LOGO_SRC = '/assets/porabo_logo_transparent_90065b0b.svg';

// Helper: load an image into an HTMLImageElement
const loadImage = (src: string, crossOrigin?: boolean): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (crossOrigin) img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
};

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  district,
  areaName,
  shareUrl,
  type
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [generating, setGenerating] = useState<boolean>(true);
  const [downloading, setDownloading] = useState<boolean>(false);
  const qrCacheRef = useRef<{ [key: string]: string }>({});

  // Generate QR immediately on open with cache for instant re-open
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    // Cache hit → instant display (no flicker on re-open)
    if (qrCacheRef.current[shareUrl]) {
      setQrDataUrl(qrCacheRef.current[shareUrl]);
      setGenerating(false);
      return;
    }

    setGenerating(true);
    setQrDataUrl('');

    QRCode.toDataURL(shareUrl, {
      width: 400,
      margin: 2,
      color: { dark: '#030712', light: '#ffffff' },
      errorCorrectionLevel: 'M'
    })
      .then(url => {
        if (isMounted) {
          qrCacheRef.current[shareUrl] = url;
          setQrDataUrl(url);
          setGenerating(false);
        }
      })
      .catch(err => {
        console.error('QR generation error:', err);
        if (isMounted) setGenerating(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, shareUrl]);

  // Lock body scroll + escape to close
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  // Reset copy state on close
  useEffect(() => {
    if (!isOpen) setCopied(false);
  }, [isOpen]);

  // ========================================================
  // Beautiful Canvas Card Generator
  // ========================================================
  const generateCardImage = async (qrUrl: string): Promise<string> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');
    canvas.width = CARD_WIDTH;
    canvas.height = CARD_HEIGHT;

    // ----- 1. Background gradient -----
    const bgGrad = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
    bgGrad.addColorStop(0, '#0A0F19');
    bgGrad.addColorStop(0.5, '#111827');
    bgGrad.addColorStop(1, '#0A1628');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

    // ----- 2. Radial glows -----
    const glow1 = ctx.createRadialGradient(CARD_WIDTH, 0, 0, CARD_WIDTH, 0, 600);
    glow1.addColorStop(0, 'rgba(59,130,246,0.35)');
    glow1.addColorStop(1, 'rgba(59,130,246,0)');
    ctx.fillStyle = glow1;
    ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

    const glow2 = ctx.createRadialGradient(0, CARD_HEIGHT, 0, 0, CARD_HEIGHT, 500);
    glow2.addColorStop(0, 'rgba(6,182,212,0.2)');
    glow2.addColorStop(1, 'rgba(6,182,212,0)');
    ctx.fillStyle = glow2;
    ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

    // ----- 3. Dot grid pattern -----
    ctx.fillStyle = 'rgba(59,130,246,0.07)';
    for (let x = 0; x < CARD_WIDTH; x += 28) {
      for (let y = 0; y < CARD_HEIGHT; y += 28) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // ----- 4. Top accent line -----
    const topLineGrad = ctx.createLinearGradient(0, 0, CARD_WIDTH, 0);
    topLineGrad.addColorStop(0, 'rgba(59,130,246,0)');
    topLineGrad.addColorStop(0.5, 'rgba(56,189,248,0.9)');
    topLineGrad.addColorStop(1, 'rgba(59,130,246,0)');
    ctx.fillStyle = topLineGrad;
    ctx.fillRect(0, 0, CARD_WIDTH, 3);

    // ----- 5. Logo circle + glow -----
    const logoX = PADDING + 30;
    const logoY = 80;
    const logoR = 28;

    // Outer glow
    const logoGlow = ctx.createRadialGradient(logoX, logoY, 0, logoX, logoY, 60);
    logoGlow.addColorStop(0, 'rgba(56,189,248,0.5)');
    logoGlow.addColorStop(1, 'rgba(56,189,248,0)');
    ctx.fillStyle = logoGlow;
    ctx.beginPath();
    ctx.arc(logoX, logoY, 60, 0, Math.PI * 2);
    ctx.fill();

    // Circular background badge
    const logoBg = ctx.createLinearGradient(
      logoX - logoR,
      logoY - logoR,
      logoX + logoR,
      logoY + logoR
    );
    logoBg.addColorStop(0, '#1E3A8A');
    logoBg.addColorStop(1, '#0369A1');
    ctx.fillStyle = logoBg;
    ctx.beginPath();
    ctx.arc(logoX, logoY, logoR, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 2;
    ctx.stroke();

    // ----- 5a. Draw actual Porabo logo inside the circle -----
    let logoImg: HTMLImageElement | null = null;
    try {
      logoImg = await loadImage(LOGO_SRC);
    } catch (err) {
      console.warn('[Porabo QR Card] Logo load failed, using fallback "P":', err);
    }

    if (logoImg && logoImg.width > 0 && logoImg.height > 0) {
      // Fit the logo inside the circle while preserving aspect ratio
      const innerPad = 6;
      const maxW = (logoR * 2) - innerPad * 2;
      const maxH = (logoR * 2) - innerPad * 2;
      const aspect = logoImg.width / logoImg.height;

      let drawW: number;
      let drawH: number;
      if (aspect > 1) {
        drawW = maxW;
        drawH = maxW / aspect;
      } else {
        drawH = maxH;
        drawW = maxH * aspect;
      }

      ctx.save();
      // Circular clip so nothing leaks outside the badge
      ctx.beginPath();
      ctx.arc(logoX, logoY, logoR - 2, 0, Math.PI * 2);
      ctx.clip();

      ctx.drawImage(
        logoImg,
        logoX - drawW / 2,
        logoY - drawH / 2,
        drawW,
        drawH
      );
      ctx.restore();
    } else {
      // Fallback: draw "P" letter
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 34px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('P', logoX, logoY + 2);
    }

    // ----- 6. Brand text -----
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 32px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('Porabo', PADDING + 76, logoY - 2);

    ctx.fillStyle = '#38BDF8';
    ctx.font = '600 12px "SF Mono", "Monaco", "Courier New", monospace';
    ctx.fillText('HYPER-LOCAL TUITION NETWORK', PADDING + 78, logoY + 20);

    // ----- 7. Type badge -----
    const badgeY = 165;
    const badgeText =
      type === 'tutor' ? 'VERIFIED TEACHER PROFILE' : 'TUITION OPPORTUNITY';
    ctx.font = 'bold 14px "SF Mono", "Monaco", "Courier New", monospace';
    const badgeWidth = ctx.measureText(badgeText).width + 40;

    const badgeGrad = ctx.createLinearGradient(PADDING, badgeY, PADDING + badgeWidth, badgeY);
    badgeGrad.addColorStop(0, 'rgba(6,182,212,0.3)');
    badgeGrad.addColorStop(1, 'rgba(59,130,246,0.15)');
    ctx.fillStyle = badgeGrad;
    ctx.beginPath();
    if (typeof (ctx as any).roundRect === 'function') {
      (ctx as any).roundRect(PADDING, badgeY, badgeWidth, 34, 17);
    } else {
      ctx.rect(PADDING, badgeY, badgeWidth, 34);
    }
    ctx.fill();

    ctx.strokeStyle = 'rgba(56,189,248,0.6)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#67E8F9';
    ctx.textBaseline = 'middle';
    ctx.fillText(badgeText, PADDING + 20, badgeY + 17);

    // ----- 8. Title (word-wrapped) -----
    const maxTitleWidth = CARD_WIDTH - PADDING * 2;
    ctx.font = 'bold 40px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.textBaseline = 'top';
    const titleLines = wrapText(ctx, title, maxTitleWidth, 2);
    let currentY = badgeY + 70;

    titleLines.forEach(line => {
      ctx.fillText(line, PADDING, currentY);
      currentY += 52;
    });

    // ----- 9. Subtitle -----
    ctx.font = '18px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillStyle = '#94A3B8';
    const subtitleLines = wrapText(ctx, subtitle, maxTitleWidth, 2);
    subtitleLines.forEach(line => {
      ctx.fillText(line, PADDING, currentY);
      currentY += 26;
    });

    // ----- 10. Location pill -----
    if (areaName || district) {
      currentY += 10;
      const locationText = areaName ? `${areaName}, ${district}` : district || '';
      ctx.font = '600 15px "SF Mono", "Monaco", "Courier New", monospace';
      const locText = `${locationText}`;
      const locWidth = ctx.measureText(locText).width + 55;

      ctx.fillStyle = 'rgba(59,130,246,0.18)';
      ctx.beginPath();
      if (typeof (ctx as any).roundRect === 'function') {
        (ctx as any).roundRect(PADDING, currentY, locWidth, 32, 16);
      } else {
        ctx.rect(PADDING, currentY, locWidth, 32);
      }
      ctx.fill();

      ctx.strokeStyle = 'rgba(59,130,246,0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Pin emoji
      ctx.fillStyle = '#60A5FA';
      ctx.textBaseline = 'middle';
      ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.fillText('📍', PADDING + 14, currentY + 16);

      ctx.font = '600 15px "SF Mono", "Monaco", "Courier New", monospace';
      ctx.fillText(locText, PADDING + 38, currentY + 16);
      currentY += 48;
    }

    // ----- 11. QR white card -----
    const qrCardSize = 380;
    const qrCardX = (CARD_WIDTH - qrCardSize) / 2;
    const qrCardY = Math.max(currentY + 20, 470);

    // Card shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 15;

    const cardGrad = ctx.createLinearGradient(
      qrCardX,
      qrCardY,
      qrCardX + qrCardSize,
      qrCardY + qrCardSize
    );
    cardGrad.addColorStop(0, '#FFFFFF');
    cardGrad.addColorStop(1, '#F1F5F9');
    ctx.fillStyle = cardGrad;
    ctx.beginPath();
    if (typeof (ctx as any).roundRect === 'function') {
      (ctx as any).roundRect(qrCardX, qrCardY, qrCardSize, qrCardSize, 28);
    } else {
      ctx.rect(qrCardX, qrCardY, qrCardSize, qrCardSize);
    }
    ctx.fill();
    ctx.restore();

    // Blue accent border inside white card
    ctx.strokeStyle = 'rgba(59,130,246,0.4)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    if (typeof (ctx as any).roundRect === 'function') {
      (ctx as any).roundRect(qrCardX + 6, qrCardY + 6, qrCardSize - 12, qrCardSize - 12, 24);
    } else {
      ctx.rect(qrCardX + 6, qrCardY + 6, qrCardSize - 12, qrCardSize - 12);
    }
    ctx.stroke();

    // Draw QR image
    const qrImg = await loadImage(qrUrl, true);
    const qrInner = 24;
    ctx.drawImage(
      qrImg,
      qrCardX + qrInner,
      qrCardY + qrInner,
      qrCardSize - qrInner * 2,
      qrCardSize - qrInner * 2
    );

    // ----- 12. Scan instruction (PORABO.APP line removed) -----
    const scanY = qrCardY + qrCardSize + 50;
    ctx.fillStyle = '#38BDF8';
    ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Scan to view on Porabo', CARD_WIDTH / 2, scanY);

    // ----- 13. Footer bar -----
    const footerY = CARD_HEIGHT - 80;
    const footerGrad = ctx.createLinearGradient(0, footerY, CARD_WIDTH, footerY);
    footerGrad.addColorStop(0, 'rgba(59,130,246,0.05)');
    footerGrad.addColorStop(0.5, 'rgba(59,130,246,0.18)');
    footerGrad.addColorStop(1, 'rgba(59,130,246,0.05)');
    ctx.fillStyle = footerGrad;
    ctx.fillRect(0, footerY, CARD_WIDTH, 80);

    const footerBorder = ctx.createLinearGradient(0, footerY, CARD_WIDTH, footerY);
    footerBorder.addColorStop(0, 'rgba(56,189,248,0)');
    footerBorder.addColorStop(0.5, 'rgba(56,189,248,0.6)');
    footerBorder.addColorStop(1, 'rgba(56,189,248,0)');
    ctx.fillStyle = footerBorder;
    ctx.fillRect(0, footerY, CARD_WIDTH, 1);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      '© 2026 Porabo — Verified Academic Network',
      CARD_WIDTH / 2,
      footerY + 40
    );

    return canvas.toDataURL('image/png');
  };

  // ----- Download handler -----
  const handleDownload = async () => {
    if (!qrDataUrl || downloading) return;
    setDownloading(true);
    try {
      const cardUrl = await generateCardImage(qrDataUrl);
      const a = document.createElement('a');
      a.href = cardUrl;
      const slug = (title || 'porabo').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
      a.download = `porabo-${type}-${slug}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Card generation error, falling back to plain QR:', err);
      const a = document.createElement('a');
      a.href = qrDataUrl;
      a.download = `porabo-${type}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      /* noop */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDeviceShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Check out this ${type === 'tutor' ? 'tutor profile' : 'tuition opportunity'} on Porabo (${areaName || ''}, ${district || 'Bangladesh'}):`,
          url: shareUrl
        });
      } catch {
        /* user canceled */
      }
    } else {
      handleCopyLink();
    }
  };

  if (!isOpen) return null;

  // Portal prevents parent's backdrop-filter/transform from breaking fixed positioning
  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-sm bg-[#111827] border border-blue-900/60 rounded-3xl p-6 shadow-2xl relative space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1.5 pt-1">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 mx-auto flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <QrIcon className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-lg text-white">
            {type === 'tutor' ? 'Share Tutor Profile' : 'Share Tuition Opportunity'}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-1">{title}</p>
          {(areaName || district) && (
            <div className="inline-flex items-center gap-1 text-[11px] font-mono text-cyan-400 bg-cyan-950/70 border border-cyan-800/60 px-2.5 py-0.5 rounded-full">
              <MapPin className="w-3 h-3" />
              <span>{areaName ? `${areaName}, ${district}` : district}</span>
            </div>
          )}
        </div>

        {/* QR Preview (instant on cache, loading first time) */}
        <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center shadow-inner border-4 border-slate-200 min-h-[240px]">
          {generating ? (
            <div className="w-56 h-56 flex flex-col items-center justify-center text-slate-500 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              <span className="text-xs font-mono">Generating QR...</span>
            </div>
          ) : qrDataUrl ? (
            <div className="space-y-2 text-center">
              <img
                src={qrDataUrl}
                alt="Porabo QR Code"
                className="w-56 h-56 object-contain mx-auto rounded-lg"
              />
              <p className="text-[10px] text-slate-600 font-mono">
                Scan with any mobile camera
              </p>
            </div>
          ) : (
            <div className="w-56 h-56 flex items-center justify-center text-rose-500 text-xs">
              Unable to generate QR code.
            </div>
          )}
        </div>

        {/* Primary actions: Copy + Download beautiful card */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={handleCopyLink}
            className="py-2.5 px-3 rounded-xl bg-[#0B0F19] hover:bg-slate-800 border border-blue-950 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-blue-400" />
                <span>Copy Link</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={!qrDataUrl || downloading}
            className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/30 transition-all disabled:opacity-50"
          >
            {downloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Card...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Save Card</span>
              </>
            )}
          </button>
        </div>

        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button
            type="button"
            onClick={handleDeviceShare}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-xs font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20 transition-all"
          >
            <Share2 className="w-4 h-4" />
            <span>Share via WhatsApp / Social</span>
          </button>
        )}
      </div>
    </div>,
    document.body
  );
};

// ========================================================
// Helper: word-wrap a text string to a max width (limit lines)
// ========================================================
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);

  if (lines.length > maxLines) {
    const truncated = lines.slice(0, maxLines);
    let last = truncated[maxLines - 1];
    while (
      ctx.measureText(`${last}...`).width > maxWidth &&
      last.length > 0
    ) {
      last = last.slice(0, -1);
    }
    truncated[maxLines - 1] = `${last}...`;
    return truncated;
  }

  return lines;
}