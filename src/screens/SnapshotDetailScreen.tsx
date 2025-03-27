import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { RootRouteProp, StackNavigationProp } from '../navigation/types';
import { COLORS, FONT_SIZE, SPACING, SHADOWS } from '../constants/theme';
import { HairSnapshot } from '../types';

// Services
import { getSnapshotById, deleteSnapshot } from '../services/database';

const SnapshotDetailScreen = () => {
  const route = useRoute<RootRouteProp<'SnapshotDetail'>>();
  const navigation = useNavigation<StackNavigationProp<'SnapshotDetail'>>();
  const { snapshotId } = route.params;
  
  const [snapshot, setSnapshot] = useState<HairSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSnapshot();
  }, [snapshotId]);

  const loadSnapshot = async () => {
    try {
      setLoading(true);
      const snapshotData = await getSnapshotById(snapshotId);
      setSnapshot(snapshotData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading snapshot:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to load snapshot details. Please try again.');
    }
  };

  const handleDeleteSnapshot = async () => {
    Alert.alert(
      'Delete Snapshot',
      'Are you sure you want to delete this snapshot? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSnapshot(snapshotId);
              // Navigate back after deletion
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting snapshot:', error);
              Alert.alert('Error', 'Failed to delete snapshot. Please try again.');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading snapshot details...</Text>
      </View>
    );
  }

  if (!snapshot) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
        <Text style={styles.errorText}>Snapshot not found</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const date = new Date(snapshot.timestamp);
  const formattedDate = format(date, 'MMMM d, yyyy');
  const formattedTime = format(date, 'h:mm a');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Image */}
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: snapshot.imageUri }} 
          style={styles.image}
          resizeMode="cover"
        />
      </View>
      
      {/* Date and time */}
      <View style={styles.dateContainer}>
        <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
        <Text style={styles.dateText}>{formattedDate} at {formattedTime}</Text>
      </View>
      
      {/* Hair density scores */}
      {snapshot.hairLossScore !== undefined && (
        <View style={styles.scoresCard}>
          <Text style={styles.sectionTitle}>Hair Density Analysis</Text>
          
          {/* Overall score */}
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>Overall Density:</Text>
            <View style={styles.scoreBarContainer}>
              <View 
                style={[
                  styles.scoreBar, 
                  { width: `${snapshot.hairLossScore}%` }
                ]} 
              />
            </View>
            <Text style={styles.scoreValue}>{snapshot.hairLossScore.toFixed(1)}</Text>
          </View>
          
          {/* Crown score */}
          {snapshot.areas?.crown !== undefined && (
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Crown Area:</Text>
              <View style={styles.scoreBarContainer}>
                <View 
                  style={[
                    styles.scoreBar, 
                    { width: `${snapshot.areas.crown}%` }
                  ]} 
                />
              </View>
              <Text style={styles.scoreValue}>{snapshot.areas.crown.toFixed(1)}</Text>
            </View>
          )}
          
          {/* Hairline score */}
          {snapshot.areas?.hairline !== undefined && (
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Hairline:</Text>
              <View style={styles.scoreBarContainer}>
                <View 
                  style={[
                    styles.scoreBar, 
                    { width: `${snapshot.areas.hairline}%` }
                  ]} 
                />
              </View>
              <Text style={styles.scoreValue}>{snapshot.areas.hairline.toFixed(1)}</Text>
            </View>
          )}
        </View>
      )}
      
      {/* Notes */}
      <View style={styles.notesCard}>
        <Text style={styles.sectionTitle}>Notes</Text>
        {snapshot.notes ? (
          <Text style={styles.notesText}>{snapshot.notes}</Text>
        ) : (
          <Text style={styles.emptyNotesText}>No notes for this snapshot</Text>
        )}
      </View>
      
      {/* Delete button */}
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={handleDeleteSnapshot}
      >
        <Ionicons name="trash-outline" size={20} color="#fff" />
        <Text style={styles.deleteButtonText}>Delete Snapshot</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.textLight,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
    fontSize: FONT_SIZE.lg,
    color: COLORS.error,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: SPACING.md,
  },
  backButtonText: {
    color: '#fff',
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
  imageContainer: {
    overflow: 'hidden',
    borderRadius: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.medium,
  },
  image: {
    width: '100%',
    height: 300,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  dateText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    marginLeft: SPACING.xs,
  },
  scoresCard: {
    backgroundColor: COLORS.card,
    borderRadius: SPACING.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    ...SHADOWS.small,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    marginBottom: SPACING.md,
    color: COLORS.text,
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
  notesCard: {
    backgroundColor: COLORS.card,
    borderRadius: SPACING.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    ...SHADOWS.small,
  },
  notesText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    lineHeight: 22,
  },
  emptyNotesText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textLight,
    fontStyle: 'italic',
  },
  deleteButton: {
    backgroundColor: COLORS.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: SPACING.md,
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
    ...SHADOWS.medium,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
});

export default SnapshotDetailScreen; 