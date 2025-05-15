import {
  StyleSheet,
  Text,
  TextStyle,
  type TextProps,
} from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
  color?: string;
  fontSize?: number;
  fontWeight?: TextStyle['fontWeight'];
  lineHeight?: number;
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type,
  color: textColor,
  fontSize,
  fontWeight,
  lineHeight,
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  const css: TextStyle = {};

  if (textColor) {
    css.color = textColor;
  }

  if (fontSize) {
    css.fontSize = fontSize;
  }

  if (fontWeight) {
    css.fontWeight = fontWeight;
  }

  if (lineHeight) {
    css.lineHeight = lineHeight;
  }

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        color ? { color: textColor } : undefined,
        css,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 36,
    fontWeight: '400',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '200',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },
  primary: {
    color: '#0a7ea4',
  },
  secondary: {
    color: '#666666',
  },
});
