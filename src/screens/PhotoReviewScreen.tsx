import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  TextInput,
  ActivityIndicator,
  Alert
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp, RootRouteProp } from '../navigation/types';
import { COLORS, FONT_SIZE, SPACING, SHADOWS } from '../constants/theme';
import { v4 as uuidv4 } from 'uuid';

// Services
import { saveSnapshot } from '../services/database';
import { analyzeHairImage } from '../services/analysis';

const PhotoReviewScreen = () => {
  const navigation = useNavigation<StackNavigationProp<'PhotoReview'>>();
  const route = useRoute<RootRouteProp<'PhotoReview'>>();
  const { imageUri } = route.params;
  
  const [notes, setNotes] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<{
    overallScore: number;
    crownScore?: number;
    hairlineScore?: number;
  } | null>(null);

  // Start analysis of the image
  const handleAnalyze = async () => {
    try {
      setAnalyzing(true);
      const results = await analyzeHairImage(imageUri);
      setAnalysisResults(results);
      setAnalyzing(false);
    } catch (error) {
      setAnalyzing(false);
      console.error('Error analyzing image:', error);
      Alert.alert('Analysis Error', 'Failed to analyze hair image. Please try again.');
    }
  };

  // Save the snapshot to database
  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Save snapshot with analysis data if available
      const snapshot = {
        id: uuidv4(),
        imageUri,
        timestamp: Date.now(),
        notes: notes.trim() || undefined,
        hairLossScore: analysisResults?.overallScore,
        areas: analysisResults ? {
          crown: analysisResults.crownScore,
          hairline: analysisResults.hairlineScore,
          overall: analysisResults.overallScore
        } : undefined
      };
      
      await saveSnapshot(snapshot);
      
      setSaving(false);
      
      // Navigate back to home and reset stack
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (error) {
      setSaving(false);
      console.error('Error saving snapshot:', error);
      Alert.alert('Save Error', 'Failed to save snapshot. Please try again.');
    }
  };

  const handleRetake = () => {
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Image preview */}
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: imageUri }} 
          style={styles.image}
          resizeMode="cover"
        />
      </View>
      
      {/* Analysis section */}
      <View style={styles.analysisContainer}>
        <Text style={styles.sectionTitle}>Hair Analysis</Text>
        
        {analyzing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Analyzing hair density...</Text>
          </View>
        ) : analysisResults ? (
          // Results display
          <View style={styles.resultsContainer}>
            {/* Overall score */}
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Overall Density:</Text>
              <View style={styles.scoreBarContainer}>
                <View 
                  style={[
                    styles.scoreBar, 
                    { width: `${analysisResults.overallScore}%` }
                  ]} 
                />
              </View>
              <Text style={styles.scoreValue}>{analysisResults.overallScore.toFixed(1)}</Text>
            </View>
            
            {/* Crown score */}
            {analysisResults.crownScore !== undefined && (
              <View style={styles.scoreRow}>
                <Text style={styles.scoreLabel}>Crown Area:</Text>
                <View style={styles.scoreBarContainer}>
                  <View 
                    style={[
                      styles.scoreBar, 
                      { width: `${analysisResults.crownScore}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.scoreValue}>{analysisResults.crownScore.toFixed(1)}</Text>
              </View>
            )}
            
            {/* Hairline score */}
            {analysisResults.hairlineScore !== undefined && (
              <View style={styles.scoreRow}>
                <Text style={styles.scoreLabel}>Hairline:</Text>
                <View style={styles.scoreBarContainer}>
                  <View 
                    style={[
                      styles.scoreBar, 
                      { width: `${analysisResults.hairlineScore}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.scoreValue}>{analysisResults.hairlineScore.toFixed(1)}</Text>
              </View>
            )}
          </View>
        ) : (
          // Analyze button
          <TouchableOpacity style={styles.analyzeButton} onPress={handleAnalyze}>
            <Ionicons name="analytics-outline" size={20} color="#fff" />
            <Text style={styles.analyzeButtonText}>Analyze Hair Density</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Notes input */}
      <View style={styles.notesContainer}>
        <Text style={styles.sectionTitle}>Notes</Text>
        <TextInput
          style={styles.notesInput}
          placeholder="Add notes about your hair condition..."
          multiline
          value={notes}
          onChangeText={setNotes}
          maxLength={200}
          placeholderTextColor={COLORS.textLight}
        />
      </View>
      
      {/* Action buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="save-outline" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Save Snapshot</Text>
            </>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.retakeButton} 
          onPress={handleRetake}
          disabled={saving}
        >
          <Ionicons name="camera-outline" size={20} color={COLORS.text} />
          <Text style={styles.retakeButtonText}>Retake Photo</Text>
        </TouchableOpacity>
      </View>
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
  imageContainer: {
    overflow: 'hidden',
    borderRadius: SPACING.md,
    marginBottom: SPACING.lg,
    ...SHADOWS.medium,
  },
  image: {
    width: '100%',
    height: 300,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    marginBottom: SPACING.md,
    color: COLORS.text,
  },
  analysisContainer: {
    backgroundColor: COLORS.card,
    borderRadius: SPACING.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    ...SHADOWS.small,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textLight,
    marginTop: SPACING.md,
  },
  resultsContainer: {
    marginTop: SPACING.sm,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  scoreLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    width: 100,
  },
  scoreBarContainer: {
    flex: 1,
    height: 12,
    backgroundColor: COLORS.border,
    borderRadius: 6,
    overflow: 'hidden',
    marginHorizontal: SPACING.md,
  },
  scoreBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  scoreValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
    color: COLORS.primary,
    width: 40,
    textAlign: 'right',
  },
  analyzeButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: SPACING.sm,
    marginVertical: SPACING.sm,
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  notesContainer: {
    backgroundColor: COLORS.card,
    borderRadius: SPACING.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    ...SHADOWS.small,
  },
  notesInput: {
    backgroundColor: COLORS.background,
    borderRadius: SPACING.sm,
    padding: SPACING.md,
    minHeight: 100,
    color: COLORS.text,
    textAlignVertical: 'top',
  },
  buttonsContainer: {
    marginBottom: SPACING.xl,
  },
  saveButton: {
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
  saveButtonText: {
    color: '#fff',
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
  retakeButton: {
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
  retakeButtonText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
});

export default PhotoReviewScreen; 