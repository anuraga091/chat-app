import React from 'react';
import { useDispatch } from 'react-redux';
import { markAsRead } from '../redux/chatSlice';

const ChatItem = ({ chat, onClick, isActive }) => {
  const dispatch = useDispatch();

  const handleMarkAsRead = (e) => {
    e.stopPropagation();
    dispatch(markAsRead(chat.chat_id));
  };

  return (
    <div onClick={onClick} className={`chat-item p-4 flex items-center cursor-pointer ${isActive ? 'bg-blue-100' : ''}`} tabIndex="0">
      <img src={chat.sender_details.profile_data.profile_picture} alt="Profile" className="w-10 h-10 rounded-full mr-4" />
      <div className="flex-1">
        <div className="font-bold">{`${chat.sender_details.profile_data.first_name} ${chat.sender_details.profile_data.last_name}`}</div>
        <div className="text-sm text-gray-500">{chat.last_message.content}</div>
        <div className="text-xs text-gray-400">{chat.sender_details.profile_data.headline}</div>
      </div>
      <div className="flex items-center">
        <div className={`text-xs ${chat.last_message.status === 'READ' ? 'text-green-500' : 'text-red-500'}`}>
          {chat.last_message.status === 'READ' ? 'Read' : 'Unread'}
        </div>
        {chat.last_message.status !== 'READ' && (
          <button
            onClick={handleMarkAsRead}
            className="ml-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-1 px-2 rounded focus:outline-none"
          >
            Mark as Read
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatItem;
