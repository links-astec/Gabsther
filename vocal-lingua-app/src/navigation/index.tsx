import React from 'react';
import { ActivityIndicator, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CompositeNavigationProp, NavigatorScreenParams } from '@react-navigation/native';
import { useAuth } from '@/context/AuthContext';
import { LoginScreen } from '@/screens/LoginScreen';
import { RegisterScreen } from '@/screens/RegisterScreen';
import { DashboardScreen } from '@/screens/DashboardScreen';
import { LessonsScreen } from '@/screens/LessonsScreen';
import { LessonDetailScreen } from '@/screens/LessonDetailScreen';
import { VoiceChatScreen } from '@/screens/VoiceChatScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';

/* ── Param lists ─────────────────────────────────────────────────────────── */

export type MainTabParamList = {
  Dashboard: undefined;
  Lessons: undefined;
  Speak: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  LessonDetail: { lessonId: number };
  VoiceChat: {
    lessonId?: number;
    scenario?: { emoji: string; label: string; prompt: string };
  };
  Login: undefined;
  Register: undefined;
};

/** Use this type for screens that live inside a tab but also need to push stack screens. */
export type TabScreenNavProp<T extends keyof MainTabParamList> = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, T>,
  NativeStackNavigationProp<RootStackParamList>
>;

/* ── Custom tab bar ──────────────────────────────────────────────────────── */

const TAB_ITEMS: Array<{ key: keyof MainTabParamList; label: string; icon: string; activeIcon: string }> = [
  { key: 'Dashboard', label: 'Home',    icon: '🏠', activeIcon: '🏠' },
  { key: 'Lessons',   label: 'Lessons', icon: '📚', activeIcon: '📚' },
  { key: 'Speak',     label: 'Speak',   icon: '🎙', activeIcon: '🎙' },
  { key: 'Profile',   label: 'Profile', icon: '👤', activeIcon: '👤' },
];

function CustomTabBar({ state, navigation }: { state: any; navigation: any }) {
  return (
    <View style={tabStyles.bar}>
      {TAB_ITEMS.map((item) => {
        const index = state.routes.findIndex((r: any) => r.name === item.key);
        const focused = state.index === index;
        return (
          <TouchableOpacity
            key={item.key}
            style={tabStyles.tab}
            onPress={() => navigation.navigate(item.key)}
            activeOpacity={0.7}
          >
            <Text style={[tabStyles.icon, focused && tabStyles.iconActive]}>
              {focused ? item.activeIcon : item.icon}
            </Text>
            <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>
              {item.label}
            </Text>
            {focused && <View style={tabStyles.dot} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const tabStyles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingBottom: 20,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 10,
  },
  tab: { flex: 1, alignItems: 'center', gap: 2 },
  icon: { fontSize: 22, opacity: 0.45 },
  iconActive: { opacity: 1 },
  label: { fontSize: 10, fontWeight: '600', color: '#9ca3af' },
  labelActive: { color: '#1d4ed8', fontWeight: '700' },
  dot: {
    position: 'absolute',
    bottom: -6,
    width: 4, height: 4, borderRadius: 2, backgroundColor: '#1d4ed8',
  },
});

/* ── Tab navigator ───────────────────────────────────────────────────────── */

const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Lessons"   component={LessonsScreen} />
      <Tab.Screen name="Speak"     component={VoiceChatScreen} />
      <Tab.Screen name="Profile"   component={ProfileScreen} />
    </Tab.Navigator>
  );
}

/* ── Root stack ──────────────────────────────────────────────────────────── */

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}>
        <ActivityIndicator size="large" color="#1d4ed8" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="MainTabs"    component={MainTabs} options={{ animation: 'none' }} />
            <Stack.Screen name="LessonDetail" component={LessonDetailScreen} />
            <Stack.Screen
              name="VoiceChat"
              component={VoiceChatScreen}
              options={{ animation: 'slide_from_bottom' }}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Login"    component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
