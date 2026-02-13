import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as Burnt from 'burnt';
import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useExam } from '@/context/exam-context';
import { Palette, Shadows, Radius, Typography, Spacing } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function ExamsScreen() {
  const router = useRouter();
  const { savedExams, loadSavedExam, deleteSavedExam, duplicateExam } = useExam();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredExams = savedExams.filter((exam) =>
    exam.config.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLoad = async (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await loadSavedExam(id);
    Burnt.toast({
      title: 'Exam Loaded',
      message: 'Switched to selected exam',
      preset: 'done',
    });
    router.push('/maker');
  };

  const handleDelete = (id: string, title: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Delete Exam',
      `Are you sure you want to delete "${title}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteSavedExam(id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Burnt.toast({
              title: 'Exam Deleted',
              message: 'Exam removed successfully',
              preset: 'done',
            });
          },
        },
      ]
    );
  };

  const handleDuplicate = async (e: any, id: string, title: string) => {
    e.stopPropagation();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await duplicateExam(id);
    Burnt.toast({
      title: 'Exam Duplicated',
      message: `Created a copy of "${title}"`,
      preset: 'done',
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#0f172a', '#1e293b', '#334155']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <Text style={styles.heroTitle}>📚 My Exams</Text>
            <Text style={styles.heroSubtitle}>Manage your saved exam templates</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <IconSymbol name="camera.fill" size={20} color={Palette.neutral[400]} style={{ marginRight: 8, opacity: 0 }} /> 
          {/* Using invisible icon for spacing or could map a search icon if added */}
          <Text style={{ marginRight: 8, fontSize: 16 }}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search exams..."
            placeholderTextColor={Palette.neutral[400]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {filteredExams.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📭</Text>
            <Text style={styles.emptyStateTitle}>No Exams Found</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery ? `No exams match "${searchQuery}"` : "You haven't saved any exams yet."}
            </Text>
          </View>
        ) : (
          filteredExams.map((exam) => (
            <Pressable
              key={exam.id}
              style={styles.examCard}
              onPress={() => handleLoad(exam.id)}
              onLongPress={() => handleDelete(exam.id, exam.config.title)}
            >
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{exam.config.title}</Text>
                  <Text style={styles.cardDate}>Last modified: {new Date(exam.updatedAt).toLocaleDateString()}</Text>
                </View>
                <View style={styles.cardActions}>
                  <Pressable
                    onPress={(e) => handleDuplicate(e, exam.id, exam.config.title)}
                    hitSlop={10}
                  >
                    <Text style={{ fontSize: 18, color: Palette.primary.solid }}>📋</Text>
                  </Pressable>
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      handleDelete(exam.id, exam.config.title);
                    }}
                    hitSlop={10}
                  >
                    <Text style={{ fontSize: 18, color: Palette.neutral[400] }}>🗑️</Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.cardStats}>
                <View style={styles.statBadge}>
                  <Text style={styles.statValue}>
                    {exam.config.questions.length}
                  </Text>
                  <Text style={styles.statLabel}>Questions</Text>
                </View>
                <View style={[styles.statBadge, { backgroundColor: Palette.primary.light + '20' }]}>
                  <Text style={[styles.statValue, { color: Palette.primary.solid }]}>
                    {exam.config.questions.reduce((sum, q) => sum + (q.points || 0), 0)}
                  </Text>
                  <Text style={[styles.statLabel, { color: Palette.primary.solid }]}>Points</Text>
                </View>
              </View>
            </Pressable>
          ))
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
    paddingBottom: Spacing.xl + 20,
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
    marginBottom: -20,
    zIndex: 1,
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
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    zIndex: 2,
    marginBottom: Spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    height: 48,
    ...Shadows.sm,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    color: Palette.neutral[900],
  },
  scrollView: {
    flex: 1,
    zIndex: 0,
  },
  content: {
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
    gap: Spacing.md,
  },
  examCard: {
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    ...Shadows.sm,
    borderLeftWidth: 4,
    borderLeftColor: Palette.primary.solid,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  cardActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'center',
  },
  cardTitle: {
    ...Typography.h3,
    color: Palette.neutral[900],
    marginBottom: 2,
    flexShrink: 1,
  },
  cardDate: {
    ...Typography.caption,
    color: Palette.neutral[500],
  },
  cardStats: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Palette.neutral[100],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  statValue: {
    ...Typography.bodyBold,
    color: Palette.neutral[700],
  },
  statLabel: {
    ...Typography.caption,
    color: Palette.neutral[500],
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  emptyStateTitle: {
    ...Typography.h3,
    color: Palette.neutral[400],
  },
  emptyStateText: {
    ...Typography.body,
    color: Palette.neutral[400],
    textAlign: 'center',
  },
});
