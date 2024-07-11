import React from 'react';
import { useSelector } from 'react-redux';

const Tabs = ({ activeTab, setActiveTab }) => {
  const chats = useSelector((state) => state.chat.chats);

  const unreadCount = chats.filter(chat => chat.last_message.status !== 'READ').length;

  return (
    <div className="flex justify-center mb-4">
      <button
        className={`px-4 py-2 mr-2 ${activeTab === 'All' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        onClick={() => setActiveTab('All')}
      >
        All
      </button>
      <button
        className={`px-4 py-2 ${activeTab === 'Unread' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        onClick={() => setActiveTab('Unread')}
      >
        Unread ({unreadCount})
      </button>
    </div>
  );
};

export default Tabs;
