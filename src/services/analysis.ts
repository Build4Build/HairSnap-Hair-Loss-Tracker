import { HairSnapshot, ProgressData, ProgressTrend } from '../types';

// In a real app, this would be connected to a ML model or backend service
// For now, we'll simulate analysis with a mock implementation

// Analyze a single image to detect hair loss
export const analyzeHairImage = async (imageUri: string): Promise<{
  overallScore: number;
  crownScore?: number;
  hairlineScore?: number;
}> => {
  // Simulate API call or local ML model processing time
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // For demo purposes, generate random scores between 50-100
  // In a real app, this would be the result of image analysis
  const overallScore = Math.floor(Math.random() * 41) + 60; // 60-100
  const crownScore = Math.floor(Math.random() * 41) + 60; // 60-100
  const hairlineScore = Math.floor(Math.random() * 41) + 60; // 60-100
  
  return {
    overallScore,
    crownScore,
    hairlineScore
  };
};

// Calculate hair loss progression over time
export const calculateProgression = (snapshots: HairSnapshot[]): ProgressData => {
  // Need at least 2 snapshots to calculate progression
  if (snapshots.length < 2) {
    return {
      trend: ProgressTrend.INSUFFICIENT_DATA,
      historicalScores: snapshots.map(snapshot => ({
        date: new Date(snapshot.timestamp).toISOString().split('T')[0],
        score: snapshot.hairLossScore || 0
      }))
    };
  }
  
  // Sort snapshots by timestamp (oldest first)
  const sortedSnapshots = [...snapshots].sort((a, b) => a.timestamp - b.timestamp);
  
  // Get first and most recent scores
  const firstSnapshot = sortedSnapshots[0];
  const latestSnapshot = sortedSnapshots[sortedSnapshots.length - 1];
  
  const firstScore = firstSnapshot.hairLossScore || 0;
  const latestScore = latestSnapshot.hairLossScore || 0;
  
  // Calculate percent change
  const percentChange = firstScore !== 0 
    ? ((latestScore - firstScore) / firstScore) * 100 
    : 0;
  
  // Determine trend
  let trend: ProgressTrend;
  if (Math.abs(percentChange) < 5) {
    trend = ProgressTrend.STABLE;
  } else if (percentChange > 0) {
    trend = ProgressTrend.IMPROVING;
  } else {
    trend = ProgressTrend.DECLINING;
  }
  
  // Format historical scores for charting
  const historicalScores = sortedSnapshots.map(snapshot => ({
    date: new Date(snapshot.timestamp).toISOString().split('T')[0],
    score: snapshot.hairLossScore || 0
  }));
  
  return {
    trend,
    percentChange: parseFloat(percentChange.toFixed(2)),
    historicalScores
  };
};

// Generate personalized suggestions based on progression data
export const generateSuggestions = (progressData: ProgressData): string[] => {
  const { trend, percentChange } = progressData;
  
  // Based on the trend, return different suggestions
  switch (trend) {
    case ProgressTrend.IMPROVING:
      return [
        "Continue your current hair care routine, it's showing positive results!",
        "Maintain a balanced diet rich in vitamins and minerals for continued improvement.",
        "Keep stress levels low to maintain your hair health progress."
      ];
      
    case ProgressTrend.STABLE:
      return [
        "Your hair density appears stable - maintain your current routine.",
        "Consider adding a scalp massage to your routine to stimulate blood flow.",
        "Stay hydrated and ensure you're getting enough protein in your diet."
      ];
      
    case ProgressTrend.DECLINING:
      // More detailed suggestions for declining trend
      if (percentChange && percentChange < -10) {
        return [
          "Consider consulting with a dermatologist about your hair loss.",
          "Check if any medications you're taking might contribute to hair loss.",
          "Try reducing heat styling and chemical treatments.",
          "Look into minoxidil or other over-the-counter treatments."
        ];
      } else {
        return [
          "Try incorporating a scalp massage into your routine to stimulate follicles.",
          "Consider a biotin supplement after consulting with your doctor.",
          "Reduce stress through exercise, meditation, or other relaxation techniques."
        ];
      }
      
    case ProgressTrend.INSUFFICIENT_DATA:
    default:
      return [
        "Take photos consistently to gather more data for personalized recommendations.",
        "Ensure good lighting and consistent positioning for more accurate analysis.",
        "Track for at least 3 months to see meaningful patterns in hair loss or growth."
      ];
  }
}; 