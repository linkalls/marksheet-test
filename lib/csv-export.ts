import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import type { ExamConfig } from '@/types/exam';

export interface GradingResult {
  examTitle: string;
  studentName?: string;
  score: number;
  totalPoints: number;
  percentage: number;
  gradedAt: string;
  questions: Array<{
    questionId: string;
    label: string;
    points: number;
    correct: boolean;
  }>;
}

/**
 * Escape a value for safe CSV output
 */
function escapeCsvValue(value: string): string {
  // Handle null/undefined
  if (value == null) return '';
  
  const str = String(value);
  
  // If the value contains quotes, commas, newlines, or starts with special chars, 
  // we need to escape it
  const needsEscaping = 
    str.includes('"') || 
    str.includes(',') || 
    str.includes('\n') || 
    str.includes('\r') ||
    str.startsWith('=') ||
    str.startsWith('+') ||
    str.startsWith('-') ||
    str.startsWith('@');
  
  if (!needsEscaping) {
    return str;
  }
  
  // Double any quotes in the value
  const escapedQuotes = str.replace(/"/g, '""');
  
  // Wrap in quotes
  return `"${escapedQuotes}"`;
}

/**
 * Export grading results to CSV format
 */
export async function exportGradingResultsToCSV(
  results: GradingResult[],
  filename?: string
): Promise<void> {
  if (results.length === 0) {
    throw new Error('No results to export');
  }

  // Build CSV content with proper escaping
  const headers = [
    'Student',
    'Exam',
    'Score',
    'Total Points',
    'Percentage',
    'Graded At',
    'Question Details',
  ];
  
  const rows = results.map(result => [
    escapeCsvValue(result.studentName || 'Unknown'),
    escapeCsvValue(result.examTitle),
    escapeCsvValue(result.score.toString()),
    escapeCsvValue(result.totalPoints.toString()),
    escapeCsvValue(`${result.percentage.toFixed(1)}%`),
    escapeCsvValue(new Date(result.gradedAt).toLocaleString()),
    escapeCsvValue(
      result.questions
        .map(q => `${q.label}: ${q.correct ? '✓' : '✗'}`)
        .join('; ')
    ),
  ]);

  const csvContent = [
    headers.map(escapeCsvValue).join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');

  // Save to file
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const csvFilename = filename || `grading-results-${timestamp}.csv`;
  const fileUri = `${FileSystem.documentDirectory}${csvFilename}`;

  await FileSystem.writeAsStringAsync(fileUri, csvContent, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  // Share the file
  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(fileUri, {
      mimeType: 'text/csv',
      dialogTitle: 'Export Grading Results',
      UTI: 'public.comma-separated-values-text',
    });
  } else {
    throw new Error('Sharing is not available on this device');
  }
}

/**
 * Export exam configuration to CSV format (for template sharing)
 */
export async function exportExamConfigToCSV(
  config: ExamConfig,
  filename?: string
): Promise<void> {
  // Build CSV content with proper escaping
  const headers = [
    'Question #',
    'Label',
    'Type',
    'Points',
    'Options Count',
    'Option Style',
    'Correct Options',
    'Box Height',
  ];
  
  const rows = config.questions.map((q, index) => [
    escapeCsvValue((index + 1).toString()),
    escapeCsvValue(q.label),
    escapeCsvValue(q.type),
    escapeCsvValue(q.points.toString()),
    escapeCsvValue(q.optionsCount?.toString() || ''),
    escapeCsvValue(q.optionStyle || ''),
    escapeCsvValue(q.correctOptions?.join(', ') || ''),
    escapeCsvValue(q.boxHeight || ''),
  ]);

  const csvContent = [
    escapeCsvValue(`Exam: ${config.title}`),
    '',
    headers.map(escapeCsvValue).join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');

  // Save to file
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const csvFilename = filename || `exam-${config.title.replace(/[^a-z0-9]/gi, '-')}-${timestamp}.csv`;
  const fileUri = `${FileSystem.documentDirectory}${csvFilename}`;

  await FileSystem.writeAsStringAsync(fileUri, csvContent, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  // Share the file
  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(fileUri, {
      mimeType: 'text/csv',
      dialogTitle: 'Export Exam Configuration',
      UTI: 'public.comma-separated-values-text',
    });
  } else {
    throw new Error('Sharing is not available on this device');
  }
}
