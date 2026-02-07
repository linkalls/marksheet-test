import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import * as Haptics from 'expo-haptics';
import * as Burnt from 'burnt';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useExam } from '@/context/exam-context';
import { gradeByVisionFromFile, type LocalInputFile } from '@/lib/openai';
import { getOptionLabel } from '@/lib/exam-utils';
import { Palette, Shadows, Radius, Typography, Spacing } from '@/constants/theme';
import type { OptionStyle } from '@/types/exam';

interface GradeRow {
  id: string;
  label: string;
  filled: number[] | null;
  correct: boolean;
  points: number;
  optionsCount: number;
  optionStyle: string;
}

function areArraysEqual(a: number[] | null, b: number[] | null): boolean {
  // Treat null as empty array for comparison
  const arrA = a || [];
  const arrB = b || [];
  if (arrA.length !== arrB.length) return false;
  const sortedA = [...arrA].sort((x, y) => x - y);
  const sortedB = [...arrB].sort((x, y) => x - y);
  return sortedA.every((val, index) => val === sortedB[index]);
}

export default function GraderScreen() {
  const { config, savedExams, gradingConfig, loadExamForGrading, clearGradingConfig } = useExam();
  // If a specific exam is loaded for grading, use it. Otherwise fallback to the current maker config.
  const targetConfig = gradingConfig ?? config;

  const [answerSheetFile, setAnswerSheetFile] = useState<LocalInputFile | null>(null);
  const [grading, setGrading] = useState(false);
  const [rows, setRows] = useState<GradeRow[]>([]);
  const [isSelectorVisible, setSelectorVisible] = useState(false);
  const [correctionRow, setCorrectionRow] = useState<GradeRow | null>(null);

  const maxPoints = useMemo(
    () => targetConfig.questions.filter((q) => q.type === 'mark').reduce((sum, q) => sum + q.points, 0),
    [targetConfig.questions]
  );

  const total = useMemo(() => rows.reduce((sum, row) => sum + row.points, 0), [rows]);
  const percentage = maxPoints > 0 ? Math.round((total / maxPoints) * 100) : 0;

  const pickAnswerSheetFile = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (result.canceled) {
      return;
    }
    const asset = result.assets[0];
    setAnswerSheetFile({
      uri: asset.uri,
      name: asset.name ?? 'answer-sheet.bin',
      mimeType: asset.mimeType,
    });
  };

  const runGrading = async () => {
    if (!answerSheetFile) {
      Alert.alert('Answer file required', 'Select a scanned answer sheet first.');
      return;
    }

    try {
      setGrading(true);
      const detected = await gradeByVisionFromFile(answerSheetFile, targetConfig);
      const markQuestions = targetConfig.questions.filter((q) => q.type === 'mark');

      const mapped: GradeRow[] = markQuestions.map((q) => {
        const found = detected.find((d) => d.id === q.id);
        const filled = found?.filled ?? null;
        const correct = areArraysEqual(filled, q.correctOptions ?? []);
        return {
          id: q.id,
          label: q.label,
          filled,
          correct,
          points: correct ? (q.points || 0) : 0,
          optionsCount: q.optionsCount ?? 4,
          optionStyle: q.optionStyle ?? 'alphabet',
        };
      });

      setRows(mapped);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Burnt.toast({
        title: '✅ Grading Complete',
        message: `Scored ${percentage}% (${total}/${maxPoints} pts)`,
        preset: 'done',
      });
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Burnt.toast({
        title: '❌ Grading Failed',
        message: String(error).slice(0, 100),
        preset: 'error',
      });
    } finally {
      setGrading(false);
    }
  };

  const handleManualCorrection = (row: GradeRow) => {
    Haptics.selectionAsync();
    setCorrectionRow(row);
  };

  const toggleCorrection = (id: string, index: number) => {
      // Find the row from state to get latest value
      const row = rows.find(r => r.id === id);
      if (!row) return;

      const current = row.filled || [];
      let next: number[];
      if (current.includes(index)) {
          next = current.filter(x => x !== index);
      } else {
          next = [...current, index].sort((a,b) => a-b);
      }
      applyCorrection(id, next);
  };

  const applyCorrection = (id: string, filled: number[] | null) => {
    // If empty array, treat as empty array (which areArraysEqual handles as match for [] or null)
    // But conceptually null means "no detection run" or "ambiguous"?
    // Here we toggle specific options, so [] is appropriate if user clears all.
    const finalFilled = filled;

    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;

        const question = targetConfig.questions.find((q) => q.id === id);
        // Correct check
        const isCorrect = areArraysEqual(finalFilled, question?.type === 'mark' ? (question.correctOptions ?? []) : []);
        
        const newRow = {
          ...row,
          filled: finalFilled,
          correct: isCorrect,
          points: isCorrect ? (question?.points || 0) : 0,
        };

        // Update the currently open correction modal row as well if it matches
        if (correctionRow?.id === id) {
             setCorrectionRow(newRow);
        }
        return newRow;
      })
    );
    Haptics.selectionAsync();
  };

  const formatFilled = (row: GradeRow) => {
      if (!row.filled || row.filled.length === 0) return 'None';
      return row.filled.map(i => getOptionLabel(row.optionStyle as OptionStyle, i)).join(', ');
  };

  return (
    <View style={styles.container}>
      {/* Hero Header with Gradient */}
      <LinearGradient
        colors={['#0f766e', '#0d9488', '#14b8a6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <Text style={styles.heroTitle}>📊 Grader</Text>
            <Text style={styles.heroSubtitle}>Scan & grade answer sheets with AI Vision</Text>
            
            {/* Score Display */}
            <View style={styles.scoreContainer}>
              <View style={styles.scoreRing}>
                <Text style={styles.scorePercentage}>{percentage}%</Text>
              </View>
              <View style={styles.scoreDetails}>
                <Text style={styles.scoreValue}>{total} / {maxPoints}</Text>
                <Text style={styles.scoreLabel}>Points Earned</Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Exam Selector Trigger */}
        <Pressable 
          style={styles.examSelectorCard}
          onPress={() => setSelectorVisible(true)}
        >
          <View style={styles.examSelectorContent}>
            <View>
              <Text style={styles.examSelectorLabel}>Current Exam {gradingConfig ? '(Saved)' : '(Draft)'}</Text>
              <Text style={styles.examSelectorTitle} numberOfLines={1}>
                {targetConfig.questions.length > 0 ? targetConfig.title : 'No Exam Selected'}
              </Text>
              <Text style={styles.examSelectorMeta}>
                {targetConfig.questions.length > 0 
                  ? `${targetConfig.questions.filter(q => q.type === 'mark').length} mark questions`
                  : 'Tap to select an exam'
                }
              </Text>
            </View>
            <View style={styles.examSelectorIconWrapper}>
              <Text style={styles.examSelectorIcon}>⇅</Text>
            </View>
          </View>
        </Pressable>

        {/* Modal for Exam Selection */}
        <Modal
          visible={isSelectorVisible}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setSelectorVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Exam</Text>
              <Pressable onPress={() => setSelectorVisible(false)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Close</Text>
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.modalContent}>
              {/* Option to use current Maker draft */}
              <Pressable
                style={[
                   styles.modalItem,
                   !gradingConfig && styles.modalItemActive
                ]}
                onPress={() => {
                   clearGradingConfig();
                   setSelectorVisible(false);
                   Haptics.selectionAsync();
                }}
              >
                 <View style={styles.modalItemInfo}>
                    <Text style={styles.modalItemTitle}>📝 Current Maker Draft</Text>
                    <Text style={styles.modalItemMeta}>Use the exam currently being edited</Text>
                 </View>
                 {!gradingConfig && <Text style={styles.checkIcon}>✓</Text>}
              </Pressable>

              {savedExams.length === 0 ? (
                <View style={styles.emptyListState}>
                  <Text style={styles.emptyListIcon}>📭</Text>
                  <Text style={styles.emptyListText}>No saved exams found.</Text>
                  <Text style={styles.emptyListSubtext}>Go to the Maker tab to create one.</Text>
                </View>
              ) : (
                savedExams.map((saved) => (
                  <Pressable
                    key={saved.id}
                    style={[
                      styles.modalItem,
                      gradingConfig?.title === saved.config.title && gradingConfig?.questions.length === saved.config.questions.length && styles.modalItemActive
                    ]}
                    onPress={() => {
                      loadExamForGrading(saved.id);
                      setSelectorVisible(false);
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                      Burnt.toast({
                        title: '✅ Exam Loaded',
                        message: `Ready to grade: ${saved.config.title}`,
                        preset: 'done', 
                      });
                    }}
                  >
                    <View style={styles.modalItemInfo}>
                      <Text style={styles.modalItemTitle}>{saved.config.title}</Text>
                      <Text style={styles.modalItemMeta}>
                        {saved.config.questions.length} questions • {new Date(saved.updatedAt).toLocaleDateString()}
                      </Text>
                    </View>
                    {gradingConfig?.title === saved.config.title && gradingConfig?.questions.length === saved.config.questions.length && (
                      <Text style={styles.checkIcon}>✓</Text>
                    )}
                  </Pressable>
                ))
              )}
            </ScrollView>
          </View>
        </Modal>

        {/* Modal for Manual Correction */}
        <Modal
          visible={!!correctionRow}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setCorrectionRow(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
               <View style={styles.modalHeader}>
                  <Text style={styles.cardIcon}>✏️</Text>
                  <Text style={styles.modalTitle} numberOfLines={1}>Correct {correctionRow?.label}</Text>
               </View>
               <Text style={styles.cardDescription}>
                 Tap options to toggle them.
               </Text>

               <View style={styles.correctionOptions}>
                 {correctionRow && Array.from({ length: correctionRow.optionsCount }).map((_, i) => {
                    const isSelected = correctionRow.filled?.includes(i);
                    const label = getOptionLabel(correctionRow.optionStyle as OptionStyle, i);
                    return (
                      <Pressable
                        key={i}
                        style={[styles.correctionOption, isSelected && styles.correctionOptionActive]}
                        onPress={() => toggleCorrection(correctionRow.id, i)}
                      >
                         <Text style={[styles.correctionOptionText, isSelected && styles.correctionOptionTextActive]}>
                           {label}
                         </Text>
                      </Pressable>
                    );
                 })}
               </View>

               <View style={styles.modalActions}>
                 <Pressable
                   style={[styles.modalButton, styles.modalButtonPrimary]}
                   onPress={() => setCorrectionRow(null)}
                 >
                   <Text style={styles.modalButtonTextPrimary}>Done</Text>
                 </Pressable>
               </View>
            </View>
          </View>
        </Modal>

        <View style={styles.glassCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>📷</Text>
            <Text style={styles.cardTitle}>Answer Sheet</Text>
          </View>
          <Text style={styles.cardDescription}>
            Upload a photo or scan of the filled answer sheet
          </Text>

          <Pressable style={styles.filePickerButton} onPress={pickAnswerSheetFile}>
            <Text style={styles.filePickerIcon}>📄</Text>
            <View style={styles.filePickerInfo}>
              <Text style={styles.filePickerLabel}>
                {answerSheetFile ? answerSheetFile.name : 'Select answer sheet'}
              </Text>
              <Text style={styles.filePickerHint}>PDF or image file</Text>
            </View>
          </Pressable>

          <Pressable
            style={styles.gradientButtonWrapper}
            onPress={runGrading}
            disabled={grading}
          >
            <LinearGradient
              colors={grading ? [Palette.neutral[400], Palette.neutral[500]] : ['#7c3aed', '#8b5cf6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              {grading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.gradientButtonText}>👁️ Grade with AI Vision</Text>
              )}
            </LinearGradient>
          </Pressable>
        </View>

        {/* Results */}
        {rows.length > 0 && (
          <View style={styles.glassCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>📋</Text>
              <Text style={styles.cardTitle}>Results</Text>
            </View>

            {rows.map((row) => (
              <Pressable
                key={row.id}
                style={[
                  styles.resultRow,
                  row.correct ? styles.resultRowCorrect : styles.resultRowIncorrect,
                ]}
                onPress={() => handleManualCorrection(row)}
              >
                <View style={styles.resultInfo}>
                  <Text style={styles.resultLabel}>{row.label}</Text>
                  <Text style={styles.resultFilled}>
                    Detected: {formatFilled(row)}
                  </Text>
                </View>
                <View style={styles.resultStatus}>
                  <Text style={[styles.resultIcon, row.correct ? styles.resultIconCorrect : styles.resultIconIncorrect]}>
                    {row.correct ? '✓' : '✗'}
                  </Text>
                  <Text style={[styles.resultPoints, row.correct ? styles.resultPointsCorrect : styles.resultPointsIncorrect]}>
                    {row.points} pts
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {/* Empty State */}
        {rows.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🎯</Text>
            <Text style={styles.emptyStateTitle}>Ready to Grade</Text>
            <Text style={styles.emptyStateText}>
              {'Select an answer sheet and tap "Grade with AI Vision" to start'}
            </Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background.primary,
  },
  header: {
    paddingBottom: Spacing.xl,
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
  },
  headerContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  heroTitle: {
    ...Typography.hero,
    color: '#fff',
    marginBottom: Spacing.xs,
  },
  heroSubtitle: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: Spacing.lg,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  scoreRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  scorePercentage: {
    ...Typography.h1,
    color: '#fff',
  },
  scoreDetails: {
    flex: 1,
  },
  scoreValue: {
    ...Typography.h2,
    color: '#fff',
  },
  scoreLabel: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.7)',
  },
  scrollView: {
    flex: 1,
    marginTop: -Spacing.md,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  glassCard: {
    backgroundColor: Palette.glass.card,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    ...Shadows.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  cardIcon: {
    fontSize: 20,
    marginRight: Spacing.sm,
  },
  cardTitle: {
    ...Typography.h3,
    color: Palette.neutral[900],
  },
  cardDescription: {
    ...Typography.caption,
    color: Palette.neutral[500],
    marginBottom: Spacing.md,
  },
  examSelectorCard: {
    backgroundColor: Palette.glass.card,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    ...Shadows.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  examSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  examSelectorLabel: {
    ...Typography.caption,
    color: Palette.neutral[500],
    marginBottom: 2,
  },
  examSelectorTitle: {
    ...Typography.h3,
    color: Palette.primary.solid,
    marginBottom: 2,
    flexShrink: 1,
  },
  examSelectorMeta: {
    ...Typography.small,
    color: Palette.neutral[400],
  },
  examSelectorIconWrapper: {
    backgroundColor: Palette.neutral[100],
    borderRadius: Radius.full,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  examSelectorIcon: {
    fontSize: 20,
    color: Palette.neutral[600],
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Palette.background.secondary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: Palette.neutral[200],
  },
  modalTitle: {
    ...Typography.h3,
  },
  closeButton: {
    padding: Spacing.sm,
  },
  closeButtonText: {
    ...Typography.bodyBold,
    color: Palette.primary.solid,
  },
  modalContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.neutral[200],
    ...Shadows.sm,
  },
  modalItemActive: {
    borderColor: Palette.primary.solid,
    backgroundColor: Palette.primary.light + '10',
  },
  modalItemInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  modalItemTitle: {
    ...Typography.bodyBold,
    fontSize: 16,
    marginBottom: 4,
    flexShrink: 1,
  },
  modalItemMeta: {
    ...Typography.small,
    color: Palette.neutral[500],
  },
  checkIcon: {
    fontSize: 18,
    color: Palette.primary.solid,
    fontWeight: 'bold',
  },
  emptyListState: {
    alignItems: 'center',
    marginTop: Spacing.xxxl,
    padding: Spacing.xl,
  },
  emptyListIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyListText: {
    ...Typography.h3,
    color: Palette.neutral[600],
    marginBottom: Spacing.xs,
  },
  emptyListSubtext: {
    ...Typography.body,
    color: Palette.neutral[400],
  },
  filePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.neutral[100],
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Palette.neutral[200],
    borderStyle: 'dashed',
  },
  filePickerIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  filePickerInfo: {
    flex: 1,
  },
  filePickerLabel: {
    ...Typography.bodyBold,
    color: Palette.neutral[700],
  },
  filePickerHint: {
    ...Typography.small,
    color: Palette.neutral[400],
  },
  gradientButtonWrapper: {
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  gradientButton: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  gradientButtonText: {
    ...Typography.button,
    color: '#fff',
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginTop: Spacing.sm,
  },
  resultRowCorrect: {
    backgroundColor: Palette.success.bg,
  },
  resultRowIncorrect: {
    backgroundColor: Palette.error.bg,
  },
  resultInfo: {
    flex: 1,
  },
  resultLabel: {
    ...Typography.bodyBold,
    color: Palette.neutral[900],
  },
  resultFilled: {
    ...Typography.small,
    color: Palette.neutral[600],
  },
  resultStatus: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  resultIcon: {
    fontSize: 24,
    fontWeight: '700',
  },
  resultIconCorrect: {
    color: Palette.success.dark,
  },
  resultIconIncorrect: {
    color: Palette.error.dark,
  },
  resultPoints: {
    ...Typography.caption,
    fontWeight: '700',
  },
  resultPointsCorrect: {
    color: Palette.success.dark,
  },
  resultPointsIncorrect: {
    color: Palette.error.dark,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
    gap: Spacing.sm,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  emptyStateTitle: {
    ...Typography.h2,
    color: Palette.neutral[400],
  },
  emptyStateText: {
    ...Typography.body,
    color: Palette.neutral[400],
    textAlign: 'center',
    maxWidth: 280,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    ...Shadows.lg,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: Palette.primary.solid,
  },
  modalButtonTextPrimary: {
    ...Typography.bodyBold,
    color: '#fff',
  },
  correctionOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  correctionOption: {
    width: 50,
    height: 50,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Palette.neutral[300],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.neutral[50],
  },
  correctionOptionActive: {
    backgroundColor: Palette.success.bg,
    borderColor: Palette.success.solid,
  },
  correctionOptionText: {
    ...Typography.bodyBold,
    color: Palette.neutral[600],
  },
  correctionOptionTextActive: {
    color: Palette.success.dark,
  },
});
