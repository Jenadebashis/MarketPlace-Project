import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { apiCall } from '../api';
import MessageList from '../components/MessageList';
import ChatInput from '../components/ChatInput';
import { useLocation } from 'react-router-dom';
import generateRoomId from '../utils/generateId';

const ChatPage = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const { conversations } = useSelector(state => state.inbox);
  const { messages, isConnected } = useSelector(state => state.chat);

  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const currentUserId = user?.id;

  const dispatch = useDispatch();
  const location = useLocation();

  // 1. Get initial sellerId from navigation state (if coming from a product)
  const [activeSellerId, setActiveSellerId] = useState(location.state?.sellerId || null);

  // 2. Fetch History & Update activeSellerId
  const openConversation = async (chat) => {
    setSelectedChat(chat);
    // Crucial: Set the sellerId from the chat object so ChatInput has it
    setActiveSellerId(chat.otherPartyId);

    try {
      const history = await apiCall(`/api/chat/history/${chat.roomId}`, 'GET');
      dispatch({ type: 'chat/setMessages', payload: history });
      dispatch({ type: 'socket/join_room', payload: chat.roomId });
    } catch (err) { console.error("History error", err); }
  };

  // 3. Fetch Inbox on mount
  useEffect(() => {
    const fetchInbox = async () => {
      try {
        const data = await apiCall('/api/chat/inbox', 'GET');
        dispatch({ type: 'inbox/setConversations', payload: data });
      } catch (err) { console.error("Inbox fetch failed", err); }
    };
    fetchInbox();
  }, [dispatch]);

  // 4. Handle Redirection from Product Page
  useEffect(() => {
    if (activeSellerId && conversations.length > 0) {
      const existingChat = conversations.find(c => Number(c.otherPartyId) === Number(activeSellerId));

      if (existingChat) {
        openConversation(existingChat);
      } else if (!selectedChat) {
        const generatedId = generateRoomId(currentUserId, activeSellerId);
        setSelectedChat({
          roomId: generatedId,
          otherPartyName: "New Message",
          otherPartyId: activeSellerId, // Ensure this is kept
          product: { image: "", name: "Inquiry" }
        });
      }
    }
  }, [activeSellerId, conversations]);

  useEffect(() => {
    if (selectedChat?.roomId && isConnected) {
      console.log("Joining room:", selectedChat.roomId);
      dispatch({ type: 'socket/join_room', payload: selectedChat.roomId });
    }
  }, [selectedChat?.roomId, isConnected, dispatch]);

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

          <MessageList currentUserId={user.id} messages={messages} />

          <ChatInput roomId={selectedChat.roomId} isConnected={isConnected} sellerId={activeSellerId} />
        </div>
      )}
    </div>
  );
};

export default ChatPage;