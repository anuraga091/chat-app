import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useDispatch} from 'react-redux';
import { updateLastMessage } from '../redux/chatSlice';


const ChatWindow = ({ activeChat, userId, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [loading, setLoading] = useState(false);
  const messageCursor = useRef(null);
  const chatWindowRef = useRef(null);
  const isFetching = useRef(false);

  const dispatch = useDispatch()

  useEffect(() => {
    if (activeChat) {
      fetchInitialMessages();
    }
  }, [activeChat]);

  const fetchInitialMessages = async () => {
    if (!loading) {
      setLoading(true);
      try {
        const response = await axios.post('http://localhost:3001/fetch/messages', {
          chat_id: activeChat,
          cursor: { last_message_id: null, page_size: 10 }
        });
        
        setMessages(response.data.messages); 
        setHasMoreMessages(response.data.cursor.has_next_message);
        messageCursor.current = response.data.messages[0]?.id || null;
        isFetching.current = false;
      } catch (error) {
        console.error('Error fetching initial messages:', error);
      } finally {
        setLoading(false);
        scrollToBottom();
      }
    }
  };

 

  const fetchMoreMessages = async () => {
    if (loading || !hasMoreMessages || isFetching.current) return;
    isFetching.current = true;
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3001/fetch/messages', {
        chat_id: activeChat,
        cursor: { last_message_id: messageCursor.current, page_size: 10 }
      });
      const fetchedMessages = response.data.messages.reverse();
      if (fetchedMessages.length > 0) {
        setMessages(prevMessages => {
          const newMessages = fetchedMessages.filter(fm => !prevMessages.some(pm => pm.id === fm.id));
          return [...newMessages, ...prevMessages];
        });
        setHasMoreMessages(response.data.cursor.has_next_message);
        messageCursor.current = fetchedMessages[0]?.id || null;
      }
      isFetching.current = false;
    } catch (error) {
      console.error('Error fetching more messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = () => {
    if (chatWindowRef.current.scrollTop === 0 && hasMoreMessages && !loading && !isFetching.current) {
      fetchMoreMessages();
    }
  };

  const sendMessage = async () => {
    if (message.trim() === '') return;
    const newMessage = { chatId: activeChat, content: message, created_at: new Date().toISOString(), sender_id: userId };
    try {
      const response = await axios.post('http://localhost:3001/add-message', newMessage);
      dispatch(updateLastMessage({chatId: activeChat, message: {
        content: message,
        created_at: new Date().toISOString(),
        sender_id: userId,
        status: 'DELIVERED'
      } }));

      setMessages(prevMessages => [...prevMessages, response.data]); 
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
    scrollToBottom();
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      if (chatWindowRef.current) {
        chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
      }
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const sortMessages = (messages) => {
    return messages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <button onClick={onClose} className="text-red-500 hover:text-red-700">Close</button>
      </div>
      <div className="flex-1 overflow-y-auto p-4" ref={chatWindowRef} onScroll={handleScroll}>
        {sortMessages(messages).map((msg) => (
          <div key={msg.id} className={`my-2 flex ${msg.sender_id === userId ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-2 rounded ${msg.sender_id === userId ? 'bg-blue-100' : 'bg-gray-100'}`}>
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
          onKeyDown={handleKeyDown}
        />
        <button onClick={sendMessage} className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700">
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
