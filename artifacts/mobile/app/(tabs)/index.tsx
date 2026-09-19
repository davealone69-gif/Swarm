import React, { useRef, useState } from 'react';
import {
  Keyboard,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useSwarm } from '@/context/SwarmContext';
import { AgentCard } from '@/components/AgentCard';
import { analyzePrompt, ClarificationAnswers, ClarifyingQuestion, LocalAiPlan } from '@/utils/local-ai';

const QUICK_PROMPTS = [
  { label: 'Calculator', icon: 'calculator-outline' as const, prompt: 'Build a modern calculator app with scientific functions and memory' },
  { label: 'Notes',      icon: 'document-text-outline' as const, prompt: 'Build a minimalist notes app with formatting and search' },
  { label: 'To-Do',      icon: 'checkmark-done-outline' as const, prompt: 'Build a task manager app with priorities and completion tracking' },
  { label: 'Timer',      icon: 'timer-outline' as const, prompt: 'Build a precision timer and stopwatch with lap tracking' },
  { label: 'Weather',    icon: 'partly-sunny-outline' as const, prompt: 'Build a weather forecast app with 7-day view' },
  { label: 'Chat',       icon: 'chatbubbles-outline' as const, prompt: 'Build a real-time messaging app with bubble layout' },
];

const TERMINAL_BG = '#0D0D15';

