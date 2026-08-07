import { jsPDF } from 'jspdf';

export interface PdfVisit {
  id: string;
  date: string;
  dateISO: string;
  site: string;
  siteAr?: string;
  gov: string;
  cat: string;
  duration: string;
  xp: number;
  badge?: string | null;
  story: string;
  rafiqNote: string;
  tags: string[];
}

export interface PdfBadge {
  id: string | number;
  name: string;
}

export interface PdfInput {
  profile?: { displayName?: string; xp?: number; level?: number };
  visits: PdfVisit[];
  badges: PdfBadge[];
  governorateCoverage: Record<string, number>;
  governorates: string[];
  summary?: string;
}

const BASALT = '#141008';
const NILE = '#0F3D3E';
const LIMESTONE = '#F5EFE0';
const PAPER = '#FAF3E4';
const GOLD = '#D4A84E';
const GOLD_BRIGHT = '#F5C040';
const COPPER = '#8A5A34';
const FAIENCE = '#2E9C93';
const INK = '#28281F';
const MUTED = '#8B7E6A';

const CAT_COLORS: Record<string, string> = {
  'archeological': FAIENCE,
  'cultural': GOLD,
  'natural': '#2E7A54',
  'water': NILE,
  'desert': COPPER,
  'religious': '#7A5530',
  'unknown': COPPER,
};

function catColor(cat: string): string {
  return CAT_COLORS[cat.toLowerCase()] || COPPER;
}

function letterSpaced(s: string): string {
  return s.toUpperCase().split('').join('  ');
}

function sunDisc(doc: jsPDF, cx: number, cy: number, r: number) {
  doc.setDrawColor(GOLD);
  doc.setLineWidth(1.6);
  doc.circle(cx, cy, r, 'S');
  doc.setDrawColor(GOLD_BRIGHT);
  doc.setLineWidth(0.9);
  doc.circle(cx, cy, r * 0.78, 'S');
  doc.setFillColor(GOLD_BRIGHT);
  doc.circle(cx, cy, r * 0.26, 'F');
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6;
    doc.setDrawColor(GOLD);
    doc.setLineWidth(0.7);
    doc.line(
      cx + Math.cos(a) * r * 1.05,
      cy + Math.sin(a) * r * 1.05,
      cx + Math.cos(a) * r * 1.22,
      cy + Math.sin(a) * r * 1.22
    );
  }
}

