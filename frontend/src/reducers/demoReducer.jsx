const initialState = { list: [], loading: false, error: null };

export default function demoReducer(state = initialState, action) {
  switch (action.type) {
    case 'GET_PARKS_REQ':
      return { ...state, loading: true };
    case 'GET_PARKS_OK':
      return { ...state, loading: false, list: action.payload };
    case 'GET_PARKS_ERR':
      return { ...state, loading: false, error: action.payload };
    case 'CLEAR_DATA':
      return initialState;
    default:
      return state;
  }
}