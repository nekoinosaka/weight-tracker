// src/components/messaging/MessageDisplay.jsx
import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import { CheckCircle, CheckCircleOutline, DoneAll, DoneAllOutlined } from '@mui/icons-material';

const MessageDisplay = ({ messages, currentUserId }) => {
  // Mock messages for demonstration
  const mockMessages = [
    {
      id: '1',
      senderId: 'user1',
      content: '你好，最近怎么样？',
      status: 'read',
      createdAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: '2',
      senderId: currentUserId,
      content: '我很好，谢谢！你呢？',
      status: 'read',
      createdAt: new Date(Date.now() - 3500000).toISOString()
    },
    {
      id: '3',
      senderId: 'user1',
      content: '我也不错，在忙什么呢？',
      status: 'read',
      createdAt: new Date(Date.now() - 3400000).toISOString()
    },
    {
      id: '4',
      senderId: currentUserId,
      content: '在开发一个新功能，即时通讯功能！',
      status: 'delivered',
      createdAt: new Date(Date.now() - 3300000).toISOString()
    },
    {
      id: '5',
      senderId: currentUserId,
      content: '刚刚完成了消息显示组件',
      status: 'sent',
      createdAt: new Date(Date.now() - 3200000).toISOString()
    }
  ];
  
  const displayMessages = messages.length > 0 ? messages : mockMessages;
  
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'read':
        return <DoneAll style={{ fontSize: '16px', color: '#1976d2' }} />;
      case 'delivered':
        return <DoneAllOutlined style={{ fontSize: '16px', color: '#666' }} />;
      case 'sent':
        return <CheckCircleOutline style={{ fontSize: '16px', color: '#666' }} />;
      default:
        return null;
    }
  };
  
  return (
    <Box 
      sx={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        backgroundColor: '#f5f5f5'
      }}
    >
      {displayMessages.map((message) => {
        const isCurrentUser = message.senderId === currentUserId;
        
        return (
          <Box
            key={message.id}
            sx={{
              display: 'flex',
              justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
              marginBottom: '16px',
              maxWidth: '70%'
            }}
          >
            {!isCurrentUser && (
              <Avatar 
                sx={{ 
                  width: '36px', 
                  height: '36px',
                  marginRight: '8px'
                }}
              >
                {message.senderId.charAt(0).toUpperCase()}
              </Avatar>
            )}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isCurrentUser ? 'flex-end' : 'flex-start'
              }}
            >
              <Box
                sx={{
                  padding: '12px 16px',
                  borderRadius: isCurrentUser 
                    ? '16px 16px 4px 16px' 
                    : '16px 16px 16px 4px',
                  backgroundColor: isCurrentUser ? '#1976d2' : '#fff',
                  color: isCurrentUser ? '#fff' : '#000',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}
              >
                <Typography variant="body1">{message.content}</Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  marginTop: '4px',
                  fontSize: '0.75rem',
                  color: '#666'
                }}
              >
                <span>{formatTime(message.createdAt)}</span>
                {isCurrentUser && (
                  <span style={{ marginLeft: '4px' }}>
                    {getStatusIcon(message.status)}
                  </span>
                )}
              </Box>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default MessageDisplay;