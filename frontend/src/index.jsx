import { configureStore } from '@reduxjs/toolkit';
import demoReducer from './reducers/demoReducer';
import appMiddleware from './appMiddleware';
import socketMiddleware from './socketMiddleware';
import chatReducer from './reducers/chatReducer';
import notificationReducer from './reducers/notificationReducer';

export const store = configureStore({
  reducer: {
    demo: demoReducer,
    chat: chatReducer,
    notifications: notificationReducer,
  },
  // Add your custom middleware to the pipeline
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware().concat(appMiddleware, socketMiddleware()),
});