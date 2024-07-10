import React from 'react';

const ChatItem = ({ chat, onClick }) => {
  return (
    <div onClick={onClick} className="chat-item p-4 flex items-center cursor-pointer">
      <img src={chat.sender_details.profile_data.profile_picture} alt="Profile" className="w-10 h-10 rounded-full mr-4" />
      <div className="flex-1">
        <div className="font-bold">{`${chat.sender_details.profile_data.first_name} ${chat.sender_details.profile_data.last_name}`}</div>
        <div className="text-sm text-gray-500">{chat.last_message.content}</div>
        <div className="text-xs text-gray-400">{chat.sender_details.profile_data.headline}</div>
      </div>
      <div className={`text-xs ${chat.last_message.status === 'READ' ? 'text-green-500' : 'text-red-500'}`}>
        {chat.last_message.status === 'READ' ? 'Read' : 'Unread'}
      </div>
    </div>
  );
};

export default ChatItem;
