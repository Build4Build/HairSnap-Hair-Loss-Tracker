import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '../navigation/types';
import { COLORS, FONT_SIZE, SPACING, SHADOWS } from '../constants/theme';

// Services
import { takePhoto, pickPhotoFromLibrary, requestCameraPermissions } from '../services/camera';

const CameraScreen = () => {
  const navigation = useNavigation<StackNavigationProp<'CapturePhoto'>>();
  const [loading, setLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    // Check for camera permissions when screen loads
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const granted = await requestCameraPermissions();
    setHasPermission(granted);
  };

  const handleTakePhoto = async () => {
    try {
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Camera permission is needed to take photos.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Grant Permission', onPress: checkPermissions }
          ]
        );
        return;
      }

      setLoading(true);
      const imageUri = await takePhoto();
      setLoading(false);
      
      if (imageUri) {
        // Navigate to photo review screen with the captured image
        navigation.navigate('PhotoReview', { imageUri });
      }
    } catch (error) {
      setLoading(false);
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
    }
  };

  const handlePickFromLibrary = async () => {
    try {
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Media library access is needed to select photos.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Grant Permission', onPress: checkPermissions }
          ]
        );
        return;
      }

      setLoading(true);
      const imageUri = await pickPhotoFromLibrary();
      setLoading(false);
      
      if (imageUri) {
        // Navigate to photo review screen with the selected image
        navigation.navigate('PhotoReview', { imageUri });
      }
    } catch (error) {
      setLoading(false);
      console.error('Error picking from library:', error);
      Alert.alert('Error', 'Failed to select photo. Please try again.');
    }
  };

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.warning} />
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionText}>
            HairSnap needs camera and photo library access to capture and save hair photos.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={checkPermissions}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Capture Hair Photo</Text>
          <Text style={styles.subtitle}>
            Take a consistent photo of your hair to track changes over time
          </Text>
        </View>

        {/* Instructions card */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>For best results:</Text>
          <View style={styles.instructionItem}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
            <Text style={styles.instructionText}>Use good lighting</Text>
          </View>
          <View style={styles.instructionItem}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
            <Text style={styles.instructionText}>Maintain the same distance and angle each time</Text>
          </View>
          <View style={styles.instructionItem}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
            <Text style={styles.instructionText}>Take photos of crown, hairline, and overall view</Text>
          </View>
          <View style={styles.instructionItem}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
            <Text style={styles.instructionText}>Keep hair dry and not styled for consistent results</Text>
          </View>
        </View>

        {/* Camera buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={styles.cameraButton}
            onPress={handleTakePhoto}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="camera" size={24} color="#fff" />
                <Text style={styles.buttonText}>Take Photo</Text>
              </>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.libraryButton}
            onPress={handlePickFromLibrary}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.text} size="small" />
            ) : (
              <>
                <Ionicons name="images" size={24} color={COLORS.text} />
                <Text style={styles.libraryButtonText}>Select from Library</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textLight,
  },
  instructionsCard: {
    ...SHADOWS.medium,
    backgroundColor: COLORS.card,
    borderRadius: SPACING.md,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  instructionsTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    marginBottom: SPACING.md,
    color: COLORS.text,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  buttonsContainer: {
    marginTop: 'auto',
    marginBottom: SPACING.xl,
  },
  cameraButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.medium,
  },
  libraryButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: SPACING.md,
    ...SHADOWS.small,
  },
  buttonText: {
    color: '#fff',
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
  libraryButtonText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  permissionTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  permissionText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  permissionButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: SPACING.md,
    ...SHADOWS.medium,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
});

export default CameraScreen; 