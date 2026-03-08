import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Send, Smile, Paperclip } from 'lucide-react'; // Using Lucide for consistent style

const ChatInput = ({ roomId, isConnected, sellerId }) => {
  const [text, setText] = useState('');
  const dispatch = useDispatch();

  const handleSendMessage = async (e) => {
    e.preventDefault();

    // Prevent sending empty messages or sending while disconnected
    if (!text.trim() || !isConnected) return;

    // Dispatching to your socketMiddleware
    dispatch({
      type: 'socket/send',
      payload: {
        roomId,
        text: text.trim(),
        sellerId // Pass this so the backend can update the Conversation participants
      }
    });

    setText(''); // Clear input after sending

    const data = await apiCall('/api/chat/inbox', 'GET');
    dispatch({ type: 'inbox/setConversations', payload: data });
  };

  return (
    <div className="p-4 bg-white border-t border-slate-200">
      <form
        onSubmit={handleSendMessage}
        className="max-w-4xl mx-auto flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-2xl focus-within:ring-2 focus-within:ring-indigo-500 transition-all"
      >
        {/* Attachment/Emoji Icons (Visual only for now) */}
        <button type="button" className="text-slate-400 hover:text-indigo-600 transition-colors">
          <Smile size={22} />
        </button>

        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={isConnected ? "Type a message..." : "Connecting..."}
          disabled={!isConnected}
          className="flex-1 bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 py-2 text-sm disabled:cursor-not-allowed"
        />

        <button type="button" className="text-slate-400 hover:text-indigo-600 transition-colors">
          <Paperclip size={20} />
        </button>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!text.trim() || !isConnected}
          className={`p-2 rounded-xl transition-all shadow-md active:scale-95 ${text.trim() && isConnected
            ? 'bg-indigo-600 text-white shadow-indigo-200'
            : 'bg-slate-300 text-slate-100 shadow-none cursor-not-allowed'
            }`}
        >
          <Send size={18} fill="currentColor" />
        </button>
      </form>

      {!isConnected && (
        <p className="text-[10px] text-red-500 text-center mt-2 font-medium animate-pulse">
          Disconnected from server. Trying to reconnect...
        </p>
      )}
    </div>
  );
};

export default ChatInput;