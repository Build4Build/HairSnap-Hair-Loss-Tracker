import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  FlatList,
  Dimensions,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '../navigation/types';
import { COLORS, FONT_SIZE, SPACING, SHADOWS } from '../constants/theme';
import { UserSettings } from '../types';

// Services
import { updateUserSettings } from '../services/database';
import { requestNotificationPermissions } from '../services/notifications';

const { width } = Dimensions.get('window');

// Onboarding slides data
const slides = [
  {
    id: '1',
    title: 'Welcome to HairSnap',
    description: 'Track your hair loss progression over time with consistent photos and AI-powered analysis.',
    image: require('../../assets/icon.png'),
  },
  {
    id: '2',
    title: 'Take Regular Photos',
    description: 'Capture consistent photos of your hair to track changes accurately. We\'ll remind you when it\'s time.',
    icon: 'camera',
  },
  {
    id: '3',
    title: 'Track Your Progress',
    description: 'View detailed charts and analysis of your hair density over time to see what\'s working.',
    icon: 'analytics',
  },
  {
    id: '4',
    title: 'Get Personalized Suggestions',
    description: 'Receive tailored recommendations based on your hair loss patterns and progression.',
    icon: 'bulb',
  },
];

const OnboardingScreen = () => {
  const navigation = useNavigation<StackNavigationProp<'Onboarding'>>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = async () => {
    try {
      setLoading(true);
      
      // Request notification permissions if enabled
      let permissionGranted = false;
      if (notificationsEnabled) {
        permissionGranted = await requestNotificationPermissions();
      }
      
      // Save initial settings
      const initialSettings: UserSettings = {
        reminderFrequency: 'daily',
        reminderTimes: {
          morning: '09:00',
          evening: '21:00',
        },
        notificationsEnabled: permissionGranted,
      };
      
      await updateUserSettings(initialSettings);
      
      // Navigate to main app
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
      
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Error completing onboarding:', error);
      Alert.alert('Error', 'Failed to complete setup. Please try again.');
    }
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
  };

  const renderSlide = ({ item, index }: { item: typeof slides[0], index: number }) => {
    return (
      <View style={styles.slideContainer}>
        {item.image ? (
          <Image source={item.image} style={styles.slideImage} />
        ) : (
          <View style={styles.iconContainer}>
            <Ionicons name={`${item.icon}-outline` as any} size={120} color={COLORS.primary} />
          </View>
        )}
        
        <Text style={styles.slideTitle}>{item.title}</Text>
        <Text style={styles.slideDescription}>{item.description}</Text>
        
        {index === slides.length - 1 && (
          <View style={styles.notificationContainer}>
            <Text style={styles.notificationTitle}>Enable Reminders?</Text>
            <Text style={styles.notificationDescription}>
              We'll remind you to take photos regularly for better tracking
            </Text>
            <TouchableOpacity 
              style={styles.notificationToggle}
              onPress={toggleNotifications}
            >
              <Text style={styles.notificationToggleText}>
                Reminders: {notificationsEnabled ? 'Enabled' : 'Disabled'}
              </Text>
              <Ionicons 
                name={notificationsEnabled ? 'notifications' : 'notifications-off'} 
                size={24} 
                color={notificationsEnabled ? COLORS.primary : COLORS.textLight} 
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        keyExtractor={item => item.id}
      />
      
      {/* Pagination dots */}
      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === currentIndex && styles.paginationDotActive
            ]}
          />
        ))}
      </View>
      
      {/* Navigation buttons */}
      <View style={styles.buttonsContainer}>
        {currentIndex < slides.length - 1 ? (
          <>
            <TouchableOpacity 
              style={styles.skipButton}
              onPress={handleSkip}
            >
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.nextButton}
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText}>Next</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity 
            style={styles.getStartedButton}
            onPress={handleComplete}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.getStartedButtonText}>Get Started</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  slideContainer: {
    width,
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideImage: {
    width: 150,
    height: 150,
    marginBottom: SPACING.xl,
  },
  iconContainer: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
    ...SHADOWS.medium,
  },
  slideTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  slideDescription: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.border,
    marginHorizontal: 5,
  },
  paginationDotActive: {
    backgroundColor: COLORS.primary,
    width: 20,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
  },
  skipButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  skipButtonText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: SPACING.md,
    ...SHADOWS.small,
  },
  nextButtonText: {
    fontSize: FONT_SIZE.md,
    color: '#fff',
    fontWeight: '600',
    marginRight: SPACING.xs,
  },
  getStartedButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    ...SHADOWS.medium,
  },
  getStartedButtonText: {
    fontSize: FONT_SIZE.lg,
    color: '#fff',
    fontWeight: 'bold',
  },
  notificationContainer: {
    marginTop: SPACING.xl,
    backgroundColor: COLORS.card,
    borderRadius: SPACING.md,
    padding: SPACING.lg,
    width: '100%',
    ...SHADOWS.small,
  },
  notificationTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  notificationDescription: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textLight,
    marginBottom: SPACING.md,
  },
  notificationToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  notificationToggleText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    fontWeight: '500',
  },
});

export default OnboardingScreen; 