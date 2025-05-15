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

    text: '#333333',
    textPrimary: '#333333',
  
    textSecondary: '#666666',
    background: '#F8F7F4',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    white: '#FFFFFF',
  },
  dark: {
    primary: '#96A595',
    secondary: '#E5DFD2',
    danger: '#E88F8F',

    text: '#333333',
    textPrimary: '#333333',
    textSecondary: '#666666',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    white: '#FFFFFF',
  },
};
