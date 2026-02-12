import type { ExamConfig, Question } from '@/types/exam';

export interface QuestionAnalytics {
  questionId: string;
  label: string;
  totalAttempts: number;
  correctCount: number;
  incorrectCount: number;
  accuracy: number;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Very Hard';
}

export interface ExamAnalytics {
  examTitle: string;
  totalStudents: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  medianScore: number;
  standardDeviation: number;
  scoreDistribution: {
    range: string;
    count: number;
    percentage: number;
  }[];
  questionAnalytics: QuestionAnalytics[];
}

export interface StudentResult {
  score: number;
  totalPoints: number;
  questionResults: {
    questionId: string;
    correct: boolean;
  }[];
}

/**
 * Calculate comprehensive analytics from multiple student results
 */
export function calculateExamAnalytics(
  config: ExamConfig,
  results: StudentResult[]
): ExamAnalytics {
  if (results.length === 0) {
    return createEmptyAnalytics(config);
  }

  const scores = results.map(r => r.score);
  const percentages = results.map(r => (r.score / r.totalPoints) * 100);
  
  // Basic statistics
  const totalStudents = results.length;
  const averageScore = scores.reduce((a, b) => a + b, 0) / totalStudents;
  const highestScore = Math.max(...scores);
  const lowestScore = Math.min(...scores);
  
  // Median
  const sortedScores = [...scores].sort((a, b) => a - b);
  const medianScore = totalStudents % 2 === 0
    ? (sortedScores[totalStudents / 2 - 1] + sortedScores[totalStudents / 2]) / 2
    : sortedScores[Math.floor(totalStudents / 2)];
  
  // Standard deviation
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - averageScore, 2), 0) / totalStudents;
  const standardDeviation = Math.sqrt(variance);
  
  // Score distribution (by percentage ranges)
  const distributionRanges = [
    { range: '90-100%', min: 90, max: 100 },
    { range: '80-89%', min: 80, max: 89 },
    { range: '70-79%', min: 70, max: 79 },
    { range: '60-69%', min: 60, max: 69 },
    { range: '50-59%', min: 50, max: 59 },
    { range: 'Below 50%', min: 0, max: 49 },
  ];
  
  const scoreDistribution = distributionRanges.map(({ range, min, max }) => {
    const count = percentages.filter(p => p >= min && p <= max).length;
    return {
      range,
      count,
      percentage: (count / totalStudents) * 100,
    };
  });
  
  // Question-level analytics
  const questionAnalytics: QuestionAnalytics[] = config.questions.map(question => {
    const attempts = results.filter(r => 
      r.questionResults.some(qr => qr.questionId === question.id)
    );
    const correctCount = attempts.filter(r =>
      r.questionResults.find(qr => qr.questionId === question.id)?.correct
    ).length;
    const incorrectCount = attempts.length - correctCount;
    const accuracy = attempts.length > 0 ? (correctCount / attempts.length) * 100 : 0;
    
    // Determine difficulty based on accuracy
    let difficulty: QuestionAnalytics['difficulty'];
    if (accuracy >= 80) difficulty = 'Easy';
    else if (accuracy >= 60) difficulty = 'Medium';
    else if (accuracy >= 40) difficulty = 'Hard';
    else difficulty = 'Very Hard';
    
    return {
      questionId: question.id,
      label: question.label,
      totalAttempts: attempts.length,
      correctCount,
      incorrectCount,
      accuracy,
      difficulty,
    };
  });
  
  return {
    examTitle: config.title,
    totalStudents,
    averageScore,
    highestScore,
    lowestScore,
    medianScore,
    standardDeviation,
    scoreDistribution,
    questionAnalytics,
  };
}

function createEmptyAnalytics(config: ExamConfig): ExamAnalytics {
  return {
    examTitle: config.title,
    totalStudents: 0,
    averageScore: 0,
    highestScore: 0,
    lowestScore: 0,
    medianScore: 0,
    standardDeviation: 0,
    scoreDistribution: [
      { range: '90-100%', count: 0, percentage: 0 },
      { range: '80-89%', count: 0, percentage: 0 },
      { range: '70-79%', count: 0, percentage: 0 },
      { range: '60-69%', count: 0, percentage: 0 },
      { range: '50-59%', count: 0, percentage: 0 },
      { range: 'Below 50%', count: 0, percentage: 0 },
    ],
    questionAnalytics: config.questions.map(q => ({
      questionId: q.id,
      label: q.label,
      totalAttempts: 0,
      correctCount: 0,
      incorrectCount: 0,
      accuracy: 0,
      difficulty: 'Medium' as const,
    })),
  };
}

/**
 * Get difficulty color for UI display
 */
export function getDifficultyColor(difficulty: QuestionAnalytics['difficulty']): string {
  switch (difficulty) {
    case 'Easy': return '#10b981'; // green
    case 'Medium': return '#f59e0b'; // amber
    case 'Hard': return '#f97316'; // orange
    case 'Very Hard': return '#ef4444'; // red
  }
}

/**
 * Get grade letter based on percentage
 */
export function getGradeLetter(percentage: number): string {
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
}
