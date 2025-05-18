import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { STORAGE_KEYS, useStorage } from '@/hooks/useStorage';
import { apiClient } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import { Mood } from '@repo/shared-types';
import { router } from 'expo-router';
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Removed mock data

export default function MoodListScreen() {
  const [moods, setMoods] = useState<Mood[]>([]);
  const [newMoodText, setNewMoodText] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { getValue } = useStorage();

  const fetchMoods = useCallback(async () => {
    try {
      setIsLoading(true);
      // Get the user ID from storage
      const userId = await getValue(STORAGE_KEYS.USER_ID);
      
      if (!userId) {
        Alert.alert('Error', 'User not found. Please log in again.');
        return;
      }
      
      const response = await apiClient.getUserMoods(userId);
      setMoods(response.data.moods);
    } catch (error) {
      console.error('Error fetching moods:', error);
      Alert.alert('Error', 'Failed to load your mood history.');
    } finally {
      setIsLoading(false);
    }
  }, [getValue]);

  useEffect(() => {
    fetchMoods();
  }, [fetchMoods]);

  const openModal = () => {
    setNewMoodText('');
    setModalVisible(true);
    
    // Start animations
    fadeAnim.setValue(0);
    slideAnim.setValue(300);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeModal = () => {
    // Animate out and then close
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
    });
  };

  const handleSaveMood = async () => {
    if (newMoodText.trim()) {
      try {
        setIsLoading(true);
        // Get the user ID from storage
        const userId = await getValue(STORAGE_KEYS.USER_ID);
        
        if (!userId) {
          Alert.alert('Error', 'User not found. Please log in again.');
          return;
        }
        
        // Create the mood via API
        const response = await apiClient.createMood({
          userId,
          text: newMoodText.trim()
        });
        
        // Add the new mood to the list
        setMoods(prevMoods => [response.data.mood, ...prevMoods]);
        closeModal();
      } catch (error) {
        console.error('Error saving mood:', error);
        Alert.alert('Error', 'Failed to save your mood.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const formatDate = (date: Date | string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const moodDate = new Date(date);
    moodDate.setHours(0, 0, 0, 0);
    
    const diffDays = Math.round((today.getTime() - moodDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else {
      return `${moodDate.toLocaleString('default', { month: 'short' })} ${moodDate.getDate()}`;
    }
  };

  const renderMoodItem = ({ item }: { item: Mood }) => (
    <TouchableOpacity style={styles.moodItem}>
      <View style={styles.moodContent}>
        <ThemedText type="default" style={styles.moodText}>
          {item.text} {item.emoji}
        </ThemedText>
        <ThemedText type="caption" style={styles.moodDate}>
          {formatDate(item.date)}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Feather name="chevron-left" size={24} color={Colors.light.textPrimary} />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.title}>
          Mood History
        </ThemedText>
        <TouchableOpacity style={styles.addButton} onPress={openModal} disabled={isLoading}>
          <Feather name="plus" size={22} color={Colors.light.white} />
        </TouchableOpacity>
      </View>
      
      {isLoading && !moods.length ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <ThemedText type="default" style={styles.loadingText}>
            Loading your moods...
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={moods}
          keyExtractor={(item) => item.id}
          renderItem={renderMoodItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="inbox" size={48} color={Colors.light.textSecondary} />
              <ThemedText type="default" style={styles.emptyText}>
                No moods recorded yet.
              </ThemedText>
            </View>
          }
        />
      )}
      
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalWrapper}
        >
          <Animated.View 
            style={[
              styles.backdrop, 
              { opacity: fadeAnim },
            ]}
          >
            <Pressable 
              style={styles.backdropPressable} 
              onPress={closeModal}
            />
          </Animated.View>
          
          <Animated.View 
            style={[
              styles.modalContainer,
              { transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={styles.modalHandle} />
            
            <View style={styles.modalContent}>
              <ThemedText type="title" style={styles.modalTitle}>
                Record Mood
              </ThemedText>
              
              <TextInput
                style={styles.moodInput}
                placeholder="How are you feeling?"
                placeholderTextColor="#999"
                value={newMoodText}
                onChangeText={setNewMoodText}
                multiline={false}
                returnKeyType="done"
                selectionColor={Colors.light.primary}
                underlineColorAndroid="transparent"
                onSubmitEditing={Keyboard.dismiss}
              />
              
              <TouchableOpacity 
                style={[
                  styles.saveButton,
                  isLoading && styles.saveButtonDisabled
                ]}
                onPress={handleSaveMood}
                activeOpacity={0.8}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <ThemedText type="default" style={styles.saveButtonText}>
                    Save
                  </ThemedText>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  backButton: {
    padding: 8,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  moodItem: {
    backgroundColor: Colors.light.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  moodContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  moodText: {
    fontSize: 16,
  },
  moodDate: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  modalWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdropPressable: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingTop: 16,
    // Shadow for elevation effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalContent: {
    paddingTop: 10,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 30,
  },
  moodInput: {
    fontSize: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    paddingVertical: 12,
    marginBottom: 40,
  },
  saveButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: Platform.OS === 'ios' ? 10 : 0,
  },
  saveButtonDisabled: {
    backgroundColor: Colors.light.grey,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: Colors.light.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    marginTop: 16,
    color: Colors.light.textSecondary,
    fontSize: 16,
  },
}); 