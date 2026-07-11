import jsPDF from 'jspdf';
import type { ProgressReportData } from './ProgressReportModal';

const NAVY = [45, 90, 138] as const;
const DARK = [50, 50, 50] as const;
const MUTED = [100, 100, 100] as const;
const BODY = [75, 85, 99] as const;
const GREEN = [34, 197, 94] as const;
const BLUE = [59, 130, 246] as const;
const GRAY = [156, 163, 175] as const;

function statusLabel(status: string) {
  if (status === 'completed') return 'Completed';
  if (status === 'in-progress') return 'In Progress';
  return 'Not Started';
}

function statusColor(status: string): readonly [number, number, number] {
  if (status === 'completed') return GREEN;
  if (status === 'in-progress') return BLUE;
  return GRAY;
}

function ensureSpace(doc: jsPDF, yPos: number, needed: number): number {
  const pageHeight = doc.internal.pageSize.height;
  if (yPos + needed > pageHeight - 16) {
    doc.addPage();
    return 20;
  }
  return yPos;
}

function drawSectionTitle(doc: jsPDF, title: string, yPos: number): number {
  doc.setFontSize(12);
  doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.text(title, 20, yPos);
  return yPos + 7;
}

function drawBulletList(
  doc: jsPDF,
  items: string[],
  yPos: number,
  pageWidth: number,
  fill: readonly [number, number, number],
  bullet: string,
): number {
  const boxHeight = items.reduce((sum, item) => {
    const lines = doc.splitTextToSize(item, pageWidth - 45);
    return sum + lines.length * 4.5 + 3;
  }, 8);

  yPos = ensureSpace(doc, yPos, boxHeight + 4);
  doc.setFillColor(fill[0], fill[1], fill[2]);
  doc.roundedRect(15, yPos, pageWidth - 30, boxHeight, 2, 2, 'F');
  yPos += 5;

  items.forEach((item) => {
    doc.setFontSize(8);
    doc.setTextColor(BODY[0], BODY[1], BODY[2]);
    doc.text(bullet, 20, yPos);
    const lines = doc.splitTextToSize(item, pageWidth - 45);
    doc.text(lines, 25, yPos);
    yPos += lines.length * 4.5 + 2;
  });

  return yPos + 4;
}

