import type { ExamConfig } from '@/types/exam';

interface PdfElementBase {
  type: 'text' | 'rect' | 'line';
  x: number;
  y: number;
}

interface PdfTextElement extends PdfElementBase {
  type: 'text';
  value: string;
  fontSize: number;
}

interface PdfRectElement extends PdfElementBase {
  type: 'rect';
  width: number;
  height: number;
}

interface PdfLineElement extends PdfElementBase {
  type: 'line';
  width: number;
}

export type PdfElement = PdfTextElement | PdfRectElement | PdfLineElement;

export interface ExamPdfSchema {
  page: {
    width: number;
    height: number;
  };
  elements: PdfElement[];
}

export function buildExamPdfSchema(config: ExamConfig): ExamPdfSchema {
  const elements: PdfElement[] = [];
  const page = { width: 210, height: 297 };
  let y = 20;

  elements.push({ type: 'text', x: 15, y, value: config.title, fontSize: 16 });
  y += 10;
  elements.push({ type: 'line', x: 15, y, width: 180 });
  y += 8;
  elements.push({ type: 'text', x: 15, y, value: 'Name: ______________________', fontSize: 11 });
  y += 12;

  for (const question of config.questions) {
    elements.push({ type: 'text', x: 15, y, value: `${question.label} (${question.points})`, fontSize: 11 });

    if (question.type === 'mark') {
      const options = question.optionsCount ?? 4;
      
      // PDF layout constraints
      const startX = 70;
      const availableWidth = 125; // Page width 210mm - margins (30mm) - start position offset
      const minSpacing = 8; // Minimum spacing in mm for usability
      const maxOptionsPerRow = Math.floor(availableWidth / minSpacing);
      
      // Calculate optimal spacing and row layout
      let spacing = 15; // Default spacing
      let optionsPerRow = Math.min(options, Math.floor(availableWidth / spacing));
      
      // If options don't fit with default spacing, calculate tighter spacing
      if (options > optionsPerRow) {
        spacing = Math.max(minSpacing, availableWidth / Math.min(options, maxOptionsPerRow));
        optionsPerRow = Math.floor(availableWidth / spacing);
      }
      
      // Render options, wrapping to multiple rows if needed
      let currentRow = 0;
      for (let idx = 0; idx < options; idx += 1) {
        const positionInRow = idx % optionsPerRow;
        const row = Math.floor(idx / optionsPerRow);
        
        if (row > currentRow) {
          y += 10;
          currentRow = row;
        }
        
        const x = startX + positionInRow * spacing;
        elements.push({ type: 'rect', x, y: y - 4, width: 6, height: 6 });
      }
      
      y += 10;
      continue;
    }

    const lineCount = question.boxHeight === 'large' ? 5 : question.boxHeight === 'small' ? 1 : 3;
    for (let line = 0; line < lineCount; line += 1) {
      elements.push({ type: 'line', x: 30, y: y + line * 7, width: 165 });
    }
    y += lineCount * 7 + 4;
  }

  return { page, elements };
}
