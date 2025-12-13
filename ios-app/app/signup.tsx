import React, { useState, useEffect } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, TextInput, Card } from '@/src/components/ui';
import { useAppStore } from '@/src/store';
import { Colors, Spacing, Typography, BorderRadius } from '@/src/constants/theme';
import type { UserRole } from '@/src/types';

export default function SignupScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ role?: string }>();
  const { users, signup } = useAppStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole | null>(
    (params.role as UserRole) || null
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (params.role) {
      setRole(params.role as UserRole);
    }
  }, [params.role]);

  const handleSignup = async () => {
    if (!email || !password || !fullName || !role) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }

    const existingUser = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (existingUser) {
      Alert.alert('Error', 'An account with this email already exists.');
      return;
    }

    setLoading(true);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    signup({
      email,
      fullName,
      role,
    });

    setLoading(false);
    Alert.alert('Success', 'Account created successfully!', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  const roleOptions: { value: UserRole; label: string; icon: keyof typeof Ionicons.glyphMap; description: string }[] = [
    {
      value: 'homeowner',
      label: 'Homeowner',
      icon: 'home',
      description: 'Post jobs and hire contractors',
    },
    {
      value: 'contractor',
      label: 'Contractor/Subcontractor',
      icon: 'hammer',
      description: 'Browse jobs and submit bids',
    },
    {
      value: 'operator',
      label: 'Operator',
      icon: 'map',
      description: 'Manage territories and analytics',
    },
  ];

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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.description}>
              Join FairTradeWorker Texas today
            </Text>

            <View style={styles.form}>
              <TextInput
                label="Full Name"
                placeholder="John Doe"
                autoCapitalize="words"
                value={fullName}
                onChangeText={setFullName}
              />

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
                helperText="At least 6 characters"
              />

              <View style={styles.roleSection}>
                <Text style={styles.roleLabel}>I am a...</Text>
                <View style={styles.roleOptions}>
                  {roleOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.roleOption,
                        role === option.value && styles.roleOptionSelected,
                      ]}
                      onPress={() => setRole(option.value)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={option.icon}
                        size={24}
                        color={
                          role === option.value
                            ? Colors.primary
                            : Colors.textSecondary
                        }
                      />
                      <Text
                        style={[
                          styles.roleOptionLabel,
                          role === option.value && styles.roleOptionLabelSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                      <Text style={styles.roleOptionDescription}>
                        {option.description}
                      </Text>
                      {role === option.value && (
                        <View style={styles.roleCheckmark}>
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color={Colors.primary}
                          />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <Button
                title="Sign Up - Create Account"
                onPress={handleSignup}
                loading={loading}
                disabled={loading || !role}
                style={[styles.submitButton, { backgroundColor: Colors.primary }]}
              />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Text
                style={styles.footerLink}
                onPress={() => router.replace('/login')}
              >
                Log in
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
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
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
  roleSection: {
    gap: Spacing.md,
  },
  roleLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  roleOptions: {
    gap: Spacing.md,
  },
  roleOption: {
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
  },
  roleOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
  },
  roleOptionLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
  },
  roleOptionLabelSelected: {
    color: Colors.primary,
  },
  roleOptionDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  roleCheckmark: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
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
