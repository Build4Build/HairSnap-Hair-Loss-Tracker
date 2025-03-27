import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '../navigation/types';
import { COLORS, FONT_SIZE, SPACING, SHADOWS } from '../constants/theme';
import { HairSnapshot, ProgressData, ProgressTrend } from '../types';

// Services
import { getAllSnapshots } from '../services/database';
import { calculateProgression, generateSuggestions } from '../services/analysis';
import { requestCameraPermissions } from '../services/camera';

const HomeScreen = () => {
  const navigation = useNavigation<StackNavigationProp<'Main'>>();
  const [snapshots, setSnapshots] = useState<HairSnapshot[]>([]);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [latestSnapshot, setLatestSnapshot] = useState<HairSnapshot | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load data on screen mount
    loadData();
    
    // Request camera permissions early
    requestCameraPermissions();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Get all snapshots
      const allSnapshots = await getAllSnapshots();
      setSnapshots(allSnapshots);
      
      // Get latest snapshot
      if (allSnapshots.length > 0) {
        const latest = allSnapshots.sort((a, b) => b.timestamp - a.timestamp)[0];
        setLatestSnapshot(latest);
      }
      
      // Calculate progress data
      const progress = calculateProgression(allSnapshots);
      setProgressData(progress);
      
      // Generate suggestions
      const newSuggestions = generateSuggestions(progress);
      setSuggestions(newSuggestions);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading home data:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    }
  };

  const handleCapturePhoto = () => {
    navigation.navigate('CapturePhoto');
  };

  const handleViewProgress = () => {
    navigation.navigate('ProgressDetail');
  };

  // Helper for trend icon and color
  const getTrendInfo = () => {
    if (!progressData) return { icon: 'help-circle', color: COLORS.textLight };
    
    switch (progressData.trend) {
      case ProgressTrend.IMPROVING:
        return { icon: 'trending-up', color: COLORS.success };
      case ProgressTrend.STABLE:
        return { icon: 'remove', color: COLORS.chartNeutral };
      case ProgressTrend.DECLINING:
        return { icon: 'trending-down', color: COLORS.error };
      default:
        return { icon: 'help-circle', color: COLORS.textLight };
    }
  };

  const trendInfo = getTrendInfo();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>HairSnap</Text>
        <Text style={styles.subtitle}>Your Hair Loss Tracker</Text>
      </View>
      
      {/* Latest photo card */}
      <View style={styles.latestPhotoCard}>
        <Text style={styles.sectionTitle}>Latest Snapshot</Text>
        {latestSnapshot ? (
          <>
            <Image 
              source={{ uri: latestSnapshot.imageUri }} 
              style={styles.latestImage}
              resizeMode="cover"
            />
            <View style={styles.photoDetails}>
              <Text style={styles.photoDate}>
                {new Date(latestSnapshot.timestamp).toLocaleDateString()}
              </Text>
              {latestSnapshot.hairLossScore !== undefined && (
                <View style={styles.scoreContainer}>
                  <Text style={styles.scoreLabel}>Hair Density Score: </Text>
                  <Text style={styles.scoreValue}>{latestSnapshot.hairLossScore.toFixed(1)}</Text>
                </View>
              )}
            </View>
          </>
        ) : (
          <View style={styles.noDataContainer}>
            <Ionicons name="image-outline" size={48} color={COLORS.textLight} />
            <Text style={styles.noDataText}>No snapshots taken yet</Text>
          </View>
        )}
      </View>
      
      {/* Current progress */}
      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.sectionTitle}>Hair Progress</Text>
          <TouchableOpacity onPress={handleViewProgress}>
            <Text style={styles.viewAllText}>View Details</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.trendContainer}>
          <Ionicons name={trendInfo.icon as any} size={24} color={trendInfo.color} />
          <Text style={[styles.trendText, { color: trendInfo.color }]}>
            {progressData?.trend === ProgressTrend.INSUFFICIENT_DATA 
              ? 'Not enough data' 
              : `${progressData?.trend} (${progressData?.percentChange || 0}%)`}
          </Text>
        </View>
        
        <Text style={styles.snapshotCount}>
          {snapshots.length} {snapshots.length === 1 ? 'snapshot' : 'snapshots'} recorded
        </Text>
      </View>
      
      {/* Suggestions */}
      <View style={styles.suggestionsCard}>
        <Text style={styles.sectionTitle}>Personalized Suggestions</Text>
        {suggestions.length > 0 ? (
          suggestions.map((suggestion, index) => (
            <View key={index} style={styles.suggestionItem}>
              <Ionicons name="bulb-outline" size={20} color={COLORS.primary} />
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>No suggestions available yet</Text>
        )}
      </View>
      
      {/* Capture button */}
      <TouchableOpacity style={styles.captureButton} onPress={handleCapturePhoto}>
        <Ionicons name="camera" size={24} color="#fff" />
        <Text style={styles.captureButtonText}>Take New Photo</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textLight,
  },
  latestPhotoCard: {
    ...SHADOWS.medium,
    backgroundColor: COLORS.card,
    borderRadius: SPACING.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    marginBottom: SPACING.md,
    color: COLORS.text,
  },
  latestImage: {
    width: '100%',
    height: 200,
    borderRadius: SPACING.md,
  },
  photoDetails: {
    marginTop: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  photoDate: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textLight,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
  },
  scoreValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  noDataText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textLight,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  progressCard: {
    ...SHADOWS.medium,
    backgroundColor: COLORS.card,
    borderRadius: SPACING.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.sm,
  },
  trendText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
    marginLeft: SPACING.xs,
  },
  snapshotCount: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textLight,
  },
  suggestionsCard: {
    ...SHADOWS.medium,
    backgroundColor: COLORS.card,
    borderRadius: SPACING.md,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
  },
  suggestionItem: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    alignItems: 'flex-start',
  },
  suggestionText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    flex: 1,
    marginLeft: SPACING.xs,
  },
  captureButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: SPACING.md,
    marginBottom: SPACING.xl,
    ...SHADOWS.medium,
  },
  captureButtonText: {
    color: '#fff',
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
});

export default HomeScreen; 