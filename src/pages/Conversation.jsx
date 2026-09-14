// src/pages/Conversation.jsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, AppBar, Toolbar, IconButton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import MessageDisplay from '../components/messaging/MessageDisplay';
import MessageComposition from '../components/messaging/MessageComposition';
import { messagingService } from '../services/messaging';

const Conversation = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const location = useLocation();
  const conversation = location.state?.conversation || {
    userId,
    name: `User ${userId}`,
    avatar: `https://i.pravatar.cc/150?u=${userId}`
  };
  
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Mock current user ID for demonstration
  const currentUserId = 'currentUser';
  
  useEffect(() => {
    // In a real app, you would fetch message history from the server
    // For now, we'll use mock data from the MessageDisplay component
    setLoading(false);
  }, [userId]);
  
  const handleSendMessage = async (content) => {
    try {
      // In a real app, you would send the message to the server
      // const newMessage = await messagingService.sendMessage(currentUserId, userId, content);
      // setMessages(prev => [...prev, newMessage]);
      
      // For demonstration, we'll just add a mock message
      const newMessage = {
        id: `msg-${Date.now()}`,
        senderId: currentUserId,
        content,
        status: 'sent',
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, newMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  
  if (loading) {
    return <div>加载中...</div>;
  }
  
  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
        <Toolbar>
          <IconButton 
            edge="start" 
            color="inherit" 
            aria-label="back"
            onClick={() => navigate('/messages')}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {conversation.name}
          </Typography>
        </Toolbar>
      </AppBar>
      <MessageDisplay 
        messages={messages} 
        currentUserId={currentUserId} 
      />
      <MessageComposition onSendMessage={handleSendMessage} />
    </Box>
  );
};

export default Conversation;