import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChats, setActiveChat } from '../redux/chatSlice';
import ChatItem from './ChatItem';

const ChatList = ({ tab }) => {
  const dispatch = useDispatch();
  const chats = useSelector((state) => state.chat.chats);
  const hasMore = useSelector((state) => state.chat.hasMore);
  const loading = useSelector((state) => state.chat.loading);
  const pageDetails = useSelector((state) => state.chat.pageDetails);

  useEffect(() => {
    dispatch(fetchChats({ tab, pageDetails }));
  }, [dispatch, tab]);

  const handleScroll = (e) => {
    if (e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight) {
      if (hasMore && !loading) {
        dispatch(fetchChats({ tab, pageDetails }));
      }
    }
  };

  return (
    <div className="chat-list overflow-y-auto h-full" onScroll={handleScroll}>
      {chats.map((chat) => (
        <ChatItem key={`${chat.chat_id}-${chat.sender_details.user_id}`} chat={chat} onClick={() => dispatch(setActiveChat(chat.chat_id))} />
      ))}
      {loading && <div>Loading...</div>}
    </div>
  );
};

export default ChatList;
