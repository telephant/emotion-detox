import { useAuth } from '@/hooks/useAuth';
import { router } from 'expo-router';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '@/constants/Colors';

interface AuthButtonProps {
  style?: any;
  showUserInfo?: boolean;
}

/**
 * Authentication button component that shows different states based on user authentication
 */
export function AuthButton({ style, showUserInfo = false }: AuthButtonProps) {
  const { user, isAuthenticated, isAnonymous, logout } = useAuth();

  const handlePress = () => {
    if (isAuthenticated && !isAnonymous) {
      // User is logged in, show logout option or profile
      router.push('/settings');
    } else {
      // User is anonymous, show login/register options
      router.push('/auth/login');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isAuthenticated && !isAnonymous) {
    // Authenticated user
    return (
      <View style={[styles.container, style]}>
        {showUserInfo && (
          <View style={styles.userInfo}>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <Text style={styles.userStatus}>Signed In</Text>
          </View>
        )}
        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.profileButton} onPress={handlePress}>
            <Text style={styles.profileButtonText}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Anonymous user
  return (
    <View style={[styles.container, style]}>
      {showUserInfo && (
        <View style={styles.userInfo}>
          <Text style={styles.userStatus}>Anonymous User</Text>
          <Text style={styles.userDescription}>
            Sign up to sync your data across devices
          </Text>
        </View>
      )}
      <TouchableOpacity style={styles.authButton} onPress={handlePress}>
        <Text style={styles.authButtonText}>Sign In / Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  userStatus: {
    fontSize: 14,
    color: Colors.light.primary,
    marginBottom: 4,
    fontWeight: '600',
  },
  userDescription: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
    opacity: 0.8,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  authButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 16,
    minWidth: 160,
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
  authButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  profileButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: Colors.light.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  profileButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: Colors.light.background,
    borderWidth: 2,
    borderColor: Colors.light.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: Colors.light.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
