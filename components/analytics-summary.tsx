import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Palette, Shadows, Radius, Typography, Spacing } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import type { ExamAnalytics } from '@/lib/analytics';

interface AnalyticsSummaryProps {
  analytics: ExamAnalytics;
  onViewDetails?: () => void;
}

export function AnalyticsSummary({ analytics, onViewDetails }: AnalyticsSummaryProps) {
  if (analytics.totalStudents === 0) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyIcon}>📊</Text>
        <Text style={styles.emptyText}>No grading data yet</Text>
        <Text style={styles.emptySubtext}>Grade some answer sheets to see analytics</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Palette.primary.solid, Palette.primary.dark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>📊 Exam Analytics</Text>
        <Text style={styles.headerSubtitle}>{analytics.examTitle}</Text>
      </LinearGradient>

      <View style={styles.content}>
        {/* Summary Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{analytics.totalStudents}</Text>
            <Text style={styles.statLabel}>Students</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: Palette.primary.solid }]}>
              {analytics.averageScore.toFixed(1)}
            </Text>
            <Text style={styles.statLabel}>Avg Score</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#10b981' }]}>
              {analytics.highestScore}
            </Text>
            <Text style={styles.statLabel}>Highest</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#ef4444' }]}>
              {analytics.lowestScore}
            </Text>
            <Text style={styles.statLabel}>Lowest</Text>
          </View>
        </View>

        {/* Score Distribution */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Score Distribution</Text>
          {analytics.scoreDistribution.slice(0, 3).map((dist, idx) => (
            <View key={idx} style={styles.distributionRow}>
              <Text style={styles.distributionLabel}>{dist.range}</Text>
              <View style={styles.distributionBarContainer}>
                <View
                  style={[
                    styles.distributionBar,
                    { width: `${dist.percentage}%` },
                  ]}
                />
              </View>
              <Text style={styles.distributionValue}>{dist.count}</Text>
            </View>
          ))}
        </View>

        {/* Question Difficulty */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Question Difficulty</Text>
          <View style={styles.difficultyGrid}>
            {['Easy', 'Medium', 'Hard', 'Very Hard'].map((level) => {
              const count = analytics.questionAnalytics.filter(q => q.difficulty === level).length;
              if (count === 0) return null;
              return (
                <View key={level} style={styles.difficultyBadge}>
                  <Text style={styles.difficultyCount}>{count}</Text>
                  <Text style={styles.difficultyLabel}>{level}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {onViewDetails && (
          <Pressable style={styles.detailsButton} onPress={onViewDetails}>
            <Text style={styles.detailsButtonText}>View Detailed Analytics</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    ...Shadows.md,
    overflow: 'hidden',
    marginVertical: Spacing.md,
  },
  header: {
    padding: Spacing.lg,
  },
  headerTitle: {
    ...Typography.h3,
    color: '#fff',
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.8)',
  },
  content: {
    padding: Spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: Palette.neutral[50],
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  statValue: {
    ...Typography.h2,
    color: Palette.neutral[900],
    marginBottom: Spacing.xs,
  },
  statLabel: {
    ...Typography.caption,
    color: Palette.neutral[500],
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.bodyBold,
    color: Palette.neutral[700],
    marginBottom: Spacing.md,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  distributionLabel: {
    ...Typography.caption,
    color: Palette.neutral[600],
    width: 80,
  },
  distributionBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: Palette.neutral[100],
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  distributionBar: {
    height: '100%',
    backgroundColor: Palette.primary.solid,
    borderRadius: Radius.full,
  },
  distributionValue: {
    ...Typography.caption,
    color: Palette.neutral[700],
    width: 30,
    textAlign: 'right',
  },
  difficultyGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Palette.neutral[100],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },
  difficultyCount: {
    ...Typography.bodyBold,
    color: Palette.neutral[700],
  },
  difficultyLabel: {
    ...Typography.caption,
    color: Palette.neutral[600],
  },
  detailsButton: {
    backgroundColor: Palette.primary.light + '20',
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  detailsButtonText: {
    ...Typography.bodyBold,
    color: Palette.primary.solid,
  },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    padding: Spacing.xxxl,
    alignItems: 'center',
    ...Shadows.sm,
    marginVertical: Spacing.md,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyText: {
    ...Typography.h3,
    color: Palette.neutral[400],
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    ...Typography.body,
    color: Palette.neutral[400],
    textAlign: 'center',
  },
});
