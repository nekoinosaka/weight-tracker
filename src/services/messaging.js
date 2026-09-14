// src/services/messaging.js
import { supabase } from './supabase';

export const messagingService = {
  // Send a message to another user
  async sendMessage(senderId, receiverId, content) {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        content,
        status: 'sent'
      })
      .select();
    
    if (error) throw error;
    return data[0];
  },
  
  // Get message history between two users
  async getMessageHistory(userId1, userId2) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  },
  
  // Mark messages as delivered
  async markMessagesAsDelivered(messageIds) {
    const { error } = await supabase
      .from('messages')
      .update({ status: 'delivered' })
      .in('id', messageIds);
    
    if (error) throw error;
    return true;
  },
  
  // Mark messages as read
  async markMessagesAsRead(messageIds) {
    const { error } = await supabase
      .from('messages')
      .update({ status: 'read' })
      .in('id', messageIds);
    
    if (error) throw error;
    return true;
  },
  
  // Get unread messages for a user
  async getUnreadMessages(userId) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('receiver_id', userId)
      .eq('status', 'sent');
    
    if (error) throw error;
    return data;
  },
  
  // Create a notification for a user
  async createNotification(userId, type, message, relatedId = null) {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        message,
        related_id: relatedId
      })
      .select();
    
    if (error) throw error;
    return data[0];
  },
  
  // Get notifications for a user
  async getNotifications(userId) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },
  
  // Mark notification as read
  async markNotificationAsRead(notificationId) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);
    
    if (error) throw error;
    return true;
  },
  
  // Mark all notifications as read
  async markAllNotificationsAsRead(userId) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId);
    
    if (error) throw error;
    return true;
  }
};

// Set up real-time listeners for messages
export const setupMessageListener = (userId, callback) => {
  return supabase
    .channel(`messages:${userId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `receiver_id=eq.${userId}`
    }, callback)
    .subscribe();
};

// Set up real-time listeners for notifications
export const setupNotificationListener = (userId, callback) => {
  return supabase
    .channel(`notifications:${userId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`
    }, callback)
    .subscribe();
};
