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
  const dispatch = useDispatch();
  const location = useLocation();

  console.log('the value of messages and currentUserId coming here is: ', { messages, user, conversations });

  // Accessing the data you sent
  const { sellerId } = location.state || {};

  const currentUserId = user?.id; // Make sure you have the logged-in user ID
  const generatedId = generateRoomId(currentUserId, sellerId);

  // 1. Fetch History when a chat is clicked
  const openConversation = async (chat) => {
    setSelectedChat(chat);
    try {
      const history = await apiCall(`/api/chat/history/${chat.roomId}`, 'GET');
      const hv = [...history];
      console.log('the type of history is: ', typeof(history), typeof(hv));
      console.log('the history we are getting is: ', {history, hv});
      dispatch({ type: 'chat/setMessages', payload: hv });
      dispatch({ type: 'socket/join_room', payload: chat.roomId });
    } catch (err) { console.error("History error", err); }
  };

  useEffect(() => {
    const fetchInbox = async () => {
      try {
        const data = await apiCall('/api/chat/inbox', 'GET');
        // Assuming your reducer handles setting the full list
        dispatch({ type: 'inbox/setConversations', payload: data });
      } catch (err) {
        console.error("Failed to fetch inbox:", err);
      }
    };

    fetchInbox();
  }, []);

  useEffect(() => {
    if (sellerId) {
      // 1. Check if we already have a chat with this person in our list
      const existingChat = conversations.find(c => c.otherPartyId === sellerId);

      if (existingChat) {
        openConversation(existingChat);
      } else {
        // 2. If no history, we "Mock" a selected chat so the UI opens
        // This allows the user to type a message before the room is officially saved in DB
        setSelectedChat({
          roomId: generatedId, // Temporary ID
          otherPartyName: "New Message", // You'd ideally pass the name via state too
          product: { image: "", name: "Inquiry" }
        });
      }
    }
  }, [sellerId, conversations]);

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

          <ChatInput roomId={selectedChat.roomId} isConnected={isConnected} sellerId={sellerId} />
        </div>
      )}
    </div>
  );
};

export default ChatPage;