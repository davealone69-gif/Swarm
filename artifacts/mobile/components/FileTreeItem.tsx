import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GeneratedFile } from '@/utils/generators';
import { useColors } from '@/hooks/useColors';

function fileIcon(file: GeneratedFile): { name: keyof typeof Ionicons.glyphMap; color: string } {
  switch (file.language) {
    case 'kotlin':   return { name: 'logo-android', color: '#3DDC84' };
    case 'xml':      return { name: 'code-outline', color: '#FF6D00' };
    case 'gradle':   return { name: 'settings-outline', color: '#7C4DFF' };
    case 'toml':     return { name: 'document-outline', color: '#00BCD4' };
    case 'markdown': return { name: 'reader-outline', color: '#9E9E9E' };
    case 'python':   return { name: 'logo-python', color: '#FFD43B' };
    case 'yaml':     return { name: 'git-branch-outline', color: '#FF6D00' };
    case 'text':     return { name: 'document-text-outline', color: '#9E9E9E' };
    default:         return { name: 'document-text-outline', color: '#9E9E9E' };
  }
}

function getDepth(path: string): number {
  return Math.min(path.split('/').length - 1, 5);
}

function fileName(path: string): string {
  return path.split('/').pop() ?? path;
}

interface Props {
  file: GeneratedFile;
  onPress: () => void;
  selected?: boolean;
}

export function FileTreeItem({ file, onPress, selected = false }: Props) {
  const c = useColors();
  const icon = fileIcon(file);
  const depth = getDepth(file.path);
  const name = fileName(file.path);

  return (
    <TouchableOpacity
      style={[
        styles.row,
        {
          paddingLeft: 12 + depth * 14,
          backgroundColor: selected ? '#00E67614' : 'transparent',
          borderLeftWidth: selected ? 2 : 0,
          borderLeftColor: '#00E676',
        },
      ]}
      onPress={onPress}
      activeOpacity={0.65}
    >
      {/* Connector lines */}
      {depth > 0 && (
        <View style={[styles.connector, { borderColor: c.border }]} />
      )}

      <Ionicons name={icon.name} size={15} color={icon.color} />
      <Text
        style={[
          styles.name,
          { color: selected ? '#00E676' : c.foreground },
        ]}
        numberOfLines={1}
      >
        {name}
      </Text>

      <Text style={[styles.lang, { color: c.mutedForeground }]}>
        {file.language}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingRight: 12,
    gap: 8,
  },
  connector: {
    width: 10,
    height: 1,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    marginRight: -2,
  },
  name: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  lang: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0.5,
  },
});
