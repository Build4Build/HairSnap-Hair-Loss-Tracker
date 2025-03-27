import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Platform 
} from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import AppIcon from '../components/AppIcon';

/**
 * Screen for generating and exporting app store assets (icons and screenshots)
 */
const AppStoreAssetsScreen: React.FC = () => {
  const [status, setStatus] = useState<string>('');
  const iconRefs = React.useRef<View[]>([]);
  
  // Icon sizes for different platforms
  const iconSizes = [
    { name: 'iOS App Icon', size: 1024, platform: 'ios' },
    { name: 'iOS Spotlight', size: 120, platform: 'ios' },
    { name: 'iOS Settings', size: 87, platform: 'ios' },
    { name: 'iOS Notification', size: 60, platform: 'ios' },
    { name: 'Android Launcher Icon', size: 192, platform: 'android' },
    { name: 'Android Adaptive Icon', size: 432, platform: 'android' },
    { name: 'Web Favicon', size: 64, platform: 'web' },
  ];

  // Request media library permissions
  const requestPermissions = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    return status === 'granted';
  };

  // Capture a single icon and save it
  const captureIcon = async (ref: View, size: number, name: string) => {
    try {
      const uri = await captureRef(ref, {
        format: 'png',
        quality: 1,
      });
      
      // Create directory if it doesn't exist
      const dir = `${FileSystem.documentDirectory}icons/`;
      const dirInfo = await FileSystem.getInfoAsync(dir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
      }
      
      // Save file to local filesystem
      const filename = `${name.replace(/\s+/g, '-').toLowerCase()}-${size}.png`;
      const fileUri = `${dir}${filename}`;
      await FileSystem.copyAsync({ from: uri, to: fileUri });
      
      // Save to media library
      const asset = await MediaLibrary.createAssetAsync(fileUri);
      await MediaLibrary.createAlbumAsync('HairSnap Icons', asset, false);
      
      setStatus(`Saved ${name} (${size}px)`);
      return fileUri;
    } catch (error) {
      console.error('Error capturing icon:', error);
      setStatus(`Error saving ${name}: ${error}`);
      return null;
    }
  };

  // Generate and save all icons
  const generateAllIcons = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      setStatus('Media library permission denied');
      return;
    }
    
    setStatus('Generating icons...');
    const savedFiles: string[] = [];
    
    for (let i = 0; i < iconSizes.length; i++) {
      const { size, name } = iconSizes[i];
      const fileUri = await captureIcon(iconRefs.current[i], size, name);
      if (fileUri) savedFiles.push(fileUri);
    }
    
    if (savedFiles.length > 0 && Platform.OS !== 'web') {
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(savedFiles[0], {
          dialogTitle: 'Share App Icons',
          UTI: 'public.image',
        });
      }
    }
    
    setStatus(`Generated ${savedFiles.length} icons successfully`);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>App Store Assets Generator</Text>
      <Text style={styles.subtitle}>Generate all necessary icons and screenshots</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Icons</Text>
        <View style={styles.iconsGrid}>
          {iconSizes.map((item, index) => (
            <View key={item.name} style={styles.iconContainer}>
              <View
                ref={ref => ref && (iconRefs.current[index] = ref)}
                style={[styles.iconWrapper, { width: 120, height: 120 }]}
              >
                <AppIcon size={item.size > 120 ? 120 : item.size} />
              </View>
              <Text style={styles.iconLabel}>{item.name}</Text>
              <Text style={styles.iconSize}>{item.size}px</Text>
            </View>
          ))}
        </View>
        
        <TouchableOpacity style={styles.button} onPress={generateAllIcons}>
          <Text style={styles.buttonText}>Generate All Icons</Text>
        </TouchableOpacity>
        
        {status ? <Text style={styles.statusText}>{status}</Text> : null}
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Icons will be saved to your device's media library in the "HairSnap Icons" album.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#3498db',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2c3e50',
  },
  iconsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
    width: '45%',
  },
  iconWrapper: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  iconLabel: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  iconSize: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignSelf: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusText: {
    marginTop: 16,
    textAlign: 'center',
    color: '#27ae60',
    fontSize: 14,
  },
  footer: {
    marginBottom: 24,
  },
  footerText: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
});

export default AppStoreAssetsScreen; 