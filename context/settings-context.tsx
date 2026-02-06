import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, DEFAULT_SETTINGS } from '@/constants/keys';

interface SettingsContextType {
  apiKey: string | null;
  modelName: string;
  debugMode: boolean;
  isLoading: boolean;
  setApiKey: (key: string | null) => Promise<void>;
  setModelName: (name: string) => Promise<void>;
  setDebugMode: (enabled: boolean) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [modelName, setModelNameState] = useState(DEFAULT_SETTINGS.MODEL_NAME);
  const [debugMode, setDebugModeState] = useState(DEFAULT_SETTINGS.DEBUG_MODE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Load API Key from SecureStore
      const key = await SecureStore.getItemAsync(STORAGE_KEYS.API_KEY);
      if (key) setApiKeyState(key);

      // Load other settings from AsyncStorage
      const model = await AsyncStorage.getItem(STORAGE_KEYS.MODEL_NAME);
      if (model) setModelNameState(model);

      const debug = await AsyncStorage.getItem(STORAGE_KEYS.DEBUG_MODE);
      if (debug) setDebugModeState(debug === 'true');
    } catch (e) {
      console.error('Failed to load settings', e);
    } finally {
      setIsLoading(false);
    }
  };

  const setApiKey = async (key: string | null) => {
    try {
      if (key) {
        await SecureStore.setItemAsync(STORAGE_KEYS.API_KEY, key);
      } else {
        await SecureStore.deleteItemAsync(STORAGE_KEYS.API_KEY);
      }
      setApiKeyState(key);
    } catch (e) {
      console.error('Failed to save API key', e);
      throw e;
    }
  };

  const setModelName = async (name: string) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.MODEL_NAME, name);
      setModelNameState(name);
    } catch (e) {
      console.error('Failed to save model name', e);
      throw e;
    }
  };

  const setDebugMode = async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.DEBUG_MODE, String(enabled));
      setDebugModeState(enabled);
    } catch (e) {
      console.error('Failed to save debug mode', e);
      throw e;
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        apiKey,
        modelName,
        debugMode,
        isLoading,
        setApiKey,
        setModelName,
        setDebugMode,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