function renderCover(doc: jsPDF, input: PdfInput) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const cx = W / 2;
  const profile = input.profile || {};
  const xp = profile.xp ?? 0;
  const level = profile.level ?? 1;
  const name = profile.displayName || 'Explorer';

  doc.setFillColor(BASALT);
  doc.rect(0, 0, W, H, 'F');

  doc.setDrawColor(`${GOLD}55`);
  doc.setLineWidth(1);
  doc.rect(24, 24, W - 48, H - 48, 'S');
  doc.rect(30, 30, W - 60, H - 60, 'S');

  sunDisc(doc, cx, 220, 62);

  doc.setTextColor(GOLD_BRIGHT);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(42);
  doc.text(letterSpaced('Rihla'), cx, 348, { align: 'center', charSpace: 2 });

  doc.setDrawColor(GOLD);
  doc.setLineWidth(1.1);
  doc.line(cx - 70, 372, cx + 70, 372);

  doc.setTextColor(GOLD);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(15);
  doc.text(letterSpaced('The Egyptian Journey'), cx, 396, { align: 'center', charSpace: 1 });

  doc.setTextColor(LIMESTONE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.text(name, cx, 452, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(`${LIMESTONE}99`);
  doc.text('A personal travelogue written with Rihla', cx, 474, { align: 'center' });

  doc.setDrawColor(`${GOLD}44`);
  doc.setLineWidth(0.8);
  doc.line(cx - 90, 520, cx + 90, 520);

  doc.setTextColor(LIMESTONE);
  doc.setFontSize(12);
  doc.text(String(input.visits.length), cx - 130, 560, { align: 'center' });
  doc.text(String(Object.values(input.governorateCoverage).filter((c) => c > 0).length), cx, 560, { align: 'center' });
  doc.text(String(xp), cx + 130, 560, { align: 'center' });

  doc.setTextColor(GOLD);
  doc.setFontSize(8);
  doc.text('SITES VISITED', cx - 130, 574, { align: 'center' });
  doc.text('GOVERNORATES', cx, 574, { align: 'center' });
  doc.text('XP EARNED', cx + 130, 574, { align: 'center' });

  doc.setDrawColor(`${GOLD}33`);
  doc.setLineWidth(0.7);
  doc.line(cx - 150, 585, cx + 150, 585);

  doc.setTextColor(`${LIMESTONE}66`);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.text(`Exported on ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`, cx, H - 84, { align: 'center' });
  doc.setTextColor(GOLD);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Made with Rihla · Travel Well', cx, H - 64, { align: 'center' });
}

function renderStats(doc: jsPDF, input: PdfInput) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 48;
  const CW = W - M * 2;
  const profile = input.profile || {};
  const xp = profile.xp ?? 0;
  const level = profile.level ?? 1;
  const visitsCount = input.visits.length;
  const govCount = Object.values(input.governorateCoverage).filter((c) => c > 0).length;

  doc.setFillColor(PAPER);
  doc.rect(0, 0, W, H, 'F');

  doc.setDrawColor(`${GOLD}66`);
  doc.setLineWidth(1);
  doc.rect(M - 8, M - 10, CW + 16, 92, 'S');
  doc.setFillColor(NILE);
  doc.rect(M - 8, M - 10, CW + 16, 92, 'F');
  sunDisc(doc, W - M - 30, M + 36, 22);
  doc.setTextColor(LIMESTONE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('The Journey in Numbers', M, M + 32);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(`${LIMESTONE}99`);
  doc.text('Everything your time in Egypt added up to', M, M + 54);

  const boxes: Array<{ label: string; val: string; col: string }> = [
    { label: 'Sites Visited', val: String(visitsCount), col: FAIENCE },
    { label: 'Total XP', val: String(xp), col: GOLD },
    { label: 'Level', val: String(level), col: COPPER },
    { label: 'Governorates', val: `${govCount}/7`, col: NILE },
  ];
  const gap = 14;
  const bw = (CW - gap * 3) / 4;
  let y = M + 120;
  boxes.forEach((b, i) => {
    const x = M + i * (bw + gap);
    doc.setFillColor(LIMESTONE);
    doc.roundedRect(x, y, bw, 84, 10, 10, 'F');
    doc.setDrawColor(`${b.col}44`);
    doc.setLineWidth(1);
    doc.roundedRect(x, y, bw, 84, 10, 10, 'S');
    doc.setFillColor(b.col);
    doc.rect(x, y, 4, 84, 'F');
    doc.setTextColor(NILE);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(26);
    doc.text(b.val, x + bw / 2, y + 40, { align: 'center' });
    doc.setTextColor(MUTED);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(letterSpaced(b.label), x + bw / 2, y + 60, { align: 'center' });
  });

  y += 116;
  doc.setTextColor(NILE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Progress to Next Level', M, y);
  doc.setFontSize(9);
  doc.setTextColor(MUTED);
  doc.text(`Level ${level} · ${xp % 500} / 500 XP`, W - M, y, { align: 'right' });

  const trackY = y + 12;
  doc.setFillColor('#E4DAC0');
  doc.roundedRect(M, trackY, CW, 10, 5, 5, 'F');
  doc.setFillColor(GOLD_BRIGHT);
  doc.roundedRect(M, trackY, Math.max(10, CW * ((xp % 500) / 500)), 10, 5, 5, 'F');
  doc.setTextColor(NILE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`${500 - (xp % 500)} XP to Level ${level + 1}`, M, trackY + 28);

  // Governorate coverage
  y = trackY + 54;
  doc.setTextColor(NILE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Egypt Coverage', M, y);
  y += 14;
  input.governorates.forEach((g) => {
    const c = input.governorateCoverage[g] || 0;
    doc.setTextColor(NILE);
    doc.setFont('helvetica', c > 0 ? 'bold' : 'normal');
    doc.setFontSize(9);
    doc.text(g, M, y + 7);
    doc.setFillColor('#E4DAC0');
    doc.roundedRect(M + 110, y, CW - 110 - 36, 7, 3.5, 3.5, 'F');
    if (c > 0) {
      doc.setFillColor(c > 0 ? catColor('archeological') : '#E4DAC0');
      doc.roundedRect(M + 110, y, Math.max(8, (CW - 110 - 36) * Math.min(c / 4, 1)), 7, 3.5, 3.5, 'F');
    }
    doc.setTextColor(c > 0 ? COPPER : '#C4B89A');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(String(c), W - M - 20, y + 7, { align: 'right' });
    y += 16;
  });

  // Badges
  if (input.badges.length > 0) {
    y += 16;
    doc.setTextColor(NILE);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(`Badges Earned · ${input.badges.length}`, M, y);
    y += 24;
    const radius = 22;
    const spacing = 78;
    const cols = Math.max(1, Math.floor(CW / spacing));
    input.badges.slice(0, cols * 2).forEach((b, i) => {
      const bx = M + (i % cols) * spacing;
      const by = y + Math.floor(i / cols) * 92;
      doc.setFillColor(FAIENCE);
      doc.circle(bx, by, radius, 'F');
      doc.setDrawColor(LIMESTONE);
      doc.setLineWidth(1.4);
      doc.circle(bx, by, radius - 3, 'S');
      doc.setTextColor(LIMESTONE);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text(b.name.charAt(0).toUpperCase(), bx, by + 7, { align: 'center' });
      doc.setTextColor(NILE);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      const label = doc.splitTextToSize(b.name, spacing - 6);
      doc.text(label, bx, by + radius + 12, { align: 'center' });
    });
    y += 92 * Math.min(2, Math.ceil(input.badges.length / cols)) + 8;
  }

  doc.setDrawColor(`${GOLD}44`);
  doc.setLineWidth(0.8);
  doc.line(M, H - 54, W - M, H - 54);
  doc.setTextColor(MUTED);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Page 2`, W - M, H - 38, { align: 'right' });
}

function renderStoryPages(doc: jsPDF, input: PdfInput) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 48;
  const CW = W - M * 2;

  input.visits.forEach((v, idx) => {
    doc.addPage();
    doc.setFillColor(PAPER);
    doc.rect(0, 0, W, H, 'F');

    const col = catColor(v.cat);

    doc.setFillColor(BASALT);
    doc.rect(0, 0, W, 66, 'F');
    doc.setFillColor(col);
    doc.rect(0, 66, W, 4, 'F');
    sunDisc(doc, 56, 33, 17);
    doc.setTextColor(LIMESTONE);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(`${letterSpaced(v.date)}  ·  ${v.gov.toUpperCase()}`, 86, 28);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(`${LIMESTONE}88`);
    doc.text(letterSpaced(v.cat), 86, 46);

    doc.setTextColor(NILE);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`${String(idx + 1).padStart(2, '0')}  ·  ${v.site}`, W - M, 40, { align: 'right' });
    doc.setTextColor(col);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`${v.duration}  ·  +${v.xp} XP`, W - M, 56, { align: 'right' });

    let y = 104;
    doc.setDrawColor(`${GOLD}66`);
    doc.setLineWidth(1);
    doc.roundedRect(M - 6, y - 8, CW + 12, 58, 8, 8, 'S');
    doc.setFillColor(LIMESTONE);
    doc.roundedRect(M - 6, y - 8, CW + 12, 58, 8, 8, 'F');

    doc.setFillColor(col);
    doc.rect(M - 6, y - 8, 6, 58, 'F');
    doc.setTextColor(NILE);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text(v.site, M + 14, y + 12);
    doc.setTextColor(MUTED);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.text(v.siteAr ? `${v.siteAr} · ` : '', M + 14, y + 28);
    doc.setTextColor(COPPER);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`+${v.xp} XP  ·  ${v.duration}`, W - M - 14, y + 12, { align: 'right' });
    if (v.badge) {
      doc.setTextColor(col);
      doc.text(v.badge.toUpperCase(), W - M - 14, y + 28, { align: 'right' });
    }
    y += 68;

    doc.setTextColor(NILE);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('◈  Rihla Story', M, y);
    y += 14;
    doc.setTextColor(INK);
    doc.setFont('times', 'italic');
    doc.setFontSize(12);
    const lines = doc.splitTextToSize(v.story, CW - 20);
    lines.forEach((ln: string) => {
      if (y > H - 70) {
        doc.addPage();
        doc.setFillColor(PAPER);
        doc.rect(0, 0, W, H, 'F');
        y = 64;
      }
      doc.text(ln, M, y);
      y += 17;
    });

    y += 10;
    if (v.rafiqNote && v.rafiqNote !== 'Rafiq provided AI guidance and context for this destination.') {
      doc.setFillColor(`${FAIENCE}14`);
      doc.setDrawColor(`${FAIENCE}44`);
      doc.setLineWidth(0.8);
      doc.roundedRect(M, y, CW, 44, 7, 7, 'F');
      doc.roundedRect(M, y, CW, 44, 7, 7, 'S');
      doc.setTextColor(FAIENCE);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('◈  RAFIQ NOTE', M + 12, y + 15);
      doc.setTextColor(MUTED);
      doc.setFont('times', 'italic');
      doc.setFontSize(10);
      const noteLines = doc.splitTextToSize(v.rafiqNote, CW - 28);
      doc.text(noteLines.slice(0, 2), M + 12, y + 29);
    }

    doc.setDrawColor(`${GOLD}44`);
    doc.setLineWidth(0.8);
    doc.line(M, H - 54, W - M, H - 54);
    doc.setTextColor(MUTED);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Page ${idx + 3}`, W - M, H - 38, { align: 'right' });
    doc.setTextColor(GOLD);
    doc.text('RIHLA · JOURNEY JOURNAL', M, H - 38);
  });
}

