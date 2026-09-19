import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateProject, GeneratedProject, AgentProgress, AgentName } from '@/utils/generators';
import { applyClarifications, ClarificationAnswers } from '@/utils/local-ai';

const STORAGE_KEY = '@swarm_projects_v1';
const LESSONS_KEY = '@swarm_repair_lessons_v1';
const KNOWLEDGE_KEY = '@swarm_local_knowledge_v1';

export interface KnowledgeItem {
  id: string;
  name: string;
  kind: 'code' | 'skill';
  content: string;
  addedAt: number;
}

export interface AgentState {
  name: AgentName;
  label: string;
  action: string;
  status: 'idle' | 'active' | 'complete';
}

interface SwarmState {
  projects: GeneratedProject[];
  currentProject: GeneratedProject | null;
  isGenerating: boolean;
  agentStates: AgentState[];
  lastError: string | null;
  learnedLessons: string[];
  knowledge: KnowledgeItem[];
  generateApp: (prompt: string, answers?: ClarificationAnswers) => Promise<void>;
  importKnowledge: (item: Omit<KnowledgeItem, 'id' | 'addedAt'>) => Promise<void>;
  setCurrentProject: (p: GeneratedProject | null) => void;
  deleteProject: (id: string) => void;
  clearError: () => void;
}

const INITIAL_AGENTS: AgentState[] = [
  { name: 'ARCHITECT', label: 'Architect', action: 'Waiting for prompt…', status: 'idle' },
  { name: 'CODER',     label: 'Coder',     action: 'Waiting for prompt…', status: 'idle' },
  { name: 'BUILDER',   label: 'Builder',   action: 'Waiting for prompt…', status: 'idle' },
  { name: 'FIXER',     label: 'Fixer',     action: 'Waiting for prompt…', status: 'idle' },
  { name: 'OPTIMIZER', label: 'Optimizer', action: 'Waiting for prompt…', status: 'idle' },
];

const SwarmContext = createContext<SwarmState | null>(null);

export function SwarmProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<GeneratedProject[]>([]);
  const [currentProject, setCurrentProject] = useState<GeneratedProject | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [agentStates, setAgentStates] = useState<AgentState[]>(INITIAL_AGENTS);
  const [lastError, setLastError] = useState<string | null>(null);
  const [learnedLessons, setLearnedLessons] = useState<string[]>([]);
  const [knowledge, setKnowledge] = useState<KnowledgeItem[]>([]);

  // Load persisted projects on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const saved: GeneratedProject[] = JSON.parse(raw);
          setProjects(saved);
        } catch {
          // ignore parse errors
        }
      }
    });
    AsyncStorage.getItem(LESSONS_KEY).then((raw) => {
      if (raw) {
        try { setLearnedLessons(JSON.parse(raw)); } catch { /* ignore malformed local memory */ }
      }
    });
    AsyncStorage.getItem(KNOWLEDGE_KEY).then((raw) => {
      if (raw) {
        try { setKnowledge(JSON.parse(raw)); } catch { /* ignore malformed local memory */ }
      }
    });
  }, []);

  const persistProjects = useCallback(async (updated: GeneratedProject[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // storage errors are non-fatal
    }
  }, []);

  const generateApp = useCallback(async (prompt: string, answers: ClarificationAnswers = {}) => {
    if (isGenerating || !prompt.trim()) return;
    setIsGenerating(true);
    setLastError(null);

    // Reset agents
    setAgentStates(INITIAL_AGENTS.map((a) => ({ ...a, action: 'Standing by…', status: 'idle' })));

    try {
      const localReferences = knowledge
        .slice(-5)
        .map((item) => `Reference ${item.kind} "${item.name}":\n${item.content.slice(0, 12000)}`)
        .join('\n\n');
      const resolvedPrompt = applyClarifications(
        localReferences ? `${prompt}\n\nLocal references:\n${localReferences}` : prompt,
        answers,
      );
      const project = await generateProject(resolvedPrompt, (progress: AgentProgress) => {
        setAgentStates((prev) =>
          prev.map((a) =>
            a.name === progress.agent
              ? { ...a, action: progress.action, status: progress.status }
              : a,
          ),
        );
      }, answers, learnedLessons);

      const updated = [project, ...projects];
      setProjects(updated);
      setCurrentProject(project);
      await persistProjects(updated);
      const newLessons = project.repairReport?.lessons ?? [];
      if (newLessons.length > 0) {
        const mergedLessons = Array.from(new Set([...learnedLessons, ...newLessons])).slice(-20);
        setLearnedLessons(mergedLessons);
        await AsyncStorage.setItem(LESSONS_KEY, JSON.stringify(mergedLessons));
      }
    } catch (err) {
      setLastError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating, projects, persistProjects, knowledge, learnedLessons]);

  const importKnowledge = useCallback(async (item: Omit<KnowledgeItem, 'id' | 'addedAt'>) => {
    const saved: KnowledgeItem = {
      ...item,
      id: Date.now().toString() + Math.random().toString(36).slice(2, 8),
      addedAt: Date.now(),
    };
    const updated = [...knowledge, saved].slice(-10);
    setKnowledge(updated);
    await AsyncStorage.setItem(KNOWLEDGE_KEY, JSON.stringify(updated));
  }, [knowledge]);

  const deleteProject = useCallback(
    async (id: string) => {
      const updated = projects.filter((p) => p.id !== id);
      setProjects(updated);
      if (currentProject?.id === id) setCurrentProject(null);
      await persistProjects(updated);
    },
    [projects, currentProject, persistProjects],
  );

  return (
    <SwarmContext.Provider
      value={{
        projects,
        currentProject,
        isGenerating,
        agentStates,
        lastError,
        learnedLessons,
        knowledge,
        generateApp,
        importKnowledge,
        setCurrentProject,
        deleteProject,
        clearError: () => setLastError(null),
      }}
    >
      {children}
    </SwarmContext.Provider>
  );
}

export function useSwarm(): SwarmState {
  const ctx = useContext(SwarmContext);
  if (!ctx) throw new Error('useSwarm must be used within SwarmProvider');
  return ctx;
}
