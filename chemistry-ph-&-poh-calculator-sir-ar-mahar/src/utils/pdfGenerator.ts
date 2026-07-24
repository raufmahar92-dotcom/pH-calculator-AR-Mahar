import { jsPDF } from 'jspdf';
import { CalculationResult } from '../types';
import { formatScientific } from './chemistry';

export function generateCalculationPDF(result: CalculationResult) {
  const doc = new jsPDF();

  // Primary Blue colors
  const primaryBlue = [27, 73, 101]; // #1B4965
  const accentBlue = [98, 182, 203]; // #62B6CB
  const lightBg = [240, 248, 255]; // Alice blue

  // Header Banner
  doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.rect(0, 0, 210, 38, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('Chemistry pH & pOH Calculator', 14, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text('Sir AR Mahar • Chemistry Learning & Research Report', 14, 25);

  doc.setFontSize(9);
  doc.text(`Generated: ${new Date(result.timestamp).toLocaleString()}`, 14, 32);

  let y = 48;

  // Calculation Title Box
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.roundedRect(14, y, 182, 16, 3, 3, 'F');
  doc.setDrawColor(accentBlue[0], accentBlue[1], accentBlue[2]);
  doc.roundedRect(14, y, 182, 16, 3, 3, 'D');

  doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(`Report: ${result.title}`, 20, y + 10);

  y += 26;

  // Section: Summary Results
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Calculation Summary', 14, y);
  y += 6;

  doc.setLineWidth(0.5);
  doc.setDrawColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.line(14, y, 196, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);

  const outputs = result.outputs;
  if (outputs.ph !== undefined) {
    doc.text(`• pH Value: ${outputs.ph}`, 18, y);
    y += 6;
  }
  if (outputs.poh !== undefined) {
    doc.text(`• pOH Value: ${outputs.poh}`, 18, y);
    y += 6;
  }
  if (outputs.hConcentration !== undefined) {
    doc.text(`• [H⁺] Concentration: ${formatScientific(outputs.hConcentration)} M`, 18, y);
    y += 6;
  }
  if (outputs.ohConcentration !== undefined) {
    doc.text(`• [OH⁻] Concentration: ${formatScientific(outputs.ohConcentration)} M`, 18, y);
    y += 6;
  }
  if (outputs.nature) {
    doc.setFont('helvetica', 'bold');
    doc.text(`• Chemical Classification: ${outputs.nature}`, 18, y);
    doc.setFont('helvetica', 'normal');
    y += 6;
  }
  if (outputs.molarity !== undefined) {
    doc.text(`• Calculated Molarity: ${outputs.molarity} M`, 18, y);
    y += 6;
  }
  if (outputs.molality !== undefined) {
    doc.text(`• Calculated Molality: ${outputs.molality} mol/kg`, 18, y);
    y += 6;
  }
  if (outputs.dilutionResult) {
    const dr = outputs.dilutionResult;
    doc.text(`• Solved Variable: ${dr.solvedVar}`, 18, y);
    y += 6;
    if (dr.m1) doc.text(`  M1: ${dr.m1} M`, 22, y), (y += 5);
    if (dr.v1) doc.text(`  V1: ${dr.v1} mL`, 22, y), (y += 5);
    if (dr.m2) doc.text(`  M2: ${dr.m2} M`, 22, y), (y += 5);
    if (dr.v2) doc.text(`  V2: ${dr.v2} mL`, 22, y), (y += 5);
  }

  y += 6;

  // Section: Step-by-Step Breakdown
  if (result.steps && result.steps.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.text('Step-by-Step Calculation Breakdown', 14, y);
    y += 6;

    doc.line(14, y, 196, y);
    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(50, 50, 50);

    for (const step of result.steps) {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      const lines = doc.splitTextToSize(step, 178);
      doc.text(lines, 18, y);
      y += lines.length * 5 + 2;
    }
    y += 4;
  }

  // Section: Formulas Used
  if (result.formulasUsed && result.formulasUsed.length > 0) {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.text('Formulas Applied', 14, y);
    y += 6;

    doc.line(14, y, 196, y);
    y += 8;

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9.5);
    doc.setTextColor(60, 60, 60);

    for (const formula of result.formulasUsed) {
      doc.text(`▪ ${formula}`, 18, y);
      y += 6;
    }
  }

  // Footer on bottom of current page
  const pageHeight = doc.internal.pageSize.height;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text('Chemistry pH & pOH Calculator — Designed by Sir AR Mahar • Free Academic Tool', 14, pageHeight - 10);

  // Save document
  const fileName = `${result.type}_${Date.now()}.pdf`;
  doc.save(fileName);
}
