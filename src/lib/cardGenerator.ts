import QRCode from "qrcode";
import type { TuitionPost, User } from "./types";

const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1440;
const PAGE_MARGIN = 48;
const CONTENT_MARGIN = 92;
const CONTENT_WIDTH = CARD_WIDTH - CONTENT_MARGIN * 2;
const LOGO_SRC = "/assets/porabo_logo.webp";

const COLORS = {
  background: "#F1F5F9",
  warmBackground: "#F5F3EE",
  surface: "#FFFFFF",
  text: "#0F172A",
  secondary: "#475569",
  muted: "#64748B",
  border: "#E2E8F0",
  blue: "#2563EB",
  blueDark: "#1D4ED8",
  blueLight: "#EFF6FF",
  green: "#059669",
  greenLight: "#ECFDF5",
  amber: "#B45309",
  amberLight: "#FFFBEB",
  rose: "#BE123C",
  roseLight: "#FFF1F2",
};

interface CardTheme {
  background: string;
  surface: string;
  border: string;
  primary: string;
  dark: string;
  pale: string;
  contrast: string;
}

const TUITION_THEME: CardTheme = {
  background: COLORS.background,
  surface: COLORS.surface,
  border: COLORS.border,
  primary: "#2563EB",
  dark: "#172554",
  pale: "#EFF6FF",
  contrast: "#DBEAFE",
};

const TEACHER_THEME: CardTheme = {
  background: COLORS.warmBackground,
  surface: "#FFFEFA",
  border: "#E7E5E4",
  primary: "#047857",
  dark: "#064E3B",
  pale: "#ECFDF5",
  contrast: "#D1FAE5",
};

const DAY_LABELS: Record<string, string> = {
  SAT: "Saturday",
  SUN: "Sunday",
  MON: "Monday",
  TUE: "Tuesday",
  WED: "Wednesday",
  THU: "Thursday",
  FRI: "Friday",
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    image.src = src;
  });
}

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(
    x + width,
    y + height,
    x + width - radius,
    y + height,
  );
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

function wrapText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (context.measureText(next).width <= maxWidth || !line) {
      line = next;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  if (lines.length <= maxLines) return lines;

  const visible = lines.slice(0, maxLines);
  let lastLine = visible[maxLines - 1];
  while (
    lastLine.length > 0 &&
    context.measureText(`${lastLine}…`).width > maxWidth
  ) {
    lastLine = lastLine.slice(0, -1);
  }
  visible[maxLines - 1] = `${lastLine.trimEnd()}…`;
  return visible;
}

function drawTextLines(
  context: CanvasRenderingContext2D,
  lines: string[],
  x: number,
  y: number,
  lineHeight: number,
) {
  lines.forEach((line, index) => {
    context.fillText(line, x, y + index * lineHeight);
  });
}

async function createCanvas(): Promise<{
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
}> {
  const canvas = document.createElement("canvas");
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not available in this browser.");
  return { canvas, context };
}

