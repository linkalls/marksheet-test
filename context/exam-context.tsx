import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import type { ExamConfig } from '@/types/exam';
import { DEFAULT_EXAM_CONFIG } from '@/types/exam';

const EXAM_STORAGE_KEY = 'marksheet.saved.exams.v1';

export interface SavedExam {
  id: string;
  createdAt: string;
  updatedAt: string;
  config: ExamConfig;
}

interface ExamContextValue {
  config: ExamConfig;
  setConfig: React.Dispatch<React.SetStateAction<ExamConfig>>;
  savedExams: SavedExam[];
  ready: boolean;
  saveCurrentConfig: (titleOverride?: string) => Promise<void>;
  loadSavedExam: (id: string) => void;
  deleteSavedExam: (id: string) => Promise<void>;
  duplicateExam: (id: string) => Promise<void>;
  createNewExam: () => void;
  currentExamId: string | null;
  gradingConfig: ExamConfig | null;
  loadExamForGrading: (id: string) => void;
  clearGradingConfig: () => void;
}

const ExamContext = createContext<ExamContextValue | null>(null);

export function ExamProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<ExamConfig>(DEFAULT_EXAM_CONFIG);
  const [currentExamId, setCurrentExamId] = useState<string | null>(null);
  const [gradingConfig, setGradingConfig] = useState<ExamConfig | null>(null);
  const [savedExams, setSavedExams] = useState<SavedExam[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(EXAM_STORAGE_KEY);
        if (!raw) {
          return;
        }
        const parsed = JSON.parse(raw) as SavedExam[];
        if (mounted && Array.isArray(parsed)) {
          setSavedExams(parsed);
        }
      } catch {
        // Keep running even if local storage is malformed.
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

  const persistSavedExams = async (next: SavedExam[]) => {
    setSavedExams(next);
    await AsyncStorage.setItem(EXAM_STORAGE_KEY, JSON.stringify(next));
  };

  const saveCurrentConfig = async (titleOverride?: string) => {
    const now = new Date().toISOString();
    const normalizedTitle = (titleOverride ?? config.title).trim() || 'Untitled Exam';
    
    if (currentExamId) {
      // Update existing
      const next = savedExams.map((item) => 
        item.id === currentExamId 
          ? { ...item, updatedAt: now, config: { ...config, title: normalizedTitle } } 
          : item
      );
      // Move updated item to top? Or keep order? Usually move to top (LIFO) or just update in place.
      // Let's just update in place for now, or maybe sort by updatedAt in UI.
      // Actually, moving to top is better for "Recent".
      const updatedItem = next.find(x => x.id === currentExamId);
      const others = next.filter(x => x.id !== currentExamId);
      if (updatedItem) {
        await persistSavedExams([updatedItem, ...others]);
      }
    } else {
      // Create new
      const newId = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const entry: SavedExam = {
        id: newId,
        createdAt: now,
        updatedAt: now,
        config: {
          ...config,
          title: normalizedTitle,
        },
      };
      await persistSavedExams([entry, ...savedExams]);
      setCurrentExamId(newId);
    }
  };

  const loadSavedExam = (id: string) => {
    const found = savedExams.find((item) => item.id === id);
    if (!found) {
      return;
    }
    setConfig(found.config);
    setCurrentExamId(id);
  };

  const loadExamForGrading = (id: string) => {
    const found = savedExams.find((item) => item.id === id);
    if (!found) {
      return;
    }
    setGradingConfig(found.config);
  };

  const clearGradingConfig = () => {
    setGradingConfig(null);
  };

  const createNewExam = () => {
    setConfig(DEFAULT_EXAM_CONFIG);
    setCurrentExamId(null);
  };

  const deleteSavedExam = async (id: string) => {
    const next = savedExams.filter((item) => item.id !== id);
    await persistSavedExams(next);
  };

  const duplicateExam = async (id: string) => {
    const found = savedExams.find((item) => item.id === id);
    if (!found) {
      return;
    }
    const now = new Date().toISOString();
    const newId = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const entry: SavedExam = {
      id: newId,
      createdAt: now,
      updatedAt: now,
      config: {
        ...found.config,
        title: `${found.config.title} (Copy)`,
      },
    };
    await persistSavedExams([entry, ...savedExams]);
  };

  const value = useMemo(
    () => ({
      config,
      setConfig,
      savedExams,
      ready,
      saveCurrentConfig,
      loadSavedExam,
      deleteSavedExam,
      duplicateExam,
      createNewExam,
      currentExamId,
      gradingConfig,
      loadExamForGrading,
      clearGradingConfig,
    }),
    [config, savedExams, ready, currentExamId, gradingConfig],
  );
  return <ExamContext.Provider value={value}>{children}</ExamContext.Provider>;
}

export function useExam() {
  const value = useContext(ExamContext);
  if (!value) {
    throw new Error('useExam must be used inside ExamProvider');
  }
  return value;
}
