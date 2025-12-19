import { useWindowDimensions } from 'react-native';

export type DeviceType = 'phone' | 'tablet';

export interface ResponsiveBreakpoints {
  isPhone: boolean;
  isTablet: boolean;
  deviceType: DeviceType;
  width: number;
  height: number;
}

/**
 * Hook to determine device type and provide responsive utilities
 * Tablet breakpoint: 768px width
 */
export function useResponsive(): ResponsiveBreakpoints {
  const { width, height } = useWindowDimensions();
  
  const isTablet = width >= 768;
  const isPhone = !isTablet;
  const deviceType: DeviceType = isTablet ? 'tablet' : 'phone';

  return {
    isPhone,
    isTablet,
    deviceType,
    width,
    height,
  };
}

/**
 * Utility to return different values based on device type
 */
export function responsive<T>(phoneValue: T, tabletValue: T, isTablet: boolean): T {
  return isTablet ? tabletValue : phoneValue;
}
