import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Fetch chats with infinite pagination
export const fetchChats = createAsyncThunk('chat/fetchChats', async ({ tab, pageDetails }) => {
  const response = await axios.post('http://localhost:3001/fetch/chats', {
    applied_filters: { read: tab === 'Unread' ? false : undefined },
    user_id: 1,  
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
      userMap.set(chat.sender_details.user_id, true); 
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
  },
  reducers: {
    setActiveChat: (state, action) => {
      state.activeChat = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
      state.hasMoreMessages = true;
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
        state.messages = [...action.payload.reverse(), ...state.messages];
        state.hasMoreMessages = action.payload.length > 0;
        state.loading = false;
      })
      .addCase(fetchMessages.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { setActiveChat, clearMessages } = chatSlice.actions;

export default chatSlice.reducer;
