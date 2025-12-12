import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
  Alert,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Badge, TextInput } from '@/src/components/ui';
import { useAppStore } from '@/src/store';
import { Colors, Spacing, Typography, BorderRadius } from '@/src/constants/theme';
import { getJobSizeEmoji, getJobSizeLabel } from '@/src/types';
import { formatDistanceToNow, format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import type { Bid } from '@/src/types';

export default function JobDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { jobs, currentUser, addBidToJob, updateJob } = useAppStore();
  
  const job = useMemo(() => jobs.find((j) => j.id === id), [jobs, id]);
  
  const [showBidModal, setShowBidModal] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [bidMessage, setBidMessage] = useState('');
  const [submittingBid, setSubmittingBid] = useState(false);

  if (!job) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFound}>
          <Ionicons name="alert-circle" size={64} color={Colors.textMuted} />
          <Text style={styles.notFoundTitle}>Job Not Found</Text>
          <Text style={styles.notFoundDescription}>
            This job may have been removed or doesn't exist.
          </Text>
          <Button title="Go Back" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const isOwner = currentUser?.id === job.homeownerId;
  const isContractor = currentUser?.role === 'contractor';
  const hasAlreadyBid = job.bids.some((bid) => bid.contractorId === currentUser?.id);
  const timeAgo = formatDistanceToNow(new Date(job.createdAt), { addSuffix: true });

  const handleSubmitBid = async () => {
    if (!currentUser || !isContractor) return;

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid bid amount.');
      return;
    }

    if (!bidMessage.trim()) {
      Alert.alert('Error', 'Please add a message with your bid.');
      return;
    }

    setSubmittingBid(true);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newBid: Bid = {
      id: uuidv4(),
      jobId: job.id,
      contractorId: currentUser.id,
      contractorName: currentUser.fullName,
      amount,
      message: bidMessage.trim(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    addBidToJob(job.id, newBid);
    setSubmittingBid(false);
    setShowBidModal(false);
    setBidAmount('');
    setBidMessage('');

    Alert.alert('Bid Submitted! 🎉', 'Your bid has been sent to the homeowner.');
  };

  const handleAcceptBid = (bid: Bid) => {
    Alert.alert(
      'Accept Bid',
      `Accept bid of $${bid.amount} from ${bid.contractorName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: () => {
            const updatedBids = job.bids.map((b) =>
              b.id === bid.id
                ? { ...b, status: 'accepted' as const }
                : { ...b, status: 'rejected' as const }
            );
            updateJob(job.id, { bids: updatedBids, status: 'in-progress' });
            Alert.alert('Bid Accepted!', 'The contractor has been notified.');
          },
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Job Details',
          headerBackTitle: 'Back',
        }}
      />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text style={styles.emoji}>{getJobSizeEmoji(job.size)}</Text>
              <Text style={styles.title}>{job.title}</Text>
            </View>
            <View style={styles.metaRow}>
              <Badge
                label={getJobSizeLabel(job.size)}
                variant={
                  job.size === 'small'
                    ? 'success'
                    : job.size === 'medium'
                    ? 'warning'
                    : 'error'
                }
              />
              <Badge
                label={job.status.replace('-', ' ')}
                variant={
                  job.status === 'open'
                    ? 'primary'
                    : job.status === 'in-progress'
                    ? 'warning'
                    : job.status === 'completed'
                    ? 'success'
                    : 'default'
                }
              />
              <Text style={styles.timeText}>{timeAgo}</Text>
            </View>
          </View>

          {/* Photos */}
          {job.photos && job.photos.length > 0 && (
            <View style={styles.photosSection}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {job.photos.map((photo, index) => (
                  <Image
                    key={index}
                    source={{ uri: photo }}
                    style={styles.photo}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {/* Description */}
          <Card variant="outlined" padding="md" style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{job.description}</Text>
          </Card>

          {/* AI Scope */}
          <Card variant="elevated" padding="md" style={styles.section}>
            <View style={styles.scopeHeader}>
              <Ionicons name="sparkles" size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>AI Scope & Estimate</Text>
            </View>
            <Text style={styles.scopeText}>{job.aiScope.scope}</Text>
            
            <View style={styles.priceEstimate}>
              <Text style={styles.priceLabel}>Estimated Price:</Text>
              <Text style={styles.priceValue}>
                ${job.aiScope.priceLow} - ${job.aiScope.priceHigh}
              </Text>
            </View>

            {job.aiScope.materials.length > 0 && (
              <View style={styles.materials}>
                <Text style={styles.materialsLabel}>Materials needed:</Text>
                <View style={styles.materialsList}>
                  {job.aiScope.materials.map((material, index) => (
                    <Badge key={index} label={material} variant="outline" size="sm" />
                  ))}
                </View>
              </View>
            )}
          </Card>

          {/* Bids Section */}
          <View style={styles.section}>
            <View style={styles.bidsHeader}>
              <Text style={styles.sectionTitle}>Bids ({job.bids.length})</Text>
              {isContractor && !hasAlreadyBid && job.status === 'open' && (
                <Button
                  title="Submit Bid"
                  size="sm"
                  onPress={() => setShowBidModal(true)}
                />
              )}
            </View>

            {job.bids.length === 0 ? (
              <Card variant="filled" padding="md">
                <Text style={styles.noBidsText}>
                  No bids yet. {isContractor ? 'Be the first to bid!' : 'Waiting for contractor bids.'}
                </Text>
              </Card>
            ) : (
              job.bids.map((bid) => (
                <Card key={bid.id} variant="outlined" padding="md" style={styles.bidCard}>
                  <View style={styles.bidHeader}>
                    <View>
                      <Text style={styles.bidContractor}>{bid.contractorName}</Text>
                      <Text style={styles.bidTime}>
                        {formatDistanceToNow(new Date(bid.createdAt), { addSuffix: true })}
                      </Text>
                    </View>
                    <View style={styles.bidRight}>
                      <Text style={styles.bidAmount}>${bid.amount}</Text>
                      <Badge
                        label={bid.status}
                        variant={
                          bid.status === 'accepted'
                            ? 'success'
                            : bid.status === 'rejected'
                            ? 'error'
                            : 'warning'
                        }
                        size="sm"
                      />
                    </View>
                  </View>
                  <Text style={styles.bidMessage}>{bid.message}</Text>
                  
                  {isOwner && bid.status === 'pending' && job.status === 'open' && (
                    <View style={styles.bidActions}>
                      <Button
                        title="Accept Bid"
                        size="sm"
                        onPress={() => handleAcceptBid(bid)}
                      />
                    </View>
                  )}
                </Card>
              ))
            )}
          </View>

          {/* Already bid notice */}
          {isContractor && hasAlreadyBid && (
            <Card variant="filled" padding="md" style={styles.alreadyBidCard}>
              <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
              <Text style={styles.alreadyBidText}>
                You've already submitted a bid for this job
              </Text>
            </Card>
          )}
        </ScrollView>

        {/* Bid Modal */}
        <Modal
          visible={showBidModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowBidModal(false)}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Submit Your Bid</Text>
              <TouchableOpacity onPress={() => setShowBidModal(false)}>
                <Ionicons name="close" size={28} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Card variant="filled" padding="md" style={styles.modalInfoCard}>
                <Text style={styles.modalJobTitle}>{job.title}</Text>
                <Text style={styles.modalEstimate}>
                  AI Estimate: ${job.aiScope.priceLow} - ${job.aiScope.priceHigh}
                </Text>
              </Card>

              <View style={styles.modalForm}>
                <TextInput
                  label="Your Bid Amount ($)"
                  placeholder="e.g., 150"
                  keyboardType="numeric"
                  value={bidAmount}
                  onChangeText={setBidAmount}
                />

                <TextInput
                  label="Message to Homeowner"
                  placeholder="Describe your experience and approach..."
                  value={bidMessage}
                  onChangeText={setBidMessage}
                  multiline
                  numberOfLines={4}
                  style={styles.messageInput}
                />

                <Text style={styles.feeNote}>
                  ✓ No bidding fees • ✓ Keep 100% of your earnings
                </Text>

                <Button
                  title="Submit Bid – $0 Fee"
                  onPress={handleSubmitBid}
                  loading={submittingBid}
                  disabled={submittingBid}
                  size="lg"
                />
              </View>
            </ScrollView>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </>
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
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  notFoundTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  notFoundDescription: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  emoji: {
    fontSize: 28,
    marginRight: Spacing.sm,
  },
  title: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
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
  photosSection: {
    marginBottom: Spacing.xl,
    marginHorizontal: -Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  photo: {
    width: 280,
    height: 200,
    borderRadius: BorderRadius.lg,
    marginRight: Spacing.md,
    backgroundColor: Colors.surfaceSecondary,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  scopeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  scopeText: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  priceEstimate: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginBottom: Spacing.md,
  },
  priceLabel: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
  },
  priceValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
    color: Colors.primary,
  },
  materials: {
    gap: Spacing.sm,
  },
  materialsLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  materialsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  bidsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  noBidsText: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  bidCard: {
    marginBottom: Spacing.md,
  },
  bidHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  bidContractor: {
    fontSize: Typography.fontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  bidTime: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  bidRight: {
    alignItems: 'flex-end',
    gap: Spacing.xs,
  },
  bidAmount: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
    color: Colors.primary,
  },
  bidMessage: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  bidActions: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  alreadyBidCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: `${Colors.success}15`,
  },
  alreadyBidText: {
    fontSize: Typography.fontSize.md,
    color: Colors.success,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  modalContent: {
    flex: 1,
    padding: Spacing.lg,
  },
  modalInfoCard: {
    marginBottom: Spacing.xl,
    backgroundColor: `${Colors.primary}10`,
  },
  modalJobTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  modalEstimate: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
  },
  modalForm: {
    gap: Spacing.lg,
  },
  messageInput: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: Spacing.md,
  },
  feeNote: {
    fontSize: Typography.fontSize.sm,
    color: Colors.success,
    textAlign: 'center',
    fontWeight: '500',
  },
});
