import 'package:flutter/material.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'dart:io';

class NotificationService {
  static final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;
  static final FlutterLocalNotificationsPlugin _localNotifications = FlutterLocalNotificationsPlugin();
  
  static Future<void> initialize() async {
    // Firebase Cloud Messaging izinleri
    await _firebaseMessaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );
    
    // Local notifications ayarları
    const AndroidInitializationSettings initializationSettingsAndroid =
        AndroidInitializationSettings('@mipmap/ic_launcher');
    
    const DarwinInitializationSettings initializationSettingsIOS =
        DarwinInitializationSettings(
          requestAlertPermission: true,
          requestBadgePermission: true,
          requestSoundPermission: true,
        );
    
    const InitializationSettings initializationSettings =
        InitializationSettings(
          android: initializationSettingsAndroid,
          iOS: initializationSettingsIOS,
        );
    
    await _localNotifications.initialize(
      initializationSettings,
      onDidReceiveNotificationResponse: _onNotificationTapped,
    );
    
    // Background message handler
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
    
    // Foreground message handler
    FirebaseMessaging.onMessage.listen(_handleForegroundMessage);
    
    // Notification tap handler
    FirebaseMessaging.onMessageOpenedApp.listen(_handleNotificationTap);
    
    print('✅ Notification Service başlatıldı');
  }
  
  static Future<void> _onNotificationTapped(NotificationResponse response) async {
    print('📱 Local notification tapped: ${response.payload}');
    // Navigation logic burada olacak
  }
  
  static Future<void> _handleForegroundMessage(RemoteMessage message) async {
    print('📨 Foreground message: ${message.notification?.title}');
    
    // Local notification göster
    await showLocalNotification(
      title: message.notification?.title ?? 'BIST AI',
      body: message.notification?.body ?? 'Yeni sinyal!',
      payload: message.data.toString(),
    );
  }
  
  static Future<void> _handleNotificationTap(RemoteMessage message) async {
    print('📱 Notification tapped: ${message.notification?.title}');
    // Navigation logic burada olacak
  }
  
  static Future<void> showLocalNotification({
    required String title,
    required String body,
    String? payload,
  }) async {
    const AndroidNotificationDetails androidDetails = AndroidNotificationDetails(
      'bist_ai_channel',
      'BIST AI Sinyalleri',
      channelDescription: 'BIST AI trading sinyalleri ve uyarıları',
      importance: Importance.high,
      priority: Priority.high,
      icon: '@mipmap/ic_launcher',
    );
    
    const DarwinNotificationDetails iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );
    
    const NotificationDetails details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );
    
    await _localNotifications.show(
      DateTime.now().millisecondsSinceEpoch ~/ 1000,
      title,
      body,
      details,
      payload: payload,
    );
  }
  
  static Future<String?> getFCMToken() async {
    try {
      return await _firebaseMessaging.getToken();
    } catch (e) {
      print('❌ FCM Token alınamadı: $e');
      return null;
    }
  }
  
  static Future<void> subscribeToTopic(String topic) async {
    try {
      await _firebaseMessaging.subscribeToTopic(topic);
      print('✅ Topic\'e abone olundu: $topic');
    } catch (e) {
      print('❌ Topic aboneliği hatası: $e');
    }
  }
  
  static Future<void> unsubscribeFromTopic(String topic) async {
    try {
      await _firebaseMessaging.unsubscribeFromTopic(topic);
      print('✅ Topic aboneliği iptal edildi: $topic');
    } catch (e) {
      print('❌ Topic abonelik iptal hatası: $e');
    }
  }
}

// Background message handler
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  print('📨 Background message: ${message.notification?.title}');
  // Background'da gelen mesajları işle
}
