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
  Image,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Button, TextInput, Card } from '@/src/components/ui';
import { useAppStore } from '@/src/store';
import { Colors, Spacing, Typography, BorderRadius } from '@/src/constants/theme';
import { calculateJobSize } from '@/src/types';
import type { Job, JobSize } from '@/src/types';
import { v4 as uuidv4 } from 'uuid';

type Step = 'tier-select' | 'project-select' | 'input' | 'processing';
type ProjectType = 'kitchen-remodel' | 'bathroom-remodel' | 'roof-replacement' | 'deck-build' | 'fence-installation' | 'room-addition' | 'custom' | null;

const PROJECT_TEMPLATES = [
  {
    type: 'kitchen-remodel' as const,
    emoji: '🍳',
    title: 'Kitchen Remodel',
    priceRange: '$15K-$50K · 4-8 weeks',
  },
  {
    type: 'bathroom-remodel' as const,
    emoji: '🚿',
    title: 'Bathroom Remodel',
    priceRange: '$8K-$35K · 2-5 weeks',
  },
  {
    type: 'roof-replacement' as const,
    emoji: '🏠',
    title: 'Roof Replacement',
    priceRange: '$8K-$25K · 2-5 days',
  },
  {
    type: 'deck-build' as const,
    emoji: '🪵',
    title: 'Deck Build',
    priceRange: '$8K-$35K · 1-3 weeks',
  },
  {
    type: 'fence-installation' as const,
    emoji: '🚧',
    title: 'Fence Installation',
    priceRange: '$3K-$15K · 2-5 days',
  },
  {
    type: 'room-addition' as const,
    emoji: '🏗️',
    title: 'Room Addition',
    priceRange: '$25K-$100K · 6-12 weeks',
  },
  {
    type: 'custom' as const,
    emoji: '✏️',
    title: 'Custom Project',
    priceRange: 'Describe your own project',
    isCustom: true,
  },
] as const;

