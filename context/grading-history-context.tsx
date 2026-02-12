import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ExamConfig } from '@/types/exam';

const GRADING_HISTORY_KEY = 'marksheet.grading.history.v1';

export interface GradingRecord {
  id: string;
  examId: string;
  examTitle: string;
  studentName?: string;
  score: number;
  totalPoints: number;
  percentage: number;
  gradedAt: string;
  questionResults: {
    questionId: string;
    label: string;
    points: number;
    maxPoints: number;
    correct: boolean;
    filled: number[] | null;
  }[];
}

interface GradingHistoryContextValue {
  records: GradingRecord[];
  ready: boolean;
  addGradingRecord: (
    config: ExamConfig,
    score: number,
    totalPoints: number,
    questionResults: GradingRecord['questionResults'],
    studentName?: string
  ) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  getRecordsForExam: (examTitle: string) => GradingRecord[];
}

const GradingHistoryContext = createContext<GradingHistoryContextValue | null>(null);

export function GradingHistoryProvider({ children }: { children: React.ReactNode }) {
  const [records, setRecords] = useState<GradingRecord[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(GRADING_HISTORY_KEY);
        if (!raw) {
          return;
        }
        const parsed = JSON.parse(raw) as GradingRecord[];
        if (mounted && Array.isArray(parsed)) {
          setRecords(parsed);
        }
      } catch {
        // Keep running even if storage is malformed
      } finally {
        if (mounted) {
          setReady(true);
        }
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const persistRecords = async (next: GradingRecord[]) => {
    setRecords(next);
    await AsyncStorage.setItem(GRADING_HISTORY_KEY, JSON.stringify(next));
  };

  const addGradingRecord = async (
    config: ExamConfig,
    score: number,
    totalPoints: number,
    questionResults: GradingRecord['questionResults'],
    studentName?: string
  ) => {
    const now = new Date().toISOString();
    const newId = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    
    const record: GradingRecord = {
      id: newId,
      examId: `exam_${config.title.replace(/[^a-z0-9]/gi, '_')}`,
      examTitle: config.title,
      studentName,
      score,
      totalPoints,
      percentage: totalPoints > 0 ? (score / totalPoints) * 100 : 0,
      gradedAt: now,
      questionResults,
    };

    await persistRecords([record, ...records]);
  };

  const deleteRecord = async (id: string) => {
    const next = records.filter((r) => r.id !== id);
    await persistRecords(next);
  };

  const clearHistory = async () => {
    await persistRecords([]);
  };

  const getRecordsForExam = (examTitle: string): GradingRecord[] => {
    return records.filter((r) => r.examTitle === examTitle);
  };

  return (
    <GradingHistoryContext.Provider
      value={{
        records,
        ready,
        addGradingRecord,
        deleteRecord,
        clearHistory,
        getRecordsForExam,
      }}
    >
      {children}
    </GradingHistoryContext.Provider>
  );
}

export function useGradingHistory() {
  const value = useContext(GradingHistoryContext);
  if (!value) {
    throw new Error('useGradingHistory must be used inside GradingHistoryProvider');
  }
  return value;
}
