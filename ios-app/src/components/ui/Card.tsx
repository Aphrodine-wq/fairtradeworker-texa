import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { Colors, Spacing, BorderRadius, Shadows } from '@/src/constants/theme';

interface CardProps extends ViewProps {
  variant?: 'elevated' | 'glass' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({
  variant = 'elevated',
  padding = 'md',
  style,
  children,
  ...props
}: CardProps) {
  return (
    <View
      style={[
        styles.base,
        styles[`variant_${variant}`],
        styles[`padding_${padding}`],
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  
  // Variants - NO BORDERS, shadow-based depth
  variant_elevated: {
    backgroundColor: Colors.surface,
    ...Shadows.lg,
  },
  variant_glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    ...Shadows.lg,
  },
  variant_filled: {
    backgroundColor: Colors.surfaceSecondary,
    ...Shadows.md,
  },
  
  // Padding
  padding_none: {
    padding: 0,
  },
  padding_sm: {
    padding: Spacing.sm,
  },
  padding_md: {
    padding: Spacing.lg,
  },
  padding_lg: {
    padding: Spacing.xl,
  },
});
