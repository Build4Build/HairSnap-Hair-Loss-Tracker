import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp as RNStackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { HairSnapshot } from '../types';

// Define the main tab navigator screens
export type TabParamList = {
  Home: undefined;
  Camera: undefined;
  History: undefined;
  Settings: undefined;
};

// Define stack navigator screens 
export type RootStackParamList = {
  Main: undefined;
  CapturePhoto: undefined;
  PhotoReview: { imageUri: string };
  SnapshotDetail: { snapshotId: string };
  ProgressDetail: undefined;
  SettingsScreen: undefined;
  Onboarding: undefined;
  AppStoreAssets: undefined;
};

// Define combined navigation types
export type TabNavigationProp<T extends keyof TabParamList> = 
  BottomTabNavigationProp<TabParamList, T>;

export type StackNavigationProp<T extends keyof RootStackParamList> = 
  RNStackNavigationProp<RootStackParamList, T>;

export type RootRouteProp<T extends keyof RootStackParamList> = 
  RouteProp<RootStackParamList, T>; 