export default function BuildScreen() {
  const insets = useSafeAreaInsets();
  const c = useColors();
  const { generateApp, isGenerating, agentStates, currentProject, lastError, clearError } = useSwarm();
  const [prompt, setPrompt] = useState('');
  const [activeChip, setActiveChip] = useState<number | null>(null);
  const [aiPlan, setAiPlan] = useState<LocalAiPlan | null>(null);
  const [answers, setAnswers] = useState<ClarificationAnswers>({});
  const scrollRef = useRef<ScrollView>(null);

  const showAgents = isGenerating || agentStates.some((a) => a.status !== 'idle');
  const allDone = !isGenerating && currentProject != null && agentStates.every((a) => a.status === 'complete');

  const handleChip = (idx: number) => {
    setActiveChip(idx);
    setPrompt(QUICK_PROMPTS[idx].prompt);
    if (Platform.OS !== 'web') Haptics.selectionAsync();
  };

  const startGeneration = async (clarifications: ClarificationAnswers = {}) => {
    if (!prompt.trim() || isGenerating) return;
    setAiPlan(null);
    Keyboard.dismiss();
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 200);
    await generateApp(prompt, clarifications);
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    const plan = analyzePrompt(prompt);
    if (plan.questions.length > 0) {
      setAnswers({});
      setAiPlan(plan);
      return;
    }
    await startGeneration();
  };

  const answerQuestion = (question: ClarifyingQuestion, answer: string) => {
    setAnswers((current) => ({ ...current, [question.id]: answer }));
  };

  const continueAfterQuestions = async () => {
    if (!aiPlan) return;
    const missing = aiPlan.questions.some((question) => question.required && !answers[question.id]);
    if (missing) return;
    await startGeneration(answers);
  };

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 16, paddingBottom: (Platform.OS === 'web' ? 34 : insets.bottom) + 100 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <View style={[styles.logoBox, { backgroundColor: '#00E67620', borderColor: '#00E67640' }]}>
              <Ionicons name="layers-outline" size={20} color="#00E676" />
            </View>
            <View>
              <Text style={[styles.title, { color: '#00E676' }]}>SWARM-BUILDER-ZERO</Text>
              <Text style={[styles.subtitle, { color: c.mutedForeground }]}>
                5-Agent Android App Generator
              </Text>
            </View>
            <View style={[styles.versionBadge, { backgroundColor: '#7C4DFF20', borderColor: '#7C4DFF40' }]}>
              <Text style={[styles.versionText, { color: '#7C4DFF' }]}>ALPHA</Text>
            </View>
          </View>

          {/* Stats row */}
          <View style={[styles.statsRow, { backgroundColor: TERMINAL_BG, borderColor: c.border }]}>
            {[
              { label: 'AGENTS', val: '5' },
              { label: 'TEMPLATES', val: '7' },
              { label: 'FILES/APP', val: '12' },
              { label: 'SDK', val: '35' },
            ].map((s) => (
              <View key={s.label} style={styles.statItem}>
                <Text style={[styles.statVal, { color: '#00E676' }]}>{s.val}</Text>
                <Text style={[styles.statLabel, { color: c.mutedForeground }]}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Quick Prompts ── */}
        <Text style={[styles.sectionLabel, { color: c.mutedForeground }]}>QUICK START</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {QUICK_PROMPTS.map((q, i) => (
            <TouchableOpacity
              key={q.label}
              style={[
                styles.chip,
                {
                  backgroundColor: activeChip === i ? '#00E67620' : c.card,
                  borderColor: activeChip === i ? '#00E676' : c.border,
                },
              ]}
              onPress={() => handleChip(i)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={q.icon}
                size={14}
                color={activeChip === i ? '#00E676' : c.mutedForeground}
              />
              <Text
                style={[
                  styles.chipText,
                  { color: activeChip === i ? '#00E676' : c.mutedForeground },
                ]}
              >
                {q.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Prompt Input ── */}
        <Text style={[styles.sectionLabel, { color: c.mutedForeground }]}>DESCRIBE YOUR APP</Text>
        <View style={[styles.inputWrapper, { backgroundColor: TERMINAL_BG, borderColor: c.border }]}>
          <Text style={[styles.promptPrefix, { color: '#00E676' }]}>{'> '}</Text>
          <TextInput
            style={[styles.input, { color: c.foreground }]}
            value={prompt}
            onChangeText={(t) => { setPrompt(t); setActiveChip(null); }}
            placeholder="Build a calculator app with scientific functions..."
            placeholderTextColor={c.mutedForeground}
            multiline
            numberOfLines={4}
            editable={!isGenerating}
          />
        </View>

        {/* ── Error ── */}
        {lastError && (
          <View style={[styles.errorBanner, { backgroundColor: '#FF444420', borderColor: '#FF444450' }]}>
            <Ionicons name="alert-circle-outline" size={16} color="#FF4444" />
            <Text style={[styles.errorText, { color: '#FF4444' }]}>{lastError}</Text>
            <TouchableOpacity onPress={clearError}>
              <Ionicons name="close" size={16} color="#FF4444" />
            </TouchableOpacity>
          </View>
        )}

        {/* ── Generate Button ── */}
        <Pressable
          style={({ pressed }) => [
            styles.generateBtn,
            {
              backgroundColor: isGenerating ? '#00E67640' : pressed ? '#00CC60' : '#00E676',
              opacity: !prompt.trim() ? 0.5 : 1,
            },
          ]}
          onPress={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
        >
          <Ionicons
            name={isGenerating ? 'hourglass-outline' : 'flash'}
            size={20}
            color={isGenerating ? '#00E676' : '#0A0A0F'}
          />
          <Text style={[styles.generateBtnText, { color: isGenerating ? '#00E676' : '#0A0A0F' }]}>
            {isGenerating ? 'GENERATING...' : 'GENERATE APP'}
          </Text>
        </Pressable>

        {/* ── Agent Cards ── */}
        {showAgents && (
          <View style={styles.agentsSection}>
            <View style={styles.agentsHeader}>
              <Text style={[styles.sectionLabel, { color: c.mutedForeground, marginBottom: 0 }]}>
                SWARM ACTIVITY
              </Text>
              {isGenerating && (
                <View style={[styles.liveBadge, { backgroundColor: '#FF444420', borderColor: '#FF444440' }]}>
                  <View style={styles.liveDot} />
                  <Text style={[styles.liveText, { color: '#FF4444' }]}>LIVE</Text>
                </View>
              )}
            </View>
            <View style={styles.agentsList}>
              {agentStates.map((agent) => (
                <AgentCard key={agent.name} agent={agent} />
              ))}
            </View>
          </View>
        )}

        {/* ── Success Card ── */}
        {allDone && currentProject && (
          <View style={[styles.successCard, { backgroundColor: '#00E67612', borderColor: '#00E67640' }]}>
            <View style={styles.successHeader}>
              <Ionicons name="checkmark-circle" size={22} color="#00E676" />
              <Text style={[styles.successTitle, { color: '#00E676' }]}>BUILD COMPLETE</Text>
            </View>
            <Text style={[styles.successAppName, { color: c.foreground }]}>
              {currentProject.name}
            </Text>
            <Text style={[styles.successDesc, { color: c.mutedForeground }]}>
              {currentProject.files.length} files generated · {currentProject.packageName}
            </Text>
            <View style={styles.successActions}>
              <TouchableOpacity
                style={[styles.successBtn, { backgroundColor: '#00E676', flex: 1 }]}
                onPress={() => { router.push('/(tabs)/explorer'); }}
              >
                <Ionicons name="folder-open-outline" size={16} color="#0A0A0F" />
                <Text style={[styles.successBtnText, { color: '#0A0A0F' }]}>Open Explorer</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.successBtnOutline, { borderColor: '#00E67650', flex: 1 }]}
                onPress={() => { setPrompt(''); setActiveChip(null); scrollRef.current?.scrollTo({ y: 0, animated: true }); }}
              >
                <Ionicons name="add" size={16} color="#00E676" />
                <Text style={[styles.successBtnOutlineText, { color: '#00E676' }]}>Build Another</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={aiPlan !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setAiPlan(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.aiSheet, { backgroundColor: c.card, borderColor: c.border }]}>
            <View style={styles.aiSheetHeader}>
              <View style={[styles.aiIcon, { backgroundColor: '#7C4DFF20', borderColor: '#7C4DFF50' }]}>
                <Ionicons name="sparkles-outline" size={20} color="#7C4DFF" />
              </View>
              <View style={styles.aiHeaderCopy}>
                <Text style={[styles.aiTitle, { color: c.foreground }]}>OFFLINE AI CHECK</Text>
                <Text style={[styles.aiSubtitle, { color: c.mutedForeground }]}>
                  No API key. No cloud credits. Nothing leaves this device.
                </Text>
              </View>
              <TouchableOpacity onPress={() => setAiPlan(null)} hitSlop={12}>
                <Ionicons name="close" size={20} color={c.mutedForeground} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.aiSummary, { color: c.foreground }]}>
              {aiPlan?.summary}
            </Text>
            <Text style={[styles.confidence, { color: '#FF6D00' }]}>
              CONFIDENCE {Math.round((aiPlan?.confidence ?? 0) * 100)}% · ANSWER TO CONTINUE
            </Text>

            <ScrollView
              style={styles.questionsScroll}
              contentContainerStyle={styles.questionsContent}
              showsVerticalScrollIndicator={false}
            >
              {aiPlan?.questions.map((question) => (
                <View key={question.id} style={styles.questionBlock}>
                  <Text style={[styles.questionTitle, { color: c.foreground }]}>{question.title}</Text>
                  <Text style={[styles.questionDetail, { color: c.mutedForeground }]}>{question.detail}</Text>
                  <View style={styles.optionsGrid}>
                    {question.options.map((option) => {
                      const selected = answers[question.id] === option;
                      return (
                        <TouchableOpacity
                          key={option}
                          style={[
                            styles.option,
                            {
                              backgroundColor: selected ? '#00E67618' : TERMINAL_BG,
                              borderColor: selected ? '#00E676' : c.border,
                            },
                          ]}
                          onPress={() => answerQuestion(question, option)}
                          activeOpacity={0.75}
                        >
                          <Ionicons
                            name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                            size={16}
                            color={selected ? '#00E676' : c.mutedForeground}
                          />
                          <Text style={[styles.optionText, { color: selected ? '#00E676' : c.foreground }]}>
                            {option}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[
                styles.continueButton,
                {
                  backgroundColor: aiPlan?.questions.some((q) => q.required && !answers[q.id])
                    ? '#00E67640'
                    : '#00E676',
                },
              ]}
              onPress={continueAfterQuestions}
              disabled={aiPlan?.questions.some((q) => q.required && !answers[q.id])}
            >
              <Ionicons name="flash" size={18} color="#0A0A0F" />
              <Text style={styles.continueText}>BUILD WITH THESE DECISIONS</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 16, gap: 4 },
  header: { gap: 12, marginBottom: 12 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoBox: {
    width: 38, height: 38, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  title: { fontSize: 14, fontFamily: 'Inter_700Bold', letterSpacing: 1.5 },
  subtitle: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 1 },
  versionBadge: {
    marginLeft: 'auto',
    borderRadius: 4, borderWidth: 1,
    paddingHorizontal: 7, paddingVertical: 3,
  },
  versionText: { fontSize: 9, fontFamily: 'Inter_600SemiBold', letterSpacing: 1 },
  statsRow: {
    flexDirection: 'row', borderRadius: 10, borderWidth: 1,
    paddingVertical: 12, paddingHorizontal: 8,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 3 },
  statVal: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  statLabel: { fontSize: 9, fontFamily: 'Inter_400Regular', letterSpacing: 0.8 },
  sectionLabel: { fontSize: 10, fontFamily: 'Inter_600SemiBold', letterSpacing: 1.2, marginTop: 12, marginBottom: 8 },
  chipsRow: { flexDirection: 'row', gap: 8, paddingBottom: 4 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: 20, borderWidth: 1,
    paddingHorizontal: 12, paddingVertical: 7,
  },
  chipText: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  inputWrapper: {
    borderRadius: 10, borderWidth: 1,
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: 12, paddingTop: 12, paddingBottom: 12,
    minHeight: 110,
  },
  promptPrefix: { fontFamily: 'monospace', fontSize: 14, marginTop: 2, marginRight: 4 },
  input: {
    flex: 1, fontFamily: 'Inter_400Regular', fontSize: 14,
    lineHeight: 21, textAlignVertical: 'top', minHeight: 84,
  },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderRadius: 8, borderWidth: 1, padding: 10, marginTop: 8,
  },
  errorText: { flex: 1, fontSize: 12, fontFamily: 'Inter_400Regular' },
  generateBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    borderRadius: 12, paddingVertical: 16, marginTop: 12,
  },
  generateBtnText: { fontSize: 15, fontFamily: 'Inter_700Bold', letterSpacing: 1.5 },
  agentsSection: { marginTop: 16, gap: 10 },
  agentsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: 4, borderWidth: 1, paddingHorizontal: 7, paddingVertical: 3,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF4444' },
  liveText: { fontSize: 9, fontFamily: 'Inter_600SemiBold', letterSpacing: 1 },
  agentsList: { gap: 6 },
  successCard: {
    borderRadius: 12, borderWidth: 1, padding: 16, gap: 8, marginTop: 16,
  },
  successHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  successTitle: { fontSize: 12, fontFamily: 'Inter_700Bold', letterSpacing: 1.5 },
  successAppName: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  successDesc: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  successActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  successBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderRadius: 8, paddingVertical: 10,
  },
  successBtnText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  successBtnOutline: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderRadius: 8, paddingVertical: 10, borderWidth: 1,
  },
  successBtnOutlineText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.72)',
  },
  aiSheet: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderWidth: 1,
    padding: 18,
    paddingBottom: Platform.OS === 'web' ? 24 : 30,
    maxHeight: '88%',
  },
  aiSheetHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  aiIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  aiHeaderCopy: { flex: 1, gap: 2 },
  aiTitle: { fontSize: 13, fontFamily: 'Inter_700Bold', letterSpacing: 1.2 },
  aiSubtitle: { fontSize: 10, fontFamily: 'Inter_400Regular' },
  aiSummary: { fontSize: 15, fontFamily: 'Inter_600SemiBold', marginTop: 18 },
  confidence: { fontSize: 9, fontFamily: 'Inter_700Bold', letterSpacing: 1, marginTop: 6 },
  questionsScroll: { marginTop: 14 },
  questionsContent: { gap: 18, paddingBottom: 14 },
  questionBlock: { gap: 6 },
  questionTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  questionDetail: { fontSize: 11, fontFamily: 'Inter_400Regular', lineHeight: 16 },
  optionsGrid: { gap: 7, marginTop: 3 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 9,
    borderWidth: 1,
    paddingHorizontal: 11,
    paddingVertical: 10,
  },
  optionText: { flex: 1, fontSize: 12, fontFamily: 'Inter_500Medium' },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 11,
    paddingVertical: 14,
    marginTop: 4,
  },
  continueText: { color: '#0A0A0F', fontSize: 12, fontFamily: 'Inter_700Bold', letterSpacing: 1 },
});
