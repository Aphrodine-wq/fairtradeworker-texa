import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card } from '@/src/components/ui';
import { useAppStore } from '@/src/store';
import { Colors, Spacing, Typography, BorderRadius, Layout } from '@/src/constants/theme';
import { useResponsive, responsive } from '@/src/hooks';

export default function HomeScreen() {
  const router = useRouter();
  const { currentUser, isDemoMode, demoLogin, jobs } = useAppStore();
  const { isTablet } = useResponsive();

  const todayJobs = jobs.filter((job) => {
    const today = new Date().toDateString();
    return new Date(job.createdAt).toDateString() === today;
  });

  const handleDemoLogin = (role: 'homeowner' | 'contractor' | 'operator') => {
    demoLogin(role);
    router.push('/dashboard');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={[styles.content, isTablet && styles.contentTablet]}>
        {/* Hero Section */}
        <View style={[styles.heroSection, isTablet && styles.heroSectionTablet]}>
          <Text style={[styles.heroTitle, isTablet && styles.heroTitleTablet]}>
            Zero-fee home services marketplace.
          </Text>
          <Text style={[styles.heroSubtitle, isTablet && styles.heroSubtitleTablet]}>
            AI scopes in 60 seconds. Contractors/Subcontractors keep 100%.
          </Text>

          {/* Quick Actions */}
          <View style={[styles.quickActions, isTablet && styles.quickActionsTablet]}>
            <Button
              title="I'm a Homeowner"
              size="lg"
              icon={<Ionicons name="home" size={24} color={Colors.textInverse} />}
              onPress={() => router.push('/signup?role=homeowner')}
              style={[styles.actionButton, { backgroundColor: Colors.primary }]}
            />
            <Button
              title="I'm a Contractor/Subcontractor"
              size="lg"
              icon={<Ionicons name="hammer" size={24} color={Colors.textInverse} />}
              onPress={() => router.push('/signup?role=contractor')}
              style={[styles.actionButton, { backgroundColor: Colors.primary }]}
            />
            <Button
              title="I'm an Operator"
              size="lg"
              icon={<Ionicons name="map" size={24} color={Colors.textInverse} />}
              onPress={() => router.push('/signup?role=operator')}
              style={[styles.actionButton, { backgroundColor: Colors.primary }]}
            />
          </View>

          {/* Stats Card */}
          <Card variant="elevated" padding="md" style={styles.statsCard}>
            <Text style={styles.statsLabel}>Jobs posted today:</Text>
            <Text style={styles.statsValue}>{todayJobs.length}</Text>
          </Card>
        </View>

        {/* Two-column layout for tablet */}
        <View style={isTablet ? styles.twoColumnContainer : null}>
          {/* Demo Mode Section */}
          <Card variant="elevated" padding="lg" style={[styles.demoCard, isTablet && styles.demoCardTablet]}>
            <View style={styles.demoHeader}>
              <Ionicons name="play-circle" size={24} color={Colors.primary} />
              <Text style={styles.demoTitle}>Try Demo Mode</Text>
            </View>
            <Text style={styles.demoDescription}>
              Explore the platform instantly with pre-populated demo accounts for each user type.
            </Text>
            <View style={[styles.demoButtons, isTablet && styles.demoButtonsTablet]}>
              <TouchableOpacity
                style={[styles.demoButton, { borderColor: Colors.primary }]}
                onPress={() => handleDemoLogin('homeowner')}
              >
                <Ionicons name="home" size={20} color={Colors.primary} />
                <Text style={[styles.demoButtonText, { color: Colors.primary }]}>
                  Homeowner
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.demoButton, { borderColor: Colors.secondary }]}
                onPress={() => handleDemoLogin('contractor')}
              >
                <Ionicons name="hammer" size={20} color={Colors.secondary} />
                <Text style={[styles.demoButtonText, { color: Colors.secondary }]}>
                  Contractor/Subcontractor
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.demoButton, { borderColor: Colors.accent }]}
                onPress={() => handleDemoLogin('operator')}
              >
                <Ionicons name="map" size={20} color={Colors.accent} />
                <Text style={[styles.demoButtonText, { color: Colors.accent }]}>
                  Operator
                </Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* How It Works Section */}
          <View style={[styles.howItWorksSection, isTablet && styles.howItWorksSectionTablet]}>
            <Text style={styles.sectionTitle}>How it works</Text>
            
            <Card variant="elevated" padding="md" style={styles.stepCard}>
              <View style={[styles.stepIcon, { backgroundColor: Colors.primary }]}>
                <Ionicons name="home" size={24} color={Colors.textInverse} />
              </View>
              <Text style={styles.stepTitle}>Post Your Job</Text>
              <Text style={styles.stepDescription}>
                Upload a video, voice note, or photos. Our AI analyzes your project and provides an instant scope and price estimate.
              </Text>
            </Card>

            <Card variant="elevated" padding="md" style={styles.stepCard}>
              <View style={[styles.stepIcon, { backgroundColor: Colors.secondary }]}>
                <Ionicons name="hammer" size={24} color={Colors.textInverse} />
              </View>
              <Text style={styles.stepTitle}>Get Bids</Text>
              <Text style={styles.stepDescription}>
                Licensed contractors in your area review your job and submit competitive bids. You choose who to hire.
              </Text>
            </Card>

            <Card variant="elevated" padding="md" style={styles.stepCard}>
              <View style={[styles.stepIcon, { backgroundColor: Colors.accent }]}>
                <Ionicons name="checkmark-circle" size={24} color={Colors.textPrimary} />
              </View>
              <Text style={styles.stepTitle}>Zero Fees</Text>
              <Text style={styles.stepDescription}>
                Contractors/Subcontractors keep 100% of what you pay. No hidden fees, no commissions. Fair trade for everyone.
              </Text>
            </Card>
          </View>
        </View>

        {/* Live Stats */}
        <Card variant="filled" padding="md" style={styles.liveStatsCard}>
          <Text style={styles.liveStatsTitle}>Live Platform Stats</Text>
          <View style={styles.liveStatsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{jobs.filter(j => j.status === 'open').length}</Text>
              <Text style={styles.statLabel}>Open Jobs</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{jobs.reduce((acc, j) => acc + j.bids.length, 0)}</Text>
              <Text style={styles.statLabel}>Total Bids</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{jobs.filter(j => j.status === 'completed').length}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  contentTablet: {
    padding: Spacing.tablet.xl,
    paddingBottom: Spacing.tablet.xxxl,
    alignItems: 'center',
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  heroSectionTablet: {
    marginBottom: Spacing.tablet.xxl,
    maxWidth: Layout.maxContentWidth.tablet,
  },
  heroTitle: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  heroTitleTablet: {
    fontSize: 42,
    marginBottom: Spacing.tablet.lg,
  },
  heroSubtitle: {
    fontSize: Typography.fontSize.lg,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  heroSubtitleTablet: {
    fontSize: Typography.fontSize.xl,
    marginBottom: Spacing.tablet.xl,
  },
  quickActions: {
    width: '100%',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  quickActionsTablet: {
    flexDirection: 'row',
    gap: Spacing.tablet.lg,
    maxWidth: Layout.maxContentWidth.tablet,
  },
  actionButton: {
    width: '100%',
  },
  statsCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderColor: 'rgba(251, 191, 36, 0.4)',
  },
  statsLabel: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  statsValue: {
    fontSize: Typography.fontSize['4xl'],
    fontWeight: '700',
    color: Colors.accent,
  },
  twoColumnContainer: {
    flexDirection: 'row',
    gap: Spacing.tablet.xl,
    maxWidth: Layout.maxContentWidth.tablet,
    alignItems: 'flex-start',
  },
  demoCard: {
    marginBottom: Spacing.xl,
  },
  demoCardTablet: {
    flex: 1,
    marginBottom: 0,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  demoTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  demoDescription: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  demoButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  demoButtonsTablet: {
    flexDirection: 'column',
    gap: Spacing.tablet.md,
  },
  demoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
  },
  demoButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '500',
  },
  howItWorksSection: {
    marginBottom: Spacing.xl,
  },
  howItWorksSectionTablet: {
    flex: 1,
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  stepCard: {
    marginBottom: Spacing.md,
    alignItems: 'flex-start',
  },
  stepIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  stepTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  stepDescription: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  liveStatsCard: {
    marginBottom: Spacing.xl,
  },
  liveStatsTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  liveStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: '700',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
});
