// src/components/messaging/MessageComposition.jsx
import React, { useState } from 'react';
import { TextField, IconButton, Box } from '@mui/material';
import { Send } from '@mui/icons-material';

const MessageComposition = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  
  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  return (
    <Box 
      sx={{
        display: 'flex',
        alignItems: 'flex-end',
        padding: '16px',
        borderTop: '1px solid #f0f0f0',
        backgroundColor: '#fff'
      }}
    >
      <TextField
        fullWidth
        multiline
        rows={1}
        maxRows={4}
        placeholder="输入消息..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        variant="outlined"
        sx={{
          marginRight: '8px',
          '& .MuiOutlinedInput-root': {
            borderRadius: '24px',
            '& fieldset': {
              borderColor: '#e0e0e0'
            },
            '&:hover fieldset': {
              borderColor: '#1976d2'
            },
            '&.Mui-focused fieldset': {
              borderColor: '#1976d2'
            }
          }
        }}
      />
      <IconButton
        color="primary"
        onClick={handleSend}
        disabled={!message.trim()}
        sx={{
          backgroundColor: message.trim() ? '#1976d2' : '#e0e0e0',
          color: '#fff',
          '&:hover': {
            backgroundColor: message.trim() ? '#1565c0' : '#bdbdbd'
          },
          borderRadius: '50%',
          width: '40px',
          height: '40px'
        }}
      >
        <Send />
      </IconButton>
    </Box>
  );
};

export default MessageComposition;