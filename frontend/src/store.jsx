import { createContext, useReducer } from 'react';

export const Store = createContext();

const initialState = {
  userInfo: localStorage.getItem('comtryaUserInfo')
    ? JSON.parse(localStorage.getItem('comtryaUserInfo'))
    : null,
  cart: {
    shippingAddress: localStorage.getItem('comtryaShippingAddress')
      ? JSON.parse(localStorage.getItem('comtryaShippingAddress'))
      : {},
    paymentMethod: localStorage.getItem('comtryaPaymentMethod')
      ? localStorage.getItem('comtryaPaymentMethod')
      : '',
    cartItems: localStorage.getItem('comtryaCart')
      ? JSON.parse(localStorage.getItem('comtryaCart'))
      : [],
  },
  //QUESTION: why does cart need to be objectified
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'CART_ADD_ITEM': {
      // add to cart
      const itemToAdd = action.payload;
      const existItem = state.cart.cartItems.find(
        (d) => d._id === itemToAdd._id
      );
      const cartItems = existItem
        ? state.cart.cartItems.map((d) =>
            d._id === existItem._id ? itemToAdd : d
          )
        : [...state.cart.cartItems, itemToAdd];

      //save cart to localStorage
      localStorage.setItem('comtryaCart', JSON.stringify(cartItems));

      return { ...state, cart: { ...state.cart, cartItems } };
    }

    case 'CART_REMOVE_ITEM': {
      const cartItems = state.cart.cartItems.filter(
        (item) => item._id !== action.payload._id
      );
      localStorage.setItem('comtryaCart', JSON.stringify(cartItems));
      return { ...state, cart: { ...state.cart, cartItems } };
    }

    case 'CART_CLEAR':
      return {...state, cart: {...state.cart, cartItems: []}};

    case 'USER_SIGNIN':
      return { ...state, userInfo: action.payload };

    case 'USER_SIGNOUT':
      return { 
        ...state,
        userInfo: null,
        cart: {
          cartItems: [],
          shippingAddress: {},
          paymentMethod: '',
        },
      };
      

    case 'SAVE_SHIPPING_ADDRESS':
      return {
        ...state,
        cart: {
          ...state.cart,
          shippingAddress: action.payload
        }
      };

    case 'SAVE_PAYMENT_METHOD':
      return {
        ...state,
        cart: {
          ...state.cart, paymentMethod: action.payload
        }
      }

    default:
      return state;
  }
};

export function StoreProvider(props) {
  // console.log('props: ', props);

  const [state, dispatch] = useReducer(reducer, initialState);
  const value = {
    state: state,
    dispatch: dispatch,
  };

  return <Store.Provider value={value}>{props.children}</Store.Provider>;
}
