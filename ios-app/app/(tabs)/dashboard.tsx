import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Badge } from '@/src/components/ui';
import { JobCard } from '@/src/components/jobs/JobCard';
import { useAppStore } from '@/src/store';
import { Colors, Spacing, Typography, BorderRadius, Layout } from '@/src/constants/theme';
import { useResponsive } from '@/src/hooks';

export default function DashboardScreen() {
  const router = useRouter();
  const { currentUser, isDemoMode, jobs, invoices } = useAppStore();
  const { isTablet } = useResponsive();

  if (!currentUser) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loginPrompt}>
          <Ionicons name="lock-closed" size={64} color={Colors.textMuted} />
          <Text style={styles.loginTitle}>Sign in to access your dashboard</Text>
          <Text style={styles.loginDescription}>
            Create an account or log in to view your personalized dashboard.
          </Text>
          <View style={styles.loginButtons}>
            <Button
              title="Log In"
              onPress={() => router.push('/login')}
              style={styles.loginButton}
            />
            <Button
              title="Sign Up"
              variant="outline"
              onPress={() => router.push('/signup')}
              style={styles.loginButton}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Homeowner Dashboard
  if (currentUser.role === 'homeowner') {
    const myJobs = jobs.filter((job) => job.homeownerId === currentUser.id);
    const openJobs = myJobs.filter((job) => job.status === 'open');
    const inProgressJobs = myJobs.filter((job) => job.status === 'in-progress');

    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container} contentContainerStyle={[styles.content, isTablet && styles.contentTablet]}>
          {isDemoMode && (
            <View style={styles.demoBanner}>
              <Ionicons name="information-circle" size={20} color={Colors.primary} />
              <Text style={styles.demoBannerText}>Demo Mode: {currentUser.fullName}</Text>
            </View>
          )}

          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Welcome back, {currentUser.fullName.split(' ')[0]}!</Text>
            <Button
              title="Post a New Job"
              icon={<Ionicons name="add" size={20} color={Colors.textInverse} />}
              onPress={() => router.push('/post-job')}
            />
          </View>

          {/* Stats */}
          <View style={[styles.statsRow, isTablet && styles.statsRowTablet]}>
            <Card variant="elevated" padding="md" style={styles.statCard}>
              <Text style={styles.statNumber}>{openJobs.length}</Text>
              <Text style={styles.statLabel}>Open Jobs</Text>
            </Card>
            <Card variant="elevated" padding="md" style={styles.statCard}>
              <Text style={styles.statNumber}>{inProgressJobs.length}</Text>
              <Text style={styles.statLabel}>In Progress</Text>
            </Card>
            <Card variant="elevated" padding="md" style={styles.statCard}>
              <Text style={styles.statNumber}>
                {openJobs.reduce((acc, job) => acc + job.bids.length, 0)}
              </Text>
              <Text style={styles.statLabel}>Total Bids</Text>
            </Card>
          </View>

          {/* Recent Jobs */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Jobs</Text>
            {myJobs.length === 0 ? (
              <Card variant="elevated" padding="lg">
                <Text style={styles.emptyText}>
                  You haven't posted any jobs yet. Post your first job to get started!
                </Text>
              </Card>
            ) : (
              <View style={isTablet ? styles.jobsGrid : null}>
                {myJobs.slice(0, isTablet ? 6 : 3).map((job) => (
                  <View key={job.id} style={isTablet ? styles.jobGridItem : null}>
                    <JobCard
                      job={job}
                      onPress={() => router.push(`/job/${job.id}`)}
                      variant="compact"
                    />
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Contractor Dashboard
  if (currentUser.role === 'contractor') {
    const myBids = jobs.flatMap((job) =>
      job.bids.filter((bid) => bid.contractorId === currentUser.id).map((bid) => ({
        ...bid,
        job,
      }))
    );
    const wonBids = myBids.filter((bid) => bid.status === 'accepted');
    const pendingBids = myBids.filter((bid) => bid.status === 'pending');
    const myInvoices = invoices.filter((inv) => inv.contractorId === currentUser.id);

    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          {isDemoMode && (
            <View style={styles.demoBanner}>
              <Ionicons name="information-circle" size={20} color={Colors.primary} />
              <Text style={styles.demoBannerText}>Demo Mode: {currentUser.fullName}</Text>
            </View>
          )}

          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Welcome, {currentUser.fullName.split(' ')[0]}!</Text>
            {currentUser.companyName && (
              <Text style={styles.companyName}>{currentUser.companyName}</Text>
            )}
          </View>

          {/* Performance Stats */}
          <Card variant="elevated" padding="md" style={styles.performanceCard}>
            <Text style={styles.cardTitle}>Performance</Text>
            <View style={styles.performanceRow}>
              <View style={styles.performanceItem}>
                <Text style={styles.performanceValue}>
                  {Math.round(currentUser.performanceScore * 100)}%
                </Text>
                <Text style={styles.performanceLabel}>Score</Text>
              </View>
              <View style={styles.performanceItem}>
                <Text style={styles.performanceValue}>
                  {Math.round(currentUser.bidAccuracy * 100)}%
                </Text>
                <Text style={styles.performanceLabel}>Bid Accuracy</Text>
              </View>
              <View style={styles.performanceItem}>
                <Text style={styles.performanceValue}>{myBids.length}</Text>
                <Text style={styles.performanceLabel}>Total Bids</Text>
              </View>
            </View>
          </Card>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <Card variant="elevated" padding="md" style={styles.statCard}>
              <Text style={styles.statNumber}>{wonBids.length}</Text>
              <Text style={styles.statLabel}>Jobs Won</Text>
            </Card>
            <Card variant="elevated" padding="md" style={styles.statCard}>
              <Text style={styles.statNumber}>{pendingBids.length}</Text>
              <Text style={styles.statLabel}>Pending Bids</Text>
            </Card>
            <Card variant="elevated" padding="md" style={styles.statCard}>
              <Text style={styles.statNumber}>${currentUser.referralEarnings}</Text>
              <Text style={styles.statLabel}>Referrals</Text>
            </Card>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              <Button
                title="Browse Jobs"
                variant="outline"
                icon={<Ionicons name="search" size={20} color={Colors.primary} />}
                onPress={() => router.push('/browse')}
                style={styles.quickActionButton}
              />
              <Button
                title="Invoices"
                variant="outline"
                icon={<Ionicons name="document-text" size={20} color={Colors.primary} />}
                onPress={() => {}}
                style={styles.quickActionButton}
              />
            </View>
          </View>

          {/* Pending Bids */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {pendingBids.length === 0 ? (
              <Card variant="elevated" padding="lg">
                <Text style={styles.emptyText}>
                  No pending bids. Browse jobs to find new opportunities!
                </Text>
              </Card>
            ) : (
              pendingBids.slice(0, 3).map((bid) => (
                <Card key={bid.id} variant="elevated" padding="md" style={styles.bidCard}>
                  <View style={styles.bidHeader}>
                    <Text style={styles.bidJobTitle}>{bid.job.title}</Text>
                    <Badge label="Pending" variant="warning" size="sm" />
                  </View>
                  <Text style={styles.bidAmount}>${bid.amount}</Text>
                </Card>
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Operator Dashboard
  if (currentUser.role === 'operator') {
    const territories = useAppStore.getState().territories;
    const myTerritories = territories.filter(
      (t) => t.operatorId === currentUser.id
    );
    const availableTerritories = territories.filter(
      (t) => t.status === 'available'
    );

    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          {isDemoMode && (
            <View style={styles.demoBanner}>
              <Ionicons name="information-circle" size={20} color={Colors.primary} />
              <Text style={styles.demoBannerText}>Demo Mode: {currentUser.fullName}</Text>
            </View>
          )}

          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Welcome, {currentUser.fullName.split(' ')[0]}!</Text>
            <Badge label="Operator" variant="primary" />
          </View>

          {/* Territory Stats */}
          <View style={styles.statsRow}>
            <Card variant="elevated" padding="md" style={styles.statCard}>
              <Text style={styles.statNumber}>{myTerritories.length}</Text>
              <Text style={styles.statLabel}>My Territories</Text>
            </Card>
            <Card variant="elevated" padding="md" style={styles.statCard}>
              <Text style={styles.statNumber}>{availableTerritories.length}</Text>
              <Text style={styles.statLabel}>Available</Text>
            </Card>
            <Card variant="elevated" padding="md" style={styles.statCard}>
              <Text style={styles.statNumber}>{territories.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </Card>
          </View>

          {/* My Territories */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Territories</Text>
            {myTerritories.length === 0 ? (
              <Card variant="elevated" padding="lg">
                <Text style={styles.emptyText}>
                  You haven't claimed any territories yet.
                </Text>
              </Card>
            ) : (
              myTerritories.map((territory) => (
                <Card key={territory.id} variant="elevated" padding="md" style={styles.territoryCard}>
                  <View style={styles.territoryHeader}>
                    <Ionicons name="location" size={24} color={Colors.primary} />
                    <Text style={styles.territoryName}>{territory.countyName}</Text>
                  </View>
                  <Badge label="Claimed" variant="success" size="sm" />
                </Card>
              ))
            )}
          </View>

          {/* Available Territories */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Territories</Text>
            {availableTerritories.slice(0, 3).map((territory) => (
              <Card key={territory.id} variant="elevated" padding="md" style={styles.territoryCard}>
                <View style={styles.territoryHeader}>
                  <Ionicons name="location-outline" size={24} color={Colors.textSecondary} />
                  <Text style={styles.territoryName}>{territory.countyName}</Text>
                </View>
                <Button
                  title="Claim"
                  size="sm"
                  onPress={() => {
                    useAppStore.getState().claimTerritory(
                      territory.id,
                      currentUser.id,
                      currentUser.fullName
                    );
                  }}
                />
              </Card>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return null;
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
  loginPrompt: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  loginTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  loginDescription: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  loginButtons: {
    width: '100%',
    gap: Spacing.md,
  },
  loginButton: {
    width: '100%',
  },
  demoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  demoBannerText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary,
    fontWeight: '500',
  },
  welcomeSection: {
    marginBottom: Spacing.xl,
  },
  welcomeTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  companyName: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statsRowTablet: {
    gap: Spacing.tablet.lg,
    maxWidth: Layout.maxContentWidth.tablet,
    width: '100%',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: '700',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  jobsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.tablet.md,
  },
  jobGridItem: {
    width: '48%',
  },
  emptyText: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  performanceCard: {
    marginBottom: Spacing.xl,
  },
  cardTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  performanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  performanceItem: {
    alignItems: 'center',
  },
  performanceValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
    color: Colors.secondary,
  },
  performanceLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  quickActionButton: {
    flex: 1,
  },
  bidCard: {
    marginBottom: Spacing.sm,
  },
  bidHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  bidJobTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: '500',
    color: Colors.textPrimary,
    flex: 1,
  },
  bidAmount: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '700',
    color: Colors.primary,
  },
  territoryCard: {
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  territoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  territoryName: {
    fontSize: Typography.fontSize.md,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
});
