import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { apiCall } from '../api';
import MessageList from '../components/MessageList';

const ChatPage = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const { conversations } = useSelector(state => state.inbox);
  const { messages, isConnected } = useSelector(state => state.chat);
  const dispatch = useDispatch();

  // 1. Fetch History when a chat is clicked
  const openConversation = async (chat) => {
    setSelectedChat(chat);
    try {
      const history = await apiCall(`/api/chat/history/${chat.roomId}`, 'GET');
      dispatch({ type: 'chat/setMessages', payload: history });
      dispatch({ type: 'socket/join_room', payload: chat.roomId });
    } catch (err) { console.error("History error", err); }
  };

  return (
    <div className="pt-16 h-screen bg-white max-w-2xl mx-auto shadow-lg border-x">
      {!selectedChat ? (
        /* VIEW A: THE INBOX LIST */
        <div className="flex flex-col h-full">
          <div className="p-4 border-b font-bold text-xl">Chats</div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map(chat => (
              <div key={chat.roomId} onClick={() => openConversation(chat)} className="p-4 flex gap-4 hover:bg-gray-50 border-b cursor-pointer transition-all">
                <img src={chat.product.image} className="w-12 h-12 rounded-full object-cover" />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-gray-900">{chat.otherPartyName}</p>
                    <span className="text-[10px] text-gray-400">{new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-sm text-gray-500 truncate italic">Re: {chat.product.name}</p>
                  <p className="text-xs text-gray-400 truncate">{chat.lastMessage}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* VIEW B: THE CHAT HISTORY (WhatsApp Style) */
        <div className="flex flex-col h-full">
          <div className="p-4 border-b flex items-center gap-3">
            <button onClick={() => setSelectedChat(null)} className="p-1 hover:bg-gray-100 rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <div className="flex items-center gap-2">
              <img src={selectedChat.product.image} className="w-8 h-8 rounded-full object-cover" />
              <p className="font-bold">{selectedChat.otherPartyName}</p>
            </div>
          </div>

          <MessageList currentUserId={currentUser.id} messages={messages} />

          <ChatInput roomId={selectedChat.roomId} isConnected={isConnected} />
        </div>
      )}
    </div>
  );
};

export default ChatPage;