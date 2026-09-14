// src/components/messaging/ConversationList.jsx
import React, { useState, useEffect } from 'react';
import { List, ListItem, ListItemAvatar, ListItemText, Avatar, IconButton, Badge } from '@mui/material';
import { Message as MessageIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { messagingService } from '../../services/messaging';

const ConversationList = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Mock data for demonstration
  const mockConversations = [
    {
      id: '1',
      userId: 'user1',
      name: '张三',
      avatar: 'https://i.pravatar.cc/150?u=1',
      lastMessage: '你好，最近怎么样？',
      lastMessageTime: '2分钟前',
      unreadCount: 2
    },
    {
      id: '2',
      userId: 'user2',
      name: '李四',
      avatar: 'https://i.pravatar.cc/150?u=2',
      lastMessage: '谢谢分享！',
      lastMessageTime: '1小时前',
      unreadCount: 0
    },
    {
      id: '3',
      userId: 'user3',
      name: '王五',
      avatar: 'https://i.pravatar.cc/150?u=3',
      lastMessage: '明天见！',
      lastMessageTime: '昨天',
      unreadCount: 1
    }
  ];
  
  useEffect(() => {
    // In a real app, you would fetch conversations from the server
    // For now, we'll use mock data
    setConversations(mockConversations);
    setLoading(false);
  }, []);
  
  const handleConversationClick = (conversation) => {
    navigate(`/messages/${conversation.userId}`, {
      state: { conversation }
    });
  };
  
  if (loading) {
    return <div>加载中...</div>;
  }
  
  if (conversations.length === 0) {
    return <div>暂无对话</div>;
  }
  
  return (
    <List>
      {conversations.map((conversation) => (
        <ListItem 
          key={conversation.id}
          button
          onClick={() => handleConversationClick(conversation)}
          sx={{
            borderBottom: '1px solid #f0f0f0',
            '&:hover': {
              backgroundColor: '#f5f5f5'
            }
          }}
        >
          <ListItemAvatar>
            <Badge 
              overlap="circular" 
              badgeContent={conversation.unreadCount > 0 ? conversation.unreadCount : null}
              color="error"
            >
              <Avatar src={conversation.avatar} alt={conversation.name} />
            </Badge>
          </ListItemAvatar>
          <ListItemText
            primary={conversation.name}
            secondary={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{conversation.lastMessage}</span>
                <span style={{ fontSize: '0.75rem', color: '#666' }}>{conversation.lastMessageTime}</span>
              </div>
            }
          />
        </ListItem>
      ))}
    </List>
  );
};

export default ConversationList;