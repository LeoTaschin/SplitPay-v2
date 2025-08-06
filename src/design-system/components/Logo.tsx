import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useDesignSystem } from '../hooks/useDesignSystem';

const LOGO_SIZE = 80;
const FONT_SCALE = 0.35;

interface LogoProps {
  size?: number;
  style?: any;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = LOGO_SIZE,
  style
}) => {
  const ds = useDesignSystem();
  const fontSize = Math.floor(size * FONT_SCALE);
  const iconSize = Math.floor(fontSize * 1.5);
  
  return (
    <View style={[styles.container, style]}>
      <View style={styles.textContainer}>
        <View style={styles.iconContainer}>
          <Image 
            source={require('../../assets/images/logoPequena.png')}
            style={{
              width: iconSize,
              height: iconSize,
              resizeMode: 'contain'
            }}
          />
        </View>
        <View style={styles.textWrapper}>
          <Text 
            style={[
              styles.text,
              styles.splitText,
              { 
                fontSize, 
                color: ds.colors.primary,
                lineHeight: Math.floor(fontSize * 1.2),
              }
            ]}
            numberOfLines={1}
            allowFontScaling={false}
          >
            Split
          </Text>
          <Text 
            style={[
              styles.text,
              styles.payText,
              { 
                fontSize, 
                color: ds.colors.text.primary,
                lineHeight: Math.floor(fontSize * 1.2),
              }
            ]}
            numberOfLines={1}
            allowFontScaling={false}
          >
            Pay
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  splitText: {
    fontWeight: '700',
  },
  payText: {
    fontWeight: '300',
  }
}); 