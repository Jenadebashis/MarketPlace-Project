const initialState = {
  messages: [],
  isConnected: false,
  loading: false,
  error: null
};

export default function chatReducer(state = initialState, action) {
  switch (action.type) {
    case 'chat/setConnected':
      return { ...state, isConnected: action.payload };
    case 'chat/addMessage':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'chat/clearMessages':
      return { ...state, messages: [] };
    default:
      return state;
  }
}