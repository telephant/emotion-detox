import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
} from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';

interface RegisterScreenProps {
  onSwitchToLogin?: () => void;
  onClose?: () => void;
}

export function RegisterScreen({ onSwitchToLogin, onClose }: RegisterScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [migrateData, setMigrateData] = useState(true);
  
  const { register, isLoading, error, clearError, isAnonymous } = useAuth();

  const handleRegister = async () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (!isValidPassword(password)) {
      Alert.alert('Error', 'Password must be at least 8 characters with uppercase, lowercase, numbers and special characters');
      return;
    }

    try {
      clearError();
      await register(email.trim(), password, migrateData);

      const message = migrateData && isAnonymous
        ? 'Registration successful! Your anonymous data has been migrated to the new account.'
        : 'Registration successful!';

      Alert.alert('Success', message, [
        {
          text: 'OK',
          onPress: () => {
            onClose?.();
            router.back();
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Registration Failed', error instanceof Error ? error.message : 'An error occurred during registration');
    }
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidPassword = (password: string) => {
    return password.length >= 8 &&
           /[a-z]/.test(password) &&
           /[A-Z]/.test(password) &&
           /\d/.test(password) &&
           /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  };

  const canSubmit = 
    email.trim() && 
    password.trim() && 
    confirmPassword.trim() &&
    isValidEmail(email.trim()) && 
    isValidPassword(password) &&
    password === confirmPassword &&
    !isLoading;

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Register an account to sync your data across devices
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={[
                styles.input,
                !isValidEmail(email) && email.length > 0 && styles.inputError
              ]}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email address"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
            {!isValidEmail(email) && email.length > 0 && (
              <Text style={styles.errorText}>Please enter a valid email address</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.input,
                  styles.passwordInput,
                  !isValidPassword(password) && password.length > 0 && styles.inputError
                ]}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.passwordToggleText}>
                  {showPassword ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>
            {!isValidPassword(password) && password.length > 0 && (
              <Text style={styles.errorText}>
                Password must be at least 8 characters with uppercase, lowercase, numbers and special characters
              </Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={[
                styles.input,
                password !== confirmPassword && confirmPassword.length > 0 && styles.inputError
              ]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Enter your password again"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
            {password !== confirmPassword && confirmPassword.length > 0 && (
              <Text style={styles.errorText}>Passwords do not match</Text>
            )}
          </View>

          {isAnonymous && (
            <View style={styles.switchGroup}>
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Migrate Existing Data</Text>
                <Switch
                  value={migrateData}
                  onValueChange={setMigrateData}
                  disabled={isLoading}
                />
              </View>
              <Text style={styles.switchDescription}>
                Migrate your current anonymous data (mood entries, urge records, etc.) to the new account
              </Text>
            </View>
          )}

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.registerButton,
              !canSubmit && styles.registerButtonDisabled
            ]}
            onPress={handleRegister}
            disabled={!canSubmit}
          >
            <Text style={[
              styles.registerButtonText,
              !canSubmit && styles.registerButtonTextDisabled
            ]}>
              {isLoading ? 'Registering...' : 'Create Account'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={onSwitchToLogin}>
            <Text style={styles.linkText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 48,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.light.primary,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.8,
  },
  form: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: Colors.light.primary + '20', // 20% opacity
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    backgroundColor: Colors.light.background,
    shadowColor: Colors.light.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputError: {
    borderColor: Colors.light.danger,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 70,
  },
  passwordToggle: {
    position: 'absolute',
    right: 16,
    top: 16,
    bottom: 16,
    justifyContent: 'center',
  },
  passwordToggleText: {
    color: Colors.light.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  switchGroup: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: Colors.light.primary + '08', // 8% opacity
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.primary,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  switchDescription: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
    opacity: 0.8,
  },
  errorContainer: {
    marginBottom: 20,
  },
  errorText: {
    color: Colors.light.danger,
    fontSize: 14,
    marginTop: 4,
  },
  registerButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    shadowColor: Colors.light.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  registerButtonDisabled: {
    backgroundColor: Colors.light.grey,
    shadowOpacity: 0,
    elevation: 0,
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  registerButtonTextDisabled: {
    color: Colors.light.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  footerText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginRight: 4,
  },
  linkText: {
    fontSize: 16,
    color: Colors.light.primary,
    fontWeight: '600',
  },
});
