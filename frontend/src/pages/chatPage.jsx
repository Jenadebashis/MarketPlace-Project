import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { apiCall } from '../api';
import MessageList from '../components/MessageList';
import ChatInput from '../components/ChatInput';
import { useLocation } from 'react-router-dom';
import generateRoomId from '../utils/generateId';
import { imgSrc } from '../utils/appConstants';
import { ChevronLeft } from 'lucide-react';

const ChatPage = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const { conversations } = useSelector(state => state.inbox);
  const { messages, isConnected } = useSelector(state => state.chat);
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const currentUserId = user?.id;

  const dispatch = useDispatch();
  const location = useLocation();

  const [activeSellerId, setActiveSellerId] = useState(location.state?.sellerId || null);

  const openConversation = async (chat) => {
    if (!chat?.roomId || selectedChat?.roomId === chat.roomId) return; // 💡 Guard 1: Don't reopen if already open

    dispatch({ type: 'inbox/markAsRead', payload: chat.roomId });
    setSelectedChat(chat);
    setActiveSellerId(chat.otherPartyId);

    try {
      const [history] = await Promise.all([
        apiCall(`/api/chat/history/${chat.roomId}`, 'GET'),
        apiCall(`/api/chat/read/${chat.roomId}`, 'PUT')
      ]);
      dispatch({ type: 'chat/setMessages', payload: history });
      dispatch({ type: 'socket/join_room', payload: chat.roomId });
    } catch (err) { console.error("Failed to open chat:", err); }
  };

  useEffect(() => {
    const fetchInbox = async () => {
      try {
        const data = await apiCall('/api/chat/inbox', 'GET');
        dispatch({ type: 'inbox/setConversations', payload: data });
      } catch (err) { console.error("Inbox fetch failed", err); }
    };
    fetchInbox();
  }, [dispatch]);

  // 💡 Guarded Redirection Effect
  useEffect(() => {
    if (activeSellerId && conversations.length > 0) {
      // 💡 Guard 2: Only run this if we don't have a selectedChat yet
      if (selectedChat) return;

      const existingChat = conversations.find(c => Number(c.otherPartyId) === Number(activeSellerId));

      if (existingChat) {
        openConversation(existingChat);
      } else {
        const generatedId = generateRoomId(currentUserId, activeSellerId);
        setSelectedChat({
          roomId: generatedId,
          otherPartyName: "New Message",
          otherPartyId: activeSellerId,
          product: { image: "", name: "Inquiry" }
        });
      }
    }
  }, [activeSellerId, conversations, selectedChat]); // Added selectedChat to dependencies

  useEffect(() => {
    if (selectedChat?.roomId && isConnected) {
      dispatch({ type: 'socket/join_room', payload: selectedChat.roomId });
    }
  }, [selectedChat?.roomId, isConnected, dispatch]);

  return (
    <div className="pt-16 h-screen bg-white max-w-2xl mx-auto shadow-lg border-x">
      {!selectedChat ? (
        <div className="flex flex-col h-full">
          <div className="p-4 border-b font-bold text-xl">Chats</div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map(chat => (
              <div key={chat.roomId} onClick={() => openConversation(chat)} className="p-4 flex gap-4 hover:bg-gray-50 border-b cursor-pointer transition-all">
                {/* 💡 Fix: Image fallback to prevent src="" error */}
                <img src={chat.product?.image || imgSrc} className="w-12 h-12 rounded-full object-cover" />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-gray-900">{chat.otherPartyName}</p>
                    <span className="text-[10px] text-gray-400">
                      {chat.timestamp ? new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate italic">Re: {chat.product?.name}</p>
                  <p className="text-xs text-gray-400 truncate">{chat.lastMessage}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          <div className="p-4 border-b flex items-center gap-3">
            <button
              onClick={() => { setSelectedChat(null); setActiveSellerId(null); }}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Back to messages"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div className="flex items-center gap-2">
              {/* 💡 Fix: Image fallback */}
              <img src={selectedChat.product?.image || imgSrc} className="w-8 h-8 rounded-full object-cover" />
              <p className="font-bold">{selectedChat.otherPartyName}</p>
            </div>
          </div>
          <MessageList currentUserId={user?.id} messages={messages} />
          <ChatInput roomId={selectedChat.roomId} isConnected={isConnected} sellerId={activeSellerId} />
        </div>
      )}
    </div>
  );
};

export default ChatPage;