export default function PostJobScreen() {
  const router = useRouter();
  const { currentUser, addJob } = useAppStore();
  const [step, setStep] = useState<Step>('tier-select');
  const [selectedTier, setSelectedTier] = useState<JobSize | null>(null);
  const [selectedProjectType, setSelectedProjectType] = useState<ProjectType>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiProcessing, setAiProcessing] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please allow access to your photo library to upload project photos.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newPhotos = result.assets.map((asset) => asset.uri);
      setPhotos((prev) => [...prev, ...newPhotos].slice(0, 5)); // Max 5 photos
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please allow access to your camera to take project photos.'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotos((prev) => [...prev, result.assets[0].uri].slice(0, 5));
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const simulateAIScope = async () => {
    setAiProcessing(true);
    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Generate scope based on project type and keywords
    const keywords = (title + ' ' + description).toLowerCase();
    let priceLow = 100;
    let priceHigh = 300;
    let materials: string[] = [];
    let scope = '';

    // Use project type for better estimates
    if (selectedProjectType === 'kitchen-remodel') {
      priceLow = 15000;
      priceHigh = 50000;
      materials = ['Cabinets', 'Countertops', 'Appliances', 'Flooring', 'Lighting'];
      scope = 'Complete kitchen remodel including cabinets, countertops, appliances, and finishes.';
    } else if (selectedProjectType === 'bathroom-remodel') {
      priceLow = 8000;
      priceHigh = 35000;
      materials = ['Fixtures', 'Tile', 'Vanity', 'Lighting', 'Plumbing'];
      scope = 'Full bathroom renovation with new fixtures, tile work, and modern finishes.';
    } else if (selectedProjectType === 'roof-replacement') {
      priceLow = 8000;
      priceHigh = 25000;
      materials = ['Roofing shingles', 'Underlayment', 'Flashing', 'Ventilation'];
      scope = 'Complete roof replacement including tear-off, new materials, and warranty.';
    } else if (selectedProjectType === 'deck-build') {
      priceLow = 8000;
      priceHigh = 35000;
      materials = ['Decking boards', 'Framing lumber', 'Posts', 'Railings', 'Hardware'];
      scope = 'Custom deck construction with quality materials and professional installation.';
    } else if (selectedProjectType === 'fence-installation') {
      priceLow = 3000;
      priceHigh = 15000;
      materials = ['Fence panels', 'Posts', 'Concrete', 'Gate hardware'];
      scope = 'Professional fence installation with durable materials and proper anchoring.';
    } else if (selectedProjectType === 'room-addition') {
      priceLow = 25000;
      priceHigh = 100000;
      materials = ['Framing', 'Drywall', 'Electrical', 'HVAC', 'Flooring', 'Windows'];
      scope = 'Major room addition including foundation, framing, systems, and finishes.';
    } else if (keywords.includes('plumb') || keywords.includes('faucet') || keywords.includes('toilet')) {
      priceLow = 75;
      priceHigh = 200;
      materials = ['Plumbing supplies', 'Teflon tape', 'Fittings'];
      scope = 'Plumbing repair including inspection, parts replacement, and testing for proper operation.';
    } else if (keywords.includes('electric') || keywords.includes('outlet') || keywords.includes('switch')) {
      priceLow = 80;
      priceHigh = 180;
      materials = ['Electrical components', 'Wire nuts', 'Electrical tape'];
      scope = 'Electrical repair including safety inspection, component replacement, and testing.';
    } else if (keywords.includes('paint') || keywords.includes('wall') || keywords.includes('drywall')) {
      priceLow = 150;
      priceHigh = 400;
      materials = ['Paint', 'Primer', 'Joint compound', 'Sandpaper'];
      scope = 'Surface preparation and painting including patching, priming, and finish coat application.';
    } else {
      priceLow = 100 + Math.floor(Math.random() * 100);
      priceHigh = priceLow + 100 + Math.floor(Math.random() * 200);
      materials = ['General supplies', 'Hardware', 'Fasteners'];
      scope = `Home repair project: ${title}. Complete inspection, necessary repairs, and cleanup.`;
    }

    setAiProcessing(false);
    return { scope, priceLow, priceHigh, materials };
  };

  const handleSubmit = async () => {
    if (!currentUser) {
      Alert.alert('Error', 'Please log in to post a job.');
      return;
    }

    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a job title.');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please describe your project.');
      return;
    }

    setLoading(true);

    try {
      const aiScope = await simulateAIScope();

      const newJob: Job = {
        id: uuidv4(),
        homeownerId: currentUser.id,
        title: title.trim(),
        description: description.trim(),
        photos: photos.length > 0 ? photos : undefined,
        mediaType: photos.length > 0 ? 'photo' : undefined,
        aiScope: {
          scope: aiScope.scope,
          priceLow: aiScope.priceLow,
          priceHigh: aiScope.priceHigh,
          materials: aiScope.materials,
        },
        size: calculateJobSize(aiScope.priceHigh),
        status: 'open',
        createdAt: new Date().toISOString(),
        bids: [],
      };

      addJob(newJob);

      Alert.alert(
        'Job Posted! 🎉',
        `Your job has been posted. AI estimate: $${aiScope.priceLow} - $${aiScope.priceHigh}`,
        [
          {
            text: 'View Job',
            onPress: () => {
              router.back();
              router.push(`/job/${newJob.id}`);
            },
          },
          {
            text: 'Go to Dashboard',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to post job. Please try again.');
    } finally {
      setLoading(false);
    }
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
          {/* Header with Back Button */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => {
              if (step === 'project-select') {
                setStep('tier-select');
              } else if (step === 'input') {
                setStep('project-select');
              } else {
                router.back();
              }
            }}>
              <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Post a Job</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Tier Selection Screen */}
          {step === 'tier-select' && (
            <View>
              <Card variant="elevated" padding="lg" style={styles.stepCard}>
                <Text style={styles.stepTitle}>Select Job Size</Text>
                <Text style={styles.stepDescription}>
                  Choose the category that best fits your project
                </Text>
                
                <View style={styles.tierContainer}>
                  <TouchableOpacity
                    style={[styles.tierButton, selectedTier === 'small' && styles.tierButtonSelected]}
                    onPress={() => {
                      setSelectedTier('small');
                      setStep('project-select');
                    }}
                  >
                    <Text style={styles.tierEmoji}>🟢</Text>
                    <Text style={styles.tierTitle}>Small Jobs</Text>
                    <Text style={styles.tierPrice}>Under $500</Text>
                    <Text style={styles.tierExamples}>Quick fixes, repairs</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.tierButton, selectedTier === 'medium' && styles.tierButtonSelected]}
                    onPress={() => {
                      setSelectedTier('medium');
                      setStep('project-select');
                    }}
                  >
                    <Text style={styles.tierEmoji}>🟡</Text>
                    <Text style={styles.tierTitle}>Medium Projects</Text>
                    <Text style={styles.tierPrice}>$500 - $2,000</Text>
                    <Text style={styles.tierExamples}>Upgrades, installations</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.tierButton, selectedTier === 'large' && styles.tierButtonSelected]}
                    onPress={() => {
                      setSelectedTier('large');
                      setStep('project-select');
                    }}
                  >
                    <Text style={styles.tierEmoji}>🔴</Text>
                    <Text style={styles.tierTitle}>Major Projects</Text>
                    <Text style={styles.tierPrice}>$2,000+</Text>
                    <Text style={styles.tierExamples}>Remodels, additions</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            </View>
          )}

          {/* Project Selection Screen */}
          {step === 'project-select' && (
            <View>
              <Card variant="elevated" padding="lg" style={styles.stepCard}>
                <Text style={styles.stepTitle}>Select Your Project Type</Text>
                <Text style={styles.stepDescription}>
                  Choose a template or describe a custom project
                </Text>
                
                <View style={styles.projectGrid}>
                  {PROJECT_TEMPLATES.map((project) => (
                    <TouchableOpacity
                      key={project.type}
                      style={[
                        styles.projectButton,
                        project.isCustom && styles.projectButtonCustom
                      ]}
                      onPress={() => {
                        setSelectedProjectType(project.type);
                        setStep('input');
                      }}
                    >
                      <Text style={styles.projectEmoji}>{project.emoji}</Text>
                      <View style={styles.projectInfo}>
                        <Text style={styles.projectTitle} numberOfLines={1}>
                          {project.title}
                        </Text>
                        <Text style={styles.projectPrice} numberOfLines={1}>
                          {project.priceRange}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </Card>
            </View>
          )}

          {/* Input Screen */}
          {step === 'input' && (
            <View>
          {/* Input Screen */}
          {step === 'input' && (
            <View>
              {/* Selected Project Info */}
              {selectedProjectType && (
                <Card variant="filled" padding="md" style={styles.selectedProjectCard}>
                  <View style={styles.selectedProjectHeader}>
                    <Text style={styles.selectedProjectEmoji}>
                      {PROJECT_TEMPLATES.find(p => p.type === selectedProjectType)?.emoji}
                    </Text>
                    <View style={styles.selectedProjectInfo}>
                      <Text style={styles.selectedProjectTitle}>
                        {PROJECT_TEMPLATES.find(p => p.type === selectedProjectType)?.title}
                      </Text>
                      <Text style={styles.selectedProjectRange}>
                        {PROJECT_TEMPLATES.find(p => p.type === selectedProjectType)?.priceRange}
                      </Text>
                    </View>
                  </View>
                </Card>
              )}

              {/* Title Input */}
              <View style={styles.section}>
                <TextInput
                  label="What needs to be done?"
                  placeholder="e.g., Kitchen faucet replacement"
                  value={title}
                  onChangeText={setTitle}
                />
              </View>

              {/* Description Input */}
              <View style={styles.section}>
                <TextInput
                  label="Describe your project"
                  placeholder="Provide details about the work needed..."
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                  style={styles.textArea}
                />
              </View>

              {/* Photo Upload Section */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Add Photos (Optional)</Text>
                <Text style={styles.helperText}>
                  Photos help contractors understand your project better
                </Text>

                <View style={styles.photoGrid}>
                  {photos.map((uri, index) => (
                    <View key={uri} style={styles.photoContainer}>
                      <Image source={{ uri }} style={styles.photoPreview} />
                      <TouchableOpacity
                        style={styles.removePhotoButton}
                        onPress={() => removePhoto(index)}
                      >
                        <Ionicons name="close-circle" size={24} color={Colors.error} />
                      </TouchableOpacity>
                    </View>
                  ))}
                  
                  {photos.length < 5 && (
                    <View style={styles.addPhotoButtons}>
                      <TouchableOpacity
                        style={styles.addPhotoButton}
                        onPress={pickImage}
                      >
                        <Ionicons name="images" size={32} color={Colors.textSecondary} />
                        <Text style={styles.addPhotoText}>Library</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.addPhotoButton}
                        onPress={takePhoto}
                      >
                        <Ionicons name="camera" size={32} color={Colors.textSecondary} />
                        <Text style={styles.addPhotoText}>Camera</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>

              {/* AI Info Card */}
              <Card variant="filled" padding="md" style={styles.infoCard}>
                <View style={styles.infoHeader}>
                  <Ionicons name="sparkles" size={24} color={Colors.primary} />
                  <Text style={styles.infoTitle}>AI-Powered Scoping</Text>
                </View>
                <Text style={styles.infoText}>
                  Our AI will analyze your project and provide an instant price estimate. 
                  Contractors/Subcontractors will review this scope when submitting their bids.
                </Text>
              </Card>

              {/* Submit Button */}
              <Button
                title={aiProcessing ? 'AI is analyzing...' : 'Post Job – $0'}
                onPress={handleSubmit}
                loading={loading || aiProcessing}
                disabled={loading || aiProcessing || !title.trim() || !description.trim()}
                size="lg"
                style={styles.submitButton}
              />

              <Text style={styles.freeNote}>
                ✓ Free to post • ✓ Free to bid • ✓ No commissions
              </Text>
            </View>
          )}
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
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  helperText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
    paddingTop: Spacing.md,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  photoContainer: {
    position: 'relative',
  },
  photoPreview: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceSecondary,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
  },
  addPhotoButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  addPhotoText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  infoCard: {
    marginBottom: Spacing.xl,
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  infoTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  infoText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  submitButton: {
    marginBottom: Spacing.md,
  },
  freeNote: {
    fontSize: Typography.fontSize.sm,
    color: Colors.success,
    textAlign: 'center',
    fontWeight: '500',
  },
  // New styles for tier and project selection
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
    paddingTop: Spacing.md,
  },
  headerTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  stepCard: {
    marginBottom: Spacing.xl,
  },
  stepTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  stepDescription: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  tierContainer: {
    gap: Spacing.md,
  },
  tierButton: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  tierButtonSelected: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(249, 115, 22, 0.05)',
  },
  tierEmoji: {
    fontSize: 40,
    marginBottom: Spacing.sm,
  },
  tierTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  tierPrice: {
    fontSize: Typography.fontSize.base,
    fontWeight: '500',
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  tierExamples: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  projectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  projectButton: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  projectButtonCustom: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.primary,
  },
  projectEmoji: {
    fontSize: 32,
  },
  projectInfo: {
    flex: 1,
    minWidth: 0,
  },
  projectTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  projectPrice: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  selectedProjectCard: {
    marginBottom: Spacing.lg,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
  },
  selectedProjectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  selectedProjectEmoji: {
    fontSize: 36,
  },
  selectedProjectInfo: {
    flex: 1,
  },
  selectedProjectTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  selectedProjectRange: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
});
