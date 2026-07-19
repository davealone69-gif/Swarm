import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AgentState } from '@/context/SwarmContext';
import { useColors } from '@/hooks/useColors';

const AGENT_CONFIG: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  ARCHITECT: { icon: 'construct-outline', color: '#7C4DFF' },
  CODER:     { icon: 'code-slash-outline', color: '#00E676' },
  BUILDER:   { icon: 'hammer-outline', color: '#FF6D00' },
  FIXER:     { icon: 'bug-outline', color: '#FF4444' },
  OPTIMIZER: { icon: 'flash-outline', color: '#00BCD4' },
};

export function AgentCard({ agent }: { agent: AgentState }) {
  const c = useColors();
  const pulse = useRef(new Animated.Value(0.3)).current;
  const slideIn = useRef(new Animated.Value(16)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideIn, { toValue: 0, duration: 280, useNativeDriver: true }),
      Animated.timing(fadeIn, { toValue: 1, duration: 280, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (agent.status === 'active') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1, duration: 480, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 0.3, duration: 480, useNativeDriver: true }),
        ]),
      ).start();
    } else {
      pulse.stopAnimation();
      Animated.timing(pulse, {
        toValue: agent.status === 'complete' ? 1 : 0.2,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [agent.status]);

  const cfg = AGENT_CONFIG[agent.name] ?? AGENT_CONFIG.ARCHITECT;
  const borderColor =
    agent.status === 'active'
      ? cfg.color + '55'
      : agent.status === 'complete'
      ? cfg.color + '30'
      : c.border;

  return (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: c.card,
          borderColor,
          opacity: fadeIn,
          transform: [{ translateY: slideIn }],
        },
      ]}
    >
      <View style={[styles.iconBox, { backgroundColor: cfg.color + '18' }]}>
        <Ionicons name={cfg.icon} size={18} color={cfg.color} />
      </View>

      <View style={styles.info}>
        <Text style={[styles.agentName, { color: cfg.color }]}>{agent.name}</Text>
        <Text style={[styles.action, { color: c.mutedForeground }]} numberOfLines={1}>
          {agent.action}
        </Text>
      </View>

      <Animated.View
        style={[
          styles.dot,
          {
            backgroundColor:
              agent.status === 'complete'
                ? '#00E676'
                : agent.status === 'active'
                ? cfg.color
                : c.mutedForeground,
            opacity: agent.status === 'active' ? pulse : agent.status === 'complete' ? 1 : 0.3,
          },
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  agentName: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 1.2,
  },
  action: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
