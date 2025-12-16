import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Badge } from '@/src/components/ui';
import { Colors, Spacing, Typography, BorderRadius } from '@/src/constants/theme';
import type { Job } from '@/src/types';
import { getJobSizeEmoji, getJobSizeLabel } from '@/src/types';
import { formatDistanceToNow } from 'date-fns';

interface JobCardProps {
  job: Job;
  onPress?: () => void;
  showBidCount?: boolean;
  variant?: 'default' | 'compact';
}

export function JobCard({ job, onPress, showBidCount = true, variant = 'default' }: JobCardProps) {
  const timeAgo = formatDistanceToNow(new Date(job.createdAt), { addSuffix: true });
  const isRecent = Date.now() - new Date(job.createdAt).getTime() < 15 * 60 * 1000;
  
  const sizeColor = job.size === 'small' 
    ? Colors.jobSmall 
    : job.size === 'medium' 
      ? Colors.jobMedium 
      : Colors.jobLarge;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card 
        variant="elevated" 
        padding={variant === 'compact' ? 'sm' : 'md'}
        style={styles.card}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.emoji}>{getJobSizeEmoji(job.size)}</Text>
            <Text style={styles.title} numberOfLines={1}>{job.title}</Text>
          </View>
          {isRecent && job.size === 'small' && (
            <Badge label="FRESH" variant="success" size="sm" />
          )}
        </View>

        {/* Photo preview */}
        {job.photos && job.photos.length > 0 && variant === 'default' && (
          <View style={styles.photoContainer}>
            <Image
              source={{ uri: job.photos[0] }}
              style={styles.photo}
              resizeMode="cover"
            />
            {job.photos.length > 1 && (
              <View style={styles.photoCount}>
                <Text style={styles.photoCountText}>+{job.photos.length - 1}</Text>
              </View>
            )}
          </View>
        )}

        {/* Description */}
        <Text style={styles.description} numberOfLines={2}>
          {job.description}
        </Text>

        {/* Price estimate */}
        <View style={styles.priceRow}>
          <Ionicons name="cash-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.priceText}>
            ${job.aiScope.priceLow} - ${job.aiScope.priceHigh}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.metaRow}>
            <Badge 
              label={getJobSizeLabel(job.size)} 
              variant={job.size === 'small' ? 'success' : job.size === 'medium' ? 'warning' : 'error'}
              size="sm"
            />
            <Text style={styles.timeText}>{timeAgo}</Text>
          </View>
          
          {showBidCount && (
            <View style={styles.bidCount}>
              <Ionicons name="people-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.bidCountText}>{job.bids.length} bid{job.bids.length !== 1 ? 's' : ''}</Text>
            </View>
          )}
        </View>

        {/* Status indicator */}
        {job.status !== 'open' && (
          <View style={[styles.statusBadge, styles[`status_${job.status}`]]}>
            <Text style={styles.statusText}>{job.status.replace('-', ' ')}</Text>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.sm,
  },
  emoji: {
    fontSize: 20,
    marginRight: Spacing.sm,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
  },
  photoContainer: {
    position: 'relative',
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: 160,
    backgroundColor: Colors.surfaceSecondary,
  },
  photoCount: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  photoCountText: {
    color: Colors.textInverse,
    fontSize: Typography.fontSize.sm,
    fontWeight: '500',
  },
  description: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  priceText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '700',
    color: Colors.primary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  timeText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textMuted,
  },
  bidCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  bidCountText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  statusBadge: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  status_open: {
    backgroundColor: Colors.successLight,
  },
  'status_in-progress': {
    backgroundColor: Colors.warningLight,
  },
  status_completed: {
    backgroundColor: Colors.secondaryLight,
  },
  status_cancelled: {
    backgroundColor: Colors.errorLight,
  },
  statusText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
