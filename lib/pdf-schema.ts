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
      for (let idx = 0; idx < options; idx += 1) {
        elements.push({ type: 'rect', x: 70 + idx * 15, y: y - 4, width: 6, height: 6 });
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
