import { Stack, router } from 'expo-router';
import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LoginScreen } from '@/components/auth/LoginScreen';
import { RegisterScreen } from '@/components/auth/RegisterScreen';
import { Colors } from '@/constants/Colors';

export default function AuthPage() {
  const [currentView, setCurrentView] = useState<'login' | 'register'>('login');

  const handleClose = () => {
    router.back();
  };

  const switchToRegister = () => {
    setCurrentView('register');
  };

  const switchToLogin = () => {
    setCurrentView('login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: currentView === 'login' ? 'Sign In' : 'Sign Up',
          headerShown: true,
          presentation: 'modal',
          headerLeft: () => (
            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.closeButton}>Cancel</Text>
            </TouchableOpacity>
          ),
        }}
      />
      
      <View style={styles.content}>
        {currentView === 'login' ? (
          <LoginScreen
            onSwitchToRegister={switchToRegister}
            onClose={handleClose}
          />
        ) : (
          <RegisterScreen
            onSwitchToLogin={switchToLogin}
            onClose={handleClose}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
  },
  closeButton: {
    color: Colors.light.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
