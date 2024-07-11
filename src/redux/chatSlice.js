import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Fetch chats with infinite pagination
export const fetchChats = createAsyncThunk('chat/fetchChats', async ({ tab, pageDetails }) => {
  const response = await axios.post('http://localhost:3001/fetch/chats', {
    applied_filters: { read: tab === 'Unread' ? false : undefined },
    user_id: 1,  
    page_details: pageDetails
  });

  // Removing duplicate chats by sender user_id
  const uniqueChats = [];
  const userMap = new Map();
  for (const chat of response.data.chats) {
    if (!userMap.has(chat.sender_details.user_id)) {
      userMap.set(chat.sender_details.user_id, true); 
      uniqueChats.push(chat);
    }
  }

  return { chats: uniqueChats, cursor: response.data.cursor };
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
    messageCursor: null, 
  },
  reducers: {
    setActiveChat: (state, action) => {
      state.activeChat = action.payload;
      state.messageCursor = null;
    },
    updateLastMessage: (state, action) => {
      const { chatId, message } = action.payload;
      console.log(action.payload)
      const chatIndex = state.chats.findIndex(chat => chat.chat_id === chatId);
      if (chatIndex !== -1) {
        state.chats[chatIndex].last_message = message;
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
      .addCase(markAsRead.fulfilled, (state, action) => {
        const chatId = action.payload;
        state.chats = state.chats.map(chat => {
          if (chat.chat_id === chatId) {
            chat.last_message.status = 'READ';
          }
          return chat;
        });
      })
    
  },
});

export const { setActiveChat, updateLastMessage } = chatSlice.actions;

export default chatSlice.reducer;

