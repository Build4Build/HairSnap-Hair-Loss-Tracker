import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  Alert,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { COLORS, FONT_SIZE, SPACING, SHADOWS } from '../constants/theme';
import { HairSnapshot, ProgressData, ProgressTrend } from '../types';

// Services
import { getAllSnapshots } from '../services/database';
import { calculateProgression, generateSuggestions } from '../services/analysis';

const screenWidth = Dimensions.get('window').width;

const ProgressDetailScreen = () => {
  const [snapshots, setSnapshots] = useState<HairSnapshot[]>([]);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Get all snapshots
      const allSnapshots = await getAllSnapshots();
      setSnapshots(allSnapshots);
      
      // Calculate progress data
      const progress = calculateProgression(allSnapshots);
      setProgressData(progress);
      
      // Generate suggestions
      const newSuggestions = generateSuggestions(progress);
      setSuggestions(newSuggestions);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading progress data:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to load progress data. Please try again.');
    }
  };

  // Helper for trend icon and color
  const getTrendInfo = () => {
    if (!progressData) return { icon: 'help-circle', color: COLORS.textLight, text: 'Unknown' };
    
    switch (progressData.trend) {
      case ProgressTrend.IMPROVING:
        return { 
          icon: 'trending-up', 
          color: COLORS.success,
          text: 'Improving'
        };
      case ProgressTrend.STABLE:
        return { 
          icon: 'remove', 
          color: COLORS.chartNeutral,
          text: 'Stable'
        };
      case ProgressTrend.DECLINING:
        return { 
          icon: 'trending-down', 
          color: COLORS.error,
          text: 'Declining'
        };
      default:
        return { 
          icon: 'help-circle', 
          color: COLORS.textLight,
          text: 'Insufficient Data'
        };
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Analyzing your progress...</Text>
      </View>
    );
  }

  const trendInfo = getTrendInfo();
  const hasData = progressData && progressData.historicalScores.length > 0;
  const hasEnoughData = progressData && progressData.trend !== ProgressTrend.INSUFFICIENT_DATA;

  // Prepare chart data
  const chartData = hasData ? {
    labels: progressData!.historicalScores.map(item => {
      const date = new Date(item.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }),
    datasets: [
      {
        data: progressData!.historicalScores.map(item => item.score),
        color: () => COLORS.primary,
        strokeWidth: 2
      }
    ]
  } : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Hair Progress</Text>
        <Text style={styles.subtitle}>Track your hair density over time</Text>
      </View>
      
      {/* Summary card */}
      <View style={styles.summaryCard}>
        <Text style={styles.sectionTitle}>Current Status</Text>
        
        {hasEnoughData ? (
          <>
            <View style={styles.trendContainer}>
              <Ionicons name={trendInfo.icon as any} size={32} color={trendInfo.color} />
              <View style={styles.trendTextContainer}>
                <Text style={[styles.trendText, { color: trendInfo.color }]}>
                  {trendInfo.text}
                </Text>
                {progressData?.percentChange !== undefined && (
                  <Text style={styles.percentChangeText}>
                    {progressData.percentChange > 0 ? '+' : ''}
                    {progressData.percentChange.toFixed(1)}% change
                  </Text>
                )}
              </View>
            </View>
            
            <Text style={styles.summaryText}>
              {progressData?.trend === ProgressTrend.IMPROVING
                ? 'Your hair density is improving! Keep up with your current routine.'
                : progressData?.trend === ProgressTrend.STABLE
                ? 'Your hair density is stable. Continue monitoring for any changes.'
                : 'Your hair density is declining. Consider the suggestions below.'}
            </Text>
          </>
        ) : (
          <View style={styles.insufficientDataContainer}>
            <Ionicons name="information-circle-outline" size={32} color={COLORS.textLight} />
            <Text style={styles.insufficientDataText}>
              Take at least 2 snapshots to see your hair loss progression.
            </Text>
          </View>
        )}
      </View>
      
      {/* Chart */}
      {hasData && chartData && (
        <View style={styles.chartCard}>
          <Text style={styles.sectionTitle}>Hair Density Trend</Text>
          <Text style={styles.chartSubtitle}>Higher score = more hair density</Text>
          
          <LineChart
            data={chartData}
            width={screenWidth - (SPACING.lg * 2 + SPACING.md * 2)}
            height={220}
            chartConfig={{
              backgroundColor: COLORS.card,
              backgroundGradientFrom: COLORS.card,
              backgroundGradientTo: COLORS.card,
              decimalPlaces: 0,
              color: () => COLORS.primary,
              labelColor: () => COLORS.textLight,
              propsForDots: {
                r: '5',
                strokeWidth: '2',
                stroke: COLORS.primary
              },
              propsForLabels: {
                fontSize: 10,
              }
            }}
            bezier
            style={styles.chart}
          />
          
          <Text style={styles.chartFooter}>
            Based on {progressData?.historicalScores.length || 0} snapshots
          </Text>
        </View>
      )}
      
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
      
      {/* Tips */}
      <View style={styles.tipsCard}>
        <Text style={styles.sectionTitle}>Tips for Accurate Tracking</Text>
        
        <View style={styles.tipItem}>
          <Ionicons name="checkmark-circle" size={20} color={COLORS.secondary} />
          <Text style={styles.tipText}>Take photos at the same time of day</Text>
        </View>
        
        <View style={styles.tipItem}>
          <Ionicons name="checkmark-circle" size={20} color={COLORS.secondary} />
          <Text style={styles.tipText}>Use consistent lighting conditions</Text>
        </View>
        
        <View style={styles.tipItem}>
          <Ionicons name="checkmark-circle" size={20} color={COLORS.secondary} />
          <Text style={styles.tipText}>Maintain the same hair length when comparing</Text>
        </View>
        
        <View style={styles.tipItem}>
          <Ionicons name="checkmark-circle" size={20} color={COLORS.secondary} />
          <Text style={styles.tipText}>Take photos from multiple angles (top, front, sides)</Text>
        </View>
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
  header: {
    marginBottom: SPACING.lg,
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
  summaryCard: {
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
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  trendTextContainer: {
    marginLeft: SPACING.md,
  },
  trendText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
  },
  percentChangeText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textLight,
  },
  summaryText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    lineHeight: 22,
  },
  insufficientDataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: SPACING.sm,
  },
  insufficientDataText: {
    flex: 1,
    marginLeft: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.textLight,
  },
  chartCard: {
    ...SHADOWS.medium,
    backgroundColor: COLORS.card,
    borderRadius: SPACING.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  chartSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textLight,
    marginBottom: SPACING.md,
  },
  chart: {
    borderRadius: SPACING.sm,
    marginVertical: SPACING.md,
  },
  chartFooter: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  suggestionsCard: {
    ...SHADOWS.medium,
    backgroundColor: COLORS.card,
    borderRadius: SPACING.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  suggestionItem: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    alignItems: 'flex-start',
  },
  suggestionText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    flex: 1,
    marginLeft: SPACING.sm,
    lineHeight: 22,
  },
  noDataText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textLight,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: SPACING.md,
  },
  tipsCard: {
    ...SHADOWS.medium,
    backgroundColor: COLORS.card,
    borderRadius: SPACING.md,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  tipText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
});

export default ProgressDetailScreen; 