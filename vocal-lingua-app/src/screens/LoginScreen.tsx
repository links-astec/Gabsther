import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation';
import { useAuth } from '@/context/AuthContext';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Login'> };

export function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password) return;
    setLoading(true);
    setError('');
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Gradient accent bar */}
      <View style={styles.accentBar}>
        <View style={[styles.accentSeg, { backgroundColor: '#1d4ed8', flex: 2 }]} />
        <View style={[styles.accentSeg, { backgroundColor: '#6366f1', flex: 1 }]} />
        <View style={[styles.accentSeg, { backgroundColor: '#ef4444', flex: 1 }]} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Logo */}
          <View style={styles.logoSection}>
            <View style={styles.iconBox}>
              <Text style={styles.micGlyph}>🎙</Text>
            </View>
            <Text style={styles.appName}>Gabsther</Text>
            <Text style={styles.tagline}>Welcome back, language learner!</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sign in</Text>

            {!!error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="you@example.com"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <View>
                <TextInput
                  style={[styles.input, { paddingRight: 48 }]}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#9ca3af"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                >
                  <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading
                ? <View style={styles.spinner} />
                : <Text style={styles.buttonText}>Sign in</Text>
              }
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.footer}>
            <Text style={styles.footerText}>
              Don't have an account?{'  '}
              <Text style={styles.footerLink}>Sign up free</Text>
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f9fafb' },
  accentBar: { height: 4, flexDirection: 'row' },
  accentSeg: { height: 4 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 32 },

  logoSection: { alignItems: 'center', marginBottom: 32 },
  iconBox: {
    width: 64, height: 64, borderRadius: 20, backgroundColor: '#1d4ed8',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    shadowColor: '#1d4ed8', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8,
  },
  micGlyph: { fontSize: 30 },
  appName: { fontSize: 26, fontWeight: '800', color: '#111827', marginBottom: 4 },
  tagline: { fontSize: 14, color: '#6b7280' },

  card: {
    backgroundColor: '#fff', borderRadius: 24, padding: 24,
    borderWidth: 1, borderColor: '#f3f4f6',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 4,
  },
  cardTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 20 },

  errorBox: {
    marginBottom: 16, padding: 12, backgroundColor: '#fef2f2',
    borderWidth: 1, borderColor: '#fecaca', borderRadius: 12,
  },
  errorText: { fontSize: 13, color: '#dc2626' },

  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: {
    backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#111827',
  },
  eyeBtn: { position: 'absolute', right: 12, top: 11 },
  eyeText: { fontSize: 17 },

  button: {
    backgroundColor: '#1d4ed8', borderRadius: 14, paddingVertical: 14,
    alignItems: 'center', marginTop: 4,
    shadowColor: '#1d4ed8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  spinner: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff',
  },

  footer: { marginTop: 24, alignItems: 'center' },
  footerText: { color: '#6b7280', fontSize: 14 },
  footerLink: { color: '#1d4ed8', fontWeight: '700' },
});
