import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { JobCard } from '@/src/components/jobs/JobCard';
import { useAppStore } from '@/src/store';
import { Colors, Spacing, Typography, BorderRadius } from '@/src/constants/theme';
import type { JobSize } from '@/src/types';

type FilterOption = 'all' | JobSize;

export default function BrowseJobsScreen() {
  const router = useRouter();
  const { jobs, currentUser } = useAppStore();
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>('all');

  const filteredJobs = useMemo(() => {
    let filtered = jobs.filter((job) => job.status === 'open');
    
    if (selectedFilter !== 'all') {
      filtered = filtered.filter((job) => job.size === selectedFilter);
    }

    // Sort by creation date (newest first)
    return filtered.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [jobs, selectedFilter]);

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

      {/* Jobs List */}
      <FlatList
        data={filteredJobs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <JobCard
            job={item}
            onPress={() => handleJobPress(item.id)}
            showBidCount={currentUser?.role === 'contractor'}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search" size={64} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No jobs found</Text>
            <Text style={styles.emptyDescription}>
              {selectedFilter === 'all'
                ? 'There are no open jobs at the moment. Check back soon!'
                : `No ${selectedFilter} jobs available. Try a different filter.`}
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
  listContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxxl,
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
