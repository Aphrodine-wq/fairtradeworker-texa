import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { JobCard } from '@/src/components/jobs/JobCard';
import { useAppStore } from '@/src/store';
import { Colors, Spacing, Typography, BorderRadius, Layout } from '@/src/constants/theme';
import { useResponsive } from '@/src/hooks';
import type { JobSize, Job } from '@/src/types';

type FilterOption = 'all' | JobSize;

// Netflix-style horizontal carousel component
function JobCarousel({ 
  jobs, 
  onJobPress 
}: { 
  jobs: Job[]; 
  onJobPress: (jobId: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.carouselContent}
      decelerationRate="fast"
      snapToInterval={340} // Card width + gap
      snapToAlignment="start"
    >
      {jobs.map((job) => (
        <View key={job.id} style={styles.carouselItem}>
          <JobCard
            job={job}
            onPress={() => onJobPress(job.id)}
            showBidCount={true}
          />
        </View>
      ))}
    </ScrollView>
  );
}

export default function BrowseJobsScreen() {
  const router = useRouter();
  const { jobs, currentUser } = useAppStore();
  const { isTablet } = useResponsive();
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>('all');

  // Filter jobs by status
  const openJobs = useMemo(() => {
    return jobs.filter((job) => job.status === 'open');
  }, [jobs]);

  // Categorize jobs for Netflix-style lanes
  const jobCategories = useMemo(() => {
    const now = Date.now();
    const fifteenMinutes = 15 * 60 * 1000;

    // 🔥 Fresh Jobs - posted in last 15 minutes with no bids
    const freshJobs = openJobs.filter((job) => {
      const jobAge = now - new Date(job.createdAt).getTime();
      return jobAge <= fifteenMinutes && job.bids.length === 0;
    });

    // 🟢 Quick Jobs - small jobs (under $500)
    const quickJobs = openJobs.filter((job) => job.size === 'small');

    // 🟡 Standard Projects - medium jobs ($500-$2,000)
    const standardJobs = openJobs.filter((job) => job.size === 'medium');

    // 🔴 Major Projects - large jobs ($2,000+)
    const majorJobs = openJobs.filter((job) => job.size === 'large');

    return { freshJobs, quickJobs, standardJobs, majorJobs };
  }, [openJobs]);

  // Filtered jobs for when a specific filter is selected
  const filteredJobs = useMemo(() => {
    if (selectedFilter === 'all') return openJobs;
    return openJobs.filter((job) => job.size === selectedFilter);
  }, [openJobs, selectedFilter]);

  const filterOptions: { key: FilterOption; label: string; emoji?: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'small', label: 'Small', emoji: '🟢' },
    { key: 'medium', label: 'Medium', emoji: '🟡' },
    { key: 'large', label: 'Large', emoji: '🔴' },
  ];

  const handleJobPress = (jobId: string) => {
    router.push(`/job/${jobId}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Filter Bar */}
      <View style={styles.filterBar}>
        {filterOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.filterButton,
              selectedFilter === option.key && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedFilter(option.key)}
          >
            {option.emoji && <Text>{option.emoji}</Text>}
            <Text
              style={[
                styles.filterButtonText,
                selectedFilter === option.key && styles.filterButtonTextActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedFilter === 'all' ? (
        // Netflix-style horizontal lanes view
        <ScrollView style={styles.scrollView}>
          {/* Fresh Jobs Lane */}
          {jobCategories.freshJobs.length > 0 && (
            <View style={styles.laneContainer}>
              <View style={styles.laneHeader}>
                <Text style={styles.laneTitle}>🔥 Fresh Jobs — Be First to Bid</Text>
                <View style={styles.laneBadge}>
                  <Text style={styles.laneBadgeText}>{jobCategories.freshJobs.length} new</Text>
                </View>
              </View>
              <JobCarousel jobs={jobCategories.freshJobs} onJobPress={handleJobPress} />
            </View>
          )}

          {/* Quick Jobs Lane */}
          {jobCategories.quickJobs.length > 0 && (
            <View style={styles.laneContainer}>
              <View style={styles.laneHeader}>
                <Text style={styles.laneTitle}>🟢 Quick Jobs</Text>
                <Text style={styles.laneSubtitle}>Under $500 • Fast turnaround</Text>
              </View>
              <JobCarousel jobs={jobCategories.quickJobs.slice(0, 10)} onJobPress={handleJobPress} />
            </View>
          )}

          {/* Standard Projects Lane */}
          {jobCategories.standardJobs.length > 0 && (
            <View style={styles.laneContainer}>
              <View style={styles.laneHeader}>
                <Text style={styles.laneTitle}>🟡 Standard Projects</Text>
                <Text style={styles.laneSubtitle}>$500 - $2,000</Text>
              </View>
              <JobCarousel jobs={jobCategories.standardJobs.slice(0, 10)} onJobPress={handleJobPress} />
            </View>
          )}

          {/* Major Projects Lane */}
          {jobCategories.majorJobs.length > 0 && (
            <View style={styles.laneContainer}>
              <View style={styles.laneHeader}>
                <Text style={styles.laneTitle}>🔴 Major Projects</Text>
                <Text style={styles.laneSubtitle}>$2,000+ • Multi-day</Text>
              </View>
              <JobCarousel jobs={jobCategories.majorJobs.slice(0, 10)} onJobPress={handleJobPress} />
            </View>
          )}

          {/* Empty state */}
          {openJobs.length === 0 && (
            <View style={styles.emptyContainer}>
              <Ionicons name="search" size={64} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No jobs found</Text>
              <Text style={styles.emptyDescription}>
                There are no open jobs at the moment. Check back soon!
              </Text>
            </View>
          )}
        </ScrollView>
      ) : (
        // Grid view for filtered results
        <FlatList
          data={filteredJobs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.listContent, isTablet && styles.listContentTablet]}
          numColumns={isTablet ? 2 : 1}
          key={isTablet ? 'tablet' : 'phone'} // Force re-render when changing columns
          columnWrapperStyle={isTablet ? styles.columnWrapper : undefined}
          renderItem={({ item }) => (
            <View style={isTablet ? styles.gridItem : null}>
              <JobCard
                job={item}
                onPress={() => handleJobPress(item.id)}
                showBidCount={currentUser?.role === 'contractor'}
              />
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search" size={64} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No jobs found</Text>
              <Text style={styles.emptyDescription}>
                No {selectedFilter} jobs available. Try a different filter.
              </Text>
            </View>
          }
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text style={styles.resultCount}>
                {filteredJobs.length} open job{filteredJobs.length !== 1 ? 's' : ''}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  filterBar: {
    flexDirection: 'row',
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceSecondary,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filterButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  filterButtonTextActive: {
    color: Colors.textInverse,
  },
  scrollView: {
    flex: 1,
  },
  laneContainer: {
    marginVertical: Spacing.lg,
  },
  laneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  laneTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  laneSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textMuted,
    marginLeft: 'auto',
  },
  laneBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  laneBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '600',
    color: Colors.textInverse,
  },
  carouselContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  carouselItem: {
    width: 320,
    marginRight: Spacing.md,
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxxl,
  },
  listContentTablet: {
    padding: Spacing.tablet.lg,
    paddingBottom: Spacing.tablet.xxxl,
  },
  columnWrapper: {
    gap: Spacing.tablet.md,
  },
  gridItem: {
    flex: 1,
  },
  listHeader: {
    marginBottom: Spacing.md,
  },
  resultCount: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textMuted,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxxl,
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyDescription: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
