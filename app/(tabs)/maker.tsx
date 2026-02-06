import { LinearGradient } from 'expo-linear-gradient';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import * as Burnt from 'burnt';
import * as Haptics from 'expo-haptics';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useExam } from '@/context/exam-context';
import {
  generateExamConfigFromFile,
  gradeByVisionFromFile,
  type LocalInputFile,
} from '@/lib/openai';
import type { Question } from '@/types/exam';

import {
  createId,
  getOptionLabel,
  normalizeQuestion,
  optionStyles,
  textHeights,
} from '@/lib/exam-utils';

import { Palette, Shadows, Radius, Typography, Spacing } from '@/constants/theme';
import { generateExamPdf } from '@/lib/pdf-generator';

export default function MakerScreen() {
  const { config, setConfig, saveCurrentConfig, savedExams, loadSavedExam, deleteSavedExam, createNewExam } = useExam();

  const [sourceFile, setSourceFile] = useState<LocalInputFile | null>(null);
  const [answerKeyFile, setAnswerKeyFile] = useState<LocalInputFile | null>(null);

  const [isGeneratingFromFile, setIsGeneratingFromFile] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<string>(''); // For progress feedback
  const [isImportingAnswers, setIsImportingAnswers] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [optionCountDrafts, setOptionCountDrafts] = useState<Record<string, string>>({});
  const [selectedSavedId, setSelectedSavedId] = useState<string | null>(null);

  const markTotal = useMemo(
    () => config.questions.filter((q) => q.type === 'mark').reduce((sum, q) => sum + q.points, 0),
    [config.questions]
  );

  const updateQuestion = (id: string, patch: Partial<Question>) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setConfig((prev) => ({
      ...prev,
      questions: prev.questions.map((q, index) => (q.id === id ? normalizeQuestion({ ...q, ...patch } as Question, index) : q)),
    }));
  };

  const addMarkQuestion = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setConfig((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          id: createId(),
          type: 'mark',
          label: `Q${prev.questions.length + 1}`,
          points: 5,
          optionsCount: 4,
          optionStyle: 'alphabet',
          correctOption: null,
        },
      ],
    }));
  };

  const addTextQuestion = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setConfig((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          id: createId(),
          type: 'text',
          label: `Q${prev.questions.length + 1}`,
          points: 10,
          boxHeight: 'medium',
        },
      ],
    }));
  };

  const pickFile = async (): Promise<LocalInputFile | null> => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (result.canceled) {
      return null;
    }

    const asset = result.assets[0];
    return {
      uri: asset.uri,
      name: asset.name ?? 'upload.bin',
      mimeType: asset.mimeType,
    };
  };

  const pickSourceFile = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const picked = await pickFile();
    if (picked) {
      setSourceFile(picked);
    }
  };

  const pickAnswerKeyFile = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const picked = await pickFile();
    if (picked) {
      setAnswerKeyFile(picked);
    }
  };

  const handleNewExam = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Create New Exam',
      'Are you sure? Unsaved changes will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create New',
          style: 'destructive',
          onPress: () => {
             createNewExam();
             setSourceFile(null);
             setAnswerKeyFile(null);
             setOptionCountDrafts({});
             setSelectedSavedId(null);
             Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  const runAiGenerationFromFile = async () => {
    if (!sourceFile) {
      Alert.alert('Source file required', 'Select a PDF or image file first.');
      return;
    }

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsGeneratingFromFile(true);
      setGenerationStatus('Analyzing files...');
      
      const generated = await generateExamConfigFromFile(sourceFile, answerKeyFile || undefined);
      
      setConfig({
        title: generated.title,
        questions: generated.questions.map((q, index) => normalizeQuestion({ ...q, id: q.id || createId() }, index)),
      });
      Burnt.toast({
        title: '✨ Generation Complete',
        message: `${generated.questions.length} questions created`,
        preset: 'done',
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Burnt.toast({
        title: '❌ Generation Failed',
        message: String(error).slice(0, 100),
        preset: 'error',
      });
      console.log(error);
    } finally {
      setIsGeneratingFromFile(false);
      setGenerationStatus('');
    }
  };

  const importAnswerKey = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!answerKeyFile) {
      Alert.alert('Answer file required', 'Select a filled answer PDF/image first.');
      return;
    }

    try {
      setIsImportingAnswers(true);
      const answers = await gradeByVisionFromFile(answerKeyFile, config);

      setConfig((prev) => ({
        ...prev,
        questions: prev.questions.map((q) => {
          if (q.type !== 'mark') return q;
          const hit = answers.find((a) => a.id === q.id);
          if (!hit) return q;
          return {
            ...q,
            correctOption: hit.filled,
          };
        }),
      }));

      Burnt.toast({
        title: '✅ Import Complete',
        message: `Updated ${answers.length} mark questions`,
        preset: 'done',
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Burnt.toast({
        title: '❌ Import Failed',
        message: String(error).slice(0, 100),
        preset: 'error',
      });
    } finally {
      setIsImportingAnswers(false);
    }
  };

  const exportPdf = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      setIsExporting(true);
      const filePath = await generateExamPdf(config);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Alert.alert('PDF created', filePath);
      }
    } catch (error) {
      Alert.alert('PDF export failed', String(error));
    } finally {
      setIsExporting(false);
    }
  };

  const saveExam = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    try {
      await saveCurrentConfig();
      Alert.alert('Saved', 'Current exam has been saved locally.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert('Save failed', String(error));
    }
  };

  const onOptionCountChange = (questionId: string, value: string) => {
    setOptionCountDrafts((prev) => ({ ...prev, [questionId]: value }));
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed >= 2) {
      updateQuestion(questionId, { optionsCount: Math.floor(parsed), correctOption: null });
    }
  };

  const onOptionCountBlur = (questionId: string, currentValue: number | undefined) => {
    const raw = optionCountDrafts[questionId];
    if (raw == null) {
      return;
    }
    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed < 2) {
      updateQuestion(questionId, { optionsCount: Math.max(2, currentValue ?? 4), correctOption: null });
    }
    setOptionCountDrafts((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  };

  return (
    <View style={styles.container}>
      {/* Hero Header with Gradient */}
      <LinearGradient
        colors={['#1e1b4b', '#312e81', '#4c1d95']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <Text style={styles.heroTitle}>✨ Exam Maker</Text>
            <Text style={styles.heroSubtitle}>Create & manage your marksheets with AI</Text>
            <View style={styles.statsRow}>
              <View style={styles.statBadge}>
                <Text style={styles.statValue}>{config.questions.length}</Text>
                <Text style={styles.statLabel}>Questions</Text>
              </View>
              <View style={styles.statBadge}>
                <Text style={styles.statValue}>{markTotal}</Text>
                <Text style={styles.statLabel}>Total Points</Text>
              </View>
              <Pressable style={styles.statBadge} onPress={handleNewExam}>
                <Text style={styles.statValue}>+</Text>
                <Text style={styles.statLabel}>New</Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Card */}
        <View style={styles.glassCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>📝</Text>
            <Text style={styles.cardTitle}>Exam Title</Text>
          </View>
          <TextInput
            style={styles.titleInput}
            value={config.title}
            onChangeText={(text) => setConfig((prev) => ({ ...prev, title: text }))}
            placeholder="Enter exam title..."
            placeholderTextColor={Palette.neutral[400]}
          />
        </View>

        {/* AI Generation Card */}
        <View style={styles.glassCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>🤖</Text>
            <Text style={styles.cardTitle}>AI Generation</Text>
          </View>
          <Text style={styles.cardDescription}>Upload a PDF or image to auto-generate questions</Text>
          
          <Pressable style={styles.filePickerButton} onPress={pickSourceFile}>
            <Text style={styles.filePickerIcon}>📄</Text>
            <View style={styles.filePickerInfo}>
              <Text style={styles.filePickerLabel}>
                {sourceFile ? sourceFile.name : 'Select source file'}
              </Text>
              <Text style={styles.filePickerHint}>PDF, PNG, JPG supported</Text>
            </View>
          </Pressable>

          <View style={styles.divider} />

          <Text style={styles.inputLabel}>Optional: Answer Key / Correct Answers</Text>
          <Pressable style={styles.filePickerButton} onPress={pickAnswerKeyFile}>
            <Text style={styles.filePickerIcon}>🗝️</Text>
            <View style={styles.filePickerInfo}>
              <Text style={styles.filePickerLabel}>
                {answerKeyFile ? answerKeyFile.name : 'Select answer key (optional)'}
              </Text>
              <Text style={styles.filePickerHint}>
                Help AI determine correct answers
              </Text>
            </View>
            {answerKeyFile && (
              <Pressable onPress={() => setAnswerKeyFile(null)} style={{ padding: 4 }}>
                <Text style={{ fontSize: 18, color: Palette.neutral[400] }}>✕</Text>
              </Pressable>
            )}
          </Pressable>

          <Pressable 
            style={[styles.gradientButtonWrapper]} 
            onPress={runAiGenerationFromFile} 
            disabled={isGeneratingFromFile}
          >
            <LinearGradient
              colors={isGeneratingFromFile ? [Palette.neutral[400], Palette.neutral[500]] : [Palette.primary.start, Palette.primary.end]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              {isGeneratingFromFile ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.gradientButtonText}>{generationStatus || 'Processing...'}</Text>
                </View>
              ) : (
                <Text style={styles.gradientButtonText}>✨ Generate Exam Config</Text>
              )}
            </LinearGradient>
          </Pressable>
        </View>

        {/* Answer Key Import Card */}
        <View style={styles.glassCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>🎯</Text>
            <Text style={styles.cardTitle}>Answer Key Import</Text>
          </View>
          <Text style={styles.cardDescription}>Import correct answers from a filled sheet</Text>
          
          <Pressable style={styles.filePickerButton} onPress={pickAnswerKeyFile}>
            <Text style={styles.filePickerIcon}>📋</Text>
            <View style={styles.filePickerInfo}>
              <Text style={styles.filePickerLabel}>
                {answerKeyFile ? answerKeyFile.name : 'Select answer key'}
              </Text>
              <Text style={styles.filePickerHint}>PDF or image of filled answers</Text>
            </View>
          </Pressable>

          <Pressable 
            style={styles.gradientButtonWrapper} 
            onPress={importAnswerKey} 
            disabled={isImportingAnswers}
          >
            <LinearGradient
              colors={isImportingAnswers ? [Palette.neutral[400], Palette.neutral[500]] : [Palette.secondary.start, Palette.secondary.end]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              {isImportingAnswers ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.gradientButtonText}>👁️ Import with Vision AI</Text>
              )}
            </LinearGradient>
          </Pressable>
        </View>

        {/* Add Questions Row */}
        <View style={styles.addQuestionsRow}>
          <Pressable style={styles.addButton} onPress={addMarkQuestion}>
            <LinearGradient
              colors={['#7c3aed', '#8b5cf6']}
              style={styles.addButtonGradient}
            >
              <Text style={styles.addButtonIcon}>⭕</Text>
              <Text style={styles.addButtonText}>Add Mark</Text>
            </LinearGradient>
          </Pressable>
          
          <Pressable style={styles.addButton} onPress={addTextQuestion}>
            <LinearGradient
              colors={['#0891b2', '#06b6d4']}
              style={styles.addButtonGradient}
            >
              <Text style={styles.addButtonIcon}>📝</Text>
              <Text style={styles.addButtonText}>Add Text</Text>
            </LinearGradient>
          </Pressable>
        </View>

        {/* Action Buttons Row */}
        <View style={styles.actionButtonsRow}>
          <Pressable style={styles.actionButton} onPress={saveExam}>
            <Text style={styles.actionButtonIcon}>💾</Text>
            <Text style={styles.actionButtonText}>Save</Text>
          </Pressable>
          
          <Pressable 
            style={[styles.actionButton, styles.exportButton]} 
            onPress={exportPdf} 
            disabled={isExporting}
          >
            {isExporting ? (
              <ActivityIndicator color={Palette.primary.solid} size="small" />
            ) : (
              <>
                <Text style={styles.actionButtonIcon}>📤</Text>
                <Text style={[styles.actionButtonText, styles.exportButtonText]}>Export PDF</Text>
              </>
            )}
          </Pressable>
        </View>

        {/* Saved Exams Section */}
        {savedExams.length > 0 && (
          <View style={styles.glassCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>📚</Text>
              <Text style={styles.cardTitle}>Saved Exams</Text>
            </View>
            {savedExams.map((saved) => (
              <View key={saved.id} style={styles.savedExamRow}>
                <Pressable
                  style={[
                    styles.savedExamItem,
                    selectedSavedId === saved.id && styles.savedExamItemActive
                  ]}
                  onPress={() => {
                    loadSavedExam(saved.id);
                    setSelectedSavedId(saved.id);
                  }}
                >
                  <Text style={styles.savedExamTitle} numberOfLines={1}>
                    {saved.config.title}
                  </Text>
                  <Text style={styles.savedExamMeta}>
                    {saved.config.questions.length} questions • {new Date(saved.updatedAt).toLocaleDateString()}
                  </Text>
                </Pressable>
                <Pressable 
                  style={styles.deleteButton} 
                  onPress={() => void deleteSavedExam(saved.id)}
                >
                  <Text style={styles.deleteButtonText}>🗑️</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {/* Questions List */}
        {config.questions.map((q, index) => (
          <View key={q.id} style={styles.questionCard}>
            <View style={styles.questionHeader}>
              <View style={styles.questionBadge}>
                <Text style={styles.questionBadgeText}>#{index + 1}</Text>
              </View>
              <View style={styles.questionTypeToggle}>
                <Pressable
                  style={[styles.typeButton, q.type === 'mark' && styles.typeButtonActive]}
                  onPress={() =>
                    updateQuestion(q.id, {
                      type: 'mark',
                      optionsCount: q.optionsCount ?? 4,
                      optionStyle: q.optionStyle ?? 'alphabet',
                      correctOption: q.type === 'mark' ? q.correctOption ?? null : null,
                    })
                  }
                >
                  <Text style={[styles.typeButtonText, q.type === 'mark' && styles.typeButtonTextActive]}>
                    ⭕ Mark
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.typeButton, q.type === 'text' && styles.typeButtonActive]}
                  onPress={() => updateQuestion(q.id, { type: 'text', boxHeight: q.boxHeight ?? 'medium' })}
                >
                  <Text style={[styles.typeButtonText, q.type === 'text' && styles.typeButtonTextActive]}>
                    📝 Text
                  </Text>
                </Pressable>
              </View>
              <Pressable
                style={styles.questionDeleteButton}
                onPress={() =>
                  setConfig((prev) => ({ ...prev, questions: prev.questions.filter((x) => x.id !== q.id) }))
                }
              >
                <Text style={styles.questionDeleteText}>✕</Text>
              </Pressable>
            </View>

            <View style={styles.questionInputRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Label</Text>
                <TextInput
                  style={styles.questionInput}
                  value={q.label}
                  onChangeText={(value) => updateQuestion(q.id, { label: value })}
                  placeholder="Q1"
                  placeholderTextColor={Palette.neutral[400]}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Points</Text>
                <TextInput
                  style={styles.questionInput}
                  keyboardType="numeric"
                  value={String(q.points)}
                  onChangeText={(value) => updateQuestion(q.id, { points: Number(value) || 0 })}
                  placeholder="5"
                  placeholderTextColor={Palette.neutral[400]}
                />
              </View>
            </View>

            {q.type === 'mark' ? (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Number of Options</Text>
                  <TextInput
                    style={styles.questionInput}
                    keyboardType="numeric"
                    value={optionCountDrafts[q.id] ?? String(q.optionsCount ?? 4)}
                    onChangeText={(value) => onOptionCountChange(q.id, value)}
                    onBlur={() => onOptionCountBlur(q.id, q.optionsCount)}
                    placeholder="4"
                    placeholderTextColor={Palette.neutral[400]}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Option Style</Text>
                  <View style={styles.optionStyleRow}>
                    {optionStyles.map((style) => (
                      <Pressable
                        key={style}
                        style={[styles.optionStyleChip, q.optionStyle === style && styles.optionStyleChipActive]}
                        onPress={() => updateQuestion(q.id, { optionStyle: style })}
                      >
                        <Text style={[styles.optionStyleText, q.optionStyle === style && styles.optionStyleTextActive]}>
                          {style === 'number' ? '123' : style === 'alphabet' ? 'ABC' : style === 'kana' ? 'あいう' : 'イロハ'}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Correct Answer</Text>
                  <View style={styles.answerRow}>
                    {Array.from({ length: Math.max(2, q.optionsCount ?? 4) }).map((_, i) => (
                      <Pressable
                        key={`${q.id}_${i}`}
                        style={[styles.answerChip, q.correctOption === i && styles.answerChipActive]}
                        onPress={() => updateQuestion(q.id, { correctOption: i })}
                      >
                        <Text style={[styles.answerChipText, q.correctOption === i && styles.answerChipTextActive]}>
                          {getOptionLabel(q.optionStyle ?? 'alphabet', i)}
                        </Text>
                      </Pressable>
                    ))}
                    <Pressable 
                      style={styles.clearAnswerChip} 
                      onPress={() => updateQuestion(q.id, { correctOption: null })}
                    >
                      <Text style={styles.clearAnswerText}>Clear</Text>
                    </Pressable>
                  </View>
                </View>
              </>
            ) : (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Box Height</Text>
                <View style={styles.optionStyleRow}>
                  {textHeights.map((height) => (
                    <Pressable
                      key={height}
                      style={[styles.optionStyleChip, q.boxHeight === height && styles.optionStyleChipActive]}
                      onPress={() => updateQuestion(q.id, { boxHeight: height })}
                    >
                      <Text style={[styles.optionStyleText, q.boxHeight === height && styles.optionStyleTextActive]}>
                        {height === 'small' ? '⬜' : height === 'medium' ? '⬜⬜' : '⬜⬜⬜'} {height}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
          </View>
        ))}

        {/* Empty State */}
        {config.questions.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📋</Text>
            <Text style={styles.emptyStateTitle}>No questions yet</Text>
            <Text style={styles.emptyStateText}>
              Add mark or text questions, or use AI to generate from a file
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
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  statValue: {
    ...Typography.h2,
    color: '#fff',
  },
  statLabel: {
    ...Typography.small,
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
  titleInput: {
    backgroundColor: Palette.neutral[100],
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    ...Typography.body,
    color: Palette.neutral[900],
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
  addQuestionsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  addButton: {
    flex: 1,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Shadows.md,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  addButtonIcon: {
    fontSize: 20,
  },
  addButtonText: {
    ...Typography.button,
    color: '#fff',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.glass.card,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    ...Shadows.sm,
    borderWidth: 1,
    borderColor: Palette.neutral[200],
  },
  exportButton: {
    backgroundColor: Palette.primary.light + '20',
    borderColor: Palette.primary.light,
  },
  actionButtonIcon: {
    fontSize: 18,
  },
  actionButtonText: {
    ...Typography.button,
    color: Palette.neutral[700],
  },
  exportButtonText: {
    color: Palette.primary.dark,
  },
  savedExamRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  savedExamItem: {
    flex: 1,
    backgroundColor: Palette.neutral[100],
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  savedExamItemActive: {
    backgroundColor: Palette.primary.light + '20',
    borderColor: Palette.primary.light,
  },
  savedExamTitle: {
    ...Typography.bodyBold,
    color: Palette.neutral[900],
  },
  savedExamMeta: {
    ...Typography.small,
    color: Palette.neutral[500],
  },
  deleteButton: {
    backgroundColor: Palette.error.bg,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 18,
  },
  questionCard: {
    backgroundColor: Palette.glass.card,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    ...Shadows.sm,
    borderWidth: 1,
    borderColor: Palette.neutral[200],
    gap: Spacing.md,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  questionBadge: {
    backgroundColor: Palette.primary.solid,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  questionBadgeText: {
    ...Typography.caption,
    color: '#fff',
    fontWeight: '700',
  },
  questionTypeToggle: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Palette.neutral[100],
    borderRadius: Radius.md,
    padding: Spacing.xs,
    gap: Spacing.xs,
  },
  typeButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: Radius.sm,
  },
  typeButtonActive: {
    backgroundColor: '#fff',
    ...Shadows.sm,
  },
  typeButtonText: {
    ...Typography.caption,
    color: Palette.neutral[500],
  },
  typeButtonTextActive: {
    color: Palette.primary.solid,
    fontWeight: '600',
  },
  questionDeleteButton: {
    backgroundColor: Palette.error.bg,
    borderRadius: Radius.full,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionDeleteText: {
    color: Palette.error.solid,
    fontWeight: '700',
    fontSize: 14,
  },
  questionInputRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  inputGroup: {
    flex: 1,
    gap: Spacing.xs,
  },
  inputLabel: {
    ...Typography.caption,
    color: Palette.neutral[500],
  },
  questionInput: {
    backgroundColor: Palette.neutral[100],
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    ...Typography.body,
    color: Palette.neutral[900],
  },
  optionStyleRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  optionStyleChip: {
    backgroundColor: Palette.neutral[100],
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionStyleChipActive: {
    backgroundColor: Palette.primary.light + '30',
    borderColor: Palette.primary.light,
  },
  optionStyleText: {
    ...Typography.caption,
    color: Palette.neutral[600],
  },
  optionStyleTextActive: {
    color: Palette.primary.dark,
    fontWeight: '600',
  },
  answerRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  answerChip: {
    backgroundColor: Palette.neutral[100],
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 44,
    alignItems: 'center',
  },
  answerChipActive: {
    backgroundColor: Palette.success.bg,
    borderColor: Palette.success.solid,
  },
  answerChipText: {
    ...Typography.bodyBold,
    color: Palette.neutral[600],
  },
  answerChipTextActive: {
    color: Palette.success.dark,
  },
  clearAnswerChip: {
    backgroundColor: Palette.neutral[200],
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  clearAnswerText: {
    ...Typography.caption,
    color: Palette.neutral[500],
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
  divider: {
    height: 1,
    backgroundColor: Palette.neutral[200],
    marginVertical: Spacing.md,
  },
});
