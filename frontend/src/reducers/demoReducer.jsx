const initialState = {
  list: [],
  cart: [], // Added cart array
  loading: false,
  error: null
};

export default function demoReducer(state = initialState, action) {
  switch (action.type) {
    case 'GET_PARKS_REQ':
      return { ...state, loading: true };
    case 'GET_PARKS_OK':
      return { ...state, loading: false, list: action.payload };
    case 'GET_PARKS_ERR':
      return { ...state, loading: false, error: action.payload };

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

    case 'CLEAR_DATA':
      return initialState;
    default:
      return state;
  }
}