import { configureStore } from '@reduxjs/toolkit';
import demoReducer from './reducers/demoReducer';
import appMiddleware from './appMiddleware';

export const store = configureStore({
  reducer: {
    demo: demoReducer,
  },
  // Add your custom middleware to the pipeline
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware().concat(appMiddleware),
});