import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMessages, clearMessages, markAsRead } from '../redux/chatSlice';
import { io } from 'socket.io-client';

const ChatWindow = () => {
  const dispatch = useDispatch();
  const activeChat = useSelector((state) => state.chat.activeChat);
  const messages = useSelector((state) => state.chat.messages);
  const hasMoreMessages = useSelector((state) => state.chat.hasMoreMessages);
  const [message, setMessage] = useState('');
  const socket = useRef(null);
  const chatWindowRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState({ last_message_id: null, page_size: 10 });

  useEffect(() => {
    if (activeChat) {
      dispatch(fetchMessages({ chatId: activeChat, cursor }));
      dispatch(markAsRead(activeChat));
      socket.current = io('http://localhost:3001');
      socket.current.emit('join', { chatId: activeChat });

      socket.current.on('message', (newMessage) => {
        dispatch(fetchMessages({ chatId: activeChat, cursor }));
      });

      return () => {
        socket.current.disconnect();
        dispatch(clearMessages());
      };
    }
  }, [activeChat, dispatch]);

  const fetchMoreMessages = async () => {
    if (loading || !hasMoreMessages) return;
    setLoading(true);
    await dispatch(fetchMessages({ chatId: activeChat, cursor }));
    setLoading(false);
  };

  const handleScroll = (e) => {
    if (e.target.scrollTop === 0 && hasMoreMessages && !loading) {
      fetchMoreMessages();
    }
  };

  const sendMessage = () => {
    if (message.trim() === '') return;
    const newMessage = { chatId: activeChat, content: message, created_at: new Date().toISOString() };
    socket.current.emit('message', newMessage);
    setMessage('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <button onClick={() => dispatch(clearMessages())} className="text-red-500 hover:text-red-700">Close</button>
      </div>
      <div className="flex-1 overflow-y-auto p-4" ref={chatWindowRef} onScroll={handleScroll}>
        {messages.map((msg, index) => (
          <div key={`${msg.id}-${index}`} className="my-2">
            <div className={`p-2 rounded ${msg.sender === 'me' ? 'bg-blue-100 self-end' : 'bg-gray-100'}`}>
              {msg.content}
            </div>
            <div className="text-xs text-gray-500">{new Date(msg.created_at).toLocaleString()}</div>
          </div>
        ))}
        {loading && <div>Loading...</div>}
      </div>
      <div className="p-4 border-t bg-white">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message"
          className="w-full p-2 border rounded mb-2"
        />
        <button onClick={sendMessage} className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700">
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
