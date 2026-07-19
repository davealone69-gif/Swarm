import React from 'react';
import { FlatList, Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useSwarm } from '@/context/SwarmContext';
import { ProjectCard } from '@/components/ProjectCard';
import { GeneratedProject } from '@/utils/generators';

export default function ProjectsScreen() {
  const insets = useSafeAreaInsets();
  const c = useColors();
  const { projects, setCurrentProject, deleteProject } = useSwarm();

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const handlePress = (project: GeneratedProject) => {
    setCurrentProject(project);
    router.push('/(tabs)/explorer');
  };

  const handleDelete = (id: string) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    deleteProject(id);
  };

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: c.border }]}>
        <Text style={[styles.title, { color: '#00E676' }]}>PROJECTS</Text>
        <View style={[styles.countBadge, { backgroundColor: '#00E67618', borderColor: '#00E67640' }]}>
          <Text style={[styles.countText, { color: '#00E676' }]}>{projects.length}</Text>
        </View>
      </View>

      {projects.length === 0 ? (
        <View style={styles.empty}>
          <View style={[styles.emptyIcon, { backgroundColor: '#1A1A27', borderColor: '#1E1E2E' }]}>
            <Ionicons name="folder-open-outline" size={36} color="#6B6B8A" />
          </View>
          <Text style={[styles.emptyTitle, { color: c.foreground }]}>No Projects Yet</Text>
          <Text style={[styles.emptyDesc, { color: c.mutedForeground }]}>
            Go to the Build tab and generate your first Android app
          </Text>
        </View>
      ) : (
        <FlatList
          data={projects}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProjectCard
              project={item}
              onPress={() => handlePress(item)}
              onDelete={() => handleDelete(item.id)}
            />
          )}
          contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 80 }]}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={[styles.listLabel, { color: c.mutedForeground }]}>
              {projects.length} {projects.length === 1 ? 'project' : 'projects'} built
            </Text>
          }
        />
      )}
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
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1.5,
  },
  countBadge: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 22,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  listLabel: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    marginBottom: 10,
    letterSpacing: 0.4,
  },
});
