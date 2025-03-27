import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, TabParamList } from './types';
import { COLORS } from '../constants/theme';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import CameraScreen from '../screens/CameraScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import PhotoReviewScreen from '../screens/PhotoReviewScreen';
import SnapshotDetailScreen from '../screens/SnapshotDetailScreen';
import ProgressDetailScreen from '../screens/ProgressDetailScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import AppStoreAssetsScreen from '../screens/AppStoreAssetsScreen';

// Import services
import { initDatabase, getUserSettings } from '../services/database';
import { setupReminderNotifications } from '../services/notifications';

// Create navigators
const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Main tab navigator
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Camera') {
            iconName = focused ? 'camera' : 'camera-outline';
          } else if (route.name === 'History') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen 
        name="Camera" 
        component={CameraScreen} 
        options={{ title: 'Capture' }}
      />
      <Tab.Screen 
        name="History" 
        component={HistoryScreen} 
        options={{ title: 'History' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
};

// Root navigator
const AppNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLaunch, setIsFirstLaunch] = useState(false);
  const [isStoreMode, setIsStoreMode] = useState(false); // For store demo mode

  useEffect(() => {
    // Initialize database and check first launch
    const initApp = async () => {
      try {
        await initDatabase();
        
        // Get user settings
        const settings = await getUserSettings();
        
        // Setup notifications based on settings
        await setupReminderNotifications(settings);
        
        // Check if it's first launch (in a real app, you would check some flag)
        // For demo, we'll set it to false
        setIsFirstLaunch(false);
        
        // Check if in store mode (can be triggered by a deep link or settings)
        // For demo, we'll set it to false
        setIsStoreMode(false);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing app:', error);
        setIsLoading(false);
      }
    };
    
    initApp();
  }, []);

  if (isLoading) {
    // In a real app, return a splash screen component here
    return null;
  }

  // If in store mode, directly show the app store assets
  if (isStoreMode) {
    return (
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen 
            name="AppStoreAssets" 
            component={AppStoreAssetsScreen} 
            options={{ title: 'HairSnap - App Store Assets' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerTintColor: COLORS.primary,
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      >
        {isFirstLaunch ? (
          <Stack.Screen 
            name="Onboarding" 
            component={OnboardingScreen} 
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen 
              name="Main" 
              component={TabNavigator} 
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="CapturePhoto" 
              component={CameraScreen} 
              options={{ title: 'Take Photo' }}
            />
            <Stack.Screen 
              name="PhotoReview" 
              component={PhotoReviewScreen} 
              options={{ title: 'Review Photo' }}
            />
            <Stack.Screen 
              name="SnapshotDetail" 
              component={SnapshotDetailScreen} 
              options={{ title: 'Snapshot Details' }}
            />
            <Stack.Screen 
              name="ProgressDetail" 
              component={ProgressDetailScreen} 
              options={{ title: 'Progress Analysis' }}
            />
            <Stack.Screen 
              name="SettingsScreen" 
              component={SettingsScreen} 
              options={{ title: 'Settings' }}
            />
            <Stack.Screen 
              name="AppStoreAssets" 
              component={AppStoreAssetsScreen} 
              options={{ title: 'App Store Assets' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 