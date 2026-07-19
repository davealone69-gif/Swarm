import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

const TERMINAL_BG = '#0D0D15';
const TERMINAL_FG = '#E0E0E0';

// Basic tokenizer for syntax highlighting
function tokenize(code: string, language: string): { text: string; color: string }[] {
  if (language === 'kotlin') return tokenizeKotlin(code);
  if (language === 'xml') return tokenizeXml(code);
  if (language === 'gradle') return tokenizeGradle(code);
  return [{ text: code, color: TERMINAL_FG }];
}

function tokenizeKotlin(code: string): { text: string; color: string }[] {
  const tokens: { text: string; color: string }[] = [];
  const keywords = /\b(fun|class|data|object|interface|val|var|when|if|else|for|while|return|import|package|override|private|public|protected|internal|companion|by|in|is|as|null|true|false|this|super|init|constructor|suspend|recompose|Composable|remember|mutableStateOf|LaunchedEffect)\b/g;
  const strings = /"[^"]*"/g;
  const comments = /\/\/[^\n]*/g;
  const numbers = /\b\d+\.?\d*[LfF]?\b/g;
  const annotations = /@\w+/g;
  
  let remaining = code;
  let offset = 0;
  
  // Simple line-by-line approach
  const lines = code.split('\n');
  let result = '';
  lines.forEach((line, i) => {
    tokens.push({ text: (i > 0 ? '\n' : '') + line, color: TERMINAL_FG });
  });
  
  // Return colored tokens for keywords
  return tokens.map(t => ({
    ...t,
    color: TERMINAL_FG,
  }));
}

function tokenizeXml(code: string): { text: string; color: string }[] {
  return [{ text: code, color: '#FF6D00' }];
}

function tokenizeGradle(code: string): { text: string; color: string }[] {
  return [{ text: code, color: '#7C4DFF' }];
}

// Color map per language
const LANG_COLORS: Record<string, string> = {
  kotlin: '#3DDC84',
  xml: '#FF6D00',
  gradle: '#7C4DFF',
  toml: '#00BCD4',
  markdown: '#9E9E9E',
};

interface Props {
  code: string;
  language: string;
  fileName?: string;
}

export function CodeView({ code, language, fileName }: Props) {
  const c = useColors();
  const [copied, setCopied] = useState(false);
  const langColor = LANG_COLORS[language] ?? '#9E9E9E';

  const handleCopy = async () => {
    await Clipboard.setStringAsync(code);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.split('\n');

  return (
    <View style={styles.container}>
      {/* Terminal chrome */}
      <View style={[styles.header, { backgroundColor: '#161620', borderBottomColor: '#1E1E2E' }]}>
        <View style={styles.trafficLights}>
          <View style={[styles.light, { backgroundColor: '#FF5F56' }]} />
          <View style={[styles.light, { backgroundColor: '#FFBD2E' }]} />
          <View style={[styles.light, { backgroundColor: '#27C93F' }]} />
        </View>
        <View style={[styles.langBadge, { backgroundColor: langColor + '20' }]}>
          <Text style={[styles.langText, { color: langColor }]}>{language.toUpperCase()}</Text>
        </View>
        <TouchableOpacity onPress={handleCopy} style={styles.copyBtn} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <Ionicons
            name={copied ? 'checkmark' : 'copy-outline'}
            size={16}
            color={copied ? '#00E676' : c.mutedForeground}
          />
        </TouchableOpacity>
      </View>

      {/* Code area */}
      <ScrollView horizontal showsHorizontalScrollIndicator style={styles.scrollH}>
        <ScrollView showsVerticalScrollIndicator style={styles.scrollV}>
          <View style={styles.codeContainer}>
            {/* Line numbers */}
            <View style={styles.lineNums}>
              {lines.map((_, i) => (
                <Text key={i} style={[styles.lineNum, { color: '#444455' }]}>
                  {i + 1}
                </Text>
              ))}
            </View>
            {/* Code */}
            <View style={styles.codeLines}>
              {lines.map((line, i) => (
                <Text key={i} style={[styles.codeLine, { color: getLineColor(line, language) }]}>
                  {line || ' '}
                </Text>
              ))}
            </View>
          </View>
        </ScrollView>
      </ScrollView>
    </View>
  );
}

function getLineColor(line: string, lang: string): string {
  const trimmed = line.trim();
  if (lang === 'kotlin') {
    if (trimmed.startsWith('//')) return '#6B6B8A';
    if (trimmed.startsWith('package ') || trimmed.startsWith('import ')) return '#7C4DFF';
    if (trimmed.startsWith('@')) return '#FF6D00';
    if (/^\s*(fun |class |data class|object |interface )/.test(line)) return '#00BCD4';
    if (/^\s*(val |var )/.test(line)) return '#00E676';
    return TERMINAL_FG;
  }
  if (lang === 'xml') {
    if (trimmed.startsWith('<!--')) return '#6B6B8A';
    if (trimmed.startsWith('<')) return '#FF6D00';
    if (trimmed.startsWith('android:')) return '#7C4DFF';
    return TERMINAL_FG;
  }
  if (lang === 'gradle') {
    if (trimmed.startsWith('//')) return '#6B6B8A';
    if (trimmed.startsWith('plugins') || trimmed.startsWith('android') || trimmed.startsWith('dependencies')) return '#7C4DFF';
    return TERMINAL_FG;
  }
  if (lang === 'toml') {
    if (trimmed.startsWith('#')) return '#6B6B8A';
    if (trimmed.startsWith('[')) return '#00BCD4';
    return TERMINAL_FG;
  }
  return TERMINAL_FG;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TERMINAL_BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 10,
  },
  trafficLights: {
    flexDirection: 'row',
    gap: 6,
  },
  light: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  langBadge: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  langText: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 1,
  },
  copyBtn: {},
  scrollH: {
    flex: 1,
  },
  scrollV: {
    flex: 1,
    paddingVertical: 12,
  },
  codeContainer: {
    flexDirection: 'row',
    paddingBottom: 40,
  },
  lineNums: {
    paddingHorizontal: 12,
    alignItems: 'flex-end',
    borderRightWidth: 1,
    borderRightColor: '#1E1E2E',
    marginRight: 12,
  },
  lineNum: {
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 20,
    minWidth: 28,
    textAlign: 'right',
  },
  codeLines: {
    paddingRight: 24,
  },
  codeLine: {
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 20,
  },
});
