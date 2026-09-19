import { AppType, detectAppType } from './generators';

export interface ClarifyingQuestion {
  id: 'appType' | 'dataMode' | 'appName';
  title: string;
  detail: string;
  options: string[];
  required: boolean;
}

export interface LocalAiPlan {
  appType: AppType;
  confidence: number;
  summary: string;
  assumptions: string[];
  questions: ClarifyingQuestion[];
}

export type ClarificationAnswers = Record<string, string>;

/**
 * A deterministic, on-device planner. It intentionally does not call a paid
 * API, require an API key, or send the user's prompt off the device.
 */
export function analyzePrompt(prompt: string): LocalAiPlan {
  const text = prompt.trim();
  const lower = text.toLowerCase();
  const appType = detectAppType(text);
  const questions: ClarifyingQuestion[] = [];
  const assumptions: string[] = [];
  let confidence = appType === 'generic' ? 0.35 : 0.82;

  if (text.length < 12 || appType === 'generic') {
    confidence = 0.3;
    questions.push({
      id: 'appType',
      title: 'What should the app mainly do?',
      detail: 'The local AI could not confidently identify the main app workflow.',
      options: ['Calculator', 'Notes', 'To-do list', 'Timer', 'Weather', 'Chat', 'Something else'],
      required: true,
    });
  } else {
    assumptions.push(`Detected a ${appType} app from your prompt.`);
  }

  if (/\b(weather|forecast|chat|message|map|location|login|account|online|api|internet)\b/.test(lower)) {
    questions.push({
      id: 'dataMode',
      title: 'How should it work without paid services?',
      detail: 'To keep the builder 100% free, choose an offline-first behavior.',
      options: ['Offline/local data only', 'Use device features, no accounts'],
      required: true,
    });
  } else {
    assumptions.push('The generated app will work offline with local in-memory state.');
  }

  return {
    appType,
    confidence,
    summary: appType === 'generic'
      ? 'I need one detail before I can choose the right Android template.'
      : `I can build a ${appType} app from this prompt.`,
    assumptions,
    questions,
  };
}

export function applyClarifications(prompt: string, answers: ClarificationAnswers): string {
  const decisions = Object.entries(answers)
    .filter(([, value]) => value.trim())
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ');
  return decisions ? `${prompt.trim()}\n\nBuilder decisions: ${decisions}` : prompt.trim();
}