/** Build PDF directly — no html2canvas (avoids Tailwind oklch / emoji failures). */
export function exportProgressReportPdf(data: ProgressReportData, fileName: string) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  let yPos = 20;

  // Header bar
  doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.rect(0, 0, pageWidth, 35, 'F');
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text('CYBERQUEST PROGRESS REPORT', pageWidth / 2, 15, { align: 'center' });
  doc.setFontSize(10);
  doc.text(`Generated on ${new Date(data.reportDate).toLocaleDateString()}`, pageWidth / 2, 25, {
    align: 'center',
  });

  yPos = 45;

  // Child profile card
  doc.setFillColor(240, 245, 255);
  doc.roundedRect(15, yPos, pageWidth - 30, 35, 3, 3, 'F');
  doc.setFontSize(14);
  doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.text(data.childName, 20, yPos + 10);
  doc.setFontSize(10);
  doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
  doc.text(`Age: ${data.childAge} years old`, 20, yPos + 17);

  const statBoxWidth = (pageWidth - 50) / 4;
  const statBoxY = yPos + 23;
  const stats = [
    { value: String(data.completedLevels.length), label: 'Levels Done' },
    { value: String(data.totalScore), label: 'Total Score' },
    { value: `${data.accuracy}%`, label: 'Accuracy' },
    { value: String(data.totalTimeSpent), label: 'Minutes' },
  ];

  stats.forEach((stat, index) => {
    const x = 20 + statBoxWidth * index;
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(x, statBoxY, statBoxWidth - 3, 12, 2, 2, 'F');
    doc.setFontSize(12);
    doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
    doc.text(stat.value, x + (statBoxWidth - 3) / 2, statBoxY + 5, { align: 'center' });
    doc.setFontSize(7);
    doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
    doc.text(stat.label, x + (statBoxWidth - 3) / 2, statBoxY + 9, { align: 'center' });
  });

  yPos = statBoxY + 22;
  yPos = drawSectionTitle(doc, 'Game Progress', yPos);

  data.gamesPlayed.forEach((game) => {
    const cardHeight = 16 + game.levels.length * 7;
    yPos = ensureSpace(doc, yPos, cardHeight + 6);

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.roundedRect(15, yPos, pageWidth - 30, cardHeight, 2, 2, 'S');

    doc.setFontSize(11);
    doc.setTextColor(DARK[0], DARK[1], DARK[2]);
    doc.text(game.gameName, 20, yPos + 5);
    doc.setFontSize(9);
    doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
    doc.text(`${game.completed}/${game.totalLevels} levels completed`, 20, yPos + 9);

    const [sr, sg, sb] = statusColor(game.status);
    doc.setFillColor(sr, sg, sb);
    doc.roundedRect(pageWidth - 50, yPos + 2, 33, 6, 2, 2, 'F');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(statusLabel(game.status), pageWidth - 33, yPos + 6, { align: 'center' });

    yPos += 12;
    doc.setFillColor(229, 231, 235);
    doc.roundedRect(20, yPos, pageWidth - 40, 3, 1.5, 1.5, 'F');
    const progressWidth = ((pageWidth - 40) * game.completed) / Math.max(game.totalLevels, 1);
    if (progressWidth > 0) {
      doc.setFillColor(GREEN[0], GREEN[1], GREEN[2]);
      doc.roundedRect(20, yPos, progressWidth, 3, 1.5, 1.5, 'F');
    }
    yPos += 6;

    game.levels.forEach((level) => {
      yPos = ensureSpace(doc, yPos, 8);
      const levelBg = level.completed ? [240, 253, 244] : [249, 250, 251];
      doc.setFillColor(levelBg[0], levelBg[1], levelBg[2]);
      doc.roundedRect(20, yPos, pageWidth - 40, 6, 1, 1, 'F');

      doc.setFontSize(8);
      doc.setTextColor(level.completed ? GREEN[0] : 200, level.completed ? GREEN[1] : 200, level.completed ? GREEN[2] : 200);
      doc.text(level.completed ? 'v' : 'o', 22, yPos + 4);

      doc.setTextColor(BODY[0], BODY[1], BODY[2]);
      const title = `Level ${level.level}: ${level.title}`;
      const titleLines = doc.splitTextToSize(title, pageWidth - 120);
      doc.text(titleLines[0], 28, yPos + 4);

      doc.setFontSize(7);
      doc.setTextColor(107, 114, 128);
      doc.text(`Score: ${level.score}/100`, pageWidth - 85, yPos + 4);
      doc.text(`Attempts: ${level.attempts}`, pageWidth - 60, yPos + 4);
      doc.text(level.timeSpent, pageWidth - 35, yPos + 4);

      yPos += 7;
    });

    yPos += 5;
  });

  yPos += 4;
  yPos = ensureSpace(doc, yPos, 20);
  yPos = drawSectionTitle(doc, 'Key Strengths', yPos);
  yPos = drawBulletList(doc, data.strengths, yPos, pageWidth, [240, 253, 244], 'v');

  if (data.areasForImprovement.length > 0) {
    yPos = ensureSpace(doc, yPos, 16);
    yPos = drawSectionTitle(doc, 'Areas for Growth', yPos);
    yPos = drawBulletList(doc, data.areasForImprovement, yPos, pageWidth, [255, 247, 237], '>');
  }

  yPos = ensureSpace(doc, yPos, 16);
  yPos = drawSectionTitle(doc, 'Recommendations for Parents', yPos);

  const recHeight =
    data.recommendations.reduce((sum, rec) => {
      const lines = doc.splitTextToSize(rec, pageWidth - 45);
      return sum + lines.length * 4.5 + 3;
    }, 8) + 4;
  yPos = ensureSpace(doc, yPos, recHeight);
  doc.setFillColor(239, 246, 255);
  doc.roundedRect(15, yPos, pageWidth - 30, recHeight, 2, 2, 'F');
  yPos += 5;

  data.recommendations.forEach((rec, index) => {
    doc.setFontSize(8);
    doc.setTextColor(BLUE[0], BLUE[1], BLUE[2]);
    doc.text(`${index + 1}.`, 20, yPos);
    doc.setTextColor(BODY[0], BODY[1], BODY[2]);
    const lines = doc.splitTextToSize(rec, pageWidth - 45);
    doc.text(lines, 25, yPos);
    yPos += lines.length * 4.5 + 2;
  });

  doc.setFontSize(8);
  doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
  doc.text(
    'Generated by CyberQuest - Teaching Kids Cybersecurity',
    pageWidth / 2,
    doc.internal.pageSize.height - 10,
    { align: 'center' },
  );

  doc.save(fileName);
}