async function drawBrandHeader(
  context: CanvasRenderingContext2D,
  label: string,
  theme: CardTheme,
) {
  context.fillStyle = theme.background;
  context.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  const header = context.createLinearGradient(0, 0, CARD_WIDTH, 220);
  header.addColorStop(0, theme.dark);
  header.addColorStop(1, theme.primary);
  context.fillStyle = header;
  context.fillRect(0, 0, CARD_WIDTH, 230);

  context.fillStyle = "rgba(255,255,255,0.08)";
  context.beginPath();
  context.arc(1000, 28, 180, 0, Math.PI * 2);
  context.fill();
  context.beginPath();
  context.arc(820, 210, 105, 0, Math.PI * 2);
  context.fill();

  roundedRect(context, PAGE_MARGIN, 42, 94, 94, 27);
  context.fillStyle = "#0F172A";
  context.fill();
  context.strokeStyle = "rgba(255,255,255,0.9)";
  context.lineWidth = 3;
  context.stroke();
  try {
    const logo = await loadImage(LOGO_SRC);
    const size = 78;
    const scale = Math.min(size / logo.width, size / logo.height);
    const width = logo.width * scale;
    const height = logo.height * scale;
    context.drawImage(
      logo,
      PAGE_MARGIN + (94 - width) / 2,
      42 + (94 - height) / 2,
      width,
      height,
    );
  } catch {
    context.fillStyle = COLORS.surface;
    context.font = "700 44px Arial, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText("P", PAGE_MARGIN + 47, 89);
  }

  context.textAlign = "left";
  context.textBaseline = "alphabetic";
  context.fillStyle = COLORS.surface;
  context.font = "700 46px Arial, sans-serif";
  context.fillText("Porabo", PAGE_MARGIN + 112, 82);
  context.fillStyle = theme.contrast;
  context.font = "600 15px Arial, sans-serif";
  context.fillText("LOCAL LEARNING. REAL CONNECTIONS.", PAGE_MARGIN + 114, 111);

  context.font = "700 14px Arial, sans-serif";
  const labelWidth = Math.max(175, context.measureText(label).width + 38);
  roundedRect(context, CARD_WIDTH - PAGE_MARGIN - labelWidth, 67, labelWidth, 42, 21);
  context.fillStyle = "rgba(255,255,255,0.16)";
  context.fill();
  context.strokeStyle = "rgba(255,255,255,0.35)";
  context.lineWidth = 1;
  context.stroke();
  context.fillStyle = COLORS.surface;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(
    label,
    CARD_WIDTH - PAGE_MARGIN - labelWidth / 2,
    88,
    labelWidth - 24,
  );

  context.save();
  context.shadowColor = "rgba(15,23,42,0.10)";
  context.shadowBlur = 28;
  context.shadowOffsetY = 8;
  roundedRect(context, PAGE_MARGIN, 184, CARD_WIDTH - PAGE_MARGIN * 2, 1160, 32);
  context.fillStyle = theme.surface;
  context.fill();
  context.restore();
  context.strokeStyle = theme.border;
  context.lineWidth = 1;
  roundedRect(context, PAGE_MARGIN, 184, CARD_WIDTH - PAGE_MARGIN * 2, 1160, 32);
  context.stroke();
}

function drawFooter(context: CanvasRenderingContext2D, theme: CardTheme) {
  context.fillStyle = theme.dark;
  context.fillRect(0, 1370, CARD_WIDTH, 70);
  context.fillStyle = COLORS.surface;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = "700 21px Arial, sans-serif";
  context.fillText("Porabo  •  Local learning, closer to home", CARD_WIDTH / 2, 1394);
  context.fillStyle = theme.contrast;
  context.font = "500 14px Arial, sans-serif";
  context.fillText("porabo.online", CARD_WIDTH / 2, 1420);
}

function drawEyebrow(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
) {
  context.fillStyle = COLORS.blueLight;
  roundedRect(context, x, y, 214, 34, 17);
  context.fill();
  context.fillStyle = COLORS.blueDark;
  context.font = "700 13px Arial, sans-serif";
  context.textAlign = "left";
  context.textBaseline = "middle";
  context.fillText(text, x + 16, y + 17);
}

function drawInfoCell(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  label: string,
  value: string,
  accent: string = COLORS.blue,
) {
  roundedRect(context, x, y, width, 98, 18);
  context.fillStyle = "#F8FAFC";
  context.fill();
  context.strokeStyle = COLORS.border;
  context.lineWidth = 1;
  context.stroke();
  context.fillStyle = accent;
  roundedRect(context, x + 1, y + 18, 4, 62, 2);
  context.fill();
  context.textAlign = "left";
  context.textBaseline = "top";
  context.fillStyle = COLORS.muted;
  context.font = "700 12px Arial, sans-serif";
  context.fillText(label.toUpperCase(), x + 20, y + 18);
  context.fillStyle = COLORS.text;
  context.font = "700 22px Arial, sans-serif";
  const lines = wrapText(context, value || "Not specified", width - 40, 2);
  drawTextLines(context, lines, x + 20, y + 45, 25);
}

