import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Badge } from '@/src/components/ui';
import { useAppStore } from '@/src/store';
import { Colors, Spacing, Typography, BorderRadius } from '@/src/constants/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const { currentUser, isDemoMode, logout } = useAppStore();

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/');
          },
        },
      ]
    );
  };

  if (!currentUser) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loginPrompt}>
          <Ionicons name="person-circle" size={80} color={Colors.textMuted} />
          <Text style={styles.loginTitle}>Welcome to FairTradeWorker</Text>
          <Text style={styles.loginDescription}>
            Sign in to access your profile and manage your account.
          </Text>
          <View style={styles.loginButtons}>
            <Button
              title="Log In"
              onPress={() => router.push('/login')}
              style={styles.loginButton}
            />
            <Button
              title="Create Account"
              variant="outline"
              onPress={() => router.push('/signup')}
              style={styles.loginButton}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const roleLabels = {
    homeowner: 'Homeowner',
    contractor: 'Contractor/Subcontractor',
    operator: 'Operator',
  };

  const roleColors = {
    homeowner: 'primary' as const,
    contractor: 'secondary' as const,
    operator: 'warning' as const,
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {isDemoMode && (
          <View style={styles.demoBanner}>
            <Ionicons name="information-circle" size={20} color={Colors.primary} />
            <Text style={styles.demoBannerText}>Demo Mode Active</Text>
          </View>
        )}

        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {currentUser.fullName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()}
              </Text>
            </View>
            {currentUser.isPro && (
              <View style={styles.proBadge}>
                <Ionicons name="star" size={12} color={Colors.accent} />
              </View>
            )}
          </View>
          <Text style={styles.userName}>{currentUser.fullName}</Text>
          <Text style={styles.userEmail}>{currentUser.email}</Text>
          <Badge
            label={roleLabels[currentUser.role]}
            variant={roleColors[currentUser.role]}
            size="md"
          />
        </View>

        {/* Stats Section */}
        {currentUser.role === 'contractor' && (
          <Card variant="elevated" padding="md" style={styles.statsCard}>
            <Text style={styles.cardTitle}>Performance Stats</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {Math.round(currentUser.performanceScore * 100)}%
                </Text>
                <Text style={styles.statLabel}>Score</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {Math.round(currentUser.bidAccuracy * 100)}%
                </Text>
                <Text style={styles.statLabel}>Accuracy</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  ${currentUser.referralEarnings}
                </Text>
                <Text style={styles.statLabel}>Earnings</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Company Info (for contractors) */}
        {currentUser.role === 'contractor' && currentUser.companyName && (
          <Card variant="outlined" padding="md" style={styles.companyCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="business" size={24} color={Colors.primary} />
              <Text style={styles.cardTitle}>Company Info</Text>
            </View>
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>{currentUser.companyName}</Text>
              {currentUser.companyAddress && (
                <Text style={styles.companyDetail}>{currentUser.companyAddress}</Text>
              )}
              {currentUser.companyPhone && (
                <Text style={styles.companyDetail}>{currentUser.companyPhone}</Text>
              )}
              {currentUser.companyEmail && (
                <Text style={styles.companyDetail}>{currentUser.companyEmail}</Text>
              )}
            </View>
          </Card>
        )}

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="person-outline" size={24} color={Colors.textSecondary} />
              <Text style={styles.menuItemText}>Edit Profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="notifications-outline" size={24} color={Colors.textSecondary} />
              <Text style={styles.menuItemText}>Notifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="card-outline" size={24} color={Colors.textSecondary} />
              <Text style={styles.menuItemText}>Payment Methods</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="help-circle-outline" size={24} color={Colors.textSecondary} />
              <Text style={styles.menuItemText}>Help Center</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="document-text-outline" size={24} color={Colors.textSecondary} />
              <Text style={styles.menuItemText}>Terms of Service</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="shield-outline" size={24} color={Colors.textSecondary} />
              <Text style={styles.menuItemText}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <Button
          title="Log Out"
          variant="outline"
          onPress={handleLogout}
          style={styles.logoutButton}
          icon={<Ionicons name="log-out-outline" size={20} color={Colors.primary} />}
        />

        {/* App Version */}
        <Text style={styles.versionText}>FairTradeWorker v1.0.0</Text>
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
  profileHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: '700',
    color: Colors.textInverse,
  },
  proBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    padding: Spacing.xs,
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  userName: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  userEmail: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  statsCard: {
    marginBottom: Spacing.lg,
  },
  cardTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  companyCard: {
    marginBottom: Spacing.lg,
  },
  companyInfo: {
    gap: Spacing.xs,
  },
  companyName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  companyDetail: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
  },
  menuSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: Spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  menuItemText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
  },
  logoutButton: {
    marginTop: Spacing.lg,
  },
  versionText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
});
