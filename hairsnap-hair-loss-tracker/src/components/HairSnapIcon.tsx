import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface HairSnapIconProps {
  size?: number;
  style?: ViewStyle;
  withBackground?: boolean;
}

/**
 * HairSnap app icon component
 * This can be used to render the app icon in different sizes.
 * In a production app, you would use actual icon images.
 */
const HairSnapIcon: React.FC<HairSnapIconProps> = ({
  size = 100,
  style,
  withBackground = true,
}) => {
  // Scale internal elements based on the size
  const iconSize = size * 0.6;
  const borderWidth = size * 0.05;
  
  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 5,
          borderWidth: withBackground ? borderWidth : 0,
        },
        style,
      ]}
    >
      {withBackground && (
        <LinearGradient
          colors={['#3498db', '#2980b9']}
          style={[
            styles.background,
            {
              borderRadius: size / 5 - borderWidth,
            },
          ]}
        />
      )}
      
      <View style={styles.iconWrapper}>
        <Ionicons name="camera" size={iconSize} color="#FFFFFF" />
        <Ionicons
          name="trending-up"
          size={iconSize * 0.5}
          color="#2ecc71"
          style={[
            styles.subIcon,
            {
              bottom: -iconSize * 0.1,
              right: -iconSize * 0.1,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderColor: '#FFFFFF',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  subIcon: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
    padding: 2,
    overflow: 'hidden',
  },
});

export default HairSnapIcon; 