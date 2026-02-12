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
 * Export grading results to CSV format
 */
export async function exportGradingResultsToCSV(
  results: GradingResult[],
  filename?: string
): Promise<void> {
  if (results.length === 0) {
    throw new Error('No results to export');
  }

  // Build CSV content
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
    result.studentName || 'Unknown',
    result.examTitle,
    result.score.toString(),
    result.totalPoints.toString(),
    `${result.percentage.toFixed(1)}%`,
    new Date(result.gradedAt).toLocaleString(),
    result.questions
      .map(q => `${q.label}: ${q.correct ? '✓' : '✗'}`)
      .join('; '),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
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
  // Build CSV content
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
    (index + 1).toString(),
    q.label,
    q.type,
    q.points.toString(),
    q.optionsCount?.toString() || '',
    q.optionStyle || '',
    q.correctOptions?.join(', ') || '',
    q.boxHeight || '',
  ]);

  const csvContent = [
    `Exam: ${config.title}`,
    '',
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
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
