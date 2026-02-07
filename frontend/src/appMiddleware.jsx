import { apiCall } from './api';

const appMiddleware = ({ dispatch }) => (next) => async (action) => {
  // 1. Check if this is an API call
  if (!action.payload || !action.payload.endpoint) {
    return next(action); // Not an API call? Go straight to Reducer.
  }

  const { types, endpoint, method, data } = action.payload;
  const [START, SUCCESS, FAILURE] = types;

  // 2. Dispatch the "Start" action (for loading spinners)
  dispatch({ type: START });

  try {
    // 3. Go to api.js for the actual Axios call
    const responseData = await apiCall(endpoint, method, data);

    // 4. Success! Dispatch success action to Reducer
    dispatch({ type: SUCCESS, payload: responseData });
  } catch (error) {
    // 5. Error! Dispatch failure action to Reducer
    dispatch({ type: FAILURE, payload: error.message });
  }
};

export default appMiddleware;