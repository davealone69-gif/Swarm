import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useSwarm } from '@/context/SwarmContext';
import { CodeView } from '@/components/CodeView';

export default function FileViewerScreen() {
  const insets = useSafeAreaInsets();
  const c = useColors();
  const { projects } = useSwarm();
  const { projectId, filePath } = useLocalSearchParams<{
    projectId: string;
    filePath: string;
  }>();

  const project = projects.find((p) => p.id === projectId);
  const file = project?.files.find((f) => f.path === filePath);
  const fileName = filePath?.split('/').pop() ?? 'File';

  return (
    <>
      <Stack.Screen
        options={{
          title: fileName,
          headerStyle: { backgroundColor: '#0A0A0F' },
          headerTintColor: '#00E676',
          headerTitleStyle: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
          headerBackTitle: 'Explorer',
        }}
      />
      <View style={[styles.root, { backgroundColor: '#0A0A0F' }]}>
        {/* File path breadcrumb */}
        <View style={[styles.breadcrumb, { borderBottomColor: '#1E1E2E' }]}>
          <Ionicons name="git-branch-outline" size={13} color="#6B6B8A" />
          <Text style={[styles.breadcrumbText, { color: '#6B6B8A' }]} numberOfLines={1}>
            {filePath}
          </Text>
        </View>

        {file ? (
          <CodeView code={file.content} language={file.language} fileName={fileName} />
        ) : (
          <View style={styles.notFound}>
            <Ionicons name="alert-circle-outline" size={32} color="#FF4444" />
            <Text style={[styles.notFoundText, { color: c.mutedForeground }]}>File not found</Text>
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  breadcrumbText: {
    flex: 1,
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0.3,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  notFoundText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
});
