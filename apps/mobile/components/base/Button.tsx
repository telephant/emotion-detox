import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { useMemo } from 'react';
import { Colors } from '@/constants/Colors';

interface ButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  shape?: 'square' | 'pill';
  type?: 'primary' | 'secondary' | 'danger';
  fullWidth?: boolean;
}

export default function Button(props: ButtonProps) {
  const {
    children,
    onPress,
    shape = 'pill',
    type = 'primary',
    fullWidth = false,
  } = props;

  const css = useMemo(() => {
    const base: StyleProp<ViewStyle> = [styles.button]; 

    if (shape === 'square') {
      base.push(styles.square);
    }

    if (shape === 'pill') {
      base.push(styles.pill);
    }

    switch (type) {
      case 'primary':
        base.push(styles.primary);
        break;
      case 'secondary':
        base.push(styles.secondary);
        break;
      case 'danger':
        base.push(styles.danger);
        break;
    }

    if (fullWidth) {
      base.push(styles.fullWidth);
    }

    return base;
  }, [shape, type, fullWidth]);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={css}
    >
      {children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  square: {
    borderRadius: 9999,
  },
  pill: {
    borderRadius: 9999,
  },
  primary: {
    backgroundColor: Colors.light.primary,
  },
  secondary: {
    backgroundColor: Colors.light.secondary,
  },
  danger: {
    backgroundColor: Colors.light.danger,
  },
  fullWidth: {
    width: '100%',
  },
});
