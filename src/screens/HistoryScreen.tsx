import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { StackNavigationProp } from '../navigation/types';
import { COLORS, FONT_SIZE, SPACING, SHADOWS } from '../constants/theme';
import { HairSnapshot } from '../types';

// Services
import { getAllSnapshots, deleteSnapshot } from '../services/database';

const HistoryScreen = () => {
  const navigation = useNavigation<StackNavigationProp<'Main'>>();
  const [snapshots, setSnapshots] = useState<HairSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSnapshots();
  }, []);

  const loadSnapshots = async () => {
    try {
      setLoading(true);
      const allSnapshots = await getAllSnapshots();
      // Sort by timestamp (newest first)
      allSnapshots.sort((a, b) => b.timestamp - a.timestamp);
      setSnapshots(allSnapshots);
      setLoading(false);
    } catch (error) {
      console.error('Error loading snapshots:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to load snapshots. Please try again.');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSnapshots();
    setRefreshing(false);
  };

  const handleSnapshotPress = (snapshotId: string) => {
    navigation.navigate('SnapshotDetail', { snapshotId });
  };

  const handleDeleteSnapshot = async (snapshotId: string) => {
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
              // Remove from state
              setSnapshots(prev => prev.filter(s => s.id !== snapshotId));
            } catch (error) {
              console.error('Error deleting snapshot:', error);
              Alert.alert('Error', 'Failed to delete snapshot. Please try again.');
            }
          }
        }
      ]
    );
  };

  const renderSnapshotItem = ({ item }: { item: HairSnapshot }) => {
    const date = new Date(item.timestamp);
    const formattedDate = format(date, 'MMM d, yyyy');
    const formattedTime = format(date, 'h:mm a');

    return (
      <TouchableOpacity 
        style={styles.snapshotItem}
        onPress={() => handleSnapshotPress(item.id)}
      >
        <Image 
          source={{ uri: item.imageUri }} 
          style={styles.snapshotImage}
          resizeMode="cover"
        />
        <View style={styles.snapshotInfo}>
          <View style={styles.snapshotHeader}>
            <Text style={styles.snapshotDate}>{formattedDate}</Text>
            <Text style={styles.snapshotTime}>{formattedTime}</Text>
          </View>
          
          {item.hairLossScore !== undefined && (
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreLabel}>Density Score:</Text>
              <Text style={styles.scoreValue}>{item.hairLossScore.toFixed(1)}</Text>
            </View>
          )}
          
          {item.notes && (
            <Text 
              style={styles.snapshotNotes}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {item.notes}
            </Text>
          )}
          
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => handleDeleteSnapshot(item.id)}
          >
            <Ionicons name="trash-outline" size={18} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading snapshots...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
        <Text style={styles.subtitle}>Your hair tracking journey</Text>
      </View>
      
      {snapshots.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="images-outline" size={64} color={COLORS.textLight} />
          <Text style={styles.emptyText}>No snapshots yet</Text>
          <Text style={styles.emptySubtext}>
            Take your first hair photo to start tracking your progress
          </Text>
          <TouchableOpacity 
            style={styles.captureButton}
            onPress={() => navigation.navigate('CapturePhoto')}
          >
            <Ionicons name="camera-outline" size={20} color="#fff" />
            <Text style={styles.captureButtonText}>Take Photo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={snapshots}
          renderItem={renderSnapshotItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textLight,
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
  listContent: {
    padding: SPACING.md,
    paddingTop: 0,
  },
  snapshotItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: SPACING.md,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  snapshotImage: {
    width: 100,
    height: 100,
  },
  snapshotInfo: {
    flex: 1,
    padding: SPACING.md,
    position: 'relative',
  },
  snapshotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  snapshotDate: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  snapshotTime: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textLight,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  scoreLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
  },
  scoreValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  snapshotNotes: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
  deleteButton: {
    position: 'absolute',
    bottom: SPACING.md,
    right: SPACING.md,
    padding: SPACING.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  emptySubtext: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  captureButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: SPACING.md,
    ...SHADOWS.medium,
  },
  captureButtonText: {
    color: '#fff',
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
});

export default HistoryScreen; 