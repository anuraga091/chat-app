import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Fetch chats with infinite pagination
export const fetchChats = createAsyncThunk('chat/fetchChats', async ({ tab, pageDetails }) => {
  const response = await axios.post('http://localhost:3001/fetch/chats', {
    applied_filters: { read: tab === 'Unread' ? false : undefined },
    user_id: 1,  // Assuming user_id: 1 is the logged-in user
    page_details: pageDetails
  });

  // Filtering chats based on last message status
  const filteredChats = response.data.chats.filter(chat => {
    const isRead = chat.last_message.status === 'READ';
    return (tab === 'Unread' && !isRead) || (tab === 'All');
  });

  // Removing duplicate chats by sender user_id
  const uniqueChats = [];
  const userMap = new Map();
  for (const chat of filteredChats) {
    if (!userMap.has(chat.sender_details.user_id)) {
      userMap.set(chat.sender_details.user_id, true); // Mark the user as seen
      uniqueChats.push(chat);
    }
  }

  return { chats: uniqueChats, cursor: response.data.cursor };
});

// Fetch messages for the active chat with reverse pagination
export const fetchMessages = createAsyncThunk('chat/fetchMessages', async ({ chatId, cursor }) => {
  const response = await axios.post('http://localhost:3001/fetch/messages', {
    chat_id: chatId,
    cursor
  });
  return response.data.messages;
});

// Mark chat as read
export const markAsRead = createAsyncThunk('chat/markAsRead', async (chatId) => {
  await axios.post('http://localhost:3001/mark-as-read', { chat_id: chatId, read: true });
  return chatId;
});

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    chats: [],
    messages: [],
    activeChat: null,
    status: 'idle',
    hasMore: true,
    loading: false,
    pageDetails: { page_size: 10, last_element_position: 0 },
    hasMoreMessages: true,
    messageCursor: null,  // To track pagination for messages
  },
  reducers: {
    setActiveChat: (state, action) => {
      state.activeChat = action.payload;
      state.messageCursor = null;  // Reset cursor when changing chat
    },
    clearMessages: (state) => {
      state.messages = [];
      state.hasMoreMessages = true;
      state.messageCursor = null;  // Reset cursor when clearing messages
    },
    addMessage: (state, action) => {
      const exists = state.messages.find(msg => msg.id === action.payload.id);
      if (!exists) {
        state.messages.push(action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.chats = [...new Map([...state.chats, ...action.payload.chats].map(item => [item['chat_id'], item])).values()];
        state.pageDetails.last_element_position = action.payload.cursor.last_element_position;
        state.hasMore = action.payload.chats.length > 0;
        state.loading = false;
      })
      .addCase(fetchChats.rejected, (state) => {
        state.loading = false;
      })
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        const newMessages = action.payload.reverse();
        state.messages = [...new Map([...newMessages, ...state.messages].map(item => [item['id'], item])).values()];
        state.hasMoreMessages = newMessages.length > 0;
        if (newMessages.length > 0) {
          state.messageCursor = newMessages[0].id;  // Update cursor with the first message's ID
        }
        state.loading = false;
      })
      .addCase(fetchMessages.rejected, (state) => {
        state.loading = false;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const chatId = action.payload;
        state.chats = state.chats.map(chat => {
          if (chat.chat_id === chatId) {
            chat.last_message.status = 'READ';
          }
          return chat;
        });
      });
  },
});

export const { setActiveChat, clearMessages, addMessage } = chatSlice.actions;

export default chatSlice.reducer;
