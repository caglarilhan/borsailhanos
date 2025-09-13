import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PushNotification from 'react-native-push-notification';

// Mobile App Configuration
interface MobileAppConfig {
  appVersion: string;
  buildNumber: string;
  platform: 'ios' | 'android';
  offlineMode: boolean;
  pushNotifications: boolean;
  biometricAuth: boolean;
}

// Offline Data Storage
interface OfflineData {
  patients: any[];
  appointments: any[];
  notes: any[];
  medications: any[];
  lastSync: string;
}

// Push Notification Types
interface PushNotificationData {
  type: 'appointment' | 'medication' | 'message' | 'reminder';
  title: string;
  body: string;
  data?: any;
  scheduledTime?: Date;
}

export class MobileAppManager {
  private config: MobileAppConfig;
  private offlineData: OfflineData;

  constructor() {
    this.config = {
      appVersion: '1.0.0',
      buildNumber: '100',
      platform: Platform.OS as 'ios' | 'android',
      offlineMode: false,
      pushNotifications: false,
      biometricAuth: false
    };
    
    this.offlineData = {
      patients: [],
      appointments: [],
      notes: [],
      medications: [],
      lastSync: new Date().toISOString()
    };
  }

  // Initialize mobile app
  async initialize(): Promise<void> {
    try {
      // Load saved configuration
      const savedConfig = await AsyncStorage.getItem('mobileAppConfig');
      if (savedConfig) {
        this.config = { ...this.config, ...JSON.parse(savedConfig) };
      }

      // Load offline data
      const savedData = await AsyncStorage.getItem('offlineData');
      if (savedData) {
        this.offlineData = { ...this.offlineData, ...JSON.parse(savedData) };
      }

      // Initialize push notifications
      this.initializePushNotifications();

      // Setup offline mode
      this.setupOfflineMode();

      console.log('Mobile app initialized successfully');
    } catch (error) {
      console.error('Failed to initialize mobile app:', error);
    }
  }

  // Initialize push notifications
  private initializePushNotifications(): void {
    PushNotification.configure({
      onRegister: (token) => {
        console.log('Push notification token:', token);
        this.savePushToken(token.token);
      },
      onNotification: (notification) => {
        console.log('Push notification received:', notification);
        this.handlePushNotification(notification);
      },
      onAction: (notification) => {
        console.log('Push notification action:', notification);
      },
      onRegistrationError: (error) => {
        console.error('Push notification registration error:', error);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: true,
    });

    // Create notification channel for Android
    if (Platform.OS === 'android') {
      PushNotification.createChannel(
        {
          channelId: 'mindtrack-notifications',
          channelName: 'MindTrack Notifications',
          channelDescription: 'Notifications for appointments, medications, and messages',
          playSound: true,
          soundName: 'default',
          importance: 4,
          vibrate: true,
        },
        (created) => console.log(`Channel created: ${created}`)
      );
    }
  }

  // Setup offline mode
  private setupOfflineMode(): void {
    // Listen for network status changes
    // In a real implementation, you would use @react-native-netinfo/netinfo
    this.config.offlineMode = false; // Placeholder
  }

  // Save push notification token
  private async savePushToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('pushToken', token);
      // In a real app, you would send this token to your server
      console.log('Push token saved:', token);
    } catch (error) {
      console.error('Failed to save push token:', error);
    }
  }

  // Handle push notification
  private handlePushNotification(notification: any): void {
    const { type, data } = notification;
    
    switch (type) {
      case 'appointment':
        this.handleAppointmentNotification(data);
        break;
      case 'medication':
        this.handleMedicationNotification(data);
        break;
      case 'message':
        this.handleMessageNotification(data);
        break;
      case 'reminder':
        this.handleReminderNotification(data);
        break;
      default:
        console.log('Unknown notification type:', type);
    }
  }

  // Handle appointment notifications
  private handleAppointmentNotification(data: any): void {
    Alert.alert(
      'Appointment Reminder',
      `You have an appointment with ${data.patientName} at ${data.time}`,
      [
        { text: 'View Details', onPress: () => this.openAppointment(data.id) },
        { text: 'OK', style: 'default' }
      ]
    );
  }

  // Handle medication notifications
  private handleMedicationNotification(data: any): void {
    Alert.alert(
      'Medication Reminder',
      `Time to take ${data.medicationName}`,
      [
        { text: 'Mark as Taken', onPress: () => this.markMedicationTaken(data.id) },
        { text: 'Snooze', onPress: () => this.snoozeMedication(data.id) }
      ]
    );
  }

  // Handle message notifications
  private handleMessageNotification(data: any): void {
    Alert.alert(
      'New Message',
      `You have a new message from ${data.senderName}`,
      [
        { text: 'View Message', onPress: () => this.openMessage(data.id) },
        { text: 'OK', style: 'default' }
      ]
    );
  }

  // Handle reminder notifications
  private handleReminderNotification(data: any): void {
    Alert.alert(
      'Reminder',
      data.message,
      [
        { text: 'OK', style: 'default' }
      ]
    );
  }

  // Schedule push notification
  scheduleNotification(notification: PushNotificationData): void {
    const notificationConfig = {
      channelId: 'mindtrack-notifications',
      title: notification.title,
      message: notification.body,
      date: notification.scheduledTime || new Date(Date.now() + 1000),
      userInfo: {
        type: notification.type,
        data: notification.data
      }
    };

    PushNotification.localNotificationSchedule(notificationConfig);
  }

  // Save data offline
  async saveOfflineData(key: string, data: any): Promise<void> {
    try {
      this.offlineData[key as keyof OfflineData] = data;
      await AsyncStorage.setItem('offlineData', JSON.stringify(this.offlineData));
      console.log(`Offline data saved for key: ${key}`);
    } catch (error) {
      console.error('Failed to save offline data:', error);
    }
  }

  // Load data offline
  async loadOfflineData(key: string): Promise<any> {
    try {
      const data = await AsyncStorage.getItem('offlineData');
      if (data) {
        const parsedData = JSON.parse(data);
        return parsedData[key];
      }
      return null;
    } catch (error) {
      console.error('Failed to load offline data:', error);
      return null;
    }
  }

  // Sync data with server
  async syncData(): Promise<void> {
    try {
      // In a real implementation, you would sync with your server
      console.log('Syncing data with server...');
      
      // Update last sync time
      this.offlineData.lastSync = new Date().toISOString();
      await AsyncStorage.setItem('offlineData', JSON.stringify(this.offlineData));
      
      console.log('Data sync completed');
    } catch (error) {
      console.error('Failed to sync data:', error);
    }
  }

  // Get app configuration
  getConfig(): MobileAppConfig {
    return this.config;
  }

  // Update app configuration
  async updateConfig(updates: Partial<MobileAppConfig>): Promise<void> {
    this.config = { ...this.config, ...updates };
    await AsyncStorage.setItem('mobileAppConfig', JSON.stringify(this.config));
  }

  // Navigation helpers
  private openAppointment(id: string): void {
    console.log('Opening appointment:', id);
    // In a real app, you would navigate to appointment details
  }

  private markMedicationTaken(id: string): void {
    console.log('Marking medication as taken:', id);
    // In a real app, you would update medication status
  }

  private snoozeMedication(id: string): void {
    console.log('Snoozing medication:', id);
    // In a real app, you would reschedule the notification
  }

  private openMessage(id: string): void {
    console.log('Opening message:', id);
    // In a real app, you would navigate to message details
  }
}

// Export singleton instance
export const mobileAppManager = new MobileAppManager();
