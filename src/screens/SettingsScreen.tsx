import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Switch, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { format } from 'date-fns';
import { COLORS, FONT_SIZE, SPACING, SHADOWS } from '../constants/theme';
import { UserSettings } from '../types';

// Services
import { getUserSettings, updateUserSettings } from '../services/database';
import { setupReminderNotifications, requestNotificationPermissions } from '../services/notifications';

const SettingsScreen = () => {
  const navigation = useNavigation<any>();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showMorningPicker, setShowMorningPicker] = useState(false);
  const [showEveningPicker, setShowEveningPicker] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const userSettings = await getUserSettings();
      setSettings(userSettings);
      setLoading(false);
    } catch (error) {
      console.error('Error loading settings:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to load settings. Please try again.');
    }
  };

  const saveSettings = async () => {
    if (!settings) return;
    
    try {
      setSaving(true);
      
      // If notifications are enabled, request permissions
      if (settings.notificationsEnabled) {
        const granted = await requestNotificationPermissions();
        if (!granted) {
          Alert.alert(
            'Notification Permission',
            'Notifications cannot be enabled without permission.',
            [{ text: 'OK' }]
          );
          setSettings(prev => prev ? { ...prev, notificationsEnabled: false } : null);
          setSaving(false);
          return;
        }
      }
      
      // Update settings in database
      await updateUserSettings(settings);
      
      // Setup notifications based on new settings
      await setupReminderNotifications(settings);
      
      setSaving(false);
      Alert.alert('Success', 'Settings saved successfully.');
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaving(false);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    }
  };

  // Navigate to App Store Assets screen
  const navigateToAppStoreAssets = () => {
    navigation.navigate('AppStoreAssets');
  };

  const toggleNotifications = (value: boolean) => {
    setSettings(prev => prev ? { ...prev, notificationsEnabled: value } : null);
  };

  const toggleReminderFrequency = () => {
    if (!settings) return;
    
    const newFrequency = settings.reminderFrequency === 'daily' ? 'twice-daily' : 'daily';
    setSettings({ ...settings, reminderFrequency: newFrequency });
  };

  const handleMorningTimeConfirm = (date: Date) => {
    if (!settings) return;
    
    const timeString = format(date, 'HH:mm');
    setSettings({
      ...settings,
      reminderTimes: {
        ...settings.reminderTimes,
        morning: timeString
      }
    });
    setShowMorningPicker(false);
  };

  const handleEveningTimeConfirm = (date: Date) => {
    if (!settings) return;
    
    const timeString = format(date, 'HH:mm');
    setSettings({
      ...settings,
      reminderTimes: {
        ...settings.reminderTimes,
        evening: timeString
      }
    });
    setShowEveningPicker(false);
  };

  // Format time string (HH:MM) to display time
  const formatTimeForDisplay = (timeString?: string) => {
    if (!timeString) return 'Not set';
    
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    
    return format(date, 'h:mm a'); // e.g. "9:00 AM"
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  if (!settings) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
        <Text style={styles.errorText}>Failed to load settings</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadSettings}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Configure your HairSnap preferences</Text>
      </View>
      
      {/* Notifications section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingLabelContainer}>
            <Ionicons name="notifications-outline" size={24} color={COLORS.text} />
            <Text style={styles.settingLabel}>Enable Reminders</Text>
          </View>
          <Switch
            value={settings.notificationsEnabled}
            onValueChange={toggleNotifications}
            trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
            thumbColor={settings.notificationsEnabled ? COLORS.primary : '#f4f3f4'}
          />
        </View>
        
        {settings.notificationsEnabled && (
          <>
            <View style={styles.settingRow}>
              <View style={styles.settingLabelContainer}>
                <Ionicons name="time-outline" size={24} color={COLORS.text} />
                <Text style={styles.settingLabel}>Reminder Frequency</Text>
              </View>
              <TouchableOpacity 
                style={styles.frequencyButton} 
                onPress={toggleReminderFrequency}
              >
                <Text style={styles.frequencyButtonText}>
                  {settings.reminderFrequency === 'daily' ? 'Daily' : 'Twice Daily'}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.settingRow}>
              <View style={styles.settingLabelContainer}>
                <Ionicons name="sunny-outline" size={24} color={COLORS.text} />
                <Text style={styles.settingLabel}>Morning Reminder</Text>
              </View>
              <TouchableOpacity 
                style={styles.timeButton} 
                onPress={() => setShowMorningPicker(true)}
              >
                <Text style={styles.timeButtonText}>
                  {formatTimeForDisplay(settings.reminderTimes.morning)}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            
            {settings.reminderFrequency === 'twice-daily' && (
              <View style={styles.settingRow}>
                <View style={styles.settingLabelContainer}>
                  <Ionicons name="moon-outline" size={24} color={COLORS.text} />
                  <Text style={styles.settingLabel}>Evening Reminder</Text>
                </View>
                <TouchableOpacity 
                  style={styles.timeButton} 
                  onPress={() => setShowEveningPicker(true)}
                >
                  <Text style={styles.timeButtonText}>
                    {formatTimeForDisplay(settings.reminderTimes.evening)}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </View>
      
      {/* Developer section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Developer</Text>
        
        <TouchableOpacity 
          style={styles.developerRow}
          onPress={navigateToAppStoreAssets}
        >
          <View style={styles.settingLabelContainer}>
            <Ionicons name="apps-outline" size={24} color={COLORS.text} />
            <Text style={styles.settingLabel}>App Store Assets</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      
      {/* About section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        
        <View style={styles.aboutItem}>
          <Ionicons name="information-circle-outline" size={24} color={COLORS.text} />
          <View style={styles.aboutTextContainer}>
            <Text style={styles.aboutTitle}>HairSnap v1.0.0</Text>
            <Text style={styles.aboutDescription}>
              Track your hair loss progression over time with consistent photos and AI-powered analysis.
            </Text>
          </View>
        </View>
        
        <View style={styles.aboutItem}>
          <Ionicons name="shield-checkmark-outline" size={24} color={COLORS.text} />
          <View style={styles.aboutTextContainer}>
            <Text style={styles.aboutTitle}>Privacy</Text>
            <Text style={styles.aboutDescription}>
              Your data is stored locally on your device and is not shared with any third parties.
            </Text>
          </View>
        </View>
      </View>
      
      {/* Save button */}
      <TouchableOpacity 
        style={styles.saveButton} 
        onPress={saveSettings}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            <Ionicons name="save-outline" size={20} color="#fff" />
            <Text style={styles.saveButtonText}>Save Settings</Text>
          </>
        )}
      </TouchableOpacity>
      
      {/* Time pickers */}
      <DateTimePickerModal
        isVisible={showMorningPicker}
        mode="time"
        onConfirm={handleMorningTimeConfirm}
        onCancel={() => setShowMorningPicker(false)}
      />
      
      <DateTimePickerModal
        isVisible={showEveningPicker}
        mode="time"
        onConfirm={handleEveningTimeConfirm}
        onCancel={() => setShowEveningPicker(false)}
      />
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
    backgroundColor: COLORS.background,
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
    backgroundColor: COLORS.background,
    padding: SPACING.xl,
  },
  errorText: {
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
    fontSize: FONT_SIZE.lg,
    color: COLORS.error,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: SPACING.md,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
  header: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textLight,
  },
  section: {
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
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  developerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    marginLeft: SPACING.md,
  },
  frequencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  frequencyButtonText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary,
    marginRight: SPACING.xs,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timeButtonText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary,
    marginRight: SPACING.xs,
  },
  aboutItem: {
    flexDirection: 'row',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  aboutTextContainer: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  aboutTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  aboutDescription: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textLight,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
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
  saveButtonText: {
    color: '#fff',
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
});

export default SettingsScreen; 