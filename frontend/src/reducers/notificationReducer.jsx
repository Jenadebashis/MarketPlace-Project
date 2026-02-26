const initialState = {
  message: null,
  type: null, // 'SUCCESS', 'INFO', 'ERROR', etc.
  visible: false,
  data: null    // To store extra info like buyerId or product details
};

const notificationReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'notifications/show':
      console.log('the message coming here is: ', action.payload);
      return {
        ...state,
        message: action.payload.message,
        type: action.payload.type,
        visible: true,
        data: action.payload.buyerId || null // Storing who triggered it
      };

    case 'notifications/hide':
      return {
        ...initialState // Resets back to hidden and null
      };

    default:
      return state;
  }
};

export default notificationReducer;