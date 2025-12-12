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
} from 'react-native';
import { useRouter } from 'expo-router';
import { Button, TextInput, Card } from '@/src/components/ui';
import { useAppStore } from '@/src/store';
import { Colors, Spacing, Typography } from '@/src/constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { users, login } = useAppStore();
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
});