async function drawQrPanel(
  context: CanvasRenderingContext2D,
  y: number,
  shareUrl: string,
  title: string,
  caption: string,
  theme: CardTheme,
) {
  const panelX = CONTENT_MARGIN;
  const panelWidth = CONTENT_WIDTH;
  roundedRect(context, panelX, y, panelWidth, 104, 20);
  context.fillStyle = theme.pale;
  context.fill();
  const qrSize = 76;
  const qrX = panelX + 14;
  const qrY = y + 14;
  roundedRect(context, qrX - 4, qrY - 4, qrSize + 8, qrSize + 8, 12);
  context.fillStyle = COLORS.surface;
  context.fill();
  try {
    const qrData = await QRCode.toDataURL(shareUrl, {
      width: 240,
      margin: 1,
      color: { dark: COLORS.text, light: COLORS.surface },
      errorCorrectionLevel: "M",
    });
    const qrImage = await loadImage(qrData);
    context.drawImage(qrImage, qrX, qrY, qrSize, qrSize);
  } catch (error) {
    console.warn("Porabo card QR generation failed:", error);
    context.fillStyle = theme.dark;
    context.font = "700 12px Arial, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText("PORABO", qrX + qrSize / 2, qrY + qrSize / 2);
  }

  context.textAlign = "left";
  context.textBaseline = "top";
  context.fillStyle = COLORS.text;
  context.font = "700 20px Arial, sans-serif";
  context.fillText(title, panelX + 112, y + 26);
  context.fillStyle = COLORS.secondary;
  context.font = "500 15px Arial, sans-serif";
  const lines = wrapText(context, caption, panelWidth - 140, 2);
  drawTextLines(context, lines, panelX + 112, y + 56, 20);
}

