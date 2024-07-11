import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChats, markAsRead } from '../redux/chatSlice';
import ChatItem from './ChatItem';

const ChatList = ({ tab, activeChat, setActiveChat }) => {
  const dispatch = useDispatch();
  const chats = useSelector((state) => state.chat.chats);
  const hasMore = useSelector((state) => state.chat.hasMore);
  const loading = useSelector((state) => state.chat.loading);
  const pageDetails = useSelector((state) => state.chat.pageDetails);
  const activeChatIndex = useRef(0);
  const chatListRef = useRef(null);

  useEffect(() => {
    dispatch(fetchChats({ tab, pageDetails }));
  }, [dispatch, tab, pageDetails]);

  useEffect(() => {
    if (chatListRef.current && chatListRef.current.children.length > 0) {
      chatListRef.current.children[activeChatIndex.current].focus();
    }
  }, [chats]);

  const handleScroll = (e) => {
    if (e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight) {
      if (hasMore && !loading) {
        dispatch(fetchChats({ tab, pageDetails }));
      }
    }
  };

  const handleChatClick = (chatId) => {
    setActiveChat(chatId);
    dispatch(markAsRead(chatId));
  };

  const handleKeyDown = (e) => {
    if (!chats.length) return;

    if (e.key === 'ArrowDown') {
      activeChatIndex.current = (activeChatIndex.current + 1) % chats.length;
      chatListRef.current.children[activeChatIndex.current].focus();
    } else if (e.key === 'ArrowUp') {
      activeChatIndex.current = (activeChatIndex.current - 1 + chats.length) % chats.length;
      chatListRef.current.children[activeChatIndex.current].focus();
    } else if (e.key === 'Enter') {
      setActiveChat(chats[activeChatIndex.current].chat_id);
      dispatch(markAsRead(chats[activeChatIndex.current].chat_id));
    }
  };

  // Filter chats based on the tab
  const filteredChats = chats.filter(chat => {
    return tab === 'All' || (tab === 'Unread' && chat.last_message.status !== 'READ');
  });

  return (
    <div
      className="chat-list overflow-y-auto h-full"
      onScroll={handleScroll}
      ref={chatListRef}
      tabIndex="0"
      onKeyDown={handleKeyDown}
    >
      {filteredChats.map((chat, index) => (
        <ChatItem
          key={`${chat.chat_id}-${chat.sender_details.user_id}`}
          chat={chat}
          onClick={() => handleChatClick(chat.chat_id)}
          isActive={chat.chat_id === activeChat}
        />
      ))}
      {loading && <div>Loading...</div>}
    </div>
  );
};

export default ChatList;
