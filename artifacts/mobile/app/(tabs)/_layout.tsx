import React from 'react';
import { Platform, StyleSheet, useColorScheme, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { Feather, Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { Tabs } from 'expo-router';
import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';
import { SymbolView } from 'expo-symbols';

function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: 'hammer', selected: 'hammer.fill' }} />
        <Label>Build</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="projects">
        <Icon sf={{ default: 'folder', selected: 'folder.fill' }} />
        <Label>Projects</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="explorer">
        <Icon sf={{ default: 'doc.text', selected: 'doc.text.fill' }} />
        <Label>Explorer</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const isDark = true; // SWARM is always dark
  const isIOS = Platform.OS === 'ios';
  const isWeb = Platform.OS === 'web';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#00E676',
        tabBarInactiveTintColor: '#6B6B8A',
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: isIOS ? 'transparent' : '#111118',
          borderTopWidth: 1,
          borderTopColor: '#1E1E2E',
          elevation: 0,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={80}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
          ) : isWeb ? (
            <View
              style={[StyleSheet.absoluteFill, { backgroundColor: '#111118' }]}
            />
          ) : null,
        tabBarLabelStyle: {
          fontFamily: 'Inter_500Medium',
          fontSize: 10,
          letterSpacing: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Build',
          tabBarIcon: ({ color, size }) =>
            isIOS ? (
              <SymbolView name="hammer" tintColor={color} size={size} />
            ) : (
              <Ionicons name="hammer-outline" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: 'Projects',
          tabBarIcon: ({ color, size }) =>
            isIOS ? (
              <SymbolView name="folder" tintColor={color} size={size} />
            ) : (
              <Ionicons name="folder-outline" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="explorer"
        options={{
          title: 'Explorer',
          tabBarIcon: ({ color, size }) =>
            isIOS ? (
              <SymbolView name="doc.text" tintColor={color} size={size} />
            ) : (
              <Ionicons name="code-slash-outline" size={22} color={color} />
            ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}