function formatBudget(amount: number): string {
  return `৳ ${amount.toLocaleString("en-US")}`;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently posted";
  return date.toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function drawStatus(
  context: CanvasRenderingContext2D,
  status: string,
  x: number,
  y: number,
) {
  const palette =
    status === "OPEN"
      ? { background: COLORS.greenLight, text: COLORS.green }
      : status === "MATCHED"
        ? { background: COLORS.blueLight, text: COLORS.blueDark }
        : { background: COLORS.amberLight, text: COLORS.amber };
  const label = status.replaceAll("_", " ");
  context.font = "700 13px Arial, sans-serif";
  const width = Math.max(88, context.measureText(label).width + 28);
  roundedRect(context, x, y, width, 32, 16);
  context.fillStyle = palette.background;
  context.fill();
  context.fillStyle = palette.text;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(label, x + width / 2, y + 16);
}

export async function generateTuitionCard(
  post: TuitionPost,
  shareUrl: string = "https://porabo.online",
): Promise<string> {
  const { canvas, context } = await createCanvas();
  await drawBrandHeader(context, "TUITION OPPORTUNITY", TUITION_THEME);

  const left = CONTENT_MARGIN;
  drawStatus(context, post.status, left, 240);
  context.textAlign = "right";
  context.textBaseline = "middle";
  context.fillStyle = COLORS.muted;
  context.font = "500 14px Arial, sans-serif";
  context.fillText(formatDate(post.createdAt), CARD_WIDTH - CONTENT_MARGIN, 256);

  context.textAlign = "left";
  context.textBaseline = "top";
  context.fillStyle = COLORS.text;
  context.font = "700 46px Arial, sans-serif";
  const titleLines = wrapText(context, post.title, CONTENT_WIDTH, 2);
  drawTextLines(context, titleLines, left, 296, 56);

  context.fillStyle = COLORS.secondary;
  context.font = "600 22px Arial, sans-serif";
  context.fillText(
    `${post.subject || "Subject"}  •  ${post.gradeLevel || "Class not specified"}`,
    left,
    420,
    CONTENT_WIDTH,
  );

  const budgetY = 462;
  const budgetGradient = context.createLinearGradient(left, budgetY, left + CONTENT_WIDTH, budgetY + 110);
  budgetGradient.addColorStop(0, COLORS.blueDark);
  budgetGradient.addColorStop(1, COLORS.blue);
  roundedRect(context, left, budgetY, CONTENT_WIDTH, 112, 22);
  context.fillStyle = budgetGradient;
  context.fill();
  context.textAlign = "left";
  context.textBaseline = "top";
  context.fillStyle = "#DBEAFE";
  context.font = "700 13px Arial, sans-serif";
  context.fillText("MONTHLY BUDGET", left + 26, budgetY + 20);
  context.fillStyle = COLORS.surface;
  context.font = "700 43px Arial, sans-serif";
  context.fillText(formatBudget(post.salaryBudget), left + 26, budgetY + 43);
  context.textAlign = "right";
  context.fillStyle = "#DBEAFE";
  context.font = "600 15px Arial, sans-serif";
  context.fillText("per month", left + CONTENT_WIDTH - 26, budgetY + 76);

  const gap = 14;
  const cellWidth = (CONTENT_WIDTH - gap) / 2;
  const mode =
    post.tuitionMode === "ONLINE"
      ? "Online"
      : post.tuitionMode === "OFFLINE"
        ? "In person"
        : post.tuitionMode === "BOTH"
          ? "Online or in person"
          : "Flexible";
  const preference =
    post.genderPreference === "MALE_ONLY"
      ? "Male tutor preferred"
      : post.genderPreference === "FEMALE_ONLY"
        ? "Female tutor preferred"
        : "Any tutor";
  drawInfoCell(context, left, 592, cellWidth, "Curriculum", post.curriculum);
  drawInfoCell(
    context,
    left + cellWidth + gap,
    592,
    cellWidth,
    "Lesson mode",
    mode,
    COLORS.green,
  );
  drawInfoCell(
    context,
    left,
    704,
    cellWidth,
    "Weekly commitment",
    `${post.daysPerWeek} days  •  ${post.hoursPerDay} hrs/day`,
  );
  drawInfoCell(
    context,
    left + cellWidth + gap,
    704,
    cellWidth,
    "Tutor preference",
    preference,
    COLORS.green,
  );

  const schedule = post.weeklySchedule || [];
  if (schedule.length > 0) {
    const scheduleY = 824;
    roundedRect(context, left, scheduleY, CONTENT_WIDTH, 164, 20);
    context.fillStyle = "#F8FAFC";
    context.fill();
    context.strokeStyle = COLORS.border;
    context.lineWidth = 1;
    context.stroke();
    context.fillStyle = COLORS.text;
    context.textAlign = "left";
    context.textBaseline = "top";
    context.font = "700 14px Arial, sans-serif";
    context.fillText("WEEKLY SCHEDULE", left + 22, scheduleY + 18);
    schedule.slice(0, 3).forEach((slot, index) => {
      const rowY = scheduleY + 50 + index * 30;
      context.font = "600 15px Arial, sans-serif";
      context.fillStyle = COLORS.secondary;
      context.textAlign = "left";
      context.fillText(DAY_LABELS[slot.day] || slot.day, left + 22, rowY);
      context.fillStyle = COLORS.blueDark;
      context.textAlign = "right";
      context.fillText(
        `${slot.startTime} – ${slot.endTime}`,
        left + CONTENT_WIDTH - 22,
        rowY,
      );
    });
    if (schedule.length > 3) {
      context.fillStyle = COLORS.muted;
      context.font = "500 11px Arial, sans-serif";
      context.textAlign = "left";
      context.fillText(`+${schedule.length - 3} more days`, left + 22, scheduleY + 145);
    }
  }

  const locationY = schedule.length > 0 ? 1004 : 846;
  roundedRect(context, left, locationY, CONTENT_WIDTH, 72, 18);
  context.fillStyle = COLORS.blueLight;
  context.fill();
  context.fillStyle = COLORS.blueDark;
  context.font = "700 12px Arial, sans-serif";
  context.textAlign = "left";
  context.textBaseline = "top";
  context.fillText("APPROXIMATE LOCATION", left + 20, locationY + 13);
  context.fillStyle = COLORS.text;
  context.font = "600 19px Arial, sans-serif";
  context.fillText(
    `${post.areaName}, ${post.district}`,
    left + 20,
    locationY + 35,
    CONTENT_WIDTH - 40,
  );

  const noteY = locationY + 88;
  if (post.specialRequirements?.trim()) {
    context.fillStyle = COLORS.muted;
    context.font = "700 12px Arial, sans-serif";
    context.textAlign = "left";
    context.textBaseline = "top";
    context.fillText("STUDENT'S NOTE", left, noteY);
    context.fillStyle = COLORS.secondary;
    context.font = "500 15px Arial, sans-serif";
    const noteLines = wrapText(context, post.specialRequirements, CONTENT_WIDTH, 2);
    drawTextLines(context, noteLines, left, noteY + 22, 20);
  }

  // Only the approximate area is included; the student's exact address and contact stay private.
  await drawQrPanel(
    context,
    1224,
    shareUrl,
    "Find local tuition on Porabo",
    "Scan to explore trusted, nearby tutoring opportunities.",
    TUITION_THEME,
  );
  drawFooter(context, TUITION_THEME);
  return canvas.toDataURL("image/png");
}

export async function generateTeacherCard(
  tutor: User,
  shareUrl: string = "https://porabo.online",
): Promise<string> {
  const { canvas, context } = await createCanvas();
  const verified = tutor.verificationStatus === "VERIFIED";
  await drawBrandHeader(context, "TEACHER PROFILE", TEACHER_THEME);

  const photoRadius = 108;
  const photoX = CARD_WIDTH / 2;
  const photoY = 316;
  context.save();
  context.shadowColor = "rgba(15,23,42,0.20)";
  context.shadowBlur = 24;
  context.shadowOffsetY = 8;
  context.beginPath();
  context.arc(photoX, photoY, photoRadius + 6, 0, Math.PI * 2);
  context.fillStyle = "#D6A74F";
  context.fill();
  context.restore();
  context.save();
  context.beginPath();
  context.arc(photoX, photoY, photoRadius, 0, Math.PI * 2);
  context.clip();
  let photoDrawn = false;
  if (tutor.profilePicture) {
    try {
      const photo = await loadImage(tutor.profilePicture);
      const scale = Math.max(
        (photoRadius * 2) / photo.width,
        (photoRadius * 2) / photo.height,
      );
      const width = photo.width * scale;
      const height = photo.height * scale;
      context.drawImage(
        photo,
        photoX - width / 2,
        photoY - height / 2,
        width,
        height,
      );
      photoDrawn = true;
    } catch (error) {
      console.warn("Porabo teacher photo failed to load:", error);
    }
  }
  if (!photoDrawn) {
    context.fillStyle = TEACHER_THEME.pale;
    context.fillRect(
      photoX - photoRadius,
      photoY - photoRadius,
      photoRadius * 2,
      photoRadius * 2,
    );
    context.fillStyle = TEACHER_THEME.primary;
    context.font = "700 88px Arial, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(tutor.fullName.trim().charAt(0).toUpperCase() || "P", photoX, photoY);
  }
  context.restore();
  context.strokeStyle = "#D6A74F";
  context.lineWidth = 5;
  context.beginPath();
  context.arc(photoX, photoY, photoRadius, 0, Math.PI * 2);
  context.stroke();

  context.fillStyle = COLORS.text;
  context.font = "700 48px Arial, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "top";
  const nameLines = wrapText(
    context,
    tutor.fullName || "Porabo Teacher",
    CONTENT_WIDTH,
    2,
  );
  drawTextLines(context, nameLines, CARD_WIDTH / 2, 440, 56);

  const institution = [tutor.institution, tutor.department]
    .filter(Boolean)
    .join("  •  ");
  context.fillStyle = COLORS.secondary;
  context.font = "600 19px Arial, sans-serif";
  context.textAlign = "center";
  const institutionLines = wrapText(
    context,
    institution || "Dedicated local educator",
    CONTENT_WIDTH - 24,
    2,
  );
  drawTextLines(context, institutionLines, CARD_WIDTH / 2, 562, 26);

  const statusText = verified ? "VERIFIED TEACHER" : "TEACHER PROFILE";
  context.font = "700 13px Arial, sans-serif";
  const statusWidth = context.measureText(statusText).width + 34;
  roundedRect(
    context,
    (CARD_WIDTH - statusWidth) / 2,
    620,
    statusWidth,
    34,
    17,
  );
  context.fillStyle = verified ? COLORS.greenLight : TEACHER_THEME.pale;
  context.fill();
  context.fillStyle = verified ? COLORS.green : TEACHER_THEME.primary;
  context.textBaseline = "middle";
  context.fillText(statusText, CARD_WIDTH / 2, 637);

  const statsY = 684;
  const statGap = 14;
  const statWidth = (CONTENT_WIDTH - statGap * 2) / 3;
  const reviews =
    tutor.totalReviews && tutor.totalReviews > 0
      ? `${tutor.totalReviews} review${tutor.totalReviews === 1 ? "" : "s"}`
      : "New profile";
  const rate =
    tutor.hourlyOrMonthlyRate && tutor.hourlyOrMonthlyRate > 0
      ? `${formatBudget(tutor.hourlyOrMonthlyRate)}/mo`
      : "Discuss";
  drawInfoCell(
    context,
    CONTENT_MARGIN,
    statsY,
    statWidth,
    "Experience",
    tutor.yearsOfExperience
      ? `${tutor.yearsOfExperience} years`
      : "Not listed",
    TEACHER_THEME.primary,
  );
  drawInfoCell(
    context,
    CONTENT_MARGIN + statWidth + statGap,
    statsY,
    statWidth,
    "Expected fee",
    rate,
    "#B7791F",
  );
  drawInfoCell(
    context,
    CONTENT_MARGIN + (statWidth + statGap) * 2,
    statsY,
    statWidth,
    "Student reviews",
    reviews,
    TEACHER_THEME.primary,
  );

  const detailsY = 804;
  roundedRect(context, CONTENT_MARGIN, detailsY, CONTENT_WIDTH, 176, 20);
  context.fillStyle = "#F8FBF7";
  context.fill();
  context.strokeStyle = TEACHER_THEME.border;
  context.lineWidth = 1;
  context.stroke();

  const columnGap = 36;
  const columnWidth = (CONTENT_WIDTH - 52 - columnGap) / 2;
  context.textAlign = "left";
  context.textBaseline = "top";
  context.fillStyle = TEACHER_THEME.primary;
  context.font = "700 12px Arial, sans-serif";
  context.fillText("SUBJECTS", CONTENT_MARGIN + 24, detailsY + 22);
  context.fillText(
    "LEVELS",
    CONTENT_MARGIN + 24 + columnWidth + columnGap,
    detailsY + 22,
  );
  context.fillStyle = COLORS.text;
  context.font = "600 17px Arial, sans-serif";
  const subjects =
    tutor.subjectsTaught && tutor.subjectsTaught.length > 0
      ? tutor.subjectsTaught.slice(0, 5).join(", ")
      : "Subjects available on request";
  const grades =
    tutor.gradesTaught && tutor.gradesTaught.length > 0
      ? tutor.gradesTaught.slice(0, 5).join(", ")
      : "Levels available on request";
  drawTextLines(
    context,
    wrapText(context, subjects, columnWidth, 4),
    CONTENT_MARGIN + 24,
    detailsY + 52,
    25,
  );
  drawTextLines(
    context,
    wrapText(context, grades, columnWidth, 4),
    CONTENT_MARGIN + 24 + columnWidth + columnGap,
    detailsY + 52,
    25,
  );

  const bioY = 1002;
  const bio = tutor.bio?.trim() || tutor.qualifications?.trim();
  if (bio) {
    roundedRect(context, CONTENT_MARGIN, bioY, CONTENT_WIDTH, 112, 20);
    context.fillStyle = TEACHER_THEME.surface;
    context.fill();
    context.strokeStyle = TEACHER_THEME.border;
    context.lineWidth = 1;
    context.stroke();
    context.fillStyle = TEACHER_THEME.primary;
    context.font = "700 12px Arial, sans-serif";
    context.textAlign = "left";
    context.textBaseline = "top";
    context.fillText(tutor.bio?.trim() ? "ABOUT THE TEACHER" : "QUALIFICATIONS", CONTENT_MARGIN + 22, bioY + 18);
    context.fillStyle = COLORS.secondary;
    context.font = "500 16px Arial, sans-serif";
    drawTextLines(
      context,
      wrapText(context, bio, CONTENT_WIDTH - 44, 3),
      CONTENT_MARGIN + 22,
      bioY + 42,
      20,
    );
  }

  const area = [tutor.areaName, tutor.district].filter(Boolean).join(", ");
  if (area) {
    context.fillStyle = TEACHER_THEME.primary;
    context.font = "600 14px Arial, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(`Based in ${area}`, CARD_WIDTH / 2, 1146, CONTENT_WIDTH);
  }

  await drawQrPanel(
    context,
    1182,
    shareUrl,
    "Meet your next tutor on Porabo",
    "Scan to discover trusted teachers in your neighbourhood.",
    TEACHER_THEME,
  );
  drawFooter(context, TEACHER_THEME);
  return canvas.toDataURL("image/png");
}

function saveImage(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function slugify(value: string, fallback: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || fallback
  );
}

export async function downloadTuitionCard(post: TuitionPost): Promise<void> {
  const image = await generateTuitionCard(post);
  saveImage(
    image,
    `porabo-tuition-${slugify(post.title, "tuition")}-${Date.now()}.png`,
  );
}

export async function downloadTeacherCard(tutor: User): Promise<void> {
  const image = await generateTeacherCard(tutor);
  saveImage(
    image,
    `porabo-teacher-${slugify(tutor.fullName, "teacher")}-${Date.now()}.png`,
  );
}
