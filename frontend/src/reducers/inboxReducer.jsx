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
      
      // We find the specific conversation and move it to the top of the list
      const updatedConversations = state.conversations.map(conv => {
        if (conv.roomId === roomId) {
          return { 
            ...conv, 
            lastMessage: text, 
            timestamp: timestamp 
          };
        }
        return conv;
      });

      // Optional: Sort so the most recent message is always at the top
      return {
        ...state,
        conversations: updatedConversations.sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
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