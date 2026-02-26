import { io } from 'socket.io-client';
const socketMiddleware = () => {
  let socket = null;

  return (store) => (next) => (action) => {
    switch (action.type) {
      case 'socket/connect':
        if (socket) socket.disconnect();
        
        socket = io('https://marketplace-project-xi5v.onrender.com/', {
          auth: { token: action.payload.token }
        });

        // --- INCOMING SERVER EVENTS ---
        
        // Listen for notifications (Sent by server when someone adds vendor's item to cart)
        socket.on('notification', (data) => {
          store.dispatch({ type: 'notifications/show', payload: data });
          
          setTimeout(() => {
            store.dispatch({ type: 'notifications/hide' });
          }, 3000);
        });

        socket.on('receive_message', (msg) => {
          store.dispatch({ type: 'chat/addMessage', payload: msg });
        });

        socket.on('connect', () => store.dispatch({ type: 'chat/setConnected', payload: true }));
        socket.on('disconnect', () => store.dispatch({ type: 'chat/setConnected', payload: false }));
        break;

      // --- OUTGOING UI EVENTS ---

      case 'cart/add_request':
        if (socket) {
          // action.payload should contain { name, price, vendorId, etc. }
          socket.emit('add_to_cart', action.payload);
        }
        return next(action); // Continue to update local cart state if needed

      case 'socket/send':
        if (socket) socket.emit('send_message', { text: action.payload });
        break;

      case 'socket/disconnect':
        if (socket) socket.disconnect();
        socket = null;
        break;

      default:
        return next(action);
    }
  };
};

export default socketMiddleware;