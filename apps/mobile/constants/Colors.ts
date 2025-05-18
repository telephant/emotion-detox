/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    primary: '#96A595',
    secondary: '#E5DFD2',
    danger: '#E88F8F',
    grey: '#CCCCCC',

    text: '#333333',
    textPrimary: '#333333',
    textSecondary: '#666666',
    background: '#F8F7F4',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    white: '#FFFFFF',
    
    // Activity heatmap colors
    inactive: '#EBEDF0',
    lowActivity: '#C6E48B',
    mediumActivity: '#7BC96F',
    highActivity: '#239A3B',
    veryHighActivity: '#196127',
  },
  dark: {
    primary: '#96A595',
    secondary: '#E5DFD2',
    danger: '#E88F8F',
    grey: '#666666',

    text: '#333333',
    textPrimary: '#333333',
    textSecondary: '#666666',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    white: '#FFFFFF',
    
    // Activity heatmap colors 
    inactive: '#161B22',
    lowActivity: '#0E4429',
    mediumActivity: '#006D32',
    highActivity: '#26A641',
    veryHighActivity: '#39D353',
  },
};
