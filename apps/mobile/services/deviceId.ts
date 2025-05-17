import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Application from 'expo-application';
import { Platform } from 'react-native';
import { v4 as uuidv4 } from 'uuid';

// Key for storing the device ID in AsyncStorage
const DEVICE_ID_KEY = '@EmotionDetox:deviceId';

/**
 * Get the physical device ID using various device identifiers
 * Uses a combination of device-specific information to create a unique identifier
 * Falls back to a UUID as a last resort
 */
const getPhysicalDeviceId = async (): Promise<string> => {
  console.log('🔄 Getting physical device identifier...');
  try {
    // Try to get the native device ID based on platform
    let nativeId = '';
    
    if (Platform.OS === 'ios') {
      // On iOS, use the installation ID
      console.log('📲 Getting iOS vendor ID...');
      nativeId = await Application.getIosIdForVendorAsync() || '';
    } else if (Platform.OS === 'android') {
      // On Android, use the installation ID
      console.log('📲 Getting Android ID...');
      nativeId = await Application.getAndroidId() || '';
    }
    
    // If we have a native ID, use it as the primary identifier
    if (nativeId) {
      console.log('✅ Native device ID obtained');
      return nativeId;
    }
    
    // Otherwise build an ID from device information
    console.log('⚠️ Native ID unavailable, using device information...');
    const parts = [];
    
    // Add OS and version
    parts.push(Platform.OS);
    parts.push(Platform.Version);
    
    // Add device information if available
    if (Device.isDevice) {
      if (Device.brand) parts.push(Device.brand);
      if (Device.modelName) parts.push(Device.modelName);
      if (Device.deviceName) parts.push(Device.deviceName);
      if (Device.designName) parts.push(Device.designName);
      if (Device.productName) parts.push(Device.productName);
    }
    
    // Create a combined ID if we have device parts
    if (parts.length > 0) {
      console.log('✅ Device ID created from device information');
      return parts.join('-');
    }
    
    // Fallback to UUID when no device info is available
    console.log('⚠️ No device information available, using UUID');
    return uuidv4();
  } catch (error) {
    console.error('❌ Error getting physical device ID:', error);
    return uuidv4();
  }
};

/**
 * Get the device ID from AsyncStorage or generate a physical device identifier
 */
export const getDeviceId = async (): Promise<string> => {
  console.log('🔄 Starting device ID resolution...');
  try {
    // Try to get the existing device ID
    console.log('🔍 Checking AsyncStorage for existing device ID...');
    const storedDeviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
    
    // If it exists, return it
    if (storedDeviceId) {
      console.log('✅ Found existing device ID in storage');
      return storedDeviceId;
    }
    
    // Otherwise, get a physical device identifier
    console.log('🆕 No stored device ID found, generating new one...');
    const physicalDeviceId = await getPhysicalDeviceId();
    
    // Store it for future use
    console.log('💾 Saving device ID to AsyncStorage...');
    await AsyncStorage.setItem(DEVICE_ID_KEY, physicalDeviceId);
    console.log('✅ Device ID saved successfully');
    
    return physicalDeviceId;
  } catch (error) {
    console.error('❌ Error getting device ID:', error);
    // Fallback to a temporary ID if storage fails
    return await getPhysicalDeviceId();
  }
}; 