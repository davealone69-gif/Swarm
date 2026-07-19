import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GeneratedProject } from '@/utils/generators';
import { useColors } from '@/hooks/useColors';

const TYPE_CONFIG: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  calculator: { icon: 'calculator-outline', color: '#7C4DFF' },
  notes:      { icon: 'document-text-outline', color: '#00E676' },
  todo:       { icon: 'checkmark-done-outline', color: '#FF6D00' },
  timer:      { icon: 'timer-outline', color: '#00BCD4' },
  weather:    { icon: 'partly-sunny-outline', color: '#FFC107' },
  chat:       { icon: 'chatbubbles-outline', color: '#FF4444' },
  generic:    { icon: 'phone-portrait-outline', color: '#9E9E9E' },
};

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

interface Props {
  project: GeneratedProject;
  onPress: () => void;
  onDelete: () => void;
}

export function ProjectCard({ project, onPress, onDelete }: Props) {
  const c = useColors();
  const cfg = TYPE_CONFIG[project.appType] ?? TYPE_CONFIG.generic;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}
      onPress={onPress}
      activeOpacity={0.72}
    >
      <View style={[styles.iconBox, { backgroundColor: cfg.color + '18' }]}>
        <Ionicons name={cfg.icon} size={24} color={cfg.color} />
      </View>

      <View style={styles.content}>
        <Text style={[styles.name, { color: c.foreground }]} numberOfLines={1}>
          {project.name}
        </Text>
        <Text style={[styles.desc, { color: c.mutedForeground }]} numberOfLines={1}>
          {project.description}
        </Text>
        <View style={styles.meta}>
          <View style={[styles.badge, { backgroundColor: cfg.color + '20' }]}>
            <Text style={[styles.badgeText, { color: cfg.color }]}>
              {project.appType.toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.metaText, { color: c.mutedForeground }]}>
            {project.files.length} files
          </Text>
          <Text style={[styles.metaText, { color: c.mutedForeground }]}>
            {timeAgo(project.createdAt)}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={onDelete}
        hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
        style={styles.deleteBtn}
      >
        <Ionicons name="trash-outline" size={17} color={c.mutedForeground} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
  },
  desc: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  badge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 9,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.8,
  },
  metaText: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  deleteBtn: {
    padding: 4,
  },
});
