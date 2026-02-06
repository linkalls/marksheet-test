import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as Burnt from 'burnt';
import React, { useState, useEffect } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';

import { useSettings } from '@/context/settings-context';
import { Palette, Shadows, Radius, Typography, Spacing } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function SettingsScreen() {
  const { apiKey, modelName, debugMode, setApiKey, setModelName, setDebugMode } = useSettings();
  
  const [keyInput, setKeyInput] = useState('');
  const [modelInput, setModelInput] = useState('');
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    if (apiKey) setKeyInput(apiKey);
    setModelInput(modelName);
  }, [apiKey, modelName]);

  const handleSaveKey = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      await setApiKey(keyInput);
      Burnt.toast({
        title: 'API Key Saved',
        // message: 'Your OpenAI API key has been securely stored.',
        preset: 'done',
      });
    } catch (e) {
      Burnt.toast({
        title: 'Save Failed',
        message: 'Could not save API key.',
        preset: 'error',
      });
    }
  };

  const handleClearKey = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Clear API Key',
      'Are you sure you want to remove your API key?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await setApiKey(null);
            setKeyInput('');
            Burnt.toast({
              title: 'API Key Removed',
              preset: 'done',
            });
          },
        },
      ]
    );
  };

  const handleSaveModel = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await setModelName(modelInput);
    Burnt.toast({
      title: 'Model Updated',
      message: `Using model: ${modelInput}`,
      preset: 'done',
    });
  };

  const toggleDebug = async (val: boolean) => {
    Haptics.selectionAsync();
    await setDebugMode(val);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f172a', '#1e293b', '#334155']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <Text style={styles.heroTitle}>⚙️ Settings</Text>
            <Text style={styles.heroSubtitle}>Configure app behavior</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        
        {/* OpenAI Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>OpenAI Configuration</Text>
          <View style={styles.card}>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>API Key</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={keyInput}
                  onChangeText={setKeyInput}
                  placeholder="sk-..."
                  secureTextEntry={!showKey}
                  autoCapitalize="none"
                />
                <Pressable onPress={() => setShowKey(!showKey)} style={styles.iconBtn}>
                   <Text>{showKey ? '🙈' : '👁️'}</Text>
                </Pressable>
              </View>
              <View style={styles.btnRow}>
                <Pressable style={[styles.btn, styles.saveBtn]} onPress={handleSaveKey}>
                  <Text style={styles.btnText}>Save Key</Text>
                </Pressable>
                <Pressable style={[styles.btn, styles.clearBtn]} onPress={handleClearKey}>
                  <Text style={styles.clearBtnText}>Clear</Text>
                </Pressable>
              </View>
              <Text style={styles.hint}>
                Key is stored securely on your device.
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Model Name</Text>
              <TextInput
                style={styles.input}
                value={modelInput}
                onChangeText={setModelInput}
                onBlur={handleSaveModel}
                placeholder="gpt-4o"
                autoCapitalize="none"
              />
              <Text style={styles.hint}>Example: gpt-4o, gpt-4-turbo, gpt-3.5-turbo</Text>
            </View>

          </View>
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Application</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View>
                <Text style={styles.label}>Debug Mode</Text>
                <Text style={styles.hint}>Show additional logs and details</Text>
              </View>
              <Switch
                value={debugMode}
                onValueChange={toggleDebug}
                trackColor={{ false: '#cbd5e1', true: Palette.primary.solid }}
                thumbColor={'#fff'}
              />
            </View>
          </View>
        </View>

        {/* Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoText}>Marksheet Maker v1.0.0</Text>
          <Text style={styles.infoText}>Expo SDK {Constants.expoVersion}</Text>
        </View>

        <View style={{ height: 80 }} />
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
  content: {
    flex: 1,
    zIndex: 0,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingTop: Spacing.xl + 20,
    gap: Spacing.xl,
  },
  section: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Palette.neutral[500],
    marginLeft: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 13,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    ...Shadows.sm,
    gap: Spacing.lg,
  },
  inputGroup: {
    gap: Spacing.xs,
  },
  label: {
    ...Typography.h4,
    color: Palette.neutral[900],
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  input: {
    backgroundColor: Palette.neutral[100],
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12, // Fixed height feel
    fontSize: 16,
    color: Palette.neutral[900],
    borderWidth: 1,
    borderColor: 'transparent',
  },
  iconBtn: {
    padding: Spacing.sm,
  },
  btnRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  btn: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtn: {
    backgroundColor: Palette.primary.solid,
  },
  clearBtn: {
    backgroundColor: Palette.error.light,
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
  },
  clearBtnText: {
    color: Palette.error.solid,
    fontWeight: '600',
  },
  hint: {
    ...Typography.caption,
    color: Palette.neutral[500],
  },
  divider: {
    height: 1,
    backgroundColor: Palette.neutral[200],
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  infoText: {
    ...Typography.caption,
    color: Palette.neutral[400],
  },
});
