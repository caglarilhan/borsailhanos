import { NextRequest, NextResponse } from 'next/server';

// Mock notification data - in real app, this would come from database
const mockNotifications = [
  {
    id: '1',
    userId: 'user-1',
    type: 'success',
    title: 'Appointment Confirmed',
    message: 'Your appointment with Dr. Sarah Johnson on September 20th at 10:00 AM has been confirmed.',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    isRead: false,
    actionUrl: '/appointments',
    actionText: 'View Details',
    priority: 'normal'
  },
  {
    id: '2',
    userId: 'user-1',
    type: 'warning',
    title: 'Medication Reminder',
    message: 'Time to take your Metformin 500mg. Please take with food.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    isRead: false,
    priority: 'high'
  },
  {
    id: '3',
    userId: 'user-1',
    type: 'info',
    title: 'Lab Results Available',
    message: 'Your Complete Blood Count results are now available in your patient portal.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    isRead: true,
    actionUrl: '/lab-results',
    actionText: 'View Results',
    priority: 'normal'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Filter notifications by user
    let userNotifications = mockNotifications.filter(n => n.userId === userId);

    // Filter by type if specified
    if (type) {
      userNotifications = userNotifications.filter(n => n.type === type);
    }

    // Apply pagination
    const paginatedNotifications = userNotifications
      .slice(offset, offset + limit)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Calculate unread count
    const unreadCount = userNotifications.filter(n => !n.isRead).length;

    return NextResponse.json({
      success: true,
      data: {
        notifications: paginatedNotifications,
        total: userNotifications.length,
        unreadCount,
        hasMore: offset + limit < userNotifications.length
      }
    });
  } catch (error) {
    console.error('Notifications API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, notificationId, settings } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'mark_read':
        if (!notificationId) {
          return NextResponse.json(
            { error: 'Notification ID is required' },
            { status: 400 }
          );
        }
        // In real app, update notification in database
        return NextResponse.json({
          success: true,
          message: 'Notification marked as read'
        });

      case 'mark_all_read':
        // In real app, mark all user notifications as read
        return NextResponse.json({
          success: true,
          message: 'All notifications marked as read'
        });

      case 'delete':
        if (!notificationId) {
          return NextResponse.json(
            { error: 'Notification ID is required' },
            { status: 400 }
          );
        }
        // In real app, delete notification from database
        return NextResponse.json({
          success: true,
          message: 'Notification deleted'
        });

      case 'update_settings':
        if (!settings) {
          return NextResponse.json(
            { error: 'Settings are required' },
            { status: 400 }
          );
        }
        // In real app, update user notification settings
        return NextResponse.json({
          success: true,
          message: 'Notification settings updated'
        });

      case 'send_test':
        // Send a test notification
        const testNotification = {
          id: `test-${Date.now()}`,
          userId,
          type: 'info',
          title: 'Test Notification',
          message: 'This is a test notification to verify your settings.',
          timestamp: new Date(),
          isRead: false,
          priority: 'normal'
        };
        
        // In real app, save to database and send via WebSocket
        return NextResponse.json({
          success: true,
          message: 'Test notification sent',
          notification: testNotification
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Notifications POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}










