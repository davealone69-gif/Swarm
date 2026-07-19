/**
 * SWARM-BUILDER-ZERO design tokens
 * Dark hacker/terminal aesthetic — both themes use the same dark palette
 * so the app always renders in dark mode regardless of system setting.
 */

const swarmDark = {
  text: '#E0E0E0',
  tint: '#00E676',

  background: '#0A0A0F',
  foreground: '#E0E0E0',

  card: '#111118',
  cardForeground: '#E0E0E0',

  primary: '#00E676',       // Matrix green — primary actions
  primaryForeground: '#0A0A0F',

  secondary: '#1A1A27',
  secondaryForeground: '#E0E0E0',

  muted: '#1A1A27',
  mutedForeground: '#6B6B8A',

  accent: '#FF6D00',        // Orange — warnings, accents
  accentForeground: '#FFFFFF',

  destructive: '#FF4444',
  destructiveForeground: '#FFFFFF',

  border: '#1E1E2E',
  input: '#1A1A27',

  // Swarm-specific
  agentPurple: '#7C4DFF',   // Agent activity indicator
  agentGreen: '#00E676',
  agentOrange: '#FF6D00',
  terminalBg: '#0D0D15',
};

const colors = {
  light: swarmDark,   // Force dark mode always
  dark: swarmDark,
  radius: 8,
};

export default colors;
