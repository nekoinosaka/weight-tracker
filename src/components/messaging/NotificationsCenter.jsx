// src/components/messaging/NotificationsCenter.jsx
import React, { useState, useEffect } from 'react';
import { Box, List, ListItem, ListItemAvatar, ListItemText, Avatar, IconButton, Typography, Divider, Badge } from '@mui/material';
import { Notifications, Message, ClearAll, MarkAllRead } from '@mui/icons-material';
import { messagingService } from '../../services/messaging';

const NotificationsCenter = ({ onNotificationClick, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Mock notifications for demonstration
  const mockNotifications = [
    {
      id: '1',
      type: 'message',
      message: '张三: 你好，最近怎么样？',
      read: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      relatedId: 'message1'
    },
    {
      id: '2',
      type: 'message',
      message: '李四: 谢谢分享！',
      read: false,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      relatedId: 'message2'
    },
    {
      id: '3',
      type: 'system',
      message: '系统: 您的账户已更新',
      read: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      relatedId: null
    }
  ];
  
  useEffect(() => {
    // In a real app, you would fetch notifications from the server
    // For now, we'll use mock data
    setNotifications(mockNotifications);
    setLoading(false);
  }, []);
  
  const handleMarkAllAsRead = async () => {
    try {
      // In a real app, you would call the API to mark all as read
      // await messagingService.markAllNotificationsAsRead(currentUserId);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };
  
  const handleClearAll = async () => {
    try {
      // In a real app, you would call the API to clear all notifications
      setNotifications([]);
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  };
  
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    return date.toLocaleDateString('zh-CN');
  };
  
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message':
        return <Message color="primary" />;
      case 'system':
        return <Notifications color="warning" />;
      default:
        return <Notifications />;
    }
  };
  
  if (loading) {
    return <div>加载中...</div>;
  }
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return (
    <Box
      sx={{
        width: '320px',
        maxHeight: '480px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px',
          borderBottom: '1px solid #f0f0f0'
        }}
      >
        <Typography variant="h6">
          通知 {unreadCount > 0 && <Badge badgeContent={unreadCount} color="error" />}
        </Typography>
        <Box>
          <IconButton 
            size="small" 
            onClick={handleMarkAllAsRead}
            sx={{ marginRight: '8px' }}
          >
            <MarkAllRead size="small" />
          </IconButton>
          <IconButton size="small" onClick={handleClearAll}>
            <ClearAll size="small" />
          </IconButton>
        </Box>
      </Box>
      
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {notifications.length === 0 ? (
          <Box sx={{ padding: '32px', textAlign: 'center', color: '#666' }}>
            <Notifications sx={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }} />
            <Typography variant="body1">暂无通知</Typography>
          </Box>
        ) : (
          <List>
            {notifications.map((notification) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  button
                  onClick={() => onNotificationClick && onNotificationClick(notification)}
                  sx={{
                    backgroundColor: notification.read ? 'transparent' : '#f5f5f5',
                    '&:hover': {
                      backgroundColor: '#f0f0f0'
                    }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        backgroundColor: notification.read ? '#e0e0e0' : '#f5f5f5'
                      }}
                    >
                      {getNotificationIcon(notification.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={notification.message}
                    secondary={formatTime(notification.createdAt)}
                    sx={{
                      '& .MuiListItemText-primary': {
                        fontWeight: notification.read ? 'normal' : '500'
                      }
                    }}
                  />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
};

export default NotificationsCenter;