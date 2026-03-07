import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { apiCall } from '../api';
import MessageList from '../components/MessageList';
import ChatInput from '../components/ChatInput';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import generateRoomId from '../utils/generateId';
import { imgSrc } from '../utils/appConstants';
import { ChevronLeft } from 'lucide-react';

const ChatPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { conversations } = useSelector(state => state.inbox);
  const { messages, isConnected } = useSelector(state => state.chat);
  const [selectedChat, setSelectedChat] = useState(null);

  const user = useMemo(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  }, []);

  const handleLoadChatData = useCallback(async (chatObj) => {
    if (!chatObj?.roomId || selectedChat?.roomId === chatObj.roomId) return;

    setSelectedChat(chatObj);
    dispatch({ type: 'inbox/markAsRead', payload: chatObj.roomId });

    try {
      const [history] = await Promise.all([
        apiCall(`/api/chat/history/${chatObj.roomId}`, 'GET'),
        apiCall(`/api/chat/read/${chatObj.roomId}`, 'PUT')
      ]);

      dispatch({ type: 'chat/setMessages', payload: history });
    } catch (err) {
      console.error("Failed to load chat data:", err);
    }
  }, [selectedChat?.roomId, dispatch]);

  useEffect(() => {
    const fetchInbox = async () => {
      try {
        const data = await apiCall('/api/chat/inbox', 'GET');
        dispatch({ type: 'inbox/setConversations', payload: data });
      } catch (err) {
        console.error("Inbox fetch failed:", err);
      }
    };
    fetchInbox();
  }, [dispatch]);

  useEffect(() => {
    if (!roomId) {
      if (selectedChat) setSelectedChat(null);
      return;
    }

    if (conversations.length > 0) {
      const chatFromInbox = conversations.find(c => c.roomId === roomId);

      if (chatFromInbox) {
        handleLoadChatData(chatFromInbox);
      }
      else if (location.state?.sellerId) {
        if (selectedChat?.roomId === roomId) return;
        setSelectedChat({
          roomId: roomId,
          otherPartyName: location.state.sellerName || "New Message",
          otherPartyId: location.state.sellerId,
          product: location.state.product || { image: "", name: "Inquiry" }
        });
      }
    }
  }, [roomId, conversations, handleLoadChatData, location.state, selectedChat?.roomId]);

  useEffect(() => {
    if (roomId && isConnected) {
      console.log("Joining room:", roomId);
      dispatch({ type: 'socket/join_room', payload: roomId });
    }
  }, [roomId, isConnected, dispatch]);

  const handleChatClick = (chat) => {
    navigate(`/messages/${chat.roomId}`);
  };

  const handleBack = () => {
    navigate('/messages');
  };

  return (
    <div className="h-[calc(100vh-64px)] bg-white max-w-2xl mx-auto shadow-lg border-x flex flex-col overflow-hidden">
      {!selectedChat ? (
        /* VIEW A: THE INBOX LIST */
        <div className="flex flex-col h-full">
          <div className="p-4 border-b font-bold text-xl text-gray-800">Chats</div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map(chat => (
              <div
                key={chat.roomId}
                onClick={() => handleChatClick(chat)}
                className={`p-4 flex gap-4 hover:bg-gray-50 border-b cursor-pointer transition-all ${chat.unreadCount > 0 ? 'bg-blue-50/30' : ''}`}
              >
                <img
                  src={chat.product?.image || imgSrc}
                  className="w-12 h-12 rounded-full object-cover border border-gray-100"
                  alt="product"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <p className={`font-bold ${chat.unreadCount > 0 ? 'text-blue-600' : 'text-gray-900'}`}>
                      {chat.otherPartyName}
                    </p>
                    <span className="text-[10px] text-gray-400">
                      {chat.timestamp ? new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate italic">Re: {chat.product?.name || 'Item'}</p>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-400 truncate max-w-[180px]">{chat.lastMessage}</p>
                    {chat.unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* VIEW B: THE CHAT HISTORY */
        <div className="flex flex-col h-full bg-gray-50">
          <div className="p-4 bg-white border-b flex items-center gap-3 sticky top-0 z-10 shadow-sm">
            <button
              onClick={handleBack}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Back to messages"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div className="flex items-center gap-3">
              <img
                src={selectedChat.product?.image || imgSrc}
                className="w-10 h-10 rounded-full object-cover border border-gray-200"
                alt="header-avatar"
              />
              <div>
                <p className="font-bold text-gray-800 leading-none">{selectedChat.otherPartyName}</p>
                <p className="text-[10px] text-emerald-500 font-medium mt-1">
                  {isConnected ? '● Online' : '○ Offline'}
                </p>
              </div>
            </div>
          </div>

          <MessageList currentUserId={user?.id} messages={messages} />

          {/* Input Area */}
          <div className="bg-white border-t p-2">
            <ChatInput
              roomId={selectedChat.roomId}
              isConnected={isConnected}
              sellerId={selectedChat.otherPartyId}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;