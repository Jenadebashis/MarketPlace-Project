import { io } from 'socket.io-client';

const socketMiddleware = () => {
  let socket = null;

  return (store) => (next) => (action) => {
    switch (action.type) {
      case 'socket/connect':
        if (socket !== null) socket.disconnect();
        
        // Initialize connection with token from action or localStorage
        socket = io('https://marketplace-project-xi5v.onrender.com/', {
          auth: { token: action.payload.token }
        });

        // Server -> Redux
        socket.on('receive_message', (msg) => {
          store.dispatch({ type: 'chat/addMessage', payload: msg });
        });

        socket.on('connect', () => store.dispatch({ type: 'chat/setConnected', payload: true }));
        socket.on('disconnect', () => store.dispatch({ type: 'chat/setConnected', payload: false }));
        break;

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