import React from 'react';
import { View, Text, StyleSheet, ViewProps } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '@/src/constants/theme';

type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline';

interface BadgeProps extends ViewProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export function Badge({
  label,
  variant = 'default',
  size = 'md',
  icon,
  style,
  ...props
}: BadgeProps) {
  return (
    <View
      style={[
        styles.base,
        styles[`variant_${variant}`],
        styles[`size_${size}`],
        style,
      ]}
      {...props}
    >
      {icon && icon}
      <Text style={[styles.text, styles[`textVariant_${variant}`], styles[`textSize_${size}`]]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  
  // Sizes
  size_sm: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  size_md: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  
  // Variants
  variant_default: {
    backgroundColor: Colors.surfaceSecondary,
  },
  variant_primary: {
    backgroundColor: Colors.primaryLight,
  },
  variant_secondary: {
    backgroundColor: Colors.secondaryLight,
  },
  variant_success: {
    backgroundColor: Colors.successLight,
  },
  variant_warning: {
    backgroundColor: Colors.warningLight,
  },
  variant_error: {
    backgroundColor: Colors.errorLight,
  },
  variant_outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  
  // Text
  text: {
    fontWeight: '500',
  },
  textSize_sm: {
    fontSize: Typography.fontSize.xs,
  },
  textSize_md: {
    fontSize: Typography.fontSize.sm,
  },
  
  // Text variants
  textVariant_default: {
    color: Colors.textSecondary,
  },
  textVariant_primary: {
    color: Colors.primaryDark,
  },
  textVariant_secondary: {
    color: Colors.secondaryDark,
  },
  textVariant_success: {
    color: Colors.success,
  },
  textVariant_warning: {
    color: Colors.warning,
  },
  textVariant_error: {
    color: Colors.error,
  },
  textVariant_outline: {
    color: Colors.textSecondary,
  },
});
