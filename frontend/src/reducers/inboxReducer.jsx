const initialState = {
  conversations: [], // List of { roomId, otherPartyName, lastMessage, timestamp, product }
  loading: false,
  error: null
};

export default function inboxReducer(state = initialState, action) {
  switch (action.type) {

    // 1. Start loading state (useful for showing a spinner on the Inbox page)
    case 'inbox/setLoading':
      return {
        ...state,
        loading: true,
        error: null
      };

    // 2. Populate the inbox (called after your GET /api/chat/inbox API call)
    case 'inbox/setConversations':
      return {
        ...state,
        conversations: action.payload,
        loading: false
      };

    // 3. REAL-TIME UPDATE: When a socket message arrives, update the snippet
    case 'inbox/updateLastMessage': {
      const { roomId, text, timestamp } = action.payload;

      const updatedConversations = state.conversations.map(conv => {
        if (conv.roomId === roomId) {
          return {
            ...conv,
            lastMessage: text,
            timestamp: timestamp,
            // 💡 Increment the count by 1 every time a message arrives
            unreadCount: (conv.unreadCount || 0) + 1
          };
        }
        return conv;
      });

      return {
        ...state,
        conversations: updatedConversations.sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        )
      };
    }

    case 'inbox/markAsRead': {
      return {
        ...state,
        conversations: state.conversations.map(conv =>
          conv.roomId === action.payload
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      };
    }

    // 4. Handle errors
    case 'inbox/setError':
      return {
        ...state,
        error: action.payload,
        loading: false
      };

    case 'inbox/syncConversation': {
      const newConv = action.payload;

      console.log('📥 REDUCER: syncConversation triggered');
      console.log('📦 Payload received:', newConv);

      const exists = state.conversations.find(c => c.roomId === newConv.roomId);

      let updatedList;
      if (exists) {
        console.log(`🔄 Updating existing conversation: ${newConv.roomId}`);
        // Update existing
        updatedList = state.conversations.map(c =>
          c.roomId === newConv.roomId ? { ...c, ...newConv } : c
        );
      } else {
        console.log(`✨ Adding BRAND NEW conversation to list: ${newConv.roomId}`);
        // Add brand new conversation to the top
        updatedList = [newConv, ...state.conversations];
      }

      // Final step: Sort and return
      const sortedList = updatedList.sort((a, b) =>
        new Date(b.lastTimestamp) - new Date(a.lastTimestamp)
      );

      console.log('📊 Stats:', {
        totalConversations: sortedList.length,
        topConversationRoomId: sortedList[0]?.roomId,
        lastMessage: sortedList[0]?.lastMessage
      });

      return {
        ...state,
        conversations: sortedList
      };
    }

    default:
      return state;
  }
}