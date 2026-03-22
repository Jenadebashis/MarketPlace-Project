const initialState = {
  list: [],
  cart: [], // Added cart array
  user: {},
  isAuthenticated: true,
  loading: false,
  error: null
};

export default function demoReducer(state = initialState, action) {
  switch (action.type) {
    // --- ADD TO CART / INCREASE ---
    case 'ADD_TO_CART':
      const existingIndex = state.cart.findIndex(item => item._id === action.payload._id);

      if (existingIndex >= 0) {
        // If item exists, map through and update quantity
        const updatedCart = state.cart.map((item, index) =>
          index === existingIndex ? { ...item, qty: item.qty + 1 } : item
        );
        return { ...state, cart: updatedCart };
      } else {
        // If new item, add to cart with qty 1
        return { ...state, cart: [...state.cart, { ...action.payload, qty: 1 }] };
      }

    // --- REMOVE FROM CART / DECREASE ---
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cart: state.cart.reduce((acc, item) => {
          if (item._id === action.payload) {
            if (item.qty > 1) {
              acc.push({ ...item, qty: item.qty - 1 });
            }
            // if qty is 1, we don't push it (removes it from cart)
          } else {
            acc.push(item);
          }
          return acc;
        }, [])
      };

    case 'SET_CART':
      return {
        ...state,
        cart: Array.isArray(action.payload) ? action.payload : []
      };

    case 'CLEAR_CART':
      return {
        ...state,
        cart: []
      };


    case 'SET_USER_DETAILS': {
      console.log('SET USER DETAILS CALLED WITH: ', action.payload);
      return {
        ...state,
        user: action.payload,
      };
    }

    case 'SET_IS_AUTHENTICATED': {
      return {
        ...state,
        isAuthenticated: action.payload,
      };
    }

    case 'CLEAR_DATA':
      return initialState;
    default:
      return state;
  }
}