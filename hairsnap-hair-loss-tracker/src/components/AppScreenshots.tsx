import React from 'react';
import { View, StyleSheet, Text, ScrollView, Image } from 'react-native';
import { COLORS, FONT_SIZE, SPACING } from '../constants/theme';
import HomeScreen from '../screens/HomeScreen';
import ProgressDetailScreen from '../screens/ProgressDetailScreen';
import CameraScreen from '../screens/CameraScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';

interface AppScreenshotsProps {
  selected?: 'home' | 'progress' | 'camera' | 'history' | 'settings';
}

/**
 * Component for showing app screenshots for marketing/store purposes
 * In a real implementation, these would be actual screenshots
 */
const AppScreenshots: React.FC<AppScreenshotsProps> = ({ 
  selected = 'home' 
}) => {
  // In a real app, we'd render actual images here
  // This is just a placeholder for the concept
  const renderSelectedScreen = () => {
    switch (selected) {
      case 'home':
        return (
          <View style={styles.phoneFrame}>
            <View style={styles.statusBar}>
              <Text style={styles.statusBarText}>9:41</Text>
            </View>
            <HomeScreen />
          </View>
        );
      case 'progress':
        return (
          <View style={styles.phoneFrame}>
            <View style={styles.statusBar}>
              <Text style={styles.statusBarText}>9:41</Text>
            </View>
            <ProgressDetailScreen />
          </View>
        );
      case 'camera':
        return (
          <View style={styles.phoneFrame}>
            <View style={styles.statusBar}>
              <Text style={styles.statusBarText}>9:41</Text>
            </View>
            <CameraScreen />
          </View>
        );
      case 'history':
        return (
          <View style={styles.phoneFrame}>
            <View style={styles.statusBar}>
              <Text style={styles.statusBarText}>9:41</Text>
            </View>
            <HistoryScreen />
          </View>
        );
      case 'settings':
        return (
          <View style={styles.phoneFrame}>
            <View style={styles.statusBar}>
              <Text style={styles.statusBarText}>9:41</Text>
            </View>
            <SettingsScreen />
          </View>
        );
      default:
        return null;
    }
  };

  // Selector for different screens
  const renderScreenSelector = () => {
    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.screensSelector}
      >
        <View style={[styles.screenOption, selected === 'home' && styles.selectedOption]}>
          <Text style={styles.screenOptionText}>Home</Text>
        </View>
        <View style={[styles.screenOption, selected === 'progress' && styles.selectedOption]}>
          <Text style={styles.screenOptionText}>Progress</Text>
        </View>
        <View style={[styles.screenOption, selected === 'camera' && styles.selectedOption]}>
          <Text style={styles.screenOptionText}>Camera</Text>
        </View>
        <View style={[styles.screenOption, selected === 'history' && styles.selectedOption]}>
          <Text style={styles.screenOptionText}>History</Text>
        </View>
        <View style={[styles.screenOption, selected === 'settings' && styles.selectedOption]}>
          <Text style={styles.screenOptionText}>Settings</Text>
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>HairSnap App Screenshots</Text>
      {renderScreenSelector()}
      {renderSelectedScreen()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  phoneFrame: {
    width: 320,
    height: 650,
    backgroundColor: '#fff',
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 10,
    borderColor: '#000',
    alignSelf: 'center',
    marginTop: SPACING.xl,
  },
  statusBar: {
    height: 40,
    backgroundColor: '#000',
    paddingHorizontal: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBarText: {
    color: '#fff',
    fontSize: FONT_SIZE.sm,
    fontWeight: 'bold',
  },
  screensSelector: {
    flexDirection: 'row',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  screenOption: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginRight: SPACING.md,
    borderRadius: SPACING.sm,
    backgroundColor: '#e0e0e0',
  },
  selectedOption: {
    backgroundColor: COLORS.primary,
  },
  screenOptionText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
    color: '#333',
  },
});

export default AppScreenshots; 