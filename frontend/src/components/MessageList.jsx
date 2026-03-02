const MessageList = ({ messages, currentUserId }) => {
  const scrollRef = React.useRef();

  React.useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f0f2f5]">
      {messages.map((msg, i) => {
        const isMe = msg.senderId === currentUserId;
        return (
          <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg shadow-sm text-sm ${isMe ? 'bg-[#dcf8c6] text-gray-800' : 'bg-white text-gray-800'}`}>
              {msg.text}
              <p className="text-[10px] text-gray-400 text-right mt-1">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        );
      })}
      <div ref={scrollRef} />
    </div>
  );
};

export default MessageList;