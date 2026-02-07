import React, { useEffect, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { logger, type LogEntry } from '@/lib/logger';
import { Palette, Radius, Shadows, Typography, Spacing } from '@/constants/theme';
import { useSettings } from '@/context/settings-context';

export function DebugConsole() {
  const insets = useSafeAreaInsets();
  const { debugMode } = useSettings();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Initial sync
    setLogs(logger.getLogs());
    // Subscribe
    return logger.subscribe((newLogs) => {
      setLogs(newLogs);
    });
  }, []);

  if (!debugMode) return null;

  if (!visible) {
    return (
      <Pressable
        style={[styles.trigger, { bottom: insets.bottom + 80 }]}
        onPress={() => setVisible(true)}
      >
        <Text style={styles.triggerText}>🐛</Text>
      </Pressable>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setVisible(false)}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { paddingTop: insets.top }]}>
          <View style={styles.header}>
            <Text style={styles.title}>Debug Console</Text>
            <View style={styles.actions}>
              <Pressable style={styles.actionBtn} onPress={() => logger.clear()}>
                <Text style={styles.actionText}>Clear</Text>
              </Pressable>
              <Pressable style={styles.actionBtn} onPress={() => setVisible(false)}>
                <Text style={styles.actionText}>Close</Text>
              </Pressable>
            </View>
          </View>
          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
            {logs.length === 0 ? (
              <Text style={styles.empty}>No logs yet.</Text>
            ) : (
              logs.map((log) => (
                <View key={log.id} style={styles.logRow}>
                  <Text style={styles.timestamp}>
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </Text>
                  <Text style={styles.message}>{log.message}</Text>
                  {log.data && (
                    <Text style={styles.data}>
                      {JSON.stringify(log.data, null, 2)}
                    </Text>
                  )}
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  trigger: {
    position: 'absolute',
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Palette.primary.solid,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.lg,
    zIndex: 9999,
  },
  triggerText: {
    fontSize: 24,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    flex: 1,
    backgroundColor: '#0f172a', // Dark theme for console
    marginTop: 60,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    backgroundColor: '#1e293b',
  },
  title: {
    ...Typography.h4,
    color: '#fff',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  actionBtn: {
    padding: Spacing.sm,
  },
  actionText: {
    ...Typography.bodyBold,
    color: Palette.primary.light,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  logRow: {
    marginBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    paddingBottom: Spacing.xs,
  },
  empty: {
    color: '#64748b',
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
  timestamp: {
    color: '#64748b',
    fontSize: 10,
    marginBottom: 2,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  message: {
    color: '#e2e8f0',
    fontSize: 12,
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: 'bold',
  },
  data: {
    color: '#94a3b8',
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});
