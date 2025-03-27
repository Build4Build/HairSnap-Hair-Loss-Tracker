import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

/**
 * App icon component with gradient background and icon
 * Can be used for generating app icons by taking screenshots
 */
const AppIcon: React.FC<{size?: number}> = ({ size = 1024 }) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <LinearGradient
        colors={['#3498db', '#2980b9', '#1c6ca1']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Circular hair outline */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons 
              name="camera" 
              size={size * 0.45} 
              color="#ffffff" 
              style={styles.cameraIcon} 
            />
            {/* Hair strands on top */}
            <View style={[styles.hairStrand, styles.hairStrand1]} />
            <View style={[styles.hairStrand, styles.hairStrand2]} />
            <View style={[styles.hairStrand, styles.hairStrand3]} />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 1024, // Make it really round for iOS
    overflow: 'hidden',
  },
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    width: '80%',
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cameraIcon: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  hairStrand: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    borderRadius: 50,
    transform: [{ rotate: '45deg' }],
  },
  hairStrand1: {
    width: '20%',
    height: 10,
    top: '20%',
    left: '30%',
  },
  hairStrand2: {
    width: '25%',
    height: 8,
    top: '15%',
    left: '45%',
  },
  hairStrand3: {
    width: '15%',
    height: 6,
    top: '25%',
    left: '55%',
  },
});

export default AppIcon; 