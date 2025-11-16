import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { AuthButton } from '@/components/auth/AuthButton';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/authService';
import { Colors } from '@/constants/Colors';

export default function SettingsPage() {
  const { user, isAuthenticated, isAnonymous } = useAuth();

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your data including mood entries, urge records, and authentication information. This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.clearAllData();
              Alert.alert('Success', 'All data has been cleared. The app will restart.');
              // In a real app, you might want to restart or navigate to initial screen
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Settings',
          headerShown: true,
        }}
      />

      <ScrollView style={styles.content}>
        <ThemedText type="title" style={styles.title}>Settings</ThemedText>

        {/* Account Section */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Account</ThemedText>

          {isAuthenticated && !isAnonymous ? (
            <View style={styles.accountInfo}>
              <ThemedText style={styles.accountText}>
                📧 {user?.email || 'No email'}
              </ThemedText>
              <ThemedText style={styles.statusText}>
                ✅ Authenticated Account
              </ThemedText>
              <ThemedText style={styles.helpText}>
                Your data is synced across all your devices
              </ThemedText>
            </View>
          ) : (
            <View style={styles.accountInfo}>
              <ThemedText style={styles.statusText}>
                👤 Anonymous User
              </ThemedText>
              <ThemedText style={styles.helpText}>
                Sign up to sync your data across devices and keep it safe
              </ThemedText>
            </View>
          )}

          <AuthButton />
        </ThemedView>

        {/* Privacy Section */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Privacy & Data</ThemedText>

          <View style={styles.privacyInfo}>
            {isAnonymous ? (
              <>
                <ThemedText style={styles.privacyText}>
                  � Your data is stored locally on this device only
                </ThemedText>
                <ThemedText style={styles.privacyText}>
                  � No personal information is collected
                </ThemedText>
                <ThemedText style={styles.privacyText}>
                  �🚫 No tracking or analytics
                </ThemedText>
                <ThemedText style={styles.privacyText}>
                  ⚠️ Data will be lost if you delete the app
                </ThemedText>
              </>
            ) : (
              <>
                <ThemedText style={styles.privacyText}>
                  ☁️ Your data is securely synced to your account
                </ThemedText>
                <ThemedText style={styles.privacyText}>
                  🔒 End-to-end encryption protects your privacy
                </ThemedText>
                <ThemedText style={styles.privacyText}>
                  🚫 No tracking or analytics
                </ThemedText>
                <ThemedText style={styles.privacyText}>
                  📱 Access your data from any device
                </ThemedText>
              </>
            )}
          </View>
        </ThemedView>

        {/* Data Management Section */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Data Management</ThemedText>

          <TouchableOpacity style={styles.dangerButton} onPress={handleClearData}>
            <ThemedText style={styles.dangerButtonText}>🗑️ Clear All Data</ThemedText>
          </TouchableOpacity>

          <ThemedText style={styles.warningText}>
            {isAnonymous
              ? "This will permanently delete all your local data including urges and moods"
              : "This will permanently delete all your urges, moods, and account data from all devices"
            }
          </ThemedText>
        </ThemedView>
      </ScrollView>
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
    padding: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 30,
    color: Colors.light.primary,
  },
  section: {
    marginBottom: 24,
    borderRadius: 20,
    padding: 24,
    shadowColor: Colors.light.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.light.primary + '10', // 10% opacity
  },
  sectionTitle: {
    marginBottom: 20,
    color: Colors.light.primary,
  },
  accountInfo: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: Colors.light.primary + '08', // 8% opacity background
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.primary,
  },
  accountText: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  statusText: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    color: Colors.light.primary,
  },
  helpText: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  privacyInfo: {
    gap: 16,
  },
  privacyText: {
    fontSize: 15,
    lineHeight: 24,
    paddingLeft: 8,
  },
  dangerButton: {
    backgroundColor: Colors.light.danger,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: Colors.light.danger,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  dangerButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  warningText: {
    fontSize: 13,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 18,
    fontStyle: 'italic',
  },
});
