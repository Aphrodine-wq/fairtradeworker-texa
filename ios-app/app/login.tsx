import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, TextInput, Card } from '@/src/components/ui';
import { useAppStore } from '@/src/store';
import { Colors, Spacing, Typography, BorderRadius } from '@/src/constants/theme';
import { DEMO_USERS } from '@/src/constants/demoData';

export default function LoginScreen() {
  const router = useRouter();
  const { users, login, demoLogin } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter your email and password.');
      return;
    }

    setLoading(true);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      setLoading(false);
      Alert.alert('Error', 'Account not found. Please sign up first.');
      return;
    }

    login(user);
    setLoading(false);
    router.back();
  };

  const handleDemoLogin = async (role: 'homeowner' | 'contractor' | 'operator') => {
    setLoading(true);
    // Simulate network delay for consistency
    await new Promise((resolve) => setTimeout(resolve, 300));
    demoLogin(role);
    setLoading(false);
    router.replace('/dashboard');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Card variant="elevated" padding="lg" style={styles.card}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.description}>
              Enter your email to access your account
            </Text>

            <View style={styles.form}>
              <TextInput
                label="Email"
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
              />

              <TextInput
                label="Password"
                placeholder="••••••••"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />

              <Button
                title="Log In"
                onPress={handleLogin}
                loading={loading}
                disabled={loading}
                style={styles.submitButton}
              />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <Text
                style={styles.footerLink}
                onPress={() => router.replace('/signup')}
              >
                Sign up
              </Text>
            </View>
          </Card>

          {/* Demo Accounts Section */}
          <Card variant="elevated" padding="md" style={styles.demoCard}>
            <View style={styles.demoHeader}>
              <Ionicons name="play-circle" size={20} color={Colors.primary} />
              <Text style={styles.demoTitle}>Quick Demo Login</Text>
            </View>
            <Text style={styles.demoDescription}>
              Try the platform instantly with demo accounts:
            </Text>
            <View style={styles.demoButtons}>
              <TouchableOpacity
                style={[styles.demoButton, { borderColor: Colors.primary }]}
                onPress={() => handleDemoLogin('homeowner')}
                disabled={loading}
              >
                <Ionicons name="home" size={18} color={Colors.primary} />
                <Text style={[styles.demoButtonText, { color: Colors.primary }]}>
                  Homeowner
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.demoButton, { borderColor: Colors.secondary }]}
                onPress={() => handleDemoLogin('contractor')}
                disabled={loading}
              >
                <Ionicons name="hammer" size={18} color={Colors.secondary} />
                <Text style={[styles.demoButtonText, { color: Colors.secondary }]}>
                  Contractor
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.demoButton, { borderColor: Colors.accent }]}
                onPress={() => handleDemoLogin('operator')}
                disabled={loading}
              >
                <Ionicons name="map" size={18} color={Colors.accent} />
                <Text style={[styles.demoButtonText, { color: Colors.accent }]}>
                  Operator
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.demoNote}>
              Demo accounts have pre-populated data for testing
            </Text>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  card: {
    width: '100%',
  },
  title: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  description: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  form: {
    gap: Spacing.lg,
  },
  submitButton: {
    marginTop: Spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.xl,
  },
  footerText: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
  },
  footerLink: {
    fontSize: Typography.fontSize.md,
    color: Colors.primary,
    fontWeight: '600',
  },
  demoCard: {
    marginTop: Spacing.lg,
    width: '100%',
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  demoTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  demoDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  demoButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  demoButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderWidth: 1.5,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
  },
  demoButtonText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '600',
    textAlign: 'center',
  },
  demoNote: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
