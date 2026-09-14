// src/pages/Messages.jsx
import React from 'react';
import { Box, Typography, AppBar, Toolbar } from '@mui/material';
import ConversationList from '../components/messaging/ConversationList';

const Messages = () => {
  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            消息
          </Typography>
        </Toolbar>
      </AppBar>
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <ConversationList />
      </Box>
    </Box>
  );
};

export default Messages;