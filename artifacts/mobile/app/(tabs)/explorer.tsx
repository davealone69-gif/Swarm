import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useSwarm } from '@/context/SwarmContext';
import { FileTreeItem } from '@/components/FileTreeItem';
import { GeneratedFile } from '@/utils/generators';

// Group files by their directory
function buildTree(files: GeneratedFile[]): { dir: string; files: GeneratedFile[] }[] {
  const groups = new Map<string, GeneratedFile[]>();
  for (const f of files) {
    const parts = f.path.split('/');
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : 'root';
    if (!groups.has(dir)) groups.set(dir, []);
    groups.get(dir)!.push(f);
  }
  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dir, files]) => ({ dir, files }));
}

export default function ExplorerScreen() {
  const insets = useSafeAreaInsets();
  const c = useColors();
  const { currentProject, projects, setCurrentProject } = useSwarm();
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const handleFilePress = (file: GeneratedFile) => {
    if (!currentProject) return;
    setSelectedFilePath(file.path);
    router.push({
      pathname: '/file-viewer',
      params: { projectId: currentProject.id, filePath: file.path },
    });
  };

  // No current project
  if (!currentProject) {
    return (
      <View style={[styles.root, { backgroundColor: c.background }]}>
        <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: c.border }]}>
          <Text style={[styles.title, { color: '#00E676' }]}>EXPLORER</Text>
        </View>
        <View style={styles.empty}>
          <View style={[styles.emptyIcon, { backgroundColor: '#1A1A27', borderColor: '#1E1E2E' }]}>
            <Ionicons name="code-slash-outline" size={36} color="#6B6B8A" />
          </View>
          <Text style={[styles.emptyTitle, { color: c.foreground }]}>No Project Selected</Text>
          <Text style={[styles.emptyDesc, { color: c.mutedForeground }]}>
            {projects.length > 0
              ? 'Tap a project in the Projects tab to explore its files'
              : 'Generate an Android app first, then explore its code here'}
          </Text>
          {projects.length > 0 && (
            <TouchableOpacity
              style={[styles.navBtn, { backgroundColor: '#00E67620', borderColor: '#00E67640' }]}
              onPress={() => router.push('/(tabs)/projects')}
            >
              <Ionicons name="folder-open-outline" size={16} color="#00E676" />
              <Text style={[styles.navBtnText, { color: '#00E676' }]}>Open Projects</Text>
            </TouchableOpacity>
          )}
          {projects.length === 0 && (
            <TouchableOpacity
              style={[styles.navBtn, { backgroundColor: '#00E67620', borderColor: '#00E67640' }]}
              onPress={() => router.push('/(tabs)/index')}
            >
              <Ionicons name="flash-outline" size={16} color="#00E676" />
              <Text style={[styles.navBtnText, { color: '#00E676' }]}>Go to Build</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  const tree = buildTree(currentProject.files);

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: c.border }]}>
        <View style={[styles.appIcon, { backgroundColor: '#00E67618' }]}>
          <Ionicons name="logo-android" size={16} color="#00E676" />
        </View>
        <View style={styles.headerInfo}>
          <Text style={[styles.title, { color: '#00E676' }]} numberOfLines={1}>
            {currentProject.name.toUpperCase()}
          </Text>
          <Text style={[styles.subtitle, { color: c.mutedForeground }]} numberOfLines={1}>
            {currentProject.packageName}
          </Text>
        </View>
        <View style={[styles.fileBadge, { backgroundColor: '#1A1A27', borderColor: c.border }]}>
          <Text style={[styles.fileBadgeText, { color: c.mutedForeground }]}>
            {currentProject.files.length} files
          </Text>
        </View>
      </View>

      {/* Project selector strip */}
      {projects.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[styles.projectStrip, { borderBottomColor: c.border }]}
          contentContainerStyle={styles.projectStripContent}
        >
          {projects.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[
                styles.projectPill,
                {
                  backgroundColor: p.id === currentProject.id ? '#00E67620' : '#1A1A27',
                  borderColor: p.id === currentProject.id ? '#00E676' : c.border,
                },
              ]}
              onPress={() => setCurrentProject(p)}
            >
              <Text
                style={[
                  styles.projectPillText,
                  { color: p.id === currentProject.id ? '#00E676' : c.mutedForeground },
                ]}
              >
                {p.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* File Tree */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.tree, { paddingBottom: bottomPad + 80 }]}
      >
        {tree.map(({ dir, files: dirFiles }) => (
          <View key={dir} style={styles.dirGroup}>
            {/* Directory label */}
            <View style={[styles.dirLabel, { borderBottomColor: c.border }]}>
              <Ionicons name="folder-outline" size={13} color="#7C4DFF" />
              <Text style={[styles.dirName, { color: '#7C4DFF' }]}>
                {dir === 'root' ? '/' : dir}
              </Text>
            </View>
            {dirFiles.map((file) => (
              <FileTreeItem
                key={file.path}
                file={file}
                onPress={() => handleFilePress(file)}
                selected={selectedFilePath === file.path}
              />
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  appIcon: {
    width: 32, height: 32, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  headerInfo: { flex: 1, gap: 1 },
  title: { fontSize: 13, fontFamily: 'Inter_700Bold', letterSpacing: 1.2 },
  subtitle: { fontSize: 10, fontFamily: 'Inter_400Regular' },
  fileBadge: {
    borderRadius: 6, borderWidth: 1,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  fileBadgeText: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  projectStrip: {
    maxHeight: 44,
    borderBottomWidth: 1,
  },
  projectStripContent: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  projectPill: {
    borderRadius: 14, borderWidth: 1,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  projectPillText: { fontSize: 11, fontFamily: 'Inter_500Medium' },
  tree: { paddingTop: 8 },
  dirGroup: { marginBottom: 4 },
  dirLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
  dirName: { fontSize: 11, fontFamily: 'Inter_500Medium', letterSpacing: 0.4 },
  empty: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    gap: 12, paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 72, height: 72, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  emptyTitle: { fontSize: 18, fontFamily: 'Inter_600SemiBold', textAlign: 'center' },
  emptyDesc: {
    fontSize: 14, fontFamily: 'Inter_400Regular',
    textAlign: 'center', lineHeight: 22,
  },
  navBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: 8, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 10,
    marginTop: 4,
  },
  navBtnText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
});
