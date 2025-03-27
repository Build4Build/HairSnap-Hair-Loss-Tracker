import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { UserSettings } from '../types';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Request permission for notifications
export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    // If we don't have permission yet, ask for it
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    // Return whether permission was granted
    return finalStatus === 'granted';
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

// Schedule a notification
export const scheduleNotification = async (
  time: string, // Format: "HH:MM"
  title: string,
  body: string
): Promise<string | null> => {
  try {
    // Parse time (HH:MM) to get hour and minute
    const [hours, minutes] = time.split(':').map(Number);
    
    // Schedule the notification with daily trigger
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { type: 'reminder' },
      },
      trigger: {
        hour: hours,
        minute: minutes,
        repeats: true,
      },
    });
    
    return identifier;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
};

// Cancel a notification by identifier
export const cancelNotification = async (identifier: string): Promise<void> => {
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
};

// Cancel all pending notifications
export const cancelAllNotifications = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error canceling all notifications:', error);
  }
};

// Set up reminder notifications based on user settings
export const setupReminderNotifications = async (
  settings: UserSettings
): Promise<void> => {
  try {
    // First cancel any existing notifications
    await cancelAllNotifications();
    
    // If notifications are not enabled, just return
    if (!settings.notificationsEnabled) {
      return;
    }
    
    // Schedule morning notification if morning time is set
    if (settings.reminderTimes.morning) {
      await scheduleNotification(
        settings.reminderTimes.morning,
        'HairSnap Reminder',
        'Time to take your morning hair photo! Track your progress consistently.'
      );
    }
    
    // Schedule evening notification if evening time is set and using twice-daily frequency
    if (settings.reminderFrequency === 'twice-daily' && settings.reminderTimes.evening) {
      await scheduleNotification(
        settings.reminderTimes.evening,
        'HairSnap Evening Reminder',
        'Don\'t forget to take your evening hair photo to monitor changes.'
      );
    }
  } catch (error) {
    console.error('Error setting up reminder notifications:', error);
  }
};

// Add a notification listener
export const addNotificationReceivedListener = (
  listener: (notification: Notifications.Notification) => void
): Notifications.Subscription => {
  return Notifications.addNotificationReceivedListener(listener);
};

// Add a notification response listener (when user taps on notification)
export const addNotificationResponseReceivedListener = (
  listener: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription => {
  return Notifications.addNotificationResponseReceivedListener(listener);
};

// Helper to remove notification listeners
export const removeNotificationSubscription = (
  subscription: Notifications.Subscription
): void => {
  subscription.remove();
}; 