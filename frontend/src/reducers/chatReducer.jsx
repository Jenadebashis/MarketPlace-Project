const initialState = {
  messages: [],
  isConnected: false,
  loading: false,
  error: null
};

export default function chatReducer(state = initialState, action) {
  switch (action.type) {
    // --- CONNECTION STATUS ---
    case 'SET_CONNECTED':
      return { 
        ...state, 
        isConnected: action.payload 
      };

    // --- ADD NEW MESSAGE ---
    case 'ADD_MESSAGE':
      return { 
        ...state, 
        messages: [...state.messages, action.payload] 
      };

    // --- SET ALL MESSAGES (e.g., loading history) ---
    case 'SET_MESSAGES':
      return {
        ...state,
        messages: Array.isArray(action.payload) ? action.payload : [],
        loading: false
      };

    // --- UTILITIES ---
    case 'CHAT_LOADING':
      return { ...state, loading: true };

    case 'CLEAR_CHAT':
      return initialState;

    default:
      return state;
  }
}