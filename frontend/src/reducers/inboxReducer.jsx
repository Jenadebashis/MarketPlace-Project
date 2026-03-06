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

    default:
      return state;
  }
}