function renderClosing(doc: jsPDF, input: PdfInput) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const cx = W / 2;
  const profile = input.profile || {};

  doc.addPage();
  doc.setFillColor(BASALT);
  doc.rect(0, 0, W, H, 'F');

  doc.setDrawColor(`${GOLD}55`);
  doc.setLineWidth(1);
  doc.rect(24, 24, W - 48, H - 48, 'S');
  doc.rect(30, 30, W - 60, H - 60, 'S');

  sunDisc(doc, cx, 250, 50);

  doc.setTextColor(GOLD);
  doc.setFont('times', 'italic');
  doc.setFontSize(28);
  doc.text('Until we meet again, Egypt.', cx, 370, { align: 'center' });

  doc.setTextColor(`${LIMESTONE}CC`);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13);
  const quote = input.summary && input.summary.length < 200
    ? input.summary
    : 'Every pyramid holds a story. Thank you for letting Rihla tell you theirs.';
  const qLines = doc.splitTextToSize(quote, W - 128);
  doc.text(qLines, cx, 420, { align: 'center' });

  doc.setDrawColor(`${GOLD}44`);
  doc.setLineWidth(0.8);
  doc.line(cx - 60, 500, cx + 60, 500);

  doc.setTextColor(`${LIMESTONE}88`);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(11);
  doc.text(`${profile.displayName || 'Explorer'} · Rihla`, cx, 530, { align: 'center' });

  doc.setTextColor(`${GOLD}66`);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Travel well. Explore boldly. Return for more.', cx, H - 84, { align: 'center' });
  doc.setTextColor(`${LIMESTONE}55`);
  doc.text('RIHLA · MADE WITH CARE', cx, H - 64, { align: 'center' });
}

export function exportJourneyPdf(input: PdfInput) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  renderCover(doc, input);
  renderStats(doc, input);
  if (input.visits.length > 0) {
    renderStoryPages(doc, input);
    renderClosing(doc, input);
  }
  const name = (input.profile?.displayName || 'explorer').toLowerCase().replace(/\s+/g, '-');
  doc.save(`rihla-journey-${name}-${new Date().toISOString().slice(0, 10)}.pdf`);
}
