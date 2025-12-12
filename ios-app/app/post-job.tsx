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
import type { Job } from '@/src/types';
import { v4 as uuidv4 } from 'uuid';

export default function PostJobScreen() {
  const router = useRouter();
  const { currentUser, addJob } = useAppStore();
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

    // Generate random scope based on title/description
    const keywords = (title + ' ' + description).toLowerCase();
    let priceLow = 100;
    let priceHigh = 300;
    let materials: string[] = [];
    let scope = '';

    if (keywords.includes('plumb') || keywords.includes('faucet') || keywords.includes('toilet')) {
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
    } else if (keywords.includes('roof') || keywords.includes('gutter')) {
      priceLow = 200;
      priceHigh = 600;
      materials = ['Roofing materials', 'Sealant', 'Flashing'];
      scope = 'Roof inspection and repair including sealing, flashing, and gutter maintenance.';
    } else if (keywords.includes('hvac') || keywords.includes('ac') || keywords.includes('heat')) {
      priceLow = 150;
      priceHigh = 500;
      materials = ['HVAC filters', 'Refrigerant', 'Parts'];
      scope = 'HVAC system inspection, cleaning, and repairs to restore optimal operation.';
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
              Contractors will review this scope when submitting their bids.
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
});
