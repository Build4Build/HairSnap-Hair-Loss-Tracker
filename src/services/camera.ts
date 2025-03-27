import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Platform } from 'react-native';
import { v4 as uuidv4 } from 'uuid';

// Directory for storing hairsnap images
const HAIRSNAP_DIRECTORY = `${FileSystem.documentDirectory}hairsnap_images/`;

// Ensure the directory exists
const setupDirectory = async (): Promise<void> => {
  const dirInfo = await FileSystem.getInfoAsync(HAIRSNAP_DIRECTORY);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(HAIRSNAP_DIRECTORY, { intermediates: true });
  }
};

// Request permission for camera and media library
export const requestCameraPermissions = async (): Promise<boolean> => {
  try {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync();
    
    return cameraPermission.granted && mediaLibraryPermission.granted;
  } catch (error) {
    console.error('Error requesting camera permissions:', error);
    return false;
  }
};

// Take a photo using the camera
export const takePhoto = async (): Promise<string | null> => {
  try {
    // Ensure we have the directory created
    await setupDirectory();
    
    // Launch the camera
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    
    // If user canceled, return null
    if (result.canceled) {
      return null;
    }
    
    // Get the URI of the first asset
    const photoUri = result.assets[0].uri;
    
    // Generate a unique filename
    const filename = `hairsnap_${uuidv4()}.jpg`;
    const destinationUri = `${HAIRSNAP_DIRECTORY}${filename}`;
    
    // Save the image to our app directory
    await FileSystem.copyAsync({
      from: photoUri,
      to: destinationUri,
    });
    
    // Save to media library for backup
    if (Platform.OS === 'ios') {
      await MediaLibrary.saveToLibraryAsync(destinationUri);
    } else {
      await MediaLibrary.createAssetAsync(destinationUri);
    }
    
    return destinationUri;
  } catch (error) {
    console.error('Error taking photo:', error);
    return null;
  }
};

// Pick a photo from the library
export const pickPhotoFromLibrary = async (): Promise<string | null> => {
  try {
    // Ensure we have the directory created
    await setupDirectory();
    
    // Launch the image library
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    
    // If user canceled, return null
    if (result.canceled) {
      return null;
    }
    
    // Get the URI of the first asset
    const photoUri = result.assets[0].uri;
    
    // Generate a unique filename
    const filename = `hairsnap_${uuidv4()}.jpg`;
    const destinationUri = `${HAIRSNAP_DIRECTORY}${filename}`;
    
    // Save the image to our app directory
    await FileSystem.copyAsync({
      from: photoUri,
      to: destinationUri,
    });
    
    return destinationUri;
  } catch (error) {
    console.error('Error picking photo from library:', error);
    return null;
  }
};

// Delete a photo
export const deletePhoto = async (uri: string): Promise<boolean> => {
  try {
    await FileSystem.deleteAsync(uri);
    return true;
  } catch (error) {
    console.error('Error deleting photo:', error);
    return false;
  }
}; 