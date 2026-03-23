import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import { useMemo } from 'react';

const socketMiddleware = () => {
  let socket = null;
  const getUser = () => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  };

  return (store) => (next) => (action) => {
    const user = getUser();
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

        socket.on('inbox_update', (data) => {
          console.log('the data coming here is: ', { data });
          // Only process if this message is meant for the logged-in user
          store.dispatch({
            type: 'inbox/syncConversation',
            payload: data.conversation
          });

          // Optional: Show a toast notification
          toast.info(`New message from ${data.otherPartyName}`);
        });

        socket.on('receive_message', (msg) => {
          console.log('the message coming here is: ', { msg });
          store.dispatch({ type: 'chat/addMessage', payload: msg });
          store.dispatch({
            type: 'inbox/updateLastMessage',
            payload: {
              roomId: msg.roomId,
              text: msg.text,
              timestamp: msg.timestamp
            }
          });
        });

        socket.on('user_presence', (data) => {
          store.dispatch({ type: 'presence/updateStatus', payload: data });
        });

        socket.on('status_response', (data) => {
          store.dispatch({ type: 'presence/updateStatus', payload: data });
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

      case 'socket/join_room':
        if (socket) socket.emit('join_chat', { roomId: action.payload });
        break;

      case 'socket/send':
        if (socket) {
          // payload should now be { roomId, text }
          socket.emit('send_message', action.payload);
        }
        break;

      case 'socket/check_status':
        if (socket) {
          console.log('the socket payload is: ', action.payload);
          socket.emit('check_online_status', action.payload.userId);
